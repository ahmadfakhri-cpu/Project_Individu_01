const MS_PER_DAY = 24 * 60 * 60 * 1000;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Tanggal hari ini (zona waktu lokal) dalam format YYYY-MM-DD. */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Cek apakah string adalah tanggal YYYY-MM-DD yang benar-benar ada di kalender. */
export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function toDayNumber(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / MS_PER_DAY);
}

/** Selisih hari dari `from` ke `to` (positif = di masa depan). */
export function diffInDays(to: string, from: string = todayISO()): number {
  return toDayNumber(to) - toDayNumber(from);
}

export function formatDate(iso: string): string {
  if (!isValidISODate(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

/** Teks relatif: "3 hari lagi", "Hari ini", "Terlambat 2 hari". */
export function describeDeadline(iso: string): string {
  const diff = diffInDays(iso);
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Besok";
  if (diff > 1) return `${diff} hari lagi`;
  return `Terlambat ${Math.abs(diff)} hari`;
}
