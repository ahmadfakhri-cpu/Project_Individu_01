import {
  PRIORITY_WEIGHT,
  type Priority,
  type Status,
  type Task,
  type TaskChanges,
  type TaskFilters,
  type TaskInput,
  type TaskSummary,
  type ValidationResult,
} from "../types/task";
import { diffInDays, isValidISODate } from "../utils/date";

const PRIORITIES: readonly Priority[] = ["rendah", "sedang", "tinggi"];
const TITLE_MAX = 80;

function isPriority(value: string): value is Priority {
  return (PRIORITIES as readonly string[]).includes(value);
}

/** Validasi input form. Mengembalikan daftar pesan error yang jelas. */
export function validateTaskInput(raw: {
  title: string;
  description?: string;
  deadline: string;
  priority: string;
}): ValidationResult {
  const errors: string[] = [];
  const title = raw.title.trim();
  const description = raw.description?.trim();

  if (title.length === 0) errors.push("Judul tugas tidak boleh kosong.");
  else if (title.length > TITLE_MAX) errors.push(`Judul maksimal ${TITLE_MAX} karakter.`);

  if (raw.deadline === "") errors.push("Tenggat wajib diisi.");
  else if (!isValidISODate(raw.deadline)) errors.push("Format tenggat tidak valid.");

  if (!isPriority(raw.priority)) errors.push("Prioritas tidak valid.");

  if (errors.length > 0 || !isPriority(raw.priority)) return { ok: false, errors };

  return {
    ok: true,
    value: {
      title,
      description: description ? description : undefined,
      deadline: raw.deadline,
      priority: raw.priority,
    },
  };
}

function generateId(): string {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

// ---- CRUD (immutable: selalu mengembalikan array baru) ----

export function createTask(tasks: Task[], input: TaskInput): Task[] {
  const task: Task = {
    id: generateId(),
    ...input,
    status: "todo",
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  return [task, ...tasks];
}

export function updateTask(tasks: Task[], id: string, changes: TaskChanges): Task[] {
  return tasks.map((task) => {
    if (task.id !== id) return task;
    const next: Task = { ...task, ...changes };
    // Jaga konsistensi completedAt dengan status.
    if (changes.status !== undefined) {
      next.completedAt = changes.status === "selesai" ? new Date().toISOString() : null;
    }
    return next;
  });
}

export function deleteTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id);
}

export function findTask(tasks: Task[], id: string): Task | undefined {
  return tasks.find((task) => task.id === id);
}

/** Siklus status: todo -> proses -> selesai -> todo. */
export function nextStatus(status: Status): Status {
  const order: Record<Status, Status> = {
    todo: "proses",
    proses: "selesai",
    selesai: "todo",
  };
  return order[status];
}

// ---- Logika turunan ----

/** Tugas terlambat = belum selesai dan tenggat sudah lewat. */
export function isOverdue(task: Task): boolean {
  return task.status !== "selesai" && diffInDays(task.deadline) < 0;
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const keyword = filters.keyword.trim().toLowerCase();
  return tasks.filter((task) => {
    const matchKeyword =
      keyword === "" ||
      task.title.toLowerCase().includes(keyword) ||
      (task.description ?? "").toLowerCase().includes(keyword);

    let matchStatus: boolean;
    if (filters.status === "semua") matchStatus = true;
    else if (filters.status === "terlambat") matchStatus = isOverdue(task);
    else matchStatus = task.status === filters.status;

    const matchPriority = filters.priority === "semua" || task.priority === filters.priority;

    return matchKeyword && matchStatus && matchPriority;
  });
}

export function sortTasks(tasks: Task[], sortBy: TaskFilters["sortBy"]): Task[] {
  const copy = [...tasks];
  switch (sortBy) {
    case "deadline":
      return copy.sort((a, b) => a.deadline.localeCompare(b.deadline));
    case "priority":
      return copy.sort((a, b) => PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]);
    case "title":
      return copy.sort((a, b) => a.title.localeCompare(b.title, "id"));
  }
}

/** Ringkasan dihitung dari data (reduce), bukan angka statis. */
export function summarize(tasks: Task[]): TaskSummary {
  const base = tasks.reduce(
    (acc, task) => {
      if (task.status === "selesai") acc.selesai += 1;
      else acc.aktif += 1;
      if (isOverdue(task)) acc.terlambat += 1;
      return acc;
    },
    { selesai: 0, aktif: 0, terlambat: 0 },
  );
  const total = tasks.length;
  return {
    total,
    ...base,
    progressPercent: total === 0 ? 0 : Math.round((base.selesai / total) * 100),
  };
}
