# FINTJAM — Plan 04: Rincian Fitur & Logic Per Halaman

> Spesifikasi fungsional detail untuk setiap halaman dan komponen interaktif.

---

## 1. `login.html` — Autentikasi (Login & Register)

### Struktur UI
- Glass card centered, max-width 420px
- Header: Logo FINTJAM + tagline
- Tab navigation: "MASUK" | "DAFTAR"
- Form area (berubah sesuai tab aktif)
- Footer: status online + versi

### Tab: MASUK (Login)

**Inputs:**
- Username (text) — required, min 3 char
- Password (password) — required, min 6 char, toggle visibility

**Submit Flow:**
```
1. Validasi input tidak kosong
2. Cari user by username di fintjam_users
3. Jika tidak ditemukan → tampilkan error "Username tidak ditemukan"
4. Hash input password → bandingkan dengan passwordHash di storage
5. Jika tidak cocok → tampilkan error "Password salah"
6. Jika cocok:
   a. Storage.setSession(user.id)
   b. Cek user.isLimitSet
      - false → redirect onboarding.html
      - true  → redirect index.html
```

### Tab: DAFTAR (Register)

**Inputs:**
- Username (text) — required, min 3 char, max 20 char, alphanumeric+underscore
- Password (password) — required, min 6 char
- Konfirmasi Password — harus sama dengan password

**Submit Flow:**
```
1. Validasi semua field
2. Cek username sudah ada → error "Username sudah digunakan"
3. Cek password === konfirmasi password → error jika tidak sama
4. Buat User object baru:
   { id, username, passwordHash: SHA256(password), monthlyLimit: 0, isLimitSet: false, createdAt }
5. Storage.createUser(newUser)
6. Storage.setSession(newUser.id)
7. Redirect → onboarding.html
```

### Error Handling
- Error muncul sebagai inline text merah di bawah input yang bermasalah
- Error hilang saat user mulai mengetik kembali

---

## 2. `onboarding.html` — Set Limit Pertama

### Auth Guard
- Jika tidak ada session → redirect ke login.html
- Jika user.isLimitSet === true → redirect ke index.html (sudah onboarding)

### Struktur UI
- Centered glass card, max-width 448px
- Header: Logo + "Inisialisasi Sistem"
- Judul: "Limit Pengeluaran"
- Input: "Rp" prefix + angka besar (currency display font)
- Info note: limit bisa diubah di settings
- Tombol: "Mulai Pemantauan"

### Logic
```
Input: format otomatis dengan pemisah titik saat mengetik
  (contoh: "5000000" → tampil "5.000.000")

Submit:
1. Parse input → hapus titik → parseInt()
2. Validasi: harus > 0
3. Storage.updateUser(userId, { monthlyLimit: value, isLimitSet: true })
4. Redirect → index.html
```

---

## 3. `index.html` — Dashboard

### Auth Guard
- Jika tidak ada session → redirect ke login.html

### Top App Bar
- Kiri: icon wallet + teks "FINTJAM"
- Tengah: Nav desktop (Dashboard | History | Settings) — hidden mobile
- Kanan: icon settings → link ke settings.html

### Bento Grid Layout (Desktop 12-col)

**Card 1: Total Saldo (col-span-8)**
- Label: "TOTAL SALDO"
- Nilai: `Rp {totalIncome - totalExpense}` — format Rupiah
- Indikator: trending up/down dengan persentase vs bulan lalu
- Hover: neon glow effect

**Card 2: Pemasukan Bulan Ini (col-span-4, bagian atas)**
- Label: "PEMASUKAN (BLN INI)"
- Nilai: warna primary (purple)
- Sumber data: sum transaksi income bulan & tahun ini

**Card 3: Pengeluaran Bulan Ini (col-span-4, bagian bawah)**
- Label: "PENGELUARAN (BLN INI)"
- Nilai: warna error (red)
- Progress bar: `expense/limit × 100%`
- Warna progress: hijau (< 60%), kuning (60–79%), merah (≥ 80%)

