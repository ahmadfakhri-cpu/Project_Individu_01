// Union / literal type: nilai yang boleh dipakai dibatasi oleh compiler.
export type Priority = "rendah" | "sedang" | "tinggi";
export type Status = "todo" | "proses" | "selesai";

export interface Task {
  id: string;
  title: string;
  description?: string; // optional property
  deadline: string; // format ISO tanggal: YYYY-MM-DD
  priority: Priority;
  status: Status;
  createdAt: string; // ISO datetime
  completedAt: string | null; // null = belum selesai
}

// Data yang diisi pengguna di form (turunan dari Task via utility type Pick).
export type TaskInput = Pick<Task, "title" | "description" | "deadline" | "priority">;

// Untuk edit: semua field input bersifat opsional (utility type Partial).
export type TaskChanges = Partial<TaskInput & Pick<Task, "status">>;

export type StatusFilter = Status | "semua" | "terlambat";
export type PriorityFilter = Priority | "semua";
export type SortKey = "deadline" | "priority" | "title";

export interface TaskFilters {
  keyword: string;
  status: StatusFilter;
  priority: PriorityFilter;
  sortBy: SortKey;
}

export interface TaskSummary {
  total: number;
  selesai: number;
  aktif: number;
  terlambat: number;
  progressPercent: number;
}

// Hasil validasi berupa discriminated union -> mudah dipakai dengan type narrowing.
export type ValidationResult =
  | { ok: true; value: TaskInput }
  | { ok: false; errors: string[] };

// Record: peta label bertipe untuk setiap nilai union.
export const STATUS_LABEL: Record<Status, string> = {
  todo: "Belum dikerjakan",
  proses: "Sedang dikerjakan",
  selesai: "Selesai",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  rendah: "Rendah",
  sedang: "Sedang",
  tinggi: "Tinggi",
};

export const PRIORITY_WEIGHT: Record<Priority, number> = {
  rendah: 1,
  sedang: 2,
  tinggi: 3,
};
