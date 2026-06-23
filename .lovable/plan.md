## Tujuan
- Data clinical pathway dengan `tanggal_masuk` tahun **< 2026** tetap memakai nama lama: **Pneumonia** dan **Dengue Fever**.
- Data dengan `tanggal_masuk` tahun **≥ 2026** memakai nama baru: **Intracranial Hemorrhagia** dan **Post Partum Hemorrhagia**.
- Dropdown filter & form input menyesuaikan nama yang ditampilkan berdasarkan tahun yang dipilih/aktif.

## Perubahan Database (migration)
1. Tambahkan kembali nilai enum lama pada kedua enum:
   - `clinical_pathway_type`: tambahkan `'Pneumonia'` dan `'Dengue Fever'`.
   - `daftar_cps`: tambahkan `'Pneumonia'` dan `'Dengue Fever'`.
2. Kembalikan data historis di `clinical_pathways`:
   - `UPDATE` baris dengan `EXTRACT(YEAR FROM tanggal_masuk) < 2026` dan `jenis_clinical_pathway = 'Intracranial Hemorrhagia'` → `'Pneumonia'`.
   - `UPDATE` baris dengan `EXTRACT(YEAR FROM tanggal_masuk) < 2026` dan `jenis_clinical_pathway = 'Post Partum Hemorrhagia'` → `'Dengue Fever'`.
   - Baris tahun 2026+ tidak diubah.
3. Pastikan tabel master `daftar_cp` punya baris target LOS untuk **kedua** nama (Pneumonia, Dengue Fever, Intracranial Hemorrhagia, Post Partum Hemorrhagia) supaya kalkulasi LOS bekerja untuk pasien dari era manapun. Tambahkan baris yang belum ada via `INSERT ... ON CONFLICT DO NOTHING`.

## Perubahan Frontend
Logika umum: tampilkan nama lama jika tahun terpilih < 2026; nama baru jika ≥ 2026. Untuk komponen tanpa konteks tahun (mis. checklist patient detail), kedua kunci di-map ke template yang sama.

1. `src/constants/pathwayOptions.ts` (file baru, opsional) — fungsi `getPathwayOptions(year: number)` yang mengembalikan daftar opsi pathway sesuai tahun. Dipakai di Dashboard, RekapData, ClinicalPathway, ClinicalPathwayForm.
2. `src/pages/Dashboard.tsx`:
   - Daftar `pathwayOptions` dibuat dinamis dari `selectedYear`.
   - Saat user mengganti tahun, reset `selectedDiagnosis` jika nilainya tidak ada di opsi baru.
   - `getTargetInfo` menerima kedua nama lama & baru (case `'Pneumonia'`/`'Intracranial Hemorrhagia'` → `< 6x24 jam`; `'Dengue Fever'`/`'Post Partum Hemorrhagia'` → `< 3x24 jam`).
3. `src/hooks/useDashboardData.ts`:
   - Mapping label diagnosis (di tiga tempat: chart, compliance, dsb.) menerima kedua nama lama & baru dan menampilkannya apa adanya.
4. `src/pages/RekapData.tsx`:
   - `pathwayOptions` dinamis berdasarkan `selectedYear`.
   - Reset filter pathway jika tahun berubah dan nilai tidak valid.
5. `src/pages/ClinicalPathway.tsx`:
   - Dropdown filter pathway dinamis sesuai tahun.
6. `src/pages/ClinicalPathwayForm.tsx`:
   - `clinicalPathwayOptions` dipilih berdasarkan tahun dari `tanggal_masuk` form (default: tahun berjalan). Saat user mengubah `tanggal_masuk`, daftar opsi pathway ikut menyesuaikan; reset nilai jika tidak valid.
7. `src/pages/ClinicalPathwayChecklist.tsx`:
   - Tambahkan kembali key `"Pneumonia"` dan `"Dengue Fever"` pada objek template (referensi ke isi yang sama dengan key baru) supaya pasien lama tetap punya checklist. Pengembangan: ekspor objek bersama lalu daftarkan keduanya, atau cukup duplikasi dua entri map yang menunjuk ke definisi yang sama.
8. `src/hooks/useRekapData.ts`:
   - `getTargetLOS` mengenali kedua nama lama & baru (Pneumonia/Intracranial Hemorrhagia → 6; Dengue Fever/Post Partum Hemorrhagia → 3).

## Catatan
- `src/integrations/supabase/types.ts` otomatis di-generate setelah migration.
- Tidak ada perubahan pada notifikasi WhatsApp; pesan akan otomatis memuat nama sesuai data baris.
- Setelah selesai, verifikasi: data 2025 dan sebelumnya tampil sebagai Pneumonia/Dengue Fever; data 2026 tampil sebagai Intracranial/Post Partum Hemorrhagia; form pendaftaran pasien baru di tahun 2026 hanya menampilkan nama baru.
