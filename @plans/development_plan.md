# Fintjam - Development Plan

## 1. Project Overview
"Fintjam" is a web-based financial tracking application designed to help users manage their income and expenses, with a particular focus on keeping track of monthly limits and debts (especially friends borrowing money).

## 2. Core Rules & Constraints
*   **Tech Stack:** Vanilla HTML, CSS, and JavaScript. NO frameworks (like React, Vue, or TailwindCSS).
*   **Database:** Client-side Local Storage ONLY. No backend server.
*   **Currency Format:** All financial values must be displayed in Indonesian Rupiah (IDR) format (e.g., `Rp 1.000.000`).

## 3. Key Features
1.  **Authentication & Onboarding:**
    *   Register and Login functionalities.
    *   Initial Setup: Users must set a monthly expense limit upon first login before accessing the main dashboard.
2.  **Dashboard (Main Interface):**
    *   Overview of Total Balance, Total Income, Total Expense, and Monthly Limit status.
    *   Visual representation using a Chart (Chart.js via CDN).
    *   List of recent transactions.
3.  **Transaction Management (CRUD):**
    *   Add new income/expense.
    *   Categories: Makanan & Minuman, Transportasi, Belanja, Gaji / Pendapatan, Investasi, Temen Ngutang.
4.  **Reporting & Alerts:**
    *   Print button to export/print the financial report.
    *   **Smart Toast Alerts:** System notifications that trigger when expenses reach specific thresholds of the monthly limit (e.g., "Approaching limit", "Limit exceeded!").
5.  **Settings:**
    *   Update Username.
    *   Update Password.
    *   Update Monthly Expense Limit.
    *   (No Avatar or Full Name fields).

## 4. Design Guidelines (Gamer Aesthetic)
*   **Theme:** Dark mode exclusively.
*   **Color Palette:**
    *   Background: Deep/Midnight Purple.
    *   Accents: Dark Red.
    *   Text: Light grey/white for contrast.
*   **Style:** Sharp edges (no overly rounded corners, `border-radius: 0` or very minimal like `2px`), aggressive and modern gamer aesthetic.
*   **Effects:** Subtle neon glows on hover for interactive elements, sharp borders.
