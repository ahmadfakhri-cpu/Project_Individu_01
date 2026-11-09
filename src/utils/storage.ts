/** Baca data dari localStorage. Mengembalikan null jika kosong atau rusak. */
export function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

/** Tulis data ke localStorage. Melempar Error jika gagal (mis. penyimpanan penuh). */
export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error("Gagal menyimpan data ke penyimpanan lokal.");
  }
}
