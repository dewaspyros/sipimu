# Perbaikan Rekap Data & Keamanan Login

## 1. Teks persentase Rekap Data tumpang tindih

Penyebab: blok ringkasan (Total Pasien, Sesuai Target, Kepatuhan CP/Penunjang/Terapi, Rata-rata LOS) diletakkan di dalam baris filter yang memakai layout `flex`. Saat lebar layar terbatas, enam kolom ringkasan dipaksa berbagi ruang sisa di samping empat dropdown sehingga angka dan label saling menimpa.

Perbaikan:
- Keluarkan blok ringkasan dari baris filter, tempatkan sebagai baris tersendiri di bawah filter dengan pemisah tipis.
- Gunakan grid responsif: 2 kolom (mobile), 3 kolom (tablet), 6 kolom (desktop lebar), masing-masing sel punya lebar minimum sendiri.
- Label panjang ("Kepatuhan Penunjang", "Rata-rata LOS") dibuat rata tengah dengan pembungkusan baris normal, angka memakai ukuran yang menyusut di layar kecil.

## 2. Durasi login maksimal 12 jam

- Simpan waktu mulai sesi saat login berhasil.
- Pengecekan berkala (saat aplikasi dimuat, saat tab kembali aktif, dan timer periodik): jika sesi sudah lebih dari 12 jam, jalankan logout otomatis dan arahkan ke halaman login dengan pesan "Sesi berakhir, silakan login kembali."
- Waktu mulai sesi dihapus saat logout manual agar tidak tersisa.

## 3. Batas percobaan login 3x, jeda 5 menit

- Hitung kegagalan login per NIK. Setelah 3 kegagalan berturut-turut, akun dikunci di perangkat tersebut selama 5 menit.
- Selama terkunci: tombol Masuk dinonaktifkan dan muncul peringatan berisi hitung mundur sisa waktu ("Terlalu banyak percobaan. Coba lagi dalam 4:32").
- Setelah 5 menit lewat atau login berhasil, penghitung direset.
- Sisa percobaan ditampilkan setelah gagal ("Percobaan tersisa: 2").

## Catatan teknis

- `src/pages/RekapData.tsx`: pindahkan grid ringkasan keluar dari `FilterBar`.
- `src/hooks/useAuth.ts`: tambah konstanta `SESSION_MAX_AGE = 12 jam`, simpan `sipimu_session_start` di `localStorage` saat sesi valid, cek kedaluwarsa di listener auth + interval 60 detik + event `visibilitychange`, panggil `signOut` bila lewat.
- Percobaan login: helper baru `src/lib/loginThrottle.ts` menyimpan `{count, lockedUntil}` per NIK di `localStorage`; dipakai oleh `Login.tsx` (UI countdown) dan diperbarui dari hasil `signIn`.
- Pembatasan ini bersifat per-perangkat (klien). Rate limit sisi server bawaan Supabase tetap berlaku; jika perlu penguncian lintas perangkat, itu memerlukan tabel + edge function terpisah (tidak termasuk di rencana ini).
