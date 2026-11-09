<<<<<<< HEAD
# Task & Deadline Planner - Nomor Absen 01

**Nama:** Ahmad Fakhry Habibulloh  |  **Kelas:** XI RPL  |  **Sekolah:** SMK Antartika 1 Sidoarjo

## Masalah dan tujuan

Siswa sering lupa tenggat tugas dan tidak tahu mana yang paling mendesak. Aplikasi ini membantu mencatat tugas beserta tenggat, prioritas, dan status, lalu menampilkan tugas yang terlambat dan persentase progres secara otomatis.

## Fitur utama dan fitur khas

**Standar minimum**
- CRUD: tambah, lihat, edit, hapus, dan ubah status tugas (Belum -> Sedang -> Selesai).
- Pencarian kata kunci (judul/catatan) + filter status, filter prioritas, dan pengurutan (tenggat/prioritas/judul).
- Ringkasan otomatis: total, aktif, selesai, terlambat (dihitung dengan `reduce`).
- Data tersimpan di `localStorage` (tetap ada setelah refresh).
- Validasi input, tampilan data kosong, loading, dan error (dengan tombol "Coba lagi").
- Alur async (`async/await`) untuk memuat dan menyimpan data simulasi.
- UI responsif (desktop dan ponsel).

**Fitur khas absen 01**
- Penanda dan filter **tugas terlambat** (tenggat lewat dan belum selesai).
- **Persentase tugas selesai** dengan progress bar.
- Filter status/prioritas.

## Teknologi yang digunakan

Vite + Vanilla TypeScript + HTML + CSS. Tanpa framework.

## Cara instalasi dan menjalankan

```bash
npm install
npm run dev      # jalankan mode pengembangan
npm run build    # cek tipe (tsc) + build produksi
npm run preview  # pratinjau hasil build
```

Butuh Node.js 20.19+ atau 22.12+.

## Konsep TypeScript yang diterapkan

| Konsep | Lokasi |
|---|---|
| `interface Task`, `TaskFilters`, `TaskSummary` | `src/types/task.ts` |
| Union/literal type `Priority`, `Status`, `SortKey` | `src/types/task.ts` |
| Utility type `Pick`, `Partial` (`TaskInput`, `TaskChanges`) | `src/types/task.ts` |
| `Record<Status, string>` untuk label dan bobot prioritas | `src/types/task.ts` |
| Discriminated union `ValidationResult` + type narrowing | `src/services/taskService.ts`, `src/main.ts` |
| Function dengan parameter dan return type | seluruh `services/` dan `utils/` |
| Generic `readJSON<T>` / `writeJSON<T>` | `src/utils/storage.ts` |
| Penanganan `null`/`undefined` (`completedAt: string \| null`, `findTask`) | `src/main.ts` |
| Module `import`/`export` | seluruh proyek |
| `async/await` + `try/catch` | `src/services/taskApi.ts`, `src/main.ts` |

Mode `strict` aktif dan tidak ada penggunaan `any`.

## Struktur folder

```
src/
  types/task.ts           # interface, union type, label
  services/taskService.ts # aturan bisnis: CRUD, filter, sort, ringkasan, validasi
  services/taskApi.ts     # load/save async + data contoh
  utils/date.ts           # fungsi tanggal
  utils/storage.ts        # localStorage
  main.ts                 # menghubungkan UI dengan service
  style.css
index.html
```

## Screenshot aplikasi

Tambahkan minimal 3 screenshot sebelum dikumpulkan (simpan di folder `screenshots/`):

1. `screenshots/daftar-tugas.png` - daftar tugas + ringkasan + progress
2. `screenshots/tugas-terlambat.png` - filter "Terlambat"
3. `screenshots/validasi-error.png` - pesan validasi form / tampilan mobile

## Minimal 5 test case (langkah dan hasil yang diharapkan)

| # | Langkah | Hasil yang diharapkan |
|---|---|---|
| 1 | Kosongkan judul, klik "Tambah tugas" | Muncul pesan "Judul tugas tidak boleh kosong."; data tidak bertambah |
| 2 | Isi judul + tenggat valid, klik "Tambah tugas" | Tugas muncul di daftar; total dan progres ikut berubah |
| 3 | Tambah tugas dengan tenggat kemarin | Tugas diberi badge "Terlambat n hari"; angka Terlambat naik; muncul di filter "Terlambat" |
| 4 | Klik "Ubah status" sampai "Selesai" | Judul dicoret, progres naik, tugas tidak lagi dihitung terlambat |
| 5 | Ketik kata kunci di kolom cari | Daftar hanya menampilkan tugas yang cocok; jika tidak ada, tampil pesan kosong |
| 6 | Refresh halaman (F5) | Semua tugas masih ada (localStorage) |
| 7 | Klik "Hapus" lalu konfirmasi | Tugas hilang dari daftar dan ringkasan diperbarui |
| 8 | Klik "Simulasi error" | Tampil loading lalu pesan error + tombol "Coba lagi"; klik tombol memulihkan data |
| 9 | Klik "Edit", ubah prioritas, simpan | Data tugas berubah, tidak terbentuk duplikat |

Pengujian logika (validasi, filter, sort, ringkasan, terlambat) juga sudah dijalankan lewat skrip uji dan lulus.

## Batasan yang diketahui

- Data hanya tersimpan di browser/perangkat yang sama (`localStorage`), tidak ada sinkronisasi antar perangkat.
- "Memuat data" adalah simulasi (jeda buatan), bukan API sungguhan.
- Tidak ada notifikasi pengingat otomatis.
- Perhitungan tanggal memakai zona waktu perangkat.

## Pernyataan penggunaan AI/referensi

Saya menggunakan bantuan AI (Claude) untuk membantu menyusun kerangka proyek dan kode awal. Kode sudah saya baca dan pelajari, dan saya siap menjelaskannya saat demo. Referensi: TypeScript Guidebook dan dokumentasi Vite.

> Ubah/hapus bagian ini sesuai kondisi sebenarnya.
=======
# Project_Individu_01
>>>>>>> 5d88f90097bd2b93f0ce8e14b6a17630593ec2a3
