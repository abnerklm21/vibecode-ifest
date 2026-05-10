const USERS_KEY = 'fintjam_users';
const TRANSACTIONS_KEY = 'fintjam_transactions';
const CURRENT_USER_KEY = 'fintjam_currentUser';

// Security
function sanitizeInput(str) {
    try {
        if (!str) return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    } catch (error) {
        console.error('Error sanitizing input:', error);
        return '';
    }
}

// Utils
function formatRupiah(number) {
    try {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    } catch (error) {
        console.error('Error formatting rupiah:', error);
        return 'Rp 0';
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function handleCurrencyInput(e) {
    const raw = e.target.value.replace(/\D/g, '');
    const num = parseInt(raw) || 0;
    e.target.value = num === 0 ? '' : new Intl.NumberFormat('id-ID').format(num);
}

function parseRupiah(str) {
    return parseInt(String(str).replace(/\D/g, '')) || 0;
}

function showToast(message, type = 'warning') {
    try {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.style.borderLeftColor = type === 'warning' ? 'var(--primary-color)' : 'var(--success-color)';
        
        const icon = type === 'warning' ? '⚠️' : '✅';
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div>${sanitizeInput(message)}</div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            try {
                toast.style.transform = 'translateX(120%)';
                setTimeout(() => toast.remove(), 300);
            } catch (e) {
                console.error('Error removing toast:', e);
            }
        }, 4000);
    } catch (error) {
        console.error('Error showing toast:', error);
    }
}

// DB Operations
function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
}

function saveUsers(users) {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
        console.error('Error saving users:', error);
    }
}

function getTransactions() {
    try {
        return JSON.parse(localStorage.getItem(TRANSACTIONS_KEY)) || [];
    } catch (error) {
        console.error('Error getting transactions:', error);
        return [];
    }
}

