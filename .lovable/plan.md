# Redesain SiPi-Mu: Modern Hospital

Menyegarkan seluruh tampilan aplikasi dengan nuansa rumah sakit modern: palet Arctic Frost (biru es bersih), tipografi Sora + Manrope, dan arsitektur dashboard (sidebar + header + panel) yang lebih rapi dan berikon.

## Arah visual

- **Warna**: dasar putih kebiruan (#e8f0f8 / putih), aksen biru klinis (#2e6b8a) sebagai primary, biru muda (#6ba3c8) untuk state hover/highlight, dan #b8d4e8 untuk garis/permukaan. Warna status (hijau patuh, amber peringatan, merah tidak patuh) diselaraskan agar tetap kontras.
- **Tipografi**: Sora untuk judul/angka besar, Manrope untuk teks isi. Dimuat via Google Fonts.
- **Bentuk & kedalaman**: sudut membulat sedang, bayangan sangat lembut berwarna biru, garis tipis, banyak ruang putih — kesan steril dan tenang, bukan gelap-korporat.
- **Ikon**: konsisten memakai lucide, dengan wadah ikon lingkaran/rounded bernuansa biru muda di kartu statistik, header halaman, dan item navigasi.

## Arsitektur tampilan

```text
+-------------+-------------------------------------------+
|  SIDEBAR    |  HEADER: judul halaman + search + akun    |
|  logo RS    +-------------------------------------------+
|  Menu       |  Baris kartu statistik (ikon + angka)     |
|  + ikon     |  ---------------------------------------  |
|  aktif      |  Panel grafik / tabel dalam kartu bersih  |
|  ditandai   |                                           |
|  Profil     |                                           |
+-------------+-------------------------------------------+
```

- **Sidebar**: header logo + nama sistem, grup menu berikon dengan penanda aktif (pill biru), blok profil pengguna di bawah, mode ringkas (icon-only) tetap bekerja.
- **Header**: judul kontekstual per halaman, tombol notifikasi dan menu akun sebagai tombol ikon bulat.
- **Halaman**: pola seragam — PageHeader (judul + ikon + deskripsi + aksi), FilterBar, lalu konten dalam kartu.

## Yang diubah per layar

- **Login / Register / Lupa Password**: layout dua sisi — panel kiri bernuansa biru dengan logo, nama rumah sakit, dan poin singkat; kartu form bersih di kanan. Responsif menjadi satu kolom di mobile.
- **Dashboard**: baris kartu KPI berikon (total pasien, kepatuhan, LOS, dsb.), grafik dalam ChartCard dengan warna diselaraskan palet baru, legenda dan tooltip dirapikan.
- **Clinical Pathway**: header berikon, filter dalam satu baris rapi, tabel dengan baris lebih lega, badge status berwarna semantik.
- **Rekap Data**: filter dan tabel mengikuti gaya kartu yang sama; kolom sticky tetap dipertahankan.
- **Pengaturan**: tab dengan gaya baru dan ikon per tab.

## Catatan teknis

- Token warna baru ditulis dalam HSL di `src/index.css` (light + dark) dan dipetakan di `tailwind.config.ts`; tidak ada warna hardcoded di komponen.
- Tambah token gradient/shadow: `--gradient-hero`, `--shadow-soft`, `--shadow-card`.
- Font ditambahkan di `index.html` + `fontFamily` di `tailwind.config.ts` (`font-heading`, `font-sans`).
- Komponen bersama di `src/components/common/` (PageHeader, ChartCard, DataTable, FilterBar, states) diberi opsi `icon` dan gaya baru, sehingga seluruh halaman ikut berubah tanpa duplikasi.
- `AppSidebar.tsx` dan `Layout.tsx` ditulis ulang tampilannya; rute, data, hook, dan logika bisnis tidak disentuh.
- Metadata `index.html` (title/description/OG) disesuaikan dengan identitas SiPi-Mu.
