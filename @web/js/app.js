const USERS_KEY = 'fintjam_users';
const TRANSACTIONS_KEY = 'fintjam_transactions';
const CURRENT_USER_KEY = 'fintjam_currentUser';

// Utils
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showToast(message, type = 'warning') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.style.borderLeftColor = type === 'warning' ? 'var(--primary-color)' : 'var(--success-color)';
    
    const icon = type === 'warning' ? '⚠️' : '✅';
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div>${message}</div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// DB Operations
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getTransactions() {
    return JSON.parse(localStorage.getItem(TRANSACTIONS_KEY)) || [];
}

function saveTransactions(transactions) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

function getCurrentUserId() {
    return localStorage.getItem(CURRENT_USER_KEY);
}

function setCurrentUserId(id) {
    if (id) localStorage.setItem(CURRENT_USER_KEY, id);
    else localStorage.removeItem(CURRENT_USER_KEY);
}

function getCurrentUser() {
    const userId = getCurrentUserId();
    if (!userId) return null;
    const users = getUsers();
    return users.find(u => u.id === userId);
}

function getUserTransactions() {
    const userId = getCurrentUserId();
    if (!userId) return [];
    return getTransactions().filter(t => t.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Auth Router
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const authPages = ['login.html', 'register.html'];

const currentUser = getCurrentUser();

if (!currentUser && !authPages.includes(currentPage)) {
    window.location.href = 'login.html';
} else if (currentUser && authPages.includes(currentPage)) {
    window.location.href = 'index.html';
} else if (currentUser && (!currentUser.monthlyLimit || currentUser.monthlyLimit <= 0) && currentPage !== 'setup.html') {
    window.location.href = 'setup.html';
} else if (currentUser && currentUser.monthlyLimit > 0 && currentPage === 'setup.html') {
    window.location.href = 'index.html';
}

// Global Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            setCurrentUserId(null);
            window.location.href = 'login.html';
        });
    }

    // Agent Name
    const agentName = document.getElementById('agentName');
    if (agentName && currentUser) {
        agentName.textContent = `AGENT: ${currentUser.username.toUpperCase()}`;
    }

    // Print
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
    }

    // Registration
    const regForm = document.getElementById('registerForm');
    if (regForm) {
        regForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const pass = document.getElementById('regPassword').value;
            const confirmPass = document.getElementById('regConfirmPassword').value;

            if (pass !== confirmPass) {
                showToast('Passwords do not match!');
                return;
            }

            const users = getUsers();
            if (users.find(u => u.username === username)) {
                showToast('Username already exists!');
                return;
            }

            const newUser = {
                id: generateId(),
                username,
                password: pass,
                monthlyLimit: 0
            };

            users.push(newUser);
            saveUsers(users);
            showToast('Registration successful!', 'success');
            setTimeout(() => window.location.href = 'login.html', 1500);
        });
    }

    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const pass = document.getElementById('loginPassword').value;

            const users = getUsers();
            const user = users.find(u => u.username === username && u.password === pass);

            if (user) {
                setCurrentUserId(user.id);
                showToast('Access granted', 'success');
                setTimeout(() => window.location.href = 'index.html', 1000);
            } else {
                showToast('Invalid credentials!');
            }
        });
    }

    // Setup
    const setupForm = document.getElementById('setupForm');
    if (setupForm) {
        setupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const limit = parseFloat(document.getElementById('setupLimit').value);
            
            if (limit <= 0) {
                showToast('Limit must be greater than 0');
                return;
            }

            const users = getUsers();
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].monthlyLimit = limit;
                saveUsers(users);
                showToast('Limit configured', 'success');
                setTimeout(() => window.location.href = 'index.html', 1000);
            }
        });
    }

    // Settings
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUsername = document.getElementById('setNewUsername').value;
            const newPass = document.getElementById('setNewPassword').value;
            const newLimit = document.getElementById('setNewLimit').value;

            const users = getUsers();
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            let updated = false;

            if (newUsername && newUsername !== users[userIndex].username) {
                if(users.find(u => u.username === newUsername && u.id !== currentUser.id)){
                    showToast('Username already taken!');
                    return;
                }
                users[userIndex].username = newUsername;
                updated = true;
            }

            if (newPass) {
                users[userIndex].password = newPass;
                updated = true;
            }

            if (newLimit) {
                users[userIndex].monthlyLimit = parseFloat(newLimit);
                updated = true;
            }

            if (updated) {
                saveUsers(users);
                showToast('Settings updated', 'success');
                setTimeout(() => location.reload(), 1000);
            } else {
                showToast('No changes made', 'success');
            }
        });
    }

    // Dashboard Logic
    if (currentPage === 'index.html' || currentPage === '') {
        renderDashboard();

        const txForm = document.getElementById('txForm');
        if (txForm) {
            txForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const type = document.getElementById('txType').value;
                const category = document.getElementById('txCategory').value;
                const amount = parseFloat(document.getElementById('txAmount').value);
                const description = document.getElementById('txDescription').value;

                const newTx = {
                    id: generateId(),
                    userId: currentUser.id,
                    type,
                    category,
                    amount,
                    description,
                    date: new Date().toISOString()
                };

                const transactions = getTransactions();
                transactions.push(newTx);
                saveTransactions(transactions);

                txForm.reset();
                showToast('Record Injected', 'success');
                renderDashboard();
            });
        }
    }
});

