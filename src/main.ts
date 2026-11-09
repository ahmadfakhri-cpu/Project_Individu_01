import "./style.css";
import { loadTasks, resetTasks, saveTasks } from "./services/taskApi";
import {
  createTask,
  deleteTask,
  filterTasks,
  findTask,
  isOverdue,
  nextStatus,
  sortTasks,
  summarize,
  updateTask,
  validateTaskInput,
} from "./services/taskService";
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  type PriorityFilter,
  type SortKey,
  type StatusFilter,
  type Task,
  type TaskFilters,
} from "./types/task";
import { describeDeadline, formatDate, todayISO } from "./utils/date";

// ---------- Helper DOM bertipe ----------
function $<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (el === null) throw new Error(`Elemen tidak ditemukan: ${selector}`);
  return el;
}

const els = {
  form: $<HTMLFormElement>("#task-form"),
  formTitle: $<HTMLElement>("#form-title"),
  id: $<HTMLInputElement>("#task-id"),
  title: $<HTMLInputElement>("#title"),
  description: $<HTMLTextAreaElement>("#description"),
  deadline: $<HTMLInputElement>("#deadline"),
  priority: $<HTMLSelectElement>("#priority"),
  errors: $<HTMLUListElement>("#form-errors"),
  submit: $<HTMLButtonElement>("#btn-submit"),
  cancel: $<HTMLButtonElement>("#btn-cancel"),
  search: $<HTMLInputElement>("#search"),
  filterStatus: $<HTMLSelectElement>("#filter-status"),
  filterPriority: $<HTMLSelectElement>("#filter-priority"),
  sort: $<HTMLSelectElement>("#sort"),
  list: $<HTMLUListElement>("#task-list"),
  state: $<HTMLElement>("#state"),
  summary: $<HTMLElement>("#summary"),
  progress: $<HTMLElement>("#progress"),
  progressBar: $<HTMLElement>("#progress-bar"),
  progressLabel: $<HTMLElement>("#progress-label"),
  btnReload: $<HTMLButtonElement>("#btn-reload"),
  btnError: $<HTMLButtonElement>("#btn-error"),
  btnReset: $<HTMLButtonElement>("#btn-reset"),
};

// ---------- State aplikasi ----------
type LoadState = "loading" | "ready" | "error";

let tasks: Task[] = [];
let loadState: LoadState = "loading";
let loadError = "";
let editingId: string | null = null;

const filters: TaskFilters = {
  keyword: "",
  status: "semua",
  priority: "semua",
  sortBy: "deadline",
};

// ---------- Persistensi ----------
async function persist(next: Task[]): Promise<void> {
  const previous = tasks;
  tasks = next;
  render();
  try {
    await saveTasks(next);
  } catch (err) {
    tasks = previous; // rollback jika gagal menyimpan
    render();
    alert(err instanceof Error ? err.message : "Gagal menyimpan data.");
  }
}

async function init(simulateError = false): Promise<void> {
  loadState = "loading";
  render();
  try {
    tasks = await loadTasks({ simulateError });
    loadState = "ready";
  } catch (err) {
    loadState = "error";
    loadError = err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui.";
  }
  render();
}

// ---------- Rendering ----------
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text; // textContent = aman dari XSS
  return node;
}

function actionButton(label: string, onClick: () => void, extra = ""): HTMLButtonElement {
  const btn = el("button", `btn btn-sm ${extra}`.trim(), label);
  btn.type = "button";
  btn.addEventListener("click", onClick);
  return btn;
}

function renderSummary(): void {
  const s = summarize(tasks);
  const items: Array<{ label: string; value: number; cls?: string }> = [
    { label: "Total tugas", value: s.total },
    { label: "Aktif", value: s.aktif },
    { label: "Selesai", value: s.selesai, cls: "ok" },
    { label: "Terlambat", value: s.terlambat, cls: "danger" },
  ];
  els.summary.replaceChildren(
    ...items.map((item) => {
      const box = el("div", `stat ${item.cls ?? ""}`.trim());
      box.append(el("strong", undefined, String(item.value)), el("span", undefined, item.label));
      return box;
    }),
  );
  els.progressBar.style.width = `${s.progressPercent}%`;
  els.progress.setAttribute("aria-valuenow", String(s.progressPercent));
  els.progressLabel.textContent = `${s.progressPercent}% tugas selesai (${s.selesai} dari ${s.total})`;
}

