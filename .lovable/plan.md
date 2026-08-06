# Perbaikan Draft Form Pasien: Dropdown Tidak Ikut Tersimpan

## Masalah

Setelah pindah tab/jendela, hanya pilihan **Clinical Pathway** yang kembali muncul. **Verifikator Pelaksana**, **DPJP**, dan **Bangsal** tampil kosong (placeholder) lagi.

## Penyebab

Di `src/pages/ClinicalPathwayForm.tsx`, dropdown Clinical Pathway memakai `value={field.value}` (terkendali penuh oleh form), sedangkan dropdown Verifikator, DPJP, dan Bangsal memakai `defaultValue={field.value}`. `defaultValue` hanya dibaca sekali saat komponen pertama kali dirender, jadi ketika draft dipulihkan lewat `form.reset(...)`, nilai dropdown tersebut tidak ikut diperbarui di tampilan — nilainya sebenarnya ada di form, tetapi tidak terlihat dan mudah tertimpa.

Selain itu, mode isian manual ("Lainnya (isi manual)") pada Verifikator/DPJP tidak dipulihkan: nama manual tersimpan, tetapi kolom input manualnya tidak muncul kembali karena hanya tampil saat nilai form persis `"custom"`.

## Perbaikan

1. Ubah dropdown **Verifikator Pelaksana**, **DPJP**, dan **Bangsal** menjadi terkendali: ganti `defaultValue={field.value}` menjadi `value={field.value}` sehingga selalu mengikuti nilai form (termasuk hasil pemulihan draft dan mode edit).
2. Pulihkan mode isian manual: simpan penanda "pakai isian manual" untuk Verifikator dan DPJP di dalam draft, dan tampilkan kembali kolom input manual beserta isinya saat draft dipulihkan.
3. Pastikan seluruh isian teks (No RM, Nama Pasien/Umur, tanggal, jam, LOS) tetap ikut dipulihkan dari draft yang sama.
4. Draft tetap dihapus otomatis setelah data berhasil disimpan.

## Catatan Teknis

- File yang diubah: `src/pages/ClinicalPathwayForm.tsx` saja. Tidak ada perubahan database.
- Penyimpanan draft tetap di `localStorage` dengan kunci per mode/ID pasien, mekanisme autosave `form.watch` yang sudah ada dipertahankan; struktur draft ditambah dua penanda mode manual.
- Perbaikan `value=` juga memperbaiki mode edit, di mana dropdown bisa tampil kosong sebelum data server selesai dimuat.