function saveTransactions(transactions) {
    try {
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (error) {
        console.error('Error saving transactions:', error);
    }
}

function getCurrentUserId() {
    try {
        return localStorage.getItem(CURRENT_USER_KEY);
    } catch (error) {
        console.error('Error getting current user ID:', error);
        return null;
    }
}

function setCurrentUserId(id) {
    try {
        if (id) {
            localStorage.setItem(CURRENT_USER_KEY, id);
        } else {
            localStorage.removeItem(CURRENT_USER_KEY);
        }
    } catch (error) {
        console.error('Error setting current user ID:', error);
    }
}

function getCurrentUser() {
    try {
        const userId = getCurrentUserId();
        if (!userId) return null;
        const users = getUsers();
        return users.find(u => u.id === userId);
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

function getUserTransactions() {
    try {
        const userId = getCurrentUserId();
        if (!userId) return [];
        return getTransactions().filter(t => t.userId === userId).sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
        console.error('Error getting user transactions:', error);
        return [];
    }
}

// Auth Router
const path = window.location.pathname.toLowerCase();
const isLoginPage = path.includes('login');
const isRegisterPage = path.includes('register');
const isSetupPage = path.includes('setup');
const isIndexPage = path.includes('index') || path.endsWith('/') || (!isLoginPage && !isRegisterPage && !isSetupPage && !path.includes('settings'));

let currentUser = null;
try {
    currentUser = getCurrentUser();
} catch (e) {
    console.error('Error initializing user:', e);
}

// Global Routing
try {
    if (!currentUser && !isLoginPage && !isRegisterPage) {
        window.location.href = 'login.html';
    } else if (currentUser && (isLoginPage || isRegisterPage)) {
        window.location.href = 'index.html';
    } else if (currentUser && (!currentUser.monthlyLimit || currentUser.monthlyLimit <= 0) && !isSetupPage) {
        window.location.href = 'setup.html';
    } else if (currentUser && currentUser.monthlyLimit > 0 && isSetupPage) {
        window.location.href = 'index.html';
    }
} catch (e) {
    console.error('Error routing:', e);
}

// Global Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                try {
                    e.preventDefault();
                    setCurrentUserId(null);
                    window.location.href = 'login.html';
                } catch (err) {
                    console.error('Logout error:', err);
                }
            });
        }

        // Agent Name
        const agentName = document.getElementById('agentName');
        if (agentName && currentUser) {
            agentName.textContent = 'AGENT: ' + sanitizeInput(currentUser.username).toUpperCase();
        }

        // Print
        const printBtn = document.getElementById('printBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                try {
                    window.print();
                } catch (err) {
                    console.error('Print error:', err);
                }
            });
        }

        // Registration
        const regForm = document.getElementById('registerForm');
        if (regForm) {
            regForm.addEventListener('submit', (e) => {
                try {
                    e.preventDefault();
                    const username = sanitizeInput(document.getElementById('regUsername').value);
                    const pass = sanitizeInput(document.getElementById('regPassword').value);
                    const confirmPass = sanitizeInput(document.getElementById('regConfirmPassword').value);

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
                        username: username,
                        password: pass,
                        monthlyLimit: 0
                    };

                    users.push(newUser);
                    saveUsers(users);
                    
                    // Auto-login after registration
                    setCurrentUserId(newUser.id);
                    
                    showToast('Identity Created. Initializing...', 'success');
                    setTimeout(() => {
                        try {
                            window.location.href = 'setup.html';
                        } catch(err) {
                            console.error('Redirect error:', err);
                            window.location.href = 'index.html';
                        }
                    }, 1500);
                } catch (err) {
                    console.error('Registration error:', err);
                }
            });
        }

        // Login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                try {
                    e.preventDefault();
                    const username = sanitizeInput(document.getElementById('loginUsername').value);
                    const pass = sanitizeInput(document.getElementById('loginPassword').value);

                    const users = getUsers();
                    const user = users.find(u => u.username === username && u.password === pass);

                    if (user) {
                        setCurrentUserId(user.id);
                        showToast('Access granted', 'success');
                        setTimeout(() => {
                            try {
                                window.location.href = 'index.html';
                            } catch(err) {
                                console.error('Redirect error:', err);
                            }
                        }, 1000);
                    } else {
                        showToast('Invalid credentials!');
                    }
                } catch (err) {
                    console.error('Login error:', err);
                }
            });
        }

        // Setup
        const setupForm = document.getElementById('setupForm');
        if (setupForm) {
            const setupLimitInput = document.getElementById('setupLimit');
            if (setupLimitInput) setupLimitInput.addEventListener('input', handleCurrencyInput);

            setupForm.addEventListener('submit', (e) => {
                try {
                    e.preventDefault();
                    const limit = parseRupiah(document.getElementById('setupLimit').value);
                    
                    if (limit <= 0 || isNaN(limit)) {
                        showToast('Limit must be a valid number greater than 0');
                        return;
                    }

                    const users = getUsers();
                    const userIndex = users.findIndex(u => u.id === currentUser.id);
                    if (userIndex !== -1) {
                        users[userIndex].monthlyLimit = limit;
                        saveUsers(users);
                        showToast('Limit configured', 'success');
                        setTimeout(() => {
                            try {
                                window.location.href = 'index.html';
                            } catch(err) {
                                console.error('Redirect error:', err);
                            }
                        }, 1000);
                    }
                } catch (err) {
                    console.error('Setup error:', err);
                }
            });
        }

        // Settings
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            const setNewLimitInput = document.getElementById('setNewLimit');
            if (setNewLimitInput) setNewLimitInput.addEventListener('input', handleCurrencyInput);

            settingsForm.addEventListener('submit', (e) => {
                try {
                    e.preventDefault();
                    const newUsername = sanitizeInput(document.getElementById('setNewUsername').value);
                    const newPass = sanitizeInput(document.getElementById('setNewPassword').value);
                    const newLimitRaw = document.getElementById('setNewLimit').value;
                    const newLimit = parseRupiah(newLimitRaw);

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

                    if (newLimitRaw) {
                        users[userIndex].monthlyLimit = newLimit;
                        updated = true;
                    }

                    if (updated) {
                        saveUsers(users);
                        showToast('Settings updated', 'success');
                        setTimeout(() => {
                            try {
                                location.reload();
                            } catch(err) {
                                console.error('Reload error:', err);
                            }
                        }, 1000);
                    } else {
                        showToast('No changes made', 'success');
                    }
                } catch (err) {
                    console.error('Settings error:', err);
                }
            });
        }

        // Dashboard Logic
        if (isIndexPage) {
            renderDashboard();

            const txForm = document.getElementById('txForm');
            if (txForm) {
                const txAmountInput = document.getElementById('txAmount');
                if (txAmountInput) txAmountInput.addEventListener('input', handleCurrencyInput);

                txForm.addEventListener('submit', (e) => {
                    try {
                        e.preventDefault();
                        const type = sanitizeInput(document.getElementById('txType').value);
                        const category = sanitizeInput(document.getElementById('txCategory').value);
                        const amount = parseRupiah(document.getElementById('txAmount').value);
                        const description = sanitizeInput(document.getElementById('txDescription').value);

                        if (isNaN(amount) || amount <= 0) {
                            showToast('Please enter a valid amount');
                            return;
                        }

                        const newTx = {
                            id: generateId(),
                            userId: currentUser.id,
                            type: type,
                            category: category,
                            amount: amount,
                            description: description,
                            date: new Date().toISOString()
                        };

                        const transactions = getTransactions();
                        transactions.push(newTx);
                        saveTransactions(transactions);

                        txForm.reset();
                        showToast('Record Injected', 'success');
                        renderDashboard();
                    } catch (err) {
                        console.error('Add transaction error:', err);
                    }
                });
            }
        }
    } catch (error) {
        console.error('DOM Content Loaded error:', error);
    }
});

