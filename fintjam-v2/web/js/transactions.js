/**
 * transactions.js — FINTJAM CRUD & Kalkulasi Transaksi
 */

'use strict';

const Transactions = (() => {

  /** Simpan transaksi baru */
  function create({ userId, type, amount, category, note, date }) {
    if (!userId || !type || !amount || !category || !date) return null;
    const txn = Storage.createTransaction({
      id: Utils.generateId('txn'),
      userId, type, amount: parseInt(amount), category,
      note: note ? note.trim() : '', date,
    });
    return txn;
  }

  /** Hapus transaksi */
  function remove(id) {
    return Storage.deleteTransaction(id);
  }

  /** Ambil semua transaksi user */
  function getByUser(userId) {
    return Storage.getTransactionsByUser(userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /** Ambil transaksi bulan tertentu */
  function getMonthly(userId, year, month) {
    return Storage.getTransactionsByUserAndMonth(userId, year, month)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /** Ringkasan keuangan bulan tertentu */
  function getSummary(userId, year, month) {
    const txns = getMonthly(userId, year, month);
    const totalIncome  = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const user         = Storage.getUserById(userId);
    const limit        = user ? user.monthlyLimit : 0;
    const limitPct     = limit > 0 ? Math.min((totalExpense / limit) * 100, 999) : 0;

    return { totalIncome, totalExpense, limit, limitPct };
  }

  /** Total saldo all-time */
  function getTotalBalance(userId) {
    const txns = Storage.getTransactionsByUser(userId);
    const income  = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return income - expense;
  }

  /**
   * Data chart 7 bulan terakhir
   * Returns: [{ label, income, expense }]
   */
  function getChartData(userId, monthsBack = 7) {
    const result = [];
    const now    = new Date();

    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const txns = Storage.getTransactionsByUserAndMonth(userId, y, m);
      result.push({
        label:   Utils.MONTHS_SHORT[d.getMonth()],
        income:  txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }
    return result;
  }

  /** Group transaksi by month untuk tampilan history */
  function groupByMonth(txns) {
    const groups = {};
    txns.forEach(t => {
      const { year, month } = Utils.getMonthYear(t.date);
      const key = `${year}-${String(month).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = { label: Utils.monthLabel(year, month), txns: [] };
      groups[key].txns.push(t);
    });
    return Object.values(groups);
  }

  return { create, remove, getByUser, getMonthly, getSummary, getTotalBalance, getChartData, groupByMonth };
})();

window.Transactions = Transactions;
