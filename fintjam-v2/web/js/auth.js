/**
 * auth.js — FINTJAM Auth Logic + Guard
 * Login, Register, Logout, Session Guard
 */

'use strict';

// ─── AUTH GUARD (IIFE — auto-run saat file dimuat) ─────────────
(function authGuard() {
  const session = Storage.getSession();
  const path    = window.location.pathname;
  const page    = path.split('/').pop() || 'index.html';

  // Halaman yang tidak perlu auth
  if (page === 'login.html') {
    // Jika sudah login, redirect ke tujuan yang sesuai
    if (session) {
      const user = Storage.getUserById(session.userId);
      window.location.replace(user && user.isLimitSet ? 'index.html' : 'onboarding.html');
    }
    return;
  }

  // Semua halaman lain butuh auth
  if (!session) {
    window.location.replace('login.html');
    return;
  }

  // Onboarding guard: jika sudah set limit, langsung ke dashboard
  if (page === 'onboarding.html') {
    const user = Storage.getUserById(session.userId);
    if (user && user.isLimitSet) {
      window.location.replace('index.html');
    }
    return;
  }
})();

// ─── AUTH FUNCTIONS ───────────────────────────────────────────
async function login(username, password) {
  const user = Storage.getUserByUsername(username);
  if (!user) return { ok: false, error: 'Username tidak ditemukan.' };

  const hash = await Utils.hashPassword(password);
  if (hash !== user.passwordHash) return { ok: false, error: 'Password salah.' };

  Storage.setSession(user.id);
  return { ok: true, user };
}

async function register(username, password) {
  const existing = Storage.getUserByUsername(username);
  if (existing) return { ok: false, error: 'Username sudah digunakan.' };

  const passwordHash = await Utils.hashPassword(password);
  const user = Storage.createUser({
    id: Utils.generateId('usr'),
    username: username.trim(),
    passwordHash,
  });

  Storage.setSession(user.id);
  return { ok: true, user };
}

function logout() {
  Storage.clearSession();
  window.location.replace('login.html');
}

function getCurrentUser() {
  const session = Storage.getSession();
  if (!session) return null;
  return Storage.getUserById(session.userId);
}

// ─── EXPORT ───────────────────────────────────────────────────
window.Auth = { login, register, logout, getCurrentUser };
