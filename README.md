<div align="center">
  <img src="public/logo-atur.svg" alt="Logo ATUR" width="120" />
  <h1>ATUR — Platform Manajemen Keuangan Mahasiswa</h1>
  <p>Aplikasi web interaktif untuk membantu mahasiswa mencatat arus kas, mengatur batas anggaran bulanan, dan mengelola kantong tabungan secara terstruktur.</p>
</div>

---

## ✨ Fitur Utama

- **Landing, Login & Register:** Halaman pengenalan platform serta sistem autentikasi akun yang tersimpan lokal melalui `LocalStorage`.
- **Dashboard Analitik:** Ringkasan total saldo, pemasukan, pengeluaran, serta grafik donat (*Donut Chart*) proporsi pengeluaran.
- **Manajemen Transaksi:** Pencatatan pemasukan dan pengeluaran lengkap dengan validasi nominal otomatis (`10.000`) dan pemilih tanggal.
- **Budgeting:** Pengaturan, pembaruan, dan pemantauan batas anggaran bulanan berdasarkan kategori.
- **Saving Pocket:** Pengelolaan tabungan berbasis target tujuan keuangan dengan fitur setor dan tarik dana.

---

## 🛠️ Teknologi yang Digunakan

- **HTML5:** Menyusun kerangka utama dokumen web (`index.html`)[cite: 1].
- **Tailwind CSS (v4) & CSS3:** Mengatur tata letak, warna, responsivitas, dan tampilan antarmuka[cite: 1].
- **React (v19) & TypeScript (`.tsx`):** Membangun antarmuka berbasis komponen, mengelola interaksi serta *state* data keuangan, navigasi halaman, dan keamanan tipe data[cite: 1].
- **Vite:** *Build tool* untuk mempercepat kompilasi dan mengoptimalkan performa aplikasi[cite: 1].
- **SVG & Lucide React:** Menampilkan ikon antarmuka serta grafik donat pada analisis pengeluaran.
- **LocalStorage (Web Storage API):** Menyimpan data akun pengguna secara lokal di browser.
- **Google Fonts (Inter):** Tipografi utama di seluruh halaman aplikasi.

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

**Prasyarat:** Pastikan **Node.js** sudah terpasang di komputer Anda.

1. **Clone atau unduh repositori ini:**
   ```bash
   git clone https://github.com/E11ra/GCJ-DEVGIRLS_KELOMPOK-5.git
   cd GCJ-DEVGIRLS_KELOMPOK-5