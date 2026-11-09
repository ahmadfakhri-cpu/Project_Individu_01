import type { Task } from "../types/task";
import { readJSON, writeJSON } from "../utils/storage";

const STORAGE_KEY = "task-planner:tasks:v1";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Data contoh agar aplikasi tidak kosong saat pertama dibuka (data samaran). */
function seedTasks(): Task[] {
  const day = (offset: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const pad = (n: number): string => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const now = new Date().toISOString();
  return [
    {
      id: "seed_1",
      title: "Selesaikan proyek TypeScript",
      description: "Task Planner untuk tugas libur sekolah",
      deadline: day(5),
      priority: "tinggi",
      status: "proses",
      createdAt: now,
      completedAt: null,
    },
    {
      id: "seed_2",
      title: "Kumpulkan laporan praktikum",
      deadline: day(-2),
      priority: "sedang",
      status: "todo",
      createdAt: now,
      completedAt: null,
    },
    {
      id: "seed_3",
      title: "Baca bab async/await",
      deadline: day(1),
      priority: "rendah",
      status: "selesai",
      createdAt: now,
      completedAt: now,
    },
  ];
}

/**
 * Memuat tugas secara asynchronous (simulasi latensi jaringan).
 * `simulateError` dipakai untuk mendemokan tampilan error.
 */
export async function loadTasks(options: { simulateError?: boolean } = {}): Promise<Task[]> {
  await wait(700);
  if (options.simulateError) {
    throw new Error("Gagal memuat data (simulasi error). Coba lagi.");
  }
  const stored = readJSON<Task[]>(STORAGE_KEY);
  if (stored === null) {
    const seed = seedTasks();
    writeJSON(STORAGE_KEY, seed);
    return seed;
  }
  if (!Array.isArray(stored)) throw new Error("Data tersimpan rusak.");
  return stored;
}

/** Menyimpan seluruh daftar tugas (async agar alurnya konsisten dengan loadTasks). */
export async function saveTasks(tasks: Task[]): Promise<void> {
  await wait(120);
  writeJSON(STORAGE_KEY, tasks);
}

export async function resetTasks(): Promise<Task[]> {
  const seed = seedTasks();
  await saveTasks(seed);
  return seed;
}
