# 🧪 Website Pendaftaran & Pembuatan Kartu Peserta Olimpiade Kimia 2026
**Universitas HKBP Nommensen Pematangsiantar**

Aplikasi web modern untuk pendaftaran peserta Olimpiade Kimia 2026 sekaligus mencetak **Kartu Peserta Resmi** secara otomatis dalam format **PDF A4 Landscape**, sesuai dengan template resmi panitia.

---

## ✨ Fitur Utama

1. **Formulir Pendaftaran Lengkap**:
   - Nama Lengkap Peserta (auto-format kapitalisasi)
   - Kelas / Tingkat (pilihan cepat Kelas X, XI, XII, XII MIPA atau kustom)
   - Asal / Alamat Sekolah
   - Nomor Peserta (input manual atau klik **"Nomor Baru"** untuk generate otomatis seperti `OK-001`, `OK-002`, dst.)
   - Pas Foto Peserta (Ukuran 3 × 4 cm) dengan dukungan drag & drop, file picker, serta tombol sampel foto cepat.

2. **Desain Kartu 100% Identik dengan Template Resmi**:
   - Header warna maroon khas dengan Logo resmi Universitas HKBP Nommensen Pematangsiantar
   - Tema Resmi: *"Meningkatkan Kompetensi dan Kreativitas generasi muda melalui eksplorasi ilmu kimia untuk inovasi berkelanjutan"*
   - Pas foto peserta rasio 3:4
   - Biodata lengkap peserta (Nama, Kelas, Asal Sekolah, Nomor Peserta)
   - Banner pelaksanaan acara: **14 November 2026**
   - Stempel resmi Panitia Olimpiade Kimia UHKBPNP (warna biru)
   - Garis batas pemotongan kartu putus-putus (*dashed line*)
   - Petunjuk cetak resmi di bagian bawah

3. **Cetak & Ekspor Fleksibel**:
   - **Cetak Kartu (PDF Resmi)**: Mengunduh langsung file PDF beresolusi tinggi (A4 Landscape) siap cetak di kertas HVS atau Brief Card.
   - **Print Langsung**: Membuka dialog printer bawaan peramban dengan styling cetak `@media print` presisi 1:1.
   - **Unduh Gambar (PNG)**: Mengunduh gambar kartu resolusi tinggi untuk arsip siswa atau dibagikan via WhatsApp.

4. **Privasi & Keamanan Data Terjaga**:
   - Pemrosesan data sepenuhnya berjalan di sisi peramban (*client-side*).
   - Data diri siswa/siswi tidak disimpan di memori peramban bersama (*shared*), sehingga privasi data setiap pendaftar terjamin aman saat mengisi secara mandiri.

---

## 🚀 Panduan Menjalankan Secara Lokal

Pastikan Anda telah menginstal **Node.js**:

```bash
# 1. Masuk ke folder proyek
cd "d:\ell\olimpiade kimia"

# 2. Jalankan server lokal
npm run dev
```

Buka peramban di: `http://localhost:3000`

---

## ☁️ Panduan Hosting ke Vercel (Gratis & Mudah)

Proyek ini telah dikonfigurasi penuh dengan file `vercel.json` dan Vite output directory `dist/`.

### Cara 1: Menggunakan GitHub + Vercel Dashboard (Paling Direkomendasikan)
1. Buat repositori baru di akun GitHub Anda (misal: `olimpiade-kimia-2026`).
2. Unggah/Push seluruh folder ini ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "Inisialisasi Web Pendaftaran Olimpiade Kimia 2026"
   git branch -M main
   git remote add origin https://github.com/USERNAME/olimpiade-kimia-2026.git
   git push -u origin main
   ```
3. Buka [https://vercel.com](https://vercel.com) dan login/daftar.
4. Klik **"Add New Project"** -> **"Import"** repositori GitHub Anda tadi.
5. Vercel akan otomatis mendeteksi konfigurasi:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Klik **"Deploy"**! Dalam 30 detik web sudah aktif online dengan link gratis (misal: `https://olimpiade-kimia-2026.vercel.app`).

### Cara 2: Menggunakan Vercel CLI Langsung dari Komputer
```bash
npx vercel
```
Ikuti instruksi di terminal (pilih default enter untuk semua pertanyaan), dan situs akan langsung tayang!

---

## 📁 Struktur Berkas

```
olimpiade-kimia/
├── contoh kartu peserta/          # PDF acuan template kartu asli
├── public/
│   ├── assets/
│   │   ├── logo.png               # Logo resmi UHKBPNP
│   │   └── stempel.png            # Stempel resmi panitia
│   └── favicon.svg                # Icon kimia browser
├── src/
│   ├── main.js                    # Logika live preview, generator PDF/PNG, storage
│   └── style.css                  # Desain modern, glassmorphism, responsif & print
├── index.html                     # Halaman utama aplikasi
├── package.json                   # Konfigurasi dependensi
├── vite.config.js                 # Konfigurasi Vite bundler
├── vercel.json                    # Konfigurasi deploy Vercel
└── dist/                          # Hasil bundle siap upload jika diperlukan
```