**Card 4: Cash Flow Chart (col-span-12)**
- Bar chart 7 bulan terakhir (pure CSS dengan `<div>` tinggi dinamis)
- Dua warna bar: primary (income) + error (expense) per bulan
- Label bulan di bawah (Jan, Feb, dst)
- Hover tooltip: nilai Rupiah

**Card 5: Transaksi Terbaru (col-span-12)**
- 5 transaksi terbaru user yang sedang login
- Per item: icon kategori, nama catatan/kategori, tanggal, jumlah ± Rp
- Tombol "Lihat Semua" → link ke transactions.html

### FAB (Floating Action Button)
- Fixed bottom-right
- Klik → buka modal `#modal-transaction`

### Modal Transaksi (overlaid)
- Toggle: PENGELUARAN / PEMASUKAN
- Input jumlah (currency format)
- Grid kategori 2×3 (6 kategori, filter sesuai tipe transaksi)
- Input tanggal (default: hari ini)
- Input catatan (opsional)
- Footer: tombol Batal + Simpan Data

**Save Flow:**
```
1. Validasi: amount > 0, kategori dipilih, tanggal valid
2. Buat Transaction object: { id, userId, type, amount, category, note, date, createdAt }
3. Storage.createTransaction(txn)
4. Tutup modal
5. Re-render dashboard cards
6. Cek limit → tampilkan toast jika perlu
```

### Toast Alert Logic
```javascript
function checkLimitAlert(userId) {
  const user = Storage.getUserById(userId);
  const now = new Date();
  const expense = Storage.getTransactionsByUserAndMonth(userId, now.getFullYear(), now.getMonth() + 1)
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const percentage = (expense / user.monthlyLimit) * 100;
  
  if (percentage >= 100) {
    showToast('LIMIT TERLAMPAUI!', `Pengeluaran Anda telah melampaui batas bulanan!`, 'danger');
  } else if (percentage >= 80) {
    showToast('LIMIT HAMPIR TERCAPAI', `Pengeluaran sudah ${percentage.toFixed(0)}% dari limit Anda.`, 'warning');
  }
}
```

### Bottom Navigation (Mobile)
- Dashboard (aktif) | History | Settings

---

## 4. `transactions.html` — History & Laporan

### Auth Guard
- Jika tidak ada session → redirect ke login.html

### Struktur UI
- Top App Bar (sama dengan dashboard)
- Filter Bar:
  - Dropdown/chip: Semua | Pemasukan | Pengeluaran
  - Dropdown bulan: Jan–Des (default: bulan ini)
  - Dropdown tahun: tahun tersedia
- Tombol "Cetak Laporan" (icon print)
- List transaksi (grouped by month, sorted by date desc)
- Setiap transaksi: icon kategori, nama/catatan, tanggal, amount ± Rp, tombol hapus

### Grouped Display
```
── MEI 2026 ──────────────────────
  [icon] Gaji Mei           09 Mei  + Rp 5.000.000
  [icon] Makan Siang        08 Mei  - Rp   45.000
  [icon] Bensin             07 Mei  - Rp  150.000

── APRIL 2026 ────────────────────
  ...
```

### Filter Logic
```javascript
function getFilteredTransactions() {
  let txns = Storage.getTransactionsByUser(currentUserId);
  
  if (typeFilter !== 'all') {
    txns = txns.filter(t => t.type === typeFilter);
  }
  if (monthFilter) {
    txns = txns.filter(t => t.date.startsWith(`${yearFilter}-${monthFilter.toString().padStart(2,'0')}`));
  }
  
  return txns.sort((a, b) => new Date(b.date) - new Date(a.date));
}
```

### Delete Transaksi
```
Klik tombol hapus → konfirmasi dialog "Hapus transaksi ini?"
Jika konfirm → Storage.deleteTransaction(id) → re-render list
```

### Print Laporan
```javascript
function printLaporan() {
  window.print(); // Print stylesheet akan menyesuaikan tampilan
}
```

---

## 5. `settings.html` — Pengaturan

