

## Rencana: Tambah Pilihan Tahun pada Dashboard, Clinical Pathway, dan Rekap Data

### Gambaran Umum
Saat ini ketiga halaman (Dashboard, Clinical Pathway, Rekap Data) tidak memiliki filter tahun. Data ditampilkan tanpa pembatasan tahun, atau menggunakan tahun berjalan secara default. Perubahan ini akan menambahkan dropdown "Pilih Tahun" di ketiga halaman sehingga pengguna bisa memfilter data berdasarkan tahun.

### Perubahan yang Dilakukan

#### 1. Dashboard (`src/pages/Dashboard.tsx`)
- Tambah state `selectedYear` dengan default tahun berjalan (2026)
- Tambah dropdown Select "Pilih Tahun" di sebelah dropdown diagnosis (pada kedua grafik)
- Pilihan tahun: 2024, 2025, 2026 (dan bisa diperluas)
- Kirim `selectedYear` ke fungsi `getMonthlyChartData`, `getComponentComplianceData`, dan `getComplianceByType`

#### 2. Clinical Pathway (`src/pages/ClinicalPathway.tsx`)
- Tambah state `selectedYear` dengan default tahun berjalan
- Tambah dropdown Select "Filter Tahun" di bagian filter (sebelah filter bulan)
- Filter data tabel berdasarkan tahun dari `tanggal_masuk`

#### 3. Rekap Data (`src/pages/RekapData.tsx`)
- Tambah state `selectedYear` dengan default tahun berjalan
- Tambah dropdown Select "Pilih Tahun" di bagian filter (sebelah filter bulan)
- Kirim tahun ke fungsi `fetchDataByMonth` dan `aggregateChecklistData`

#### 4. Hook `useDashboardData` (`src/hooks/useDashboardData.ts`)
- Update `getMonthlyChartData(type, year)` untuk memfilter data berdasarkan tahun
- Update `getComponentComplianceData(type, year)` untuk memfilter data berdasarkan tahun
- Update `getComplianceByType(type, month, year)` untuk memfilter data berdasarkan tahun

#### 5. Hook `useRekapData` (`src/hooks/useRekapData.ts`)
- Update `fetchDataByMonth(month, year)` - parameter `year` sudah ada tapi saat ini di-default ke tahun berjalan, pastikan parameter tahun dari UI diteruskan dengan benar

#### 6. Hook `useChecklistSummary` (`src/hooks/useChecklistSummary.ts`)
- Update `aggregateChecklistData(month, year)` untuk menerima parameter tahun

### Detail Teknis

**Opsi Tahun (shared constant):**
```
const yearOptions = [
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
];
```

**Filter pada Dashboard Charts:**
- `getMonthlyChartData` dan `getComponentComplianceData` saat ini mengelompokkan per bulan tanpa filter tahun, lalu mengambil 12 bulan terakhir. Dengan filter tahun, data akan difilter hanya untuk tahun yang dipilih sebelum dikelompokkan per bulan.

**Filter pada Clinical Pathway:**
- Menambahkan logika filter di `.filter()` yang sudah ada untuk memeriksa `getFullYear()` dari `tanggal_masuk` sesuai tahun yang dipilih.

**Filter pada Rekap Data:**
- Fungsi `fetchDataByMonth` sudah menerima parameter `year` (default ke tahun berjalan). Perlu memastikan dropdown tahun mengirimkan nilai yang benar ke fungsi ini.

### File yang Akan Diubah
1. `src/pages/Dashboard.tsx` - Tambah dropdown tahun + kirim parameter tahun
2. `src/pages/ClinicalPathway.tsx` - Tambah dropdown tahun + filter berdasarkan tahun
3. `src/pages/RekapData.tsx` - Tambah dropdown tahun + kirim parameter tahun
4. `src/hooks/useDashboardData.ts` - Update fungsi chart/compliance untuk menerima parameter tahun
5. `src/hooks/useChecklistSummary.ts` - Update untuk menerima parameter tahun (jika perlu)

