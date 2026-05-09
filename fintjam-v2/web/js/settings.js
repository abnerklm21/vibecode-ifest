/**
 * settings.js — FINTJAM Settings Page Logic
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.getCurrentUser();
  if (!user) return;

  // Isi nilai saat ini
  const usernameInput = document.getElementById('set-username');
  const limitInput    = document.getElementById('set-limit');
  if (usernameInput) usernameInput.value = user.username;
  if (limitInput)    limitInput.value    = Utils.formatNumberInput(user.monthlyLimit || 0);

  // Format limit input
  limitInput && limitInput.addEventListener('input', Utils.handleCurrencyInput);

  // ── UPDATE PROFIL ────────────────────────────────────────────
  document.getElementById('btn-save-profile')?.addEventListener('click', async () => {
    const newUsername = document.getElementById('set-username')?.value.trim();
    const newPassword = document.getElementById('set-password')?.value;
    const confirmPw   = document.getElementById('set-confirm-pw')?.value;

    Utils.clearErrors('set-username', 'set-password', 'set-confirm-pw');
    let changed = false;

    if (newUsername && newUsername !== user.username) {
      const uErr = Utils.validateUsername(newUsername);
      if (uErr) { Utils.setError('set-username', uErr); return; }
      const existing = Storage.getUserByUsername(newUsername);
      if (existing && existing.id !== user.id) {
        Utils.setError('set-username', 'Username sudah digunakan'); return;
      }
      Storage.updateUser(user.id, { username: newUsername });
      changed = true;
    }

    if (newPassword) {
      const pErr = Utils.validatePassword(newPassword);
      if (pErr) { Utils.setError('set-password', pErr); return; }
      if (newPassword !== confirmPw) {
        Utils.setError('set-confirm-pw', 'Konfirmasi password tidak cocok'); return;
      }
      const hash = await Utils.hashPassword(newPassword);
      Storage.updateUser(user.id, { passwordHash: hash });
      document.getElementById('set-password').value    = '';
      document.getElementById('set-confirm-pw').value = '';
      changed = true;
    }

    if (changed) {
      Utils.showToast('PROFIL DIPERBARUI', 'Perubahan berhasil disimpan.', 'success');
    } else {
      Utils.showToast('TIDAK ADA PERUBAHAN', 'Tidak ada data yang diubah.', 'warning');
    }
  });

  // ── UPDATE LIMIT ─────────────────────────────────────────────
  document.getElementById('btn-save-limit')?.addEventListener('click', () => {
    const raw = Utils.parseRupiah(document.getElementById('set-limit')?.value);
    if (!raw || raw <= 0) {
      Utils.setError('set-limit', 'Masukkan limit yang valid (lebih dari 0)');
      return;
    }
    Utils.clearErrors('set-limit');
    Storage.updateUser(user.id, { monthlyLimit: raw });
    Utils.showToast('LIMIT DIPERBARUI', `Limit baru: ${Utils.formatRupiah(raw)}`, 'success');
  });

  // ── LOGOUT ───────────────────────────────────────────────────
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    if (confirm('Yakin ingin keluar dari FINTJAM?')) {
      Auth.logout();
    }
  });
});