### Auth Guard
- Jika tidak ada session → redirect ke login.html

### Struktur UI
- Top App Bar: back button + "FINTJAM" + settings icon (aktif)
- Heading: "Pengaturan Akun"
- Section 1 — "Pengaturan Profil" (glass card):
  - Input: Username baru
  - Input: Kata Sandi Baru
  - Input: Konfirmasi Kata Sandi
  - Button: "Simpan Profil"
- Section 2 — "Batas Keuangan" (glass card):
  - Input: Limit pengeluaran bulanan (currency format)
  - Info: "Sistem memberi peringatan jika mendekati batas"
  - Button: "Perbarui Batas"
- Section 3 — Logout:
  - Button "Keluar" (merah/error style)

### Update Username Logic
```
1. Validasi username baru tidak kosong, min 3 char
2. Cek username sudah dipakai user lain
3. Storage.updateUser(userId, { username: newUsername })
4. Tampilkan toast sukses
```

### Update Password Logic
```
1. Validasi password baru min 6 char
2. Validasi konfirmasi sama dengan password baru
3. Storage.updateUser(userId, { passwordHash: SHA256(newPassword) })
4. Tampilkan toast sukses
```

### Update Limit Logic
```
1. Parse input → integer
2. Validasi > 0
3. Storage.updateUser(userId, { monthlyLimit: newLimit })
4. Tampilkan toast sukses
```

### Logout Logic
```
Storage.clearSession()
redirect → login.html
```

---

## 6. Global: Auth Guard

Setiap halaman (kecuali `login.html`) memuat script berikut di `<head>`:

```javascript
// auth.js — diload pertama sebelum apapun
(function authGuard() {
  const session = Storage.getSession();
  const currentPage = window.location.pathname;
  
  if (!session) {
    window.location.replace('login.html');
    return;
  }
  
  // Onboarding guard
  if (currentPage.includes('onboarding')) {
    const user = Storage.getUserById(session.userId);
    if (user && user.isLimitSet) {
      window.location.replace('index.html');
    }
  }
})();
```

---

## 7. Kategori: Icon & Mapping

| Code         | Label              | Icon (Material)     | Tipe Transaksi     |
|--------------|--------------------|---------------------|--------------------|
| `food_drink` | Makanan & Minuman  | `restaurant`        | expense            |
| `transport`  | Transportasi       | `directions_car`    | expense            |
| `shopping`   | Belanja            | `shopping_bag`      | expense            |
| `salary`     | Gaji / Pendapatan  | `account_balance`   | income             |
| `investment` | Investasi          | `trending_up`       | income & expense   |
| `debt_friend`| Temen Ngutang      | `group`             | income & expense   |

> Saat mode "PENGELUARAN" dipilih di modal, semua kategori tampil kecuali hanya `salary` yang dikecualikan.
> Saat mode "PEMASUKAN" dipilih, semua kategori tampil kecuali `food_drink`, `transport`, `shopping`.

---

## 8. Format Rupiah (Utility)

```javascript
// utils.js
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  // Output: "Rp 5.000.000"
}

function formatRupiahShort(amount) {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  if (amount >= 1_000_000)     return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`;
  if (amount >= 1_000)         return `Rp ${(amount / 1_000).toFixed(0)}Rb`;
  return `Rp ${amount}`;
}

// Format input field saat mengetik
function formatInputCurrency(input) {
  let value = input.value.replace(/\D/g, '');
  input.value = new Intl.NumberFormat('id-ID').format(parseInt(value) || 0);
}
```

---

## 9. Utility: Generate ID

```javascript
// utils.js
function generateId(prefix = 'id') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${timestamp}_${random}`;
}

// Contoh: generateId('usr') → "usr_1715234567890_abc12"
// Contoh: generateId('txn') → "txn_1715234600000_xyz78"
```

---

## 10. SHA-256 Password Hash (Vanilla JS)

```javascript
// utils.js — menggunakan Web Crypto API
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

> **Catatan**: Karena `hashPassword` adalah async, fungsi login dan register juga harus async/await.
