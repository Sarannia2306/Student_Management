// Verify Account Page Module
const VerifyPage = (function() {
  function init() {
    const pending = JSON.parse(localStorage.getItem('pendingVerification') || 'null');
    const current = JSON.parse(localStorage.getItem('currentUser') || 'null');
    // Prefer explicit pendingVerification; otherwise, try currentUser if not verified
    let uid = pending?.uid || current?.uid;
    let email = pending?.email || current?.email;
    const isVerified = (current && current.emailVerified === true) || (pending?.verified === true);
    const isAdmin = (pending?.role || current?.role) === 'admin';
    const adminId = pending?.adminId || current?.adminId || '';

    document.getElementById('mainContent').innerHTML = `
      <div class="container py-5" style="max-width:540px;">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0"><i class="fas fa-shield-halved me-2"></i>Verify your account</h5>
          </div>
          <div class="card-body">
            ${isVerified ? `<div class="alert alert-success">Your email appears verified. You can log in now.</div>` : ''}
            <p class="text-muted">We sent a verification link to <strong>${email || ''}</strong>. Please open the email and click the link to verify your account.</p>
            ${isAdmin && adminId ? `
              <div class="alert alert-warning">
                <strong>Admin ID:</strong> <span class="ms-1">${adminId}</span>
                <div class="mt-1">Kindly take note of the ID as you'll be required during login process.</div>
              </div>
            ` : ''}
            <div class="d-flex justify-content-between">
              <button type="button" class="btn btn-outline-secondary" id="resendLinkBtn">
                <i class="fas fa-paper-plane me-1"></i> Resend verification email
              </button>
              <button type="button" class="btn btn-primary" id="refreshStatusBtn">
                <i class="fas fa-rotate me-1"></i> I have verified
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind events: resend verification email
    const resendLinkBtn = document.getElementById('resendLinkBtn');
    if (resendLinkBtn) {
      resendLinkBtn.addEventListener('click', async () => {
        try {
          await window.FirebaseAPI?.sendVerificationEmailNow?.();
          Auth?.showAlert?.('Verification email sent. Please check your inbox.', 'info');
        } catch (e) {
          Auth?.showAlert?.('Could not send verification email. Try again later.', 'danger');
        }
      });
    }

    // Bind events: refresh verification status
    const refreshStatusBtn = document.getElementById('refreshStatusBtn');
    if (refreshStatusBtn) {
      refreshStatusBtn.addEventListener('click', async () => {
        try {
          const result = await window.FirebaseAPI?.reloadCurrentUser?.();
          if (result?.emailVerified) {
            localStorage.removeItem('pendingVerification');
            Auth?.showAlert?.('Your email is verified. You can now log in.', 'success');
            try { await window.FirebaseAPI?.doSignOut?.(); } catch (_) {}
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
          } else {
            Auth?.showAlert?.('Still not verified. Please click the link in your email.', 'warning');
          }
        } catch (e) {
          Auth?.showAlert?.('Unable to refresh verification status.', 'danger');
        }
      });
    }
  }

  return { init };
})();
