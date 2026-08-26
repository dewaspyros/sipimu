# Timer Sisa Waktu Login

## Tujuan
Menampilkan hitungan mundur sisa waktu login di header kanan atas setiap halaman, dengan format **jam:menit:detik** (hh:mm:ss), berdasarkan batas sesi 12 jam yang sudah ada.

## Implementasi

### 1. Auth context menyediakan sisa waktu
- File: `src/hooks/useAuth.ts`
- Tambahkan state `sessionRemainingMs: number | null` di `AuthContextType` dan `useProvideAuth`.
- Gunakan `setInterval(1000)` untuk menghitung sisa waktu dari `sipimu_session_start` (localStorage) dikurangi `Date.now()` dengan batas `SESSION_MAX_AGE_MS` (12 jam).
- Reset nilai menjadi `null` saat logout atau sesi tidak ada.
- Pastikan hitungan mundur berhenti/reset saat sesi habis agar tidak negatif.

### 2. Format penampilan
- Buat helper kecil di `src/hooks/useAuth.ts` (atau `src/lib/utils.ts`): `formatSessionRemaining(ms)` → `hh:mm:ss`.

### 3. Tampilkan di header
- File: `src/components/Layout.tsx`
- Di sisi kanan header, sebelum tombol notifikasi/akun, tambahkan elemen kecil yang menampilkan:
  - Ikon jam (`Clock` dari lucide-react).
  - Teks `formatSessionRemaining(sessionRemainingMs)`.
- Hanya muncul saat user sudah login (`!!user`) dan `sessionRemainingMs !== null`.
- Gunakan warna teks `text-muted-foreground` dan ukuran `text-xs` agar tidak mengganggu header.

### 4. Perilaku saat waktu habis
- Timer dihitung dari sumber yang sama dengan logika auto logout yang sudah ada, jadi tidak perlu logika logout tambahan.
- Saat timer mencapai 00:00:00, elemen otomatis menghilang setelah proses logout berjalan.

## Catatan teknis
- Timer ini bersifat informatif saja; pembatasan 12 jam tetap ditangani oleh pemeriksaan interval 60 detik dan `onAuthStateChange` yang sudah ada di `useAuth.ts`.
- Tidak menambahkan peringatan warna/karena user memilih tanpa peringatan visual.
