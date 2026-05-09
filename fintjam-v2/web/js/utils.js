/**
 * utils.js — FINTJAM Helper Utilities
 * Format Rupiah, tanggal, ID, hash, toast, kategori
 */

'use strict';

// ─── CATEGORIES CONSTANT ───────────────────────────────────────
const CATEGORIES = {
  food_drink:  { label: 'Makanan & Minuman', icon: 'restaurant',      types: ['expense'] },
  transport:   { label: 'Transportasi',       icon: 'directions_car',  types: ['expense'] },
  shopping:    { label: 'Belanja',            icon: 'shopping_bag',    types: ['expense'] },
  salary:      { label: 'Gaji / Pendapatan',  icon: 'account_balance', types: ['income']  },
  investment:  { label: 'Investasi',          icon: 'trending_up',     types: ['income', 'expense'] },
  debt_friend: { label: 'Temen Ngutang',      icon: 'group',           types: ['income', 'expense'] },
};

// ─── RUPIAH FORMAT ─────────────────────────────────────────────
function formatRupiah(amount) {
  const num = parseInt(amount) || 0;
  return 'Rp\u00a0' + new Intl.NumberFormat('id-ID').format(num);
}

function formatRupiahCompact(amount) {
  const n = parseInt(amount) || 0;
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000)     return `Rp ${(n / 1_000_000).toFixed(1)}Jt`;
  if (n >= 1_000)         return `Rp ${(n / 1_000).toFixed(0)}Rb`;
  return `Rp ${n}`;
}

/** Format angka tanpa prefix Rp (untuk tampilan input) */
function formatNumberInput(num) {
  const n = parseInt(String(num).replace(/\D/g, '')) || 0;
  return new Intl.NumberFormat('id-ID').format(n);
}

/** Parse formatted rupiah string → integer */
function parseRupiah(str) {
  return parseInt(String(str).replace(/\D/g, '')) || 0;
}

/** Auto-format input currency saat mengetik */
function handleCurrencyInput(e) {
  const raw = e.target.value.replace(/\D/g, '');
  const num = parseInt(raw) || 0;
  e.target.value = num === 0 ? '' : new Intl.NumberFormat('id-ID').format(num);
}

// ─── DATE FORMAT ───────────────────────────────────────────────
const MONTHS_ID = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

function formatDate(isoStr) {
  const d = new Date(isoStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateShort(isoStr) {
  const d = new Date(isoStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function getMonthYear(isoStr) {
  const d = new Date(isoStr + 'T00:00:00');
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

function monthLabel(year, month) {
  return `${MONTHS_ID[month - 1]} ${year}`;
}

// ─── ID GENERATOR ──────────────────────────────────────────────
function generateId(prefix = 'id') {
  const ts  = Date.now();
  const rnd = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${ts}_${rnd}`;
}

// ─── PASSWORD HASH (Web Crypto API) ────────────────────────────
async function hashPassword(password) {
  // Fallback for file:// protocol where crypto.subtle is undefined
  if (!window.crypto || !window.crypto.subtle) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── TOAST SYSTEM ──────────────────────────────────────────────
function _ensureToastContainer() {
  let el = document.getElementById('toast-container');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast-container';
    el.className = 'toast-container';
    document.body.appendChild(el);
  }
  return el;
}

/**
 * @param {string} title
 * @param {string} message
 * @param {'danger'|'warning'|'success'} type
 * @param {number} duration ms
 */
function showToast(title, message, type = 'danger', duration = 5000) {
  const container = _ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast${type === 'warning' ? ' toast-warning' : type === 'success' ? ' toast-success' : ''}`;

  const iconMap = { danger: 'warning', warning: 'info', success: 'check_circle' };
  const icon = iconMap[type] || 'warning';

  toast.innerHTML = `
    <span class="material-symbols-outlined clr-${type === 'warning' ? 'primary' : type === 'success' ? 'success' : 'error'}"
          style="font-size:20px;flex-shrink:0">${icon}</span>
    <div style="flex:1;min-width:0">
      <p class="text-label" style="color:${type === 'danger' ? 'var(--clr-error)' : type === 'warning' ? '#ffb800' : 'var(--clr-success)'}">
        ${title}
      </p>
      <p class="text-label-sm clr-muted" style="margin-top:4px;text-transform:none;letter-spacing:0">${message}</p>
    </div>
    <button class="toast-close" aria-label="Tutup">
      <span class="material-symbols-outlined" style="font-size:18px">close</span>
    </button>`;

  container.appendChild(toast);

  const dismiss = () => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  };
  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  setTimeout(dismiss, duration);
}

// ─── VALIDATION HELPERS ────────────────────────────────────────
function validateUsername(username) {
  if (!username || username.trim().length < 3) return 'Username minimal 3 karakter';
  if (username.trim().length > 20) return 'Username maksimal 20 karakter';
  if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) return 'Username hanya boleh huruf, angka, dan underscore';
  return null;
}

function validatePassword(password) {
  if (!password || password.length < 6) return 'Password minimal 6 karakter';
  return null;
}

// ─── DOM HELPERS ───────────────────────────────────────────────
function setError(fieldId, message) {
  const errEl = document.getElementById(fieldId + '-error');
  if (errEl) { errEl.textContent = message || ''; errEl.style.display = message ? 'block' : 'none'; }
  const input = document.getElementById(fieldId);
  if (input) { input.classList.toggle('error-state', !!message); }
}

function clearErrors(...fieldIds) {
  fieldIds.forEach(id => setError(id, ''));
}

// ─── EXPORT ────────────────────────────────────────────────────
window.Utils = {
  CATEGORIES,
  formatRupiah,
  formatRupiahCompact,
  formatNumberInput,
  parseRupiah,
  handleCurrencyInput,
  formatDate,
  formatDateShort,
  todayISO,
  getMonthYear,
  monthLabel,
  MONTHS_ID,
  MONTHS_SHORT,
  generateId,
  hashPassword,
  showToast,
  validateUsername,
  validatePassword,
  setError,
  clearErrors,
};
