# FINTJAM — Plan 03: Design System & Rules

> Acuan wajib untuk semua implementasi visual di folder `web/`.

---

## 1. Filosofi Desain

**"Midnight Cyber Finance"** — Dark, premium, high-tech seperti command center finansial.

- **Sharp edges**: `border-radius: 0` di semua elemen
- **Glassmorphism**: Card pakai `backdrop-filter: blur()` + background semi-transparan
- **Neon glow**: Aksen purple berpendar (box-shadow)
- **Monospace numbers**: Semua angka/currency pakai `JetBrains Mono`
- **UPPERCASE labels**: Label dan badge selalu huruf kapital

---

## 2. Color Palette (CSS Variables di `main.css`)

```css
:root {
  /* PRIMARY */
  --color-primary:               #dfb7ff;
  --color-primary-container:     #9d00ff;
  --color-on-primary:            #4b007e;
  --color-on-primary-container:  #f7e5ff;
  --color-inverse-primary:       #8c00e5;

  /* SURFACE / BACKGROUND */
  --color-background:            #1b0e20;
  --color-on-background:         #f2dbf5;
  --color-surface:               #1b0e20;
  --color-on-surface:            #f2dbf5;
  --color-surface-container:     #281b2d;
  --color-surface-container-high:#332538;
  --color-surface-variant:       #3e2f43;
  --color-on-surface-variant:    #d1c1d9;

  /* OUTLINE */
  --color-outline:               #9a8ca2;
  --color-outline-variant:       #4e4356;

  /* ERROR / EXPENSE */
  --color-error:                 #ffb4ab;
  --color-error-container:       #93000a;
  --color-on-error-container:    #ffdad6;

  /* SEMANTIC */
  --color-income:                #dfb7ff; /* = primary */
  --color-expense:               #ffb4ab; /* = error */
  --color-success:               #00ff9d; /* status online */
}
```

### Warna Semantik

| Konteks             | Variable                    | Hex       |
|---------------------|-----------------------------|-----------|
| Pemasukan (+)       | `--color-income`            | `#dfb7ff` |
| Pengeluaran (-)     | `--color-expense`           | `#ffb4ab` |
| Button utama        | `--color-primary-container` | `#9d00ff` |
| Bahaya / Over Limit | `--color-error-container`   | `#93000a` |
| Status Online       | `--color-success`           | `#00ff9d` |

---

## 3. Typography

### Font Families
- **Hanken Grotesk** → body, headline, display
- **JetBrains Mono** → label caps, currency, badge

### Type Scale

| Token              | Font           | Size | Weight | Penggunaan                  |
|--------------------|----------------|------|--------|-----------------------------|
| `.text-display-lg` | Hanken Grotesk | 48px | 800    | Logo, angka besar           |
| `.text-headline-md`| Hanken Grotesk | 24px | 700    | Judul section               |
| `.text-body-main`  | Hanken Grotesk | 16px | 400    | Paragraf, input             |
| `.text-currency`   | JetBrains Mono | 20px | 600    | Nilai mata uang             |
| `.text-label-caps` | JetBrains Mono | 12px | 500    | Label, badge, nav item      |

---

## 4. Spacing System

```css
:root {
  --space-unit:              4px;
  --space-stack-sm:          8px;
  --space-stack-md:          16px;
  --space-stack-lg:          32px;
  --space-gutter:            16px;
  --space-container-margin:  24px;
}
```

---

## 5. Border Radius Rules

> **Aturan Keras**: `border-radius: 0` di SEMUA elemen. Sharp edges adalah identitas visual Fintjam.

```css
* { border-radius: 0 !important; }
```

**Pengecualian yang diizinkan:**
- Status dot "online": `border-radius: 50%`
- Scrollbar thumb: `border-radius: 4px`

---

## 6. Efek Visual Wajib

### Glassmorphism Card
```css
.glass-card {
  background: rgba(18, 0, 33, 0.6);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(157, 0, 255, 0.2);
  position: relative;
}
/* Top accent line */
.glass-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, #9d00ff, transparent);
}
```

### Neon Glow
```css
.neon-glow     { box-shadow: 0 0 15px rgba(157, 0, 255, 0.5); }
.neon-glow-red { box-shadow: 0 0 15px rgba(255, 0, 60, 0.5);  }
```

