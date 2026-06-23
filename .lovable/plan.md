## Masalah

Di `src/hooks/useDashboardData.ts`, fungsi `getMonthlyChartData` dan `getComponentComplianceData` memakai `pathwayMap` yang hanya berisi 5 diagnosis lama:

```ts
const pathwayMap = {
  "Sectio Caesaria": "Sectio Caesaria",
  "Stroke Hemoragik": "Stroke Hemoragik",
  "Stroke Non Hemoragik": "Stroke Non Hemoragik",
  Pneumonia: "Pneumonia",
  "Dengue Fever": "Dengue Fever",
};
const targetType = type === "all" ? null : pathwayMap[type];
let filteredData = targetType ? rekapData.filter(...) : rekapData;
```

Ketika user memilih **Intracranial Hemorrhagia** atau **Post Partum Hemorrhagia**, `pathwayMap[type]` = `undefined`, lalu `targetType ? ... : rekapData` jatuh ke cabang `rekapData` — sehingga grafik menampilkan **SEMUA pasien dari semua diagnosis** untuk tahun 2026, bukan filter yang dipilih. Itulah kenapa Jan–April 2026 terlihat "terisi" di Dashboard padahal di Rekap Data memang kosong (tidak ada pasien Intracranial / Post Partum di bulan tersebut).

`getComplianceByType` juga punya `pathwayMap` yang sama, tapi memakai fallback `pathwayMap[type] || type` sehingga filternya benar — itu kebetulan tidak terdampak.

## Perubahan

**File:** `src/hooks/useDashboardData.ts`

1. Tambahkan dua entri ke ketiga `pathwayMap` (di `getComplianceByType`, `getMonthlyChartData`, `getComponentComplianceData`):
   - `"Intracranial Hemorrhagia": "Intracranial Hemorrhagia"`
   - `"Post Partum Hemorrhagia": "Post Partum Hemorrhagia"`
2. Ubah fallback di `getMonthlyChartData` dan `getComponentComplianceData` agar konsisten:
   ```ts
   const targetType = type === "all" ? null : (pathwayMap[type] || type);
   ```
   Ini mencegah bug serupa di masa depan jika ada diagnosis baru ditambahkan tanpa update map.

## Hasil yang diharapkan

- Dashboard tahun 2026, filter **Intracranial Hemorrhagia** / **Post Partum Hemorrhagia**: grafik Jan–April **kosong** (0%), konsisten dengan Rekap Data.
- Diagnosis lain tetap berfungsi seperti sebelumnya.
- Tidak ada perubahan data di database, hanya logika filter di frontend.
