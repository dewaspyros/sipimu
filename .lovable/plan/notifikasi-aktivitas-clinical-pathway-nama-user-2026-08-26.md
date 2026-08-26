# Notifikasi Aktivitas Clinical Pathway + Nama User

## Tujuan
1. Tombol lonceng di kanan atas menampilkan 5 aktivitas Clinical Pathway terakhir (siapa, apa, kapan).
2. Nama pengguna di header tidak lagi menampilkan angka NIK, melainkan nama lengkap dari profil.

## Yang akan dibangun

### 1. Penyimpanan notifikasi
Tabel baru `public.activity_notifications` berisi: pelaku (id user + nama pelaku yang disimpan langsung), jenis aksi (tambah pasien / edit pasien / simpan checklist), nama pasien, no RM, jenis clinical pathway, dan waktu.

Nama pelaku disimpan menyatu di baris notifikasi karena aturan akses profil saat ini hanya mengizinkan seseorang melihat profilnya sendiri — dengan cara ini semua staf tetap bisa melihat nama pembuat aktivitas tanpa melonggarkan akses data profil.

Aturan akses:
- Semua staf yang sudah disetujui bisa melihat seluruh notifikasi.
- Staf yang sudah disetujui bisa menambah notifikasi atas namanya sendiri.
- Hanya admin yang bisa menghapus.

### 2. Pencatatan aktivitas
Notifikasi dicatat dari aplikasi setelah aksi berhasil:
- Simpan pasien baru (Form Identitas Pasien)
- Simpan perubahan data pasien (edit)
- Simpan checklist Clinical Pathway

### 3. Tampilan lonceng notifikasi
- Lonceng menjadi dropdown berisi maksimal 5 aktivitas terbaru: nama user, deskripsi aksi, nama pasien, dan waktu relatif (mis. "5 menit lalu").
- Titik indikator hanya muncul jika ada aktivitas baru sejak terakhir dibuka (disimpan lokal di perangkat).
- Daftar diperbarui otomatis secara realtime; ada status kosong dan status memuat yang aksesibel.

### 4. Nama user di header
- Mengambil `full_name` dari profil user yang sedang login.
- Ditampilkan di menu akun dan sebagai inisial avatar; jika `full_name` kosong, jatuh kembali ke NIK.

## Catatan teknis
- Migrasi: `CREATE TABLE public.activity_notifications` + GRANT untuk `authenticated`/`service_role`, RLS aktif dengan policy berbasis `is_user_approved`/`has_role`, index pada `created_at DESC`, dan penambahan tabel ke publikasi realtime.
- Hook baru `src/hooks/useNotifications.ts` (React Query + channel realtime, cleanup via `removeChannel`) menyediakan `notifications` dan `logActivity`.
- Hook baru `src/hooks/useProfile.ts` untuk mengambil profil user aktif (cached).
- `src/components/Layout.tsx`: lonceng dibungkus `DropdownMenu`, memakai `displayName` dari profil.
- Pencatatan dipanggil di `src/pages/ClinicalPathwayForm.tsx` (create & update) dan halaman checklist Clinical Pathway.
- Kegagalan pencatatan notifikasi tidak boleh membatalkan penyimpanan data pasien (dicatat diam-diam).
