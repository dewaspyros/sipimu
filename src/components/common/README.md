# SiPi-Mu Shared UI Layer (`@/components/common`)

Lapisan komponen aplikasi di atas primitif shadcn/Radix (`@/components/ui`).
Aturannya sederhana:

```
src/components/ui/       -> primitif (shadcn/Radix). Jangan diubah manual.
src/components/common/   -> komponen aplikasi reusable (lapisan ini).
src/pages/               -> komposisi halaman. Tidak boleh membuat tabel/state view sendiri.
```

Impor selalu lewat satu pintu:

```tsx
import { PageHeader, DataTable, AsyncButton } from "@/components/common";
```

## Prinsip desain API

- **Token-only styling.** Tanpa `text-white` / `bg-[#...]`; semua warna lewat token semantik agar dark mode & tema tetap konsisten.
- **Props minimal, escape hatch jelas.** Setiap komponen menerima `className` dan meneruskan sisa props DOM.
- **Aksesibel secara default.** Nama aksesibel bersifat wajib pada `IconButton`, `caption` wajib pada `DataTable`.
- **State tidak boleh implisit.** Loading / empty / error selalu eksplisit sebagai props, bukan ditebak dari `data.length`.
- **Terkontrol maupun tidak.** `DataTable` bisa mengelola sort sendiri (`defaultSort`) atau dikendalikan (`sort` + `onSortChange`).

---

## PageHeader

```tsx
<PageHeader
  title="Rekap Data"
  description="Laporan dan rekap data Clinical Pathways per bulan"
  actions={<Button>Export Excel</Button>}
/>
```

| Prop | Tipe | Default | Catatan |
| --- | --- | --- | --- |
| `title` | `string` | — | dirender sebagai `h1` |
| `description` | `ReactNode` | — | |
| `actions` | `ReactNode` | — | kanan di desktop, wrap di mobile |
| `as` | `"h1" \| "h2"` | `"h1"` | pakai `h2` bila halaman sudah punya `h1` |

## FilterBar / SelectFilter / SearchFilter

```tsx
<FilterBar label="Filter data clinical pathway">
  <SearchFilter value={q} onValueChange={setQ} placeholder="Nama pasien atau No. RM" />
  <SelectFilter label="Filter Tahun" value={year} onValueChange={setYear} options={yearOptions} />
  <SelectFilter label="Filter Bulan" value={month} onValueChange={setMonth} options={MONTH_OPTIONS} />
</FilterBar>
```

Setiap filter membuat `id` sendiri via `useId()` sehingga aman dirender berkali-kali
(tidak ada `duplicate-id-aria`). Label selalu terhubung ke kontrol lewat `htmlFor`.

Konstanta siap pakai: `MONTH_OPTIONS`, `WARD_OPTIONS`, `ALL_VALUE` (`"all"` — Radix Select
melarang nilai string kosong, jadi jangan pakai `""` untuk opsi "semua").

## LoadingState / EmptyState / ErrorState

```tsx
{isLoading ? <LoadingState label="Memuat rekap data..." />
  : error   ? <ErrorState onRetry={refetch} />
  : rows.length === 0 ? <EmptyState icon={FileText} title="Tidak ada data" description="..." />
  : <Content />}
```

`LoadingState` punya `variant="skeleton"` (placeholder konten, `rows` dapat diatur) dan
`variant="spinner"`. Keduanya memakai `role="status"` + `aria-live="polite"`.
`ErrorState` memakai `role="alert"`.

## DataTable

Tabel generik dengan sort, state bawaan, dan semantik tabel yang benar
(`<caption>`, `scope="col"`, `aria-sort`).

