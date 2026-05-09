/**
 * storage.js — FINTJAM LocalStorage Abstraction Layer
 * Semua operasi CRUD ke localStorage terpusat di sini
 */

'use strict';

const KEYS = {
  USERS:        'fintjam_users',
  TRANSACTIONS: 'fintjam_transactions',
  SESSION:      'fintjam_session',
};

// ─── INTERNAL HELPERS ─────────────────────────────────────────
function _read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function _write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

// ─── USERS ────────────────────────────────────────────────────
function getUsers() {
  return _read(KEYS.USERS) || [];
}

function getUserById(id) {
  return getUsers().find(u => u.id === id) || null;
}

function getUserByUsername(username) {
  return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

function createUser(data) {
  const users = getUsers();
  const user = {
    id:           data.id,
    username:     data.username.trim(),
    passwordHash: data.passwordHash,
    monthlyLimit: 0,
    isLimitSet:   false,
    createdAt:    new Date().toISOString(),
  };
  users.push(user);
  _write(KEYS.USERS, users);
  return user;
}

function updateUser(id, updates) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  _write(KEYS.USERS, users);
  return users[idx];
}

// ─── TRANSACTIONS ─────────────────────────────────────────────
function getTransactions() {
  return _read(KEYS.TRANSACTIONS) || [];
}

function getTransactionsByUser(userId) {
  return getTransactions().filter(t => t.userId === userId);
}

function getTransactionsByUserAndMonth(userId, year, month) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return getTransactionsByUser(userId).filter(t => t.date.startsWith(prefix));
}

function createTransaction(data) {
  const txns = getTransactions();
  const txn = {
    id:        data.id,
    userId:    data.userId,
    type:      data.type,
    amount:    data.amount,
    category:  data.category,
    note:      data.note || '',
    date:      data.date,
    createdAt: new Date().toISOString(),
  };
  txns.push(txn);
  _write(KEYS.TRANSACTIONS, txns);
  return txn;
}

function deleteTransaction(id) {
  const txns = getTransactions();
  const filtered = txns.filter(t => t.id !== id);
  if (filtered.length === txns.length) return false;
  _write(KEYS.TRANSACTIONS, filtered);
  return true;
}

// ─── SESSION ──────────────────────────────────────────────────
function getSession() {
  return _read(KEYS.SESSION) || null;
}

function setSession(userId) {
  _write(KEYS.SESSION, { userId });
}

function clearSession() {
  localStorage.removeItem(KEYS.SESSION);
}

// ─── EXPORT ───────────────────────────────────────────────────
window.Storage = {
  KEYS,
  getUsers, getUserById, getUserByUsername, createUser, updateUser,
  getTransactions, getTransactionsByUser, getTransactionsByUserAndMonth,
  createTransaction, deleteTransaction,
  getSession, setSession, clearSession,
};