let txChartInstance = null;

function renderDashboard() {
    const transactions = getUserTransactions();
    
    let totalIncome = 0;
    let totalExpense = 0;

    const txList = document.getElementById('transactionList');
    if (!txList) return;
    
    txList.innerHTML = '';

    transactions.forEach(tx => {
        if (tx.type === 'income') totalIncome += tx.amount;
        else totalExpense += tx.amount;

        const isIncome = tx.type === 'income';
        const sign = isIncome ? '+' : '-';
        const colorClass = isIncome ? 'value-income' : 'value-expense';
        const displayDate = new Date(tx.date).toLocaleDateString();

        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `
            <div class="tx-info">
                <h4>${tx.description || tx.category}</h4>
                <div class="tx-date">${displayDate} | ${tx.category}</div>
            </div>
            <div style="display: flex; align-items: center;">
                <div class="tx-amount ${colorClass}">${sign} ${formatRupiah(tx.amount)}</div>
                <button class="tx-delete-btn" onclick="deleteTransaction('${tx.id}')">🗑️</button>
            </div>
        `;
        txList.appendChild(item);
    });

    if(transactions.length === 0){
        txList.innerHTML = '<div style="padding: 1.5rem; color: var(--text-secondary); text-align: center;">NO RECORDS FOUND</div>';
    }

    const totalBalance = totalIncome - totalExpense;

    document.getElementById('totalBalance').textContent = formatRupiah(totalBalance);
    document.getElementById('totalIncome').textContent = formatRupiah(totalIncome);
    document.getElementById('totalExpense').textContent = formatRupiah(totalExpense);
    document.getElementById('monthlyLimitDisplay').textContent = formatRupiah(currentUser.monthlyLimit);

    // Smart Toast Alert Logic
    const limit = currentUser.monthlyLimit;
    if (limit > 0) {
        if (totalExpense > limit) {
            showToast(`CRITICAL: Expenses exceeded limit by ${formatRupiah(totalExpense - limit)}!`);
        } else if (totalExpense >= limit * 0.8) {
            const percentage = ((totalExpense / limit) * 100).toFixed(0);
            showToast(`WARNING: Expense limit approaching (${percentage}% reached)`);
        }
    }

    // Render Chart
    renderChart(transactions);
}

window.deleteTransaction = function(id) {
    if(confirm('Delete this record?')) {
        let transactions = getTransactions();
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions(transactions);
        renderDashboard();
        showToast('Record deleted', 'success');
    }
}

function renderChart(transactions) {
    if (typeof Chart === 'undefined') return;
    const ctx = document.getElementById('txChart');
    if (!ctx) return;

    if (txChartInstance) {
        txChartInstance.destroy();
    }

    // Group expenses by category
    const expenseData = {};
    transactions.forEach(tx => {
        if (tx.type === 'expense') {
            expenseData[tx.category] = (expenseData[tx.category] || 0) + tx.amount;
        }
    });

    const labels = Object.keys(expenseData);
    const data = Object.values(expenseData);

    if (labels.length === 0) {
        // No data placeholder config
        txChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['No Expenses'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['rgba(255,255,255,0.1)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: 'NO EXPENSE DATA YET', color: '#a093b5' }
                }
            }
        });
        return;
    }

    txChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#ff003c',
                    '#00ff88',
                    '#00d2ff',
                    '#ffb703',
                    '#8a2be2',
                    '#ff00a0'
                ],
                borderColor: '#1a0b2e',
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            color: '#ffffff',
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#a093b5', font: { family: 'Rajdhani', size: 14 } }
                },
                title: {
                    display: true,
                    text: 'EXPENSES BY CATEGORY',
                    color: '#ff003c',
                    font: { family: 'Orbitron', size: 16, weight: 'bold' }
                }
            }
        }
    });
}
