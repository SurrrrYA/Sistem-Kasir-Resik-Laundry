# Sistem Kasir Resik Laundry

Sistem Kasir Resik Laundry adalah aplikasi manajemen laundry berbasis web yang dibuat untuk membantu proses operasional laundry, mulai dari pengelolaan pelanggan, layanan, pesanan, pembayaran, hingga laporan.

## Fitur

- Login dan autentikasi pengguna
- Role Owner dan Kasir
- Manajemen pelanggan
- Manajemen layanan laundry
- Manajemen pesanan
- Perhitungan total pesanan
- Pencatatan pembayaran
- Status pembayaran
- Laporan transaksi
- Manajemen user oleh Owner
- Lupa password dan reset password melalui email

## Role Pengguna

### Owner
Owner dapat:
- Melihat dashboard
- Mengelola pelanggan
- Mengelola layanan
- Mengelola pesanan
- Mengelola pembayaran
- Melihat laporan
- Mengelola akun user

### Kasir
Kasir dapat:
- Melihat dashboard
- Mengelola pelanggan
- Mengelola pesanan
- Mengelola pembayaran
- Melihat layanan

## Teknologi

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite

### Backend
- Laravel
- PHP
- Laravel Sanctum

### Database
- MySQL

## Struktur Project

```text
Sistem-Kasir-Resik-Laundry/
├── backend/
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── ...
│
└── frontend/
    ├── src/
    ├── public/
    └── ...
