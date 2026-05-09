/**
 * dashboard.js — FINTJAM Dashboard Render Logic
 * Cards, Chart, Modal Transaksi, Toast Alert
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.getCurrentUser();
  if (!user) return;

  const now   = new Date();
  const YEAR  = now.getFullYear();
  const MONTH = now.getMonth() + 1;

  // ── RENDER ALL ──────────────────────────────────────────────
  function renderAll() {
    renderBalance();
    renderSummaryCards();
    renderChart();
    renderRecentTxns();
    checkLimitAlert();
  }

  // ── TOTAL SALDO ─────────────────────────────────────────────
  function renderBalance() {
    const balance = Transactions.getTotalBalance(user.id);
    const el = document.getElementById('total-saldo');
    if (el) {
      const isNeg = balance < 0;
      el.textContent = (isNeg ? '- ' : '') + Utils.formatNumberInput(Math.abs(balance));
      el.style.color = isNeg ? 'var(--clr-error)' : 'var(--clr-on-bg)';
    }
  }

  // ── SUMMARY CARDS ────────────────────────────────────────────
  function renderSummaryCards() {
    const s = Transactions.getSummary(user.id, YEAR, MONTH);

    const incomeEl = document.getElementById('income-value');
    if (incomeEl) incomeEl.textContent = Utils.formatNumberInput(s.totalIncome);

    const expenseEl = document.getElementById('expense-value');
    if (expenseEl) expenseEl.textContent = Utils.formatNumberInput(s.totalExpense);

    // Progress bar
    const bar = document.getElementById('limit-bar');
    if (bar) {
      const pct = Math.min(s.limitPct, 100);
      bar.style.width = pct + '%';
      bar.className = 'limit-bar-fill';
      if (s.limitPct >= 100)     bar.classList.add('danger');
      else if (s.limitPct >= 80) bar.classList.add('warn');
    }

    const limitLabelEl = document.getElementById('limit-label');
    if (limitLabelEl && user.monthlyLimit > 0) {
      limitLabelEl.textContent = `${Math.round(s.limitPct)}% dari ${Utils.formatRupiah(user.monthlyLimit)}`;
    }
  }

  // ── CHART ────────────────────────────────────────────────────
  function renderChart() {
    const chartBars = document.getElementById('chart-bars');
    const chartLabels = document.getElementById('chart-labels');
    if (!chartBars || !chartLabels) return;

    const data = Transactions.getChartData(user.id, 7);
    const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);

    chartBars.innerHTML = '';
    chartLabels.innerHTML = '';

    data.forEach(d => {
      const incPct = Math.round((d.income  / maxVal) * 100);
      const expPct = Math.round((d.expense / maxVal) * 100);

      // Bar group
      const group = document.createElement('div');
      group.style.cssText = 'display:flex;align-items:flex-end;gap:4px;flex:1;justify-content:center';

      if (d.income > 0) {
        const bar = document.createElement('div');
        bar.className = 'chart-bar-income';
        bar.style.cssText = `width:16px;height:${incPct || 2}%;min-height:4px;position:relative;cursor:pointer`;
        bar.title = `Pemasukan: ${Utils.formatRupiah(d.income)}`;
        group.appendChild(bar);
      }
      if (d.expense > 0) {
        const bar = document.createElement('div');
        bar.className = 'chart-bar-expense';
        bar.style.cssText = `width:16px;height:${expPct || 2}%;min-height:4px;position:relative;cursor:pointer`;
        bar.title = `Pengeluaran: ${Utils.formatRupiah(d.expense)}`;
        group.appendChild(bar);
      }
      if (d.income === 0 && d.expense === 0) {
        const bar = document.createElement('div');
        bar.style.cssText = 'width:16px;height:2px;background:rgba(78,67,86,0.4)';
        group.appendChild(bar);
      }
      chartBars.appendChild(group);

      // Label
      const label = document.createElement('span');
      label.className = 'text-label-sm clr-muted';
      label.textContent = d.label;
      label.style.flex = '1';
      label.style.textAlign = 'center';
      chartLabels.appendChild(label);
    });
  }

  // ── RECENT TRANSACTIONS ──────────────────────────────────────
  function renderRecentTxns() {
    const container = document.getElementById('recent-txns');
    if (!container) return;

    const txns = Transactions.getByUser(user.id).slice(0, 5);
    if (txns.length === 0) {
      container.innerHTML = `
        <div style="padding:32px;text-align:center">
          <span class="material-symbols-outlined clr-muted" style="font-size:40px">receipt_long</span>
          <p class="text-label clr-muted" style="margin-top:8px">Belum ada transaksi</p>
        </div>`;
      return;
    }
    container.innerHTML = txns.map(t => buildTxnItem(t)).join('');
  }

  function buildTxnItem(t) {
    const cat   = Utils.CATEGORIES[t.category] || { label: t.category, icon: 'payments' };
    const sign  = t.type === 'income' ? '+' : '-';
    const color = t.type === 'income' ? 'var(--clr-income)' : 'var(--clr-expense)';
    return `
      <div class="txn-item ${t.type}">
        <div style="display:flex;align-items:center;gap:var(--sp-gutter)">
          <div class="txn-icon ${t.type}">
            <span class="material-symbols-outlined" style="font-size:22px">${cat.icon}</span>
          </div>
          <div>
            <p class="text-body" style="font-weight:700;text-transform:uppercase;font-size:14px">
              ${t.note || cat.label}
            </p>
            <p class="text-label-sm clr-muted">${Utils.formatDate(t.date)} · ${cat.label}</p>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <p class="text-currency" style="color:${color}">${sign} ${Utils.formatRupiah(t.amount)}</p>
        </div>
      </div>`;
  }

  // ── LIMIT ALERT ──────────────────────────────────────────────
  function checkLimitAlert() {
    const currentUser = Storage.getUserById(user.id);
    if (!currentUser || !currentUser.monthlyLimit) return;

    const s   = Transactions.getSummary(user.id, YEAR, MONTH);
    const pct = s.limitPct;

    if (pct >= 100) {
      Utils.showToast(
        'LIMIT TERLAMPAUI!',
        `Pengeluaran Rp${Utils.formatNumberInput(s.totalExpense)} melampaui limit ${Utils.formatRupiah(currentUser.monthlyLimit)}.`,
        'danger'
      );
    } else if (pct >= 80) {
      Utils.showToast(
        'LIMIT HAMPIR TERCAPAI',
        `Pengeluaran sudah ${Math.round(pct)}% dari limit bulanan Anda.`,
        'warning'
      );
    }
  }

  // ── MODAL TRANSAKSI ──────────────────────────────────────────
  const modal   = document.getElementById('modal-txn');
  const overlay = document.getElementById('modal-overlay');
  const fabBtn  = document.getElementById('fab-add');

  function openModal() {
    modal && (overlay.classList.add('open'));
    resetModal();
  }
  function closeModal() { overlay && overlay.classList.remove('open'); }

  fabBtn && fabBtn.addEventListener('click', openModal);
  overlay && overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.getElementById('btn-modal-close') && document.getElementById('btn-modal-close').addEventListener('click', closeModal);
  document.getElementById('btn-modal-cancel') && document.getElementById('btn-modal-cancel').addEventListener('click', closeModal);

  // Type toggle
  let currentType = 'expense';
  const btnExpense = document.getElementById('type-expense');
  const btnIncome  = document.getElementById('type-income');

  function setType(type) {
    currentType = type;
    btnExpense.classList.toggle('active-type-btn', type === 'expense');
    btnIncome.classList.toggle('active-type-btn', type === 'income');
    renderCategories();
  }

  btnExpense && btnExpense.addEventListener('click', () => setType('expense'));
  btnIncome  && btnIncome.addEventListener('click',  () => setType('income'));

  // Category selection
  let selectedCategory = null;
  function renderCategories() {
    const grid = document.getElementById('cat-grid');
    if (!grid) return;
    selectedCategory = null;

    const filtered = Object.entries(Utils.CATEGORIES)
      .filter(([, c]) => c.types.includes(currentType));

    grid.innerHTML = filtered.map(([key, c]) => `
      <div class="cat-item" data-cat="${key}" tabindex="0">
        <span class="material-symbols-outlined" style="font-size:28px">${c.icon}</span>
        <span class="cat-label">${c.label}</span>
      </div>`).join('');

    grid.querySelectorAll('.cat-item').forEach(item => {
      item.addEventListener('click', () => {
        grid.querySelectorAll('.cat-item').forEach(i => i.classList.remove('active-income','active-expense'));
        item.classList.add(currentType === 'income' ? 'active-income' : 'active-expense');
        selectedCategory = item.dataset.cat;
      });
    });
  }

  // Amount input
  const amountInput = document.getElementById('modal-amount');
  amountInput && amountInput.addEventListener('input', Utils.handleCurrencyInput);

  // Date default
  const dateInput = document.getElementById('modal-date');
  if (dateInput) dateInput.value = Utils.todayISO();

  function resetModal() {
    selectedCategory = null;
    currentType = 'expense';
    setType('expense');
    if (amountInput) amountInput.value = '';
    if (dateInput) dateInput.value = Utils.todayISO();
    const noteInput = document.getElementById('modal-note');
    if (noteInput) noteInput.value = '';
    const err = document.getElementById('modal-error');
    if (err) { err.textContent = ''; err.style.display = 'none'; }
  }

  // Save
  document.getElementById('btn-modal-save') && document.getElementById('btn-modal-save').addEventListener('click', () => {
    const errEl  = document.getElementById('modal-error');
    const amount = Utils.parseRupiah(amountInput?.value);
    const date   = dateInput?.value;
    const note   = document.getElementById('modal-note')?.value;

    if (!amount || amount <= 0) {
      errEl.textContent = 'Masukkan jumlah yang valid'; errEl.style.display = 'block'; return;
    }
    if (!selectedCategory) {
      errEl.textContent = 'Pilih kategori terlebih dahulu'; errEl.style.display = 'block'; return;
    }
    if (!date) {
      errEl.textContent = 'Tanggal wajib diisi'; errEl.style.display = 'block'; return;
    }

    Transactions.create({ userId: user.id, type: currentType, amount, category: selectedCategory, note, date });
    closeModal();
    renderAll();
  });

  // Initial render
  renderAll();

  // Username display
  const uEl = document.getElementById('username-display');
  if (uEl) uEl.textContent = user.username;
});
