# FINTJAM — Plan 05: Struktur File JS & Urutan Build

> Panduan implementasi teknis: struktur module JS, urutan build, dan aturan kode.

---

## 1. Struktur & Tanggung Jawab File JS

### `js/utils.js` — Helper Utilities
**Dimuat pertama, tidak bergantung file lain.**

```javascript
// Exports (semua fungsi global/window):
window.Utils = {
  formatRupiah(amount),           // "Rp 5.000.000"
  formatRupiahShort(amount),      // "Rp 5Jt"
  formatDate(isoDate),            // "09 Mei 2026"
  formatInputCurrency(inputEl),   // Auto-format input saat mengetik
  parseRupiah(formattedStr),      // "5.000.000" → 5000000
  generateId(prefix),             // "usr_timestamp_random"
  hashPassword(password),         // SHA-256 async → Promise<string>
  showToast(title, message, type),// type: 'warning' | 'danger' | 'success'
  CATEGORIES                      // Object mapping kategori
};
```

### `js/storage.js` — LocalStorage Abstraction
**Bergantung pada: tidak ada (standalone)**

```javascript
window.Storage = {
  // === USERS ===
  getUsers(),
  getUserById(id),
  getUserByUsername(username),
  createUser(data),              // returns User object
  updateUser(id, updates),       // returns updated User

  // === TRANSACTIONS ===
  getTransactions(),
  getTransactionsByUser(userId),
  getTransactionsByUserAndMonth(userId, year, month),
  createTransaction(data),       // returns Transaction object
  deleteTransaction(id),         // returns boolean

  // === SESSION ===
  getSession(),                  // returns { userId } | null
  setSession(userId),
  clearSession()
};
```

### `js/auth.js` — Auth Guard + Auth Logic
**Bergantung pada: utils.js, storage.js**

```javascript
// Auto-run auth guard on load (IIFE)
// Exported functions:
window.Auth = {
  login(username, password),     // async, returns { ok, error, user }
  register(username, password),  // async, returns { ok, error, user }
  logout(),                      // clears session + redirect
  getCurrentUser(),              // returns User | null
  requireAuth()                  // guard: redirect ke login jika tidak ada session
};
```

### `js/transactions.js` — CRUD & Kalkulasi Transaksi
**Bergantung pada: utils.js, storage.js**

```javascript
window.Transactions = {
  create(formData),              // async, returns Transaction | null
  delete(id),                    // boolean
  getByUser(userId),
  getMonthly(userId, year, month),
  getSummary(userId, year, month), // { totalIncome, totalExpense, balance, limitPercent }
  getChartData(userId, monthsBack) // returns array 7 bulan terakhir
};
```

### `js/dashboard.js` — Render Logic Dashboard
**Bergantung pada: utils.js, storage.js, transactions.js, auth.js**

```javascript
// Tidak perlu export — auto-run on DOMContentLoaded
// Internal functions:
renderBalanceCard()
renderIncomeCard()
renderExpenseCard()
renderChart()
renderRecentTransactions()
initModal()
handleModalSubmit()
checkAndShowLimitAlert()
```

### `js/settings.js` — Logic Settings Page
**Bergantung pada: utils.js, storage.js, auth.js**

```javascript
// Auto-run on DOMContentLoaded
// Internal functions:
loadCurrentValues()
handleProfileUpdate()
handlePasswordUpdate()
handleLimitUpdate()
handleLogout()
```

### `js/print.js` — Print Logic
**Bergantung pada: utils.js, storage.js, transactions.js**

```javascript
window.PrintReport = {
  generate(userId, month, year), // Buat konten print + trigger window.print()
};
```

---

## 2. Urutan `<script>` di Setiap Halaman

```html
<!-- WAJIB: urutan ini tidak boleh dibalik -->
<script src="js/utils.js"></script>
<script src="js/storage.js"></script>
<script src="js/auth.js"></script>

<!-- Page-specific (sesuai halaman): -->
<script src="js/transactions.js"></script>   <!-- di index.html, transactions.html -->
<script src="js/dashboard.js"></script>      <!-- di index.html -->
<script src="js/settings.js"></script>       <!-- di settings.html -->
<script src="js/print.js"></script>          <!-- di transactions.html -->
```

---

## 3. Aturan Kode (Coding Rules)

### Umum
- Gunakan `const` dan `let`, **tidak pernah** `var`
- Gunakan arrow functions untuk callback sederhana
- Gunakan `async/await`, **tidak** `.then().catch()` chain panjang
- Setiap fungsi: max **30 baris**. Jika lebih → pecah ke sub-fungsi
- Setiap file: max **800 baris** (rule proyek)