let txChartInstance = null;

function renderDashboard() {
    try {
        if (!currentUser) return;
        const transactions = getUserTransactions();
        
        let totalIncome = 0;
        let totalExpense = 0;

        const txList = document.getElementById('transactionList');
        if (!txList) return;
        
        txList.innerHTML = '';

        transactions.forEach(tx => {
            try {
                if (tx.type === 'income') totalIncome += tx.amount;
                else totalExpense += tx.amount;

                const isIncome = tx.type === 'income';
                const sign = isIncome ? '+' : '-';
                const colorClass = isIncome ? 'value-income' : 'value-expense';
                const displayDate = new Date(tx.date).toLocaleDateString();

                const safeDescription = sanitizeInput(tx.description || tx.category);
                const safeCategory = sanitizeInput(tx.category);

                const item = document.createElement('div');
                item.className = 'transaction-item';
                item.innerHTML = `
                    <div class="tx-info">
                        <h4>${safeDescription}</h4>
                        <div class="tx-date">${displayDate} | ${safeCategory}</div>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <div class="tx-amount ${colorClass}">${sign} ${formatRupiah(tx.amount)}</div>
                        <button class="tx-delete-btn" onclick="deleteTransaction('${sanitizeInput(tx.id)}')">🗑️</button>
                    </div>
                `;
                txList.appendChild(item);
            } catch (err) {
                console.error('Error rendering transaction item:', err);
            }
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
    } catch (error) {
        console.error('Error rendering dashboard:', error);
    }
}

window.deleteTransaction = function(id) {
    try {
        if(confirm('Delete this record?')) {
            let transactions = getTransactions();
            transactions = transactions.filter(t => t.id !== id);
            saveTransactions(transactions);
            renderDashboard();
            showToast('Record deleted', 'success');
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
    }
};

function renderChart(transactions) {
    try {
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
    } catch (error) {
        console.error('Error rendering chart:', error);
    }
}