```tsx
const columns = useMemo<DataTableColumn<Pathway>[]>(() => [
  { id: "no_rm", header: "No. RM", sortValue: (r) => r.no_rm, cell: (r) => r.no_rm },
  { id: "los", header: "LOS", align: "center", sortValue: (r) => r.los_hari ?? null,
    cell: (r) => (r.los_hari ? `${r.los_hari} hari` : "-") },
  { id: "aksi", header: "Aksi", srLabel: "Aksi", cell: (r) => <RowActions row={r} /> },
], []);

<DataTable
  caption="Daftar data clinical pathway pasien beserta aksi kelola data"
  data={rows}
  columns={columns}
  getRowId={(row) => row.id}
  isLoading={loading}
  error={error}
  onRetry={refetch}
  emptyTitle="Belum ada data clinical pathway"
  emptyAction={<Button onClick={add}>Tambah Data</Button>}
/>
```

Catatan penting:

- `getRowId` wajib dan harus stabil — jangan pakai index array.
- Kolom hanya bisa di-sort bila `sortValue` diisi; sort memakai `localeCompare("id-ID", { numeric: true })`.
- Klik header berulang: asc -> desc -> tanpa sort.
- `hideBelowMd` menyembunyikan kolom sekunder di layar kecil, bukan memaksa scroll horizontal panjang.
- Definisikan `columns` dengan `useMemo` agar tidak membuat ulang tiap render.

## AsyncButton & IconButton

```tsx
<AsyncButton type="submit" isLoading={saving} loadingText="Menyimpan...">
  <Save className="mr-2 h-4 w-4" aria-hidden="true" />
  Simpan Pengaturan
</AsyncButton>

<IconButton variant="outline" label={`Edit data ${row.nama_pasien}`} onClick={edit}>
  <Edit className="h-4 w-4" aria-hidden="true" />
</IconButton>
```

`AsyncButton` menyetel `aria-busy` dan otomatis menonaktifkan tombol saat loading
(mencegah double submit). `IconButton` mewajibkan `label` — inilah yang menutup celah
`button-name` pada tombol ikon, dan `touchSafe` menjaga tap target 44px di mobile.

## Field

Pembungkus field form yang menautkan label, deskripsi, dan error via `aria-describedby`/`aria-invalid`.

```tsx
<Field label="No. RM" required error={errors.no_rm?.message} description="8 digit tanpa spasi">
  {(props) => <Input {...props} {...register("no_rm")} />}
</Field>
```

## ChartCard

```tsx
<ChartCard
  title="Grafik Kepatuhan LOS, CP dan Avg LOS"
  description="Presentase kepatuhan Clinical Pathways per bulan"
  isLoading={loading}
  isEmpty={data.length === 0}
  toolbar={<SelectFilter label="Tahun" value={year} onValueChange={setYear} options={yearOptions} />}
>
  <ResponsiveContainer width="100%" height={400}>...</ResponsiveContainer>
</ChartCard>
```

`height` menjaga tinggi minimum area chart sehingga transisi loading -> data tidak menggeser layout.

---

## Best practice

1. Jangan menulis `<table>` mentah di halaman — pakai `DataTable`.
2. Jangan menulis spinner ad-hoc (`animate-spin rounded-full border-b-2`) — pakai `LoadingState` / `AsyncButton`.
3. Empty state harus membedakan "belum ada data" vs "tidak ada hasil filter", dan menawarkan jalan keluar.
4. Hindari warna literal; hanya token (`text-muted-foreground`, `bg-primary/10`, dst.).
5. Semua tombol ikon wajib lewat `IconButton`; `title` saja tidak cukup untuk screen reader.
6. Nilai opsi Select tidak boleh string kosong — gunakan `ALL_VALUE`.
7. Filter dan turunan data dibungkus `useMemo`; hindari `useEffect` untuk menyalin state turunan.

## Skalabilitas

- Bila jumlah baris melewati ~1.000, tambahkan pagination/virtualisasi di dalam `DataTable`
  sehingga seluruh halaman ikut mendapatkannya tanpa perubahan pemanggil.
- Filter di halaman saat ini berbasis klien; saat data bertambah, pindahkan predikat ke query
  Supabase dan biarkan API komponen tetap sama.
