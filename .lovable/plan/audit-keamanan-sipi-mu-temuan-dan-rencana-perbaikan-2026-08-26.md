# Audit Keamanan SiPi-Mu — Temuan dan Rencana Perbaikan

Aplikasi ini menyimpan data pasien (nama, No. RM, DPJP, bangsal, tanggal masuk). Hasil audit: **data pasien dan API key WhatsApp saat ini bisa dibaca siapa saja dari internet tanpa login.** Ini bukan dugaan — saya sudah memeriksa kebijakan akses dan izin tabel di database.

## Ringkasan temuan

| # | Temuan | Tingkat | Dampak |
|---|--------|---------|--------|
| 1 | 7 view laporan (`v_pathway_compliance`, `v_los_compliance`, `v_monthly_stats`, dll.) tidak punya proteksi baris dan bisa dibaca `anon` | Kritis | Seluruh data pasien bocor hanya dengan kunci publik yang ada di kode frontend |
| 2 | `whatsapp_settings` (berisi API key Fonnte + nomor tujuan) dapat dibaca dan diubah tanpa login | Kritis | API key WhatsApp rumah sakit dicuri, dipakai kirim pesan atas nama RS; penyerang bisa mengalihkan notifikasi ke nomornya sendiri |
| 3 | `compliance_data` dan `checklist_summary` berkebijakan role `public` + kondisi `true` | Kritis | Data kepatuhan pasien dibaca/diubah/dihapus tanpa login |
| 4 | Semua tabel punya GRANT `INSERT/UPDATE/DELETE` untuk `anon` | Kritis | Perlindungan hanya bertumpu pada RLS; satu kebijakan longgar = tabel bisa ditulis publik |
| 5 | 3 edge function (`whatsapp-notification`, `fonnte-get-groups`, `fonnte-update-group`) `verify_jwt = false` + CORS `*` | Tinggi | Siapa pun bisa memanggilnya: spam WhatsApp, membaca daftar grup, mengubah grup tujuan |
| 6 | Tidak ada pembedaan hak: setiap user login bisa hapus semua rekam pasien, ubah `monthly_summary`, `compliance_overrides` | Tinggi | Satu akun perawat yang bocor = seluruh data bisa dihapus |
| 7 | `ProtectedRoute` hanya cek "sudah login", tidak cek `is_approved` maupun role | Sedang | User yang persetujuannya dicabut tetap bisa memakai app selama sesinya hidup |
| 8 | Anon key + service role token tertulis literal di fungsi database `notify_whatsapp_new_pathway` | Sedang | Kredensial tersimpan di definisi fungsi, sulit dirotasi |
| 9 | Proteksi password bocor mati, masa berlaku OTP terlalu panjang, versi Postgres punya patch tertunda | Sedang | Password lemah/terkena kebocoran lolos; jendela penyalahgunaan OTP lebar |
| 10 | Satu fungsi database tanpa `search_path` tetap | Rendah | Risiko pembajakan skema pada fungsi SECURITY DEFINER |

### Skenario serangan nyata (temuan 1–2)

Kunci publik Supabase memang wajar ada di kode frontend — itu bukan masalahnya. Masalahnya, dengan kunci itu seseorang bisa memanggil view laporan langsung dari terminal, tanpa akun, dan menerima seluruh baris data pasien. Dengan cara yang sama ia membaca API key WhatsApp, lalu mengganti nomor/grup tujuan notifikasi sehingga setiap pasien baru yang diinput terkirim ke ponselnya.

## Rencana perbaikan

### Tahap 1 — Menutup kebocoran (migrasi database)

1. Cabut semua izin `anon` dari tabel dan view di skema publik. Aplikasi ini tidak punya halaman publik apa pun; semua akses lewat user login.
2. Tulis ulang kebijakan `whatsapp_settings`: baca dan tulis hanya untuk admin (`has_role(auth.uid(),'admin')`). Edge function tetap bisa mengaksesnya lewat jalur internal.
3. Tulis ulang kebijakan `compliance_data` dan `checklist_summary` agar berlaku untuk role `authenticated`, bukan `public`.
4. Ubah semua view laporan menjadi `security_invoker = true` sehingga view ikut menghormati kebijakan tabel di baliknya.
5. Tambahkan syarat "akun sudah disetujui" (`is_user_approved(auth.uid())`) pada kebijakan baca/tulis data pasien.
6. Batasi DELETE data pasien, serta seluruh tulis ke `monthly_summary` dan `compliance_overrides`, hanya untuk admin.
7. Perbaiki fungsi tanpa `search_path` tetap.

### Tahap 2 — Edge function

8. Aktifkan verifikasi token untuk `fonnte-get-groups` dan `fonnte-update-group`, dan di dalam fungsi periksa pemanggilnya benar-benar admin sebelum menyentuh API Fonnte.
9. `whatsapp-notification` dipanggil oleh trigger database, jadi tetap tanpa JWT, tetapi diberi header rahasia bersama yang wajib cocok; permintaan lain ditolak.
10. Ganti API key Fonnte yang tersimpan di tabel dengan secret (`FONTE_WHATSAPP_API_KEY` sudah ada), sehingga kunci tidak pernah melewati browser.
11. Persempit CORS ke domain aplikasi (`sipimu.web.id`, domain preview) alih-alih `*`.
12. Bersihkan token yang tertulis literal di `notify_whatsapp_new_pathway` dan validasi nomor tujuan sebelum dikirim ke API Fonnte.

### Tahap 3 — Frontend

13. `ProtectedRoute` diberi opsi memeriksa status persetujuan dan role, dengan halaman "menunggu persetujuan" dan "akses ditolak"; tab Manajemen User dibungkus penjagaan admin (UI tetap bukan satu-satunya pengaman — database yang menegakkan).
14. Skema zod untuk input form pasien dan pengaturan WhatsApp: batas panjang, format No. RM, dan validasi nomor telepon.

### Tahap 4 — Yang harus Anda lakukan sendiri di dashboard Supabase

Tidak bisa saya kerjakan dari sini:
- Aktifkan **Leaked Password Protection**.
- Perpendek masa berlaku OTP (maks. 1 jam).
- Jalankan upgrade versi Postgres.
- **Rotasi API key Fonnte** — anggap kunci yang sekarang sudah bocor.

## Catatan teknis

- Semua perubahan database lewat satu rangkaian migrasi; kebijakan lama di-`DROP` lalu dibuat ulang dengan target role eksplisit (`TO authenticated`).
- Pola `has_role()` dan `is_user_approved()` yang sudah ada di proyek dipakai kembali; tidak ada tabel role baru.
- Risiko utama perubahan ini: bila ada user aktif yang `is_approved`-nya belum ter-set, ia akan kehilangan akses data. Saya akan cek jumlah user yang terdampak sebelum menerapkan syarat persetujuan.
- Setelah migrasi, pemindaian keamanan dijalankan ulang untuk memastikan temuan kritis hilang.

## Urutan pengerjaan yang disarankan

Tahap 1 dulu (menghentikan kebocoran aktif), lalu Tahap 2, kemudian Tahap 3. Tahap 4 sebaiknya Anda kerjakan bersamaan dengan Tahap 1 — terutama rotasi API key Fonnte.