### Ambient Background
```css
body {
  background: linear-gradient(135deg, #1b0e20 0%, #000000 100%);
  background-attachment: fixed;
}
```

---

## 7. Komponen UI Standard

### Ghost Input
```css
.input-ghost {
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--color-outline-variant);
  color: var(--color-on-surface);
  width: 100%;
  padding: 8px 0;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.input-ghost:focus {
  outline: none;
  border-bottom-color: var(--color-primary-container);
  box-shadow: 0 4px 15px rgba(157, 0, 255, 0.3);
}
```

### Primary Button
```css
.btn-primary {
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 16px 24px;
  border: 1px solid rgba(157, 0, 255, 0.5);
  box-shadow: 0 0 15px rgba(157, 0, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s;
}
.btn-primary:hover { box-shadow: 0 0 25px rgba(157, 0, 255, 0.7); }
.btn-primary:active { transform: scale(0.98); }
```

### Transaction Item
```css
.txn-item          { border-left: 3px solid transparent; padding: 16px; }
.txn-item.income   { border-left-color: var(--color-primary); }
.txn-item.expense  { border-left-color: var(--color-error); }
```

---

## 8. Toast Alert

```css
.toast {
  position: fixed; top: 72px; right: 24px; z-index: 9999;
  background: rgba(18, 0, 33, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid var(--color-error);
  box-shadow: 0 0 15px rgba(255, 0, 60, 0.5);
  padding: 16px; max-width: 320px;
  display: flex; gap: 12px; align-items: flex-start;
  animation: slideInRight 0.3s ease, fadeOut 0.5s ease 4.5s forwards;
}
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
@keyframes fadeOut { to { opacity: 0; pointer-events: none; } }
```

---

## 9. Navigation

### Top App Bar
```css
.top-app-bar {
  position: fixed; top: 0; width: 100%; height: 64px; z-index: 50;
  background: rgba(27, 14, 32, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(223, 183, 255, 0.15);
  box-shadow: 0 0 20px rgba(223, 183, 255, 0.1);
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}
```

### Bottom Nav (Mobile)
```css
.bottom-nav { display: none; }
@media (max-width: 768px) {
  .bottom-nav {
    display: flex; position: fixed; bottom: 0;
    width: 100%; height: 72px; z-index: 50;
    background: rgba(27, 14, 32, 0.85);
    backdrop-filter: blur(20px);
    border-top: 1px solid rgba(223, 183, 255, 0.15);
  }
}
```

---

## 10. Print Stylesheet

```css
@media print {
  body { background: white !important; color: black !important; }
  .top-app-bar, .bottom-nav, .fab, .toast, .no-print { display: none !important; }
  .glass-card { background: white !important; border: 1px solid #ccc !important; box-shadow: none !important; }
  .color-income { color: #6200ea !important; }
  .color-expense { color: #d50030 !important; }
}
```

---

## 11. Responsive Breakpoints

| Breakpoint | Width    | Layout                                       |
|------------|----------|----------------------------------------------|
| Mobile     | < 768px  | Single column, Bottom Nav, full-width modal  |
| Desktop    | ≥ 768px  | Bento grid, Top Nav desktop, FAB sudut kanan |

---

## 12. Design Rules (WAJIB)

| # | Rule                                                                  |
|---|-----------------------------------------------------------------------|
| 1 | ✅ Gunakan CSS variables dari `main.css`, jangan hardcode warna       |
| 2 | ✅ JetBrains Mono untuk SEMUA nilai mata uang                         |
| 3 | ✅ Format angka dengan `Intl.NumberFormat('id-ID')` untuk Rupiah      |
| 4 | ✅ Tambahkan `transition` di semua hover/focus                        |
| 5 | ✅ `border-radius: 0` di semua elemen                                 |
| 6 | ✅ Glassmorphism untuk semua card/panel utama                         |
| 7 | ✅ Pemasukan → warna `--color-primary`                                |
| 8 | ✅ Pengeluaran → warna `--color-error`                                |
| 9 | ❌ Jangan gunakan Tailwind CSS di folder `web/`                       |
|10 | ❌ Jangan hardcode warna di luar CSS variables                        |
|11 | ❌ Jangan gunakan font selain Hanken Grotesk & JetBrains Mono         |
|12 | ❌ Jangan border-radius > 0 (kecuali pengecualian terdaftar)          |