function renderTask(task: Task): HTMLLIElement {
  const overdue = isOverdue(task);
  const li = el("li", `task p-${task.priority}${task.status === "selesai" ? " done" : ""}${overdue ? " overdue" : ""}`);

  const head = el("div", "task-head");
  head.append(el("span", "task-title", task.title));
  li.append(head);

  if (task.description) li.append(el("p", "task-desc", task.description));

  const meta = el("div", "task-meta");
  meta.append(
    el("span", "badge", `Tenggat: ${formatDate(task.deadline)}`),
    el("span", overdue ? "badge late" : "badge", task.status === "selesai" ? "Tuntas" : describeDeadline(task.deadline)),
    el("span", "badge", `Prioritas: ${PRIORITY_LABEL[task.priority]}`),
    el("span", `badge s-${task.status}`, STATUS_LABEL[task.status]),
  );
  li.append(meta);

  const actions = el("div", "task-actions");
  actions.append(
    actionButton(`Ubah status → ${STATUS_LABEL[nextStatus(task.status)]}`, () =>
      void persist(updateTask(tasks, task.id, { status: nextStatus(task.status) })),
    ),
    actionButton("Edit", () => startEdit(task.id)),
    actionButton(
      "Hapus",
      () => {
        if (confirm(`Hapus tugas "${task.title}"?`)) void persist(deleteTask(tasks, task.id));
      },
      "btn-danger",
    ),
  );
  li.append(actions);
  return li;
}

function renderList(): void {
  els.state.className = "state";
  els.state.replaceChildren();
  els.list.replaceChildren();

  if (loadState === "loading") {
    els.state.append(el("span", "spinner"), document.createTextNode("Memuat tugas..."));
    return;
  }
  if (loadState === "error") {
    els.state.className = "state error";
    const msg = el("p", undefined, loadError);
    const retry = actionButton("Coba lagi", () => void init(false));
    els.state.append(msg, retry);
    return;
  }

  const visible = sortTasks(filterTasks(tasks, filters), filters.sortBy);
  if (tasks.length === 0) {
    els.state.textContent = "Belum ada tugas. Tambahkan tugas pertamamu di formulir.";
  } else if (visible.length === 0) {
    els.state.textContent = "Tidak ada tugas yang cocok dengan pencarian/filter.";
  }
  els.list.append(...visible.map(renderTask));
}

function render(): void {
  renderSummary();
  renderList();
}

// ---------- Form ----------
function showErrors(messages: string[]): void {
  els.errors.replaceChildren(...messages.map((m) => el("li", undefined, m)));
  els.errors.hidden = messages.length === 0;
}

function resetForm(): void {
  editingId = null;
  els.form.reset();
  els.id.value = "";
  els.priority.value = "sedang";
  els.formTitle.textContent = "Tambah tugas";
  els.submit.textContent = "Tambah tugas";
  els.cancel.hidden = true;
  showErrors([]);
}

function startEdit(id: string): void {
  const task = findTask(tasks, id);
  if (task === undefined) return; // type narrowing: Task | undefined -> Task
  editingId = task.id;
  els.title.value = task.title;
  els.description.value = task.description ?? "";
  els.deadline.value = task.deadline;
  els.priority.value = task.priority;
  els.formTitle.textContent = "Edit tugas";
  els.submit.textContent = "Simpan perubahan";
  els.cancel.hidden = false;
  showErrors([]);
  els.title.focus();
  els.form.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (loadState !== "ready") {
    showErrors(["Data belum siap. Tunggu sampai tugas selesai dimuat."]);
    return;
  }
  const result = validateTaskInput({
    title: els.title.value,
    description: els.description.value,
    deadline: els.deadline.value,
    priority: els.priority.value,
  });
  if (!result.ok) {
    showErrors(result.errors);
    return;
  }
  if (editingId === null) {
    void persist(createTask(tasks, result.value));
  } else {
    void persist(updateTask(tasks, editingId, result.value));
  }
  resetForm();
});

els.cancel.addEventListener("click", resetForm);

// ---------- Pencarian, filter, sort ----------
els.search.addEventListener("input", () => {
  filters.keyword = els.search.value;
  renderList();
});
els.filterStatus.addEventListener("change", () => {
  filters.status = els.filterStatus.value as StatusFilter;
  renderList();
});
els.filterPriority.addEventListener("change", () => {
  filters.priority = els.filterPriority.value as PriorityFilter;
  renderList();
});
els.sort.addEventListener("change", () => {
  filters.sortBy = els.sort.value as SortKey;
  renderList();
});

// ---------- Tombol atas ----------
els.btnReload.addEventListener("click", () => void init(false));
els.btnError.addEventListener("click", () => void init(true));
els.btnReset.addEventListener("click", async () => {
  if (!confirm("Kembalikan ke data contoh? Data saat ini akan hilang.")) return;
  tasks = await resetTasks();
  loadState = "ready";
  resetForm();
  render();
});

// Batas minimal tenggat tidak dipaksakan (tugas lama boleh dicatat), tapi default hari ini.
els.deadline.value = todayISO();
void init();
