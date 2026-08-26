# Optimasi Performa SiPi-Mu

Hasil pemeriksaan langsung (kode + database) sebelum menyusun rencana:

- `clinical_pathways` 418 baris, `compliance_data` 300, `clinical_pathway_checklist` 20.630, `checklist_summary` 13. Jadi skala data saat ini masih kecil — bottleneck utamanya ada di pola fetch & render, bukan volume data.
- Index yang ada hanya primary key + unique `compliance_data.patient_id`. **Tidak ada** index pada `clinical_pathway_checklist.patient_id` (20k baris, di-query per pasien) maupun pada `clinical_pathways.tanggal_masuk` (dipakai untuk filter bulan/tahun).
- `QueryClient` sudah dipasang di `App.tsx`, tetapi tidak satu pun hook memakainya — semua fetching manual via `useState` + `useEffect`.

## Masalah yang ditemukan

1. **Dashboard menarik seluruh tabel tiap kali dibuka.** `useDashboardData` memanggil `fetchAllData()` (semua pathway, tanpa filter tahun/bulan) + `getBulkComplianceData` + 6 query view sekaligus pada setiap mount. Tidak ada cache, jadi pindah menu lalu kembali = fetch ulang semuanya. Limit default PostgREST 1000 baris juga akan diam-diam memotong data begitu pasien melewati 1000.
2. **Memo tidak berfungsi.** `getComplianceByType`, `getMonthlyChartData`, `getComponentComplianceData` dibuat ulang setiap render hook, sehingga `useMemo` di `Dashboard.tsx` yang bergantung padanya tetap menghitung ulang seluruh agregasi di tiap render.
3. **Agregasi berulang di client.** Tiap kartu/grafik memfilter ulang array yang sama (parse `new Date()` per baris, per pemanggilan). Bisa dijadikan satu kali reduce.
4. **RekapData menyimpan hasil filter di state.** `filteredData` disimpan lewat `useEffect` + `setState`, artinya dua render tiap perubahan filter, dan array data terduplikasi di memori.
5. **Tidak ada code splitting.** Recharts, day-picker, seluruh halaman berada di satu bundle awal — memperlambat first load, termasuk halaman Login yang tidak butuh chart.
6. **Query per-pasien tanpa index.** Checklist (20k baris) di-filter per `patient_id` melalui sequential scan.
7. **Kebocoran & noise runtime.** `console.log` debug dieksekusi tiap render di `ClinicalPathwayChecklist` (termasuk log berisi session id di `useComplianceData`), `setTimeout(navigate)` tanpa cleanup, dan draft autosave di form menulis ke `localStorage` pada tiap keystroke.
8. **Metadata head masih default** ("Lovable Generated Project" di og:description).

## Rencana perbaikan

### A. Lapisan data (dampak terbesar)
- Pindahkan semua fetching ke React Query (`useQuery`) dengan `staleTime` wajar (mis. 5 menit) dan key berbasis filter, sehingga navigasi antar menu tidak memicu fetch ulang.
- Ganti `fetchAllData()` di dashboard dengan query terfilter tahun; ambil pathway + compliance dalam satu query relasional (`select('*, compliance_data(*)')`) agar dua round-trip jadi satu, dan pasang `.range()` eksplisit supaya batas 1000 baris tidak menggigit.
- Tambahkan index database: `clinical_pathway_checklist(patient_id)`, `clinical_pathways(tanggal_masuk)`, dan `clinical_pathways(jenis_clinical_pathway, tanggal_masuk)`.

### B. Rendering
- Bungkus fungsi agregasi dengan `useCallback`/`useMemo` di `useDashboardData` agar memo di `Dashboard.tsx` benar-benar efektif.
- Hitung seluruh statistik dashboard dalam satu pass (single reduce) dan pre-parse tanggal sekali saat transformasi data, bukan di setiap filter.
- `RekapData`: ubah `filteredData` dari state menjadi nilai `useMemo` turunan; memoisasi baris tabel yang berat.
- Lazy-load rute lewat `React.lazy` + `Suspense`, sehingga Recharts hanya diunduh saat Dashboard dibuka.

### C. Kebersihan eksekusi
- Hapus `console.log` di jalur render dan log yang memuat session id.
- Bersihkan `setTimeout` navigasi lewat cleanup effect.
- Debounce penulisan draft form ke `localStorage` (≈400 ms) alih-alih tiap keystroke.
- Perbaiki metadata `index.html` (title, description, og/twitter) sesuai aplikasi.

### D. Skalabilitas (rekomendasi, tidak diimplementasikan sekarang kecuali disetujui)
- Pindahkan agregasi kepatuhan ke SQL view/RPC ketika data melewati beberapa ribu baris, agar browser tidak lagi mengunduh seluruh tabel.
- Terapkan pagination server-side pada Rekap Data & Clinical Pathway.

## Catatan teknis
Perubahan menyentuh: `src/hooks/useDashboardData.ts`, `useRekapData.ts`, `useComplianceData.ts`, `useClinicalPathways.ts`, `src/pages/Dashboard.tsx`, `RekapData.tsx`, `ClinicalPathway.tsx`, `ClinicalPathwayChecklist.tsx`, `ClinicalPathwayForm.tsx`, `src/App.tsx`, `index.html`, plus satu migrasi database untuk index. Tidak ada perubahan tampilan atau aturan bisnis — hanya kecepatan dan efisiensi.