### Penamaan
- **Fungsi**: camelCase → `getUserById`, `formatRupiah`
- **Konstanta**: UPPER_SNAKE_CASE → `CATEGORIES`, `STORAGE_KEYS`
- **File**: kebab-case → `storage.js`, `auth.js`
- **LocalStorage keys**: prefix `fintjam_` → `fintjam_users`
- **ID format**: `{prefix}_{timestamp}_{random5}` → `usr_1715234567_abc12`

### DOM Manipulation
- Gunakan `getElementById` untuk single element (lebih cepat)
- Gunakan `querySelectorAll` hanya untuk multiple elements
- Jangan manipulasi DOM di luar `DOMContentLoaded` callback
- Gunakan `innerHTML` hanya untuk render list/template (bukan input user langsung)

### Error Handling
```javascript
// Pattern standar untuk semua operasi async
async function safeOperation() {
  try {
    const result = await someAsyncOp();
    return { ok: true, data: result };
  } catch (error) {
    console.error('[FINTJAM]', error);
    return { ok: false, error: error.message };
  }
}
```

---

## 4. LocalStorage Keys Konstanta

Definisikan di `storage.js`:

```javascript
const STORAGE_KEYS = {
  USERS:        'fintjam_users',
  TRANSACTIONS: 'fintjam_transactions',
  SESSION:      'fintjam_session'
};
```

---

## 5. Template HTML Per Halaman

### Boilerplate Wajib (Semua Halaman)

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="[Deskripsi halaman]">
  <title>[Nama Halaman] — FINTJAM</title>

  <!-- Fonts (wajib) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">

  <!-- Design System -->
  <link rel="stylesheet" href="css/main.css">
</head>
<body>
  <!-- Content -->

  <!-- Scripts (urutan wajib) -->
  <script src="js/utils.js"></script>
  <script src="js/storage.js"></script>
  <script src="js/auth.js"></script>
  <!-- + page-specific scripts -->
</body>
</html>
```

---

## 6. Urutan Build Sequence

```
PHASE 1 — Foundation (Tidak bergantung halaman lain)
├── [1] css/main.css          Design tokens, base styles, komponen global
├── [2] js/utils.js           Helper: rupiah, tanggal, ID, hash, toast, categories
└── [3] js/storage.js         LocalStorage CRUD abstraction

PHASE 2 — Auth Layer
├── [4] login.html            UI Login + Register (2 tab)
└── [5] js/auth.js            Login, Register, Logout, Guard logic

PHASE 3 — Core Flow
├── [6] onboarding.html       Set limit pertama UI
├── [7] index.html            Dashboard shell (HTML structure only)
├── [8] js/transactions.js    CRUD + kalkulasi transaksi
└── [9] js/dashboard.js       Render cards, chart, modal, toast

PHASE 4 — Secondary Pages
├── [10] transactions.html    History + filter UI
├── [11] settings.html        Settings UI
├── [12] js/settings.js       Update profil, password, limit
└── [13] js/print.js          Print logic + print stylesheet

PHASE 5 — Polish & QA
├── [14] Responsive testing (mobile + desktop)
├── [15] Cross-browser check
├── [16] Print preview test
└── [17] LocalStorage edge cases (empty, corrupted, etc.)
```

---

## 7. Checklist QA Per Fitur

### Auth
- [ ] Register berhasil dengan data valid
- [ ] Register gagal jika username duplikat
- [ ] Login berhasil dengan kredensial benar
- [ ] Login gagal dengan password salah
- [ ] Redirect ke onboarding jika isLimitSet = false
- [ ] Redirect ke dashboard jika isLimitSet = true
- [ ] Auth guard bekerja di semua halaman

### Transaksi
- [ ] Bisa tambah transaksi income
- [ ] Bisa tambah transaksi expense
- [ ] Format rupiah otomatis di input
- [ ] Kategori filter sesuai tipe (income/expense)
- [ ] Validasi amount > 0
- [ ] Bisa hapus transaksi
- [ ] List transaksi difilter by user session

### Dashboard
- [ ] Total saldo dihitung benar
- [ ] Pemasukan/pengeluaran bulan ini akurat
- [ ] Chart merender data 7 bulan terakhir
- [ ] 5 transaksi terbaru tampil

### Limit Alert
- [ ] Toast muncul saat pengeluaran ≥ 80% limit
- [ ] Toast berbeda untuk 80–99% vs ≥ 100%
- [ ] Toast auto-dismiss setelah 5 detik

### Settings
- [ ] Update username berhasil
- [ ] Update username gagal jika username sudah dipakai
- [ ] Update password berhasil
- [ ] Update limit berhasil
- [ ] Logout menghapus session + redirect login

### Print
- [ ] Preview print rapi (hitam putih)
- [ ] Elemen tidak relevan tersembunyi saat print
- [ ] Nilai rupiah terbaca jelas di print
