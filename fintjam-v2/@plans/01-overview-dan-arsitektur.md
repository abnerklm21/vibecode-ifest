# FINTJAM — Plan 01: Overview & Arsitektur Proyek

> Dokumen ini adalah blueprint utama pengembangan aplikasi Fintjam Financial Tracker.

---

## 1. Identitas Proyek

| Atribut          | Detail                                      |
|------------------|---------------------------------------------|
| **Nama App**     | FINTJAM                                     |
| **Tagline**      | Sistem Manajemen Finansial                  |
| **Platform**     | Web (Desktop & Mobile Responsive)           |
| **Stack**        | Vanilla HTML + CSS + JavaScript (No Framework) |
| **Storage**      | Browser LocalStorage (pengganti database)   |
| **Currency**     | Rupiah Indonesia (IDR)                      |
| **Bahasa UI**    | Bahasa Indonesia                            |

---

## 2. Struktur Folder `web/`

```
web/
├── index.html                  → Dashboard utama (halaman inti setelah login)
├── login.html                  → Halaman Login & Register (tab-based)
├── onboarding.html             → Set limit pertama kali setelah register
├── transactions.html           → Halaman history & laporan transaksi
├── settings.html               → Pengaturan akun (username, password, limit)
│
├── css/
│   └── main.css                → Design system: tokens, utilities, komponen global
│
├── js/
│   ├── auth.js                 → Logic autentikasi (login, register, logout, guard)
│   ├── storage.js              → Abstraksi LocalStorage (CRUD semua entitas)
│   ├── transactions.js         → Logic CRUD transaksi & kalkulasi
│   ├── dashboard.js            → Logic render dashboard, chart, summary
│   ├── settings.js             → Logic update profil & limit
│   ├── utils.js                → Helper: format rupiah, tanggal, validasi, toast
│   └── print.js                → Logic cetak laporan (window.print)
│
└── assets/
    └── (tidak ada gambar eksternal — semua visual via CSS)
```

---

## 3. Alur Navigasi Aplikasi (User Flow)

```
[Akses URL Apapun]
        │
        ▼
[Auth Guard: cek sessionUser di LocalStorage]
        │
   Belum Login ──────────────────────▶ login.html
        │                                  │
        │                         [Tab MASUK / DAFTAR]
        │                                  │
        │                    Belum punya akun → Register
        │                    Register berhasil ──▶ onboarding.html
        │                                            │
        │                    Sudah punya akun → Login
        │                    Login berhasil:
        │                      • Jika limit BELUM diset → onboarding.html
        │                      • Jika limit SUDAH diset → index.html
        │
   Sudah Login ──────────────────────▶ index.html (Dashboard)
                                            │
                                    ┌───────┴────────┐
                                    ▼                ▼
                            [FAB + Tambah]    [Nav: History]
                                    │                │
                            Modal Input     transactions.html
                            Transaksi
                                    │
                            [Nav: Settings]
                                    │
                            settings.html
```

---

## 4. Halaman & Komponen Utama

### 4.1 `login.html` — Autentikasi
- **Tab MASUK**: Form username + password → validasi → set sessionUser → redirect
- **Tab DAFTAR**: Form username + password + konfirmasi → simpan ke users[] → redirect onboarding
- Komponen: Glass card, ghost input, neon button, system status footer

### 4.2 `onboarding.html` — Set Limit Pertama
- Input batas pengeluaran bulanan (format Rupiah)
- Simpan limit ke data user di LocalStorage
- Tombol "Mulai Pemantauan" → redirect ke `index.html`

### 4.3 `index.html` — Dashboard
- **Top App Bar**: Logo + nav desktop + icon settings
- **Bento Grid**:
  - Total Saldo (pemasukan - pengeluaran)
  - Pemasukan bulan ini
  - Pengeluaran bulan ini + progress bar limit
  - Cash Flow Bar Chart (7 bulan terakhir)
  - 5 Transaksi Terbaru
- **FAB**: Buka modal input transaksi
- **Bottom Nav** (mobile): Dashboard, History, Settings
- **Toast Alert**: Muncul otomatis jika pengeluaran ≥ 80% limit

### 4.4 `transactions.html` — History & Laporan
- Filter: Semua / Pemasukan / Pengeluaran + filter bulan
- List transaksi per tanggal (grouped by month)
- Tombol "Cetak Laporan" → trigger print stylesheet
- Tombol hapus per transaksi

### 4.5 `settings.html` — Pengaturan
- Section 1: Update username
- Section 2: Update password (lama + baru + konfirmasi)
- Section 3: Update limit pengeluaran bulanan
- Tombol Keluar (logout)

---

## 5. Komponen Shared (Reusable)

| Komponen           | Digunakan Di              | File          |
|--------------------|---------------------------|---------------|
| Top App Bar        | index, transactions, settings | Inline HTML + CSS |
| Bottom Nav (mobile)| index, transactions, settings | Inline HTML + CSS |
| Modal Transaksi    | index.html (toggle FAB)   | dashboard.js  |
| Toast Alert        | index.html                | utils.js      |
| Auth Guard         | Semua halaman kecuali login | auth.js      |
| Format Rupiah      | Semua halaman             | utils.js      |

---

## 6. Tech Stack & CDN

```html
<!-- Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">

<!-- TIDAK ada framework CSS, TIDAK ada Tailwind di web/ -->
<!-- Semua styling menggunakan CSS variables dari main.css -->
```

---

## 7. Urutan Pengembangan (Build Sequence)

```
Phase 1 — Foundation
  [1] css/main.css        → Design tokens, utilities, base styles
  [2] js/utils.js         → Format rupiah, tanggal, toast, validasi
  [3] js/storage.js       → LocalStorage abstraction layer

Phase 2 — Auth Layer
  [4] login.html          → UI Login + Register
  [5] js/auth.js          → Login, Register, Logout, Guard

Phase 3 — Core Pages
  [6] onboarding.html     → Set limit UI
  [7] index.html          → Dashboard shell + bento grid
  [8] js/dashboard.js     → Data rendering + chart + modal
  [9] js/transactions.js  → CRUD transaksi

Phase 4 — Secondary Pages
  [10] transactions.html  → History + filter + print
  [11] settings.html      → Pengaturan UI
  [12] js/settings.js     → Logic update profil & limit
  [13] js/print.js        → Print report logic

Phase 5 — Polish
  [14] Toast alert system
  [15] Limit warning logic
  [16] Responsive check semua halaman
  [17] Print stylesheet
```
