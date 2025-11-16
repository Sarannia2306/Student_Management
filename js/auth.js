// Authentication Module
const Auth = (function() {
    // Check if user is logged in
    function checkAuth() {
        return localStorage.getItem('currentUser') !== null;
    }

    // Toggle password visibility within auth modals only (scoped listeners)
    function togglePasswordVisibility() {
        const bindInContainer = (container) => {
            if (!container || container._boundToggleDelegation) return;
            container._boundToggleDelegation = true;
            container.addEventListener('click', function(e){
                const btn = e.target.closest('.toggle-password');
                if (!btn || !container.contains(btn)) return;
                const group = btn.closest('.input-group');
                const input = group ? group.querySelector('input') : btn.previousElementSibling;
                const icon = btn.querySelector('i');
                try { console.log('[Auth-scope] click', { id: input?.id, type: input?.type }); } catch(_){}
                if (!input) return;
                if (String(input.type).toLowerCase() === 'password') {
                    input.type = 'text';
                    if (icon) { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
                } else {
                    input.type = 'password';
                    if (icon) { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
                }
            });
        };
        bindInContainer(document.getElementById('loginModal'));
        bindInContainer(document.getElementById('registerModal'));
    }


    function isValidEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v||'');}
    // >=8 chars, at least 1 uppercase, 1 number, 1 special character
    function isStrongPassword(p){
        const s = String(p||'');
        return /[A-Z]/.test(s) && /\d/.test(s) && /[^A-Za-z0-9]/.test(s) && s.length >= 8;
    }

    // Mask IC leaving first 2 and last 2 digits visible
    function maskIC(ic){
        const s = String(ic||'');
        if (s.length <= 4) return '*'.repeat(Math.max(0, s.length));
        const head = s.slice(0,2), tail = s.slice(-2);
        return head + '*'.repeat(s.length - 4) + tail;
    }

    function updatePwdHints(prefix, value){
        const s = String(value||'');
        const okLen = s.length >= 8;
        const okUpper = /[A-Z]/.test(s);
        const okNum = /\d/.test(s);
        const okSpecial = /[^A-Za-z0-9]/.test(s);

        const setState = (id, ok) => {
            const li = document.getElementById(id);
            if (!li) return;
            const icon = li.querySelector('.hint-icon');
            li.classList.toggle('text-success', ok);
            li.classList.toggle('text-muted', !ok);
            if (icon){
                icon.classList.remove('fa-circle','fa-check-circle','text-success');
                icon.classList.add(ok ? 'fa-check-circle' : 'fa-circle');
                if (ok) icon.classList.add('text-success');
                icon.style.fontSize = ok ? '12px' : '6px';
            }
        };

        setState(`${prefix}PwdHintLen`, okLen);
        setState(`${prefix}PwdHintUpper`, okUpper);
        setState(`${prefix}PwdHintNum`, okNum);
        setState(`${prefix}PwdHintSpecial`, okSpecial);
    }
    function mapAuthError(err){
        const code = (err && err.code ? String(err.code) : '').toLowerCase();
        const msg = (err && err.message ? String(err.message) : '').toLowerCase();
        const text = `${code} ${msg}`;
        if (text.includes('email-already-in-use') || text.includes('email_exists')) return 'Email already registered. Please log in.';
        if (text.includes('invalid-email')) return 'Please enter a valid email address';
        if (text.includes('weak-password')) return 'Password must be at least 6 characters';
        if (text.includes('wrong-password') || text.includes('invalid-credential') || text.includes('invalid-login-credentials')) return 'Incorrect email or password';
        if (text.includes('user-not-found')) return 'No account found for this email';
        if (text.includes('user-disabled')) return 'This account has been disabled';
        if (text.includes('too-many-requests')) return 'Too many attempts. Please try again later';
        if (text.includes('network-request-failed')) return 'Network error. Check your connection and try again';
        if (text.includes('operation-not-allowed')) return 'Email/Password sign-in is disabled in Firebase project';
        if (text.includes('permission_denied') || text.includes('permission-denied')) return 'Database permission denied. Please check Firebase Realtime Database rules.';
        if (text.includes('subtle') && text.includes('secure')) return 'Secure context required. Please use HTTPS or Firebase Hosting to continue.';
        return 'Authentication error. Please try again.';
    }

    // Handle student login
    async function handleStudentLogin(e) {
        e.preventDefault();
        const email = document.getElementById('studentEmail').value.trim();
        const password = document.getElementById('studentPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!email){ showAlert('Email is required', 'danger'); document.getElementById('studentEmail').focus(); return; }
        if (!isValidEmail(email)){ showAlert('Please enter a valid email', 'danger'); document.getElementById('studentEmail').focus(); return; }
        if (!password){ showAlert('Password is required', 'danger'); document.getElementById('studentPassword').focus(); return; }
        
        try {
            if (window.FirebaseAPI?.signIn) {
                const user = await window.FirebaseAPI.signIn(email, password);
                if (!user || (user.role && user.role !== 'student')) {
                    return showAlert('This account is not a Student', 'danger');
                }
                if (!(user.emailVerified || user.verified === true)) {
                    localStorage.setItem('pendingVerification', JSON.stringify({ uid: user.uid, email: user.email, role: 'student' }));
                    showAlert('Please verify your email via the link we sent to your inbox.', 'warning');
                    try { await window.FirebaseAPI?.doSignOut?.(); } catch(_){}
                    if (typeof App !== 'undefined') App.loadPage('verify');
                    return;
                }
                const userData = { ...user, role: 'student', lastLogin: new Date().toISOString() };
                localStorage.setItem('currentUser', JSON.stringify(userData));
            } else {
                // Fallback: localStorage auth
                const students = JSON.parse(localStorage.getItem('students') || '[]');
                const student = students.find(s => s.email === email && s.password === password);
                if (!student) return showAlert('Invalid student email or password', 'danger');
                const userData = { id: student.id, email: student.email, name: student.fullName, role: 'student', ...student, lastLogin: new Date().toISOString() };
                localStorage.setItem('currentUser', JSON.stringify(userData));
                const updatedStudents = students.map(s => s.id === student.id ? { ...s, lastLogin: userData.lastLogin } : s);
                localStorage.setItem('students', JSON.stringify(updatedStudents));
            }
            if (rememberMe) localStorage.setItem('rememberedEmail', email); else localStorage.removeItem('rememberedEmail');
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal')); if (loginModal) loginModal.hide();
            const current = JSON.parse(localStorage.getItem('currentUser'));
            App.setCurrentUser(current);
            App.loadDashboard();
            App.logActivity('Student logged in', current?.email);
            showAlert(`Welcome back, ${current?.fullName || current?.name || 'Student'}!`, 'success');
        } catch (err) {
            showAlert(mapAuthError(err), 'danger');
            document.getElementById('studentPassword').focus();
        }
    }
    
    // Handle admin login
    async function handleAdminLogin(e) {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;
        const adminIdCode = (document.getElementById('adminIdCode')?.value || '').trim();
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!email){ showAlert('Email is required', 'danger'); document.getElementById('adminEmail').focus(); return; }
        if (!isValidEmail(email)){ showAlert('Please enter a valid email', 'danger'); document.getElementById('adminEmail').focus(); return; }
        if (!password){ showAlert('Password is required', 'danger'); document.getElementById('adminPassword').focus(); return; }
        if (!/^\d{4}$/.test(adminIdCode)) { showAlert('Please enter your 4-digit Admin ID (from AD-1234)', 'danger'); document.getElementById('adminIdCode')?.focus(); return; }
        
        try {
            if (window.FirebaseAPI?.signIn) {
                const user = await window.FirebaseAPI.signIn(email, password);
                if (!user || (user.role && user.role !== 'admin')) {
                    return showAlert('This account is not an Admin', 'danger');
                }
                if (!(user.emailVerified || user.verified === true)) {
                    localStorage.setItem('pendingVerification', JSON.stringify({ uid: user.uid, email: user.email, role: 'admin' }));
                    showAlert('Please verify your email via the link we sent to your inbox.', 'warning');
                    try { await window.FirebaseAPI?.doSignOut?.(); } catch(_){ }
                    if (typeof App !== 'undefined') App.loadPage('verify');
                    return;
                }
                // Verify 4-digit Admin ID matches profile
                let profile = null;
                try { profile = await window.FirebaseAPI?.getUserProfile?.(user.uid); } catch(_) {}
                const adminId = profile?.adminId || user?.adminId || '';
                const last4 = String(adminId).slice(-4);
                if (!last4 || last4 !== adminIdCode) {
                    try { await window.FirebaseAPI?.doSignOut?.(); } catch(_) {}
                    return showAlert('Invalid Admin ID. Enter the 4 digits after AD- on your Admin ID.', 'danger');
                }
                const userData = { ...user, role: 'admin', lastLogin: new Date().toISOString() };
                localStorage.setItem('currentUser', JSON.stringify(userData));
            } else {
                const admins = JSON.parse(localStorage.getItem('admins') || '[]');
                const admin = admins.find(a => a.email === email && a.password === password);
                if (!admin) return showAlert('Invalid admin email or password', 'danger');
                const last4 = String(admin.adminId || '').slice(-4);
                if (!/^\d{4}$/.test(adminIdCode) || last4 !== adminIdCode) return showAlert('Invalid Admin ID. Enter the 4 digits after AD- on your Admin ID.', 'danger');
                const userData = { id: admin.id, email: admin.email, name: admin.fullName, role: 'admin', ...admin, lastLogin: new Date().toISOString() };
                localStorage.setItem('currentUser', JSON.stringify(userData));
                const updatedAdmins = admins.map(a => a.id === admin.id ? { ...a, lastLogin: userData.lastLogin } : a);
                localStorage.setItem('admins', JSON.stringify(updatedAdmins));
            }
            if (rememberMe) localStorage.setItem('rememberedEmail', email); else localStorage.removeItem('rememberedEmail');
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal')); if (loginModal) loginModal.hide();
            const current = JSON.parse(localStorage.getItem('currentUser'));
            App.setCurrentUser(current);
            App.loadDashboard();
            App.logActivity('Admin logged in', current?.email);
            showAlert(`Welcome back, ${current?.fullName || current?.name || 'Admin'}!`, 'success');
        } catch (err) {
            showAlert(mapAuthError(err), 'danger');
            document.getElementById('adminPassword').focus();
        }
    }
    
    // Handle student registration
    async function handleStudentRegister(e) {
        e.preventDefault();
        const agreed = !!document.getElementById('studentAgree')?.checked;
        if (!agreed) { showAlert('Please agree to the Terms & Conditions to continue', 'danger'); document.getElementById('studentAgree')?.focus(); return; }
        
        // Generate default student ID: STU<YY>-<4digits>
        const yy = String(new Date().getFullYear()).slice(-2);
        const rnd4 = Math.floor(1000 + Math.random() * 9000);
        const studentId = `STU${yy}-${rnd4}`;

        const formData = {
            fullName: document.getElementById('studentFullName').value.trim(),
            email: document.getElementById('studentRegEmail').value.trim().toLowerCase(),
            phone: document.getElementById('studentPhone').value.trim(),
            icNumber: document.getElementById('studentIC').value.trim(),
            password: document.getElementById('studentRegPassword').value,
            confirmPassword: document.getElementById('confirmStudentPassword').value,
            role: 'student',
            registeredAt: new Date().toISOString()
        };
        if (!formData.fullName){ showAlert('Full name is required', 'danger'); document.getElementById('studentFullName').focus(); return; }
        if (!isValidEmail(formData.email)){ showAlert('Please enter a valid email', 'danger'); document.getElementById('studentRegEmail').focus(); return; }
        if (!formData.password){ showAlert('Password is required', 'danger'); document.getElementById('studentRegPassword').focus(); return; }
        if (!isStrongPassword(formData.password)){
            showAlert('Password must be at least 8 characters, include 1 uppercase, 1 number, and 1 special character', 'danger');
            document.getElementById('studentRegPassword').focus();
            return;
        }
        if (formData.password !== formData.confirmPassword){ showAlert('Passwords do not match', 'danger'); document.getElementById('confirmStudentPassword').focus(); return; }
        try {
            if (window.FirebaseAPI?.registerUser) {
                // Hash IC
                const icHash = await window.FirebaseAPI.sha256Hex(formData.icNumber);
                const created = await window.FirebaseAPI.registerUser(formData.email, formData.password, 'student', {
                    studentId: studentId,
                    fullName: formData.fullName,
                    phone: formData.phone,
                    icHash: icHash,
                    maskedIC: maskIC(formData.icNumber)
                });
                // Create IC uniqueness index 
                try {
                    await window.FirebaseAPI.setIcIndex(icHash, created.uid);
                } catch (e) {
                    showAlert('IC number already exists. Please use a different IC.', 'danger');
                    try { await window.FirebaseAPI?.doSignOut?.(); } catch(_){}
                    return;
                }
                // Email verification already sent by Firebase on registration
                localStorage.setItem('pendingVerification', JSON.stringify({ uid: created.uid, email: formData.email, role: 'student' }));
                // Close register modal and route to Verify page
                const regEl = document.getElementById('registerModal');
                if (regEl) { try { (bootstrap.Modal.getInstance(regEl) || new bootstrap.Modal(regEl)).hide(); } catch(_){} }
                if (typeof App !== 'undefined') App.loadPage('verify');
                return;
            } else {
                const students = JSON.parse(localStorage.getItem('students') || '[]');
                if (students.some(s => s.email === formData.email)) return showAlert('Email already registered', 'danger');
                const { confirmPassword, ...studentData } = formData;
                studentData.studentId = studentId;
                studentData.maskedIC = maskIC(studentData.icNumber);
                students.push(studentData);
                localStorage.setItem('students', JSON.stringify(students));
            }
            App.logActivity('New student registered', formData.email);
            showAlert('Registration successful! Please log in.', 'success');
        } catch (err) {
            return showAlert(mapAuthError(err), 'danger');
        }
        
        // Switch to login
        const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        registerModal.hide();
        loginModal.show();
        
        // Pre-fill email in login form
        document.getElementById('studentLogin').click();
        document.getElementById('studentEmail').value = formData.email;
        document.getElementById('studentPassword').focus();
    }
    
    // Handle admin registration (only for demo, in production this would be restricted)
    async function handleAdminRegister(e) {
        e.preventDefault();
        const agreed = !!document.getElementById('adminAgree')?.checked;
        if (!agreed) { showAlert('Please agree to the Terms & Conditions to continue', 'danger'); document.getElementById('adminAgree')?.focus(); return; }
        
        // Generate Admin ID: AD-<4digits>
        const adminId = `AD-${Math.floor(1000 + Math.random() * 9000)}`;

        const formData = {
            fullName: document.getElementById('adminFullName').value.trim(),
            email: document.getElementById('adminRegEmail').value.trim().toLowerCase(),
            phone: document.getElementById('adminPhone').value.trim(),
            icNumber: document.getElementById('adminIC').value.trim(),
            password: document.getElementById('adminRegPassword').value,
            confirmPassword: document.getElementById('confirmAdminPassword').value,
            role: 'admin',
            registeredAt: new Date().toISOString()
        };
        if (!formData.fullName){ showAlert('Full name is required', 'danger'); document.getElementById('adminFullName').focus(); return; }
        if (!isValidEmail(formData.email)){ showAlert('Please enter a valid email', 'danger'); document.getElementById('adminRegEmail').focus(); return; }
        if (!formData.password){ showAlert('Password is required', 'danger'); document.getElementById('adminRegPassword').focus(); return; }
        if (!isStrongPassword(formData.password)){
            showAlert('Password must be at least 8 characters, include 1 uppercase, 1 number, and 1 special character', 'danger');
            document.getElementById('adminRegPassword').focus();
            return;
        }
        if (formData.password !== formData.confirmPassword){ showAlert('Passwords do not match', 'danger'); document.getElementById('confirmAdminPassword').focus(); return; }
        try {
            if (window.FirebaseAPI?.registerUser) {
                const icHash = await window.FirebaseAPI.sha256Hex(formData.icNumber);
                const created = await window.FirebaseAPI.registerUser(formData.email, formData.password, 'admin', {
                    adminId: adminId,
                    fullName: formData.fullName,
                    phone: formData.phone,
                    icHash: icHash,
                    maskedIC: maskIC(formData.icNumber)
                });
                try {
                    await window.FirebaseAPI.setIcIndex(icHash, created.uid);
                } catch (e) {
                    showAlert('IC number already exists. Please use a different IC.', 'danger');
                    try { await window.FirebaseAPI?.doSignOut?.(); } catch(_){}
                    return;
                }
                // Require email verification like student; show admin ID on Verify page
                localStorage.setItem('pendingVerification', JSON.stringify({ uid: created.uid, email: formData.email, role: 'admin', adminId }));
                const regEl = document.getElementById('registerModal');
                if (regEl) { try { (bootstrap.Modal.getInstance(regEl) || new bootstrap.Modal(regEl)).hide(); } catch(_){} }
                if (typeof App !== 'undefined') App.loadPage('verify');
                App.logActivity('New admin registered (pending verification)', formData.email);
                return;
            } else {
                const admins = JSON.parse(localStorage.getItem('admins') || '[]');
                if (admins.some(a => a.email === formData.email)) return showAlert('Admin email already registered', 'danger');
                const { confirmPassword, ...adminData } = formData;
                adminData.adminId = adminId;
                adminData.maskedIC = maskIC(adminData.icNumber);
                admins.push(adminData);
                localStorage.setItem('admins', JSON.stringify(admins));
                // LocalStorage mode: mimic verify flow by showing login modal and a notice
                const regEl = document.getElementById('registerModal');
                if (regEl) { try { (bootstrap.Modal.getInstance(regEl) || new bootstrap.Modal(regEl)).hide(); } catch(_){} }
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
                showAlert(`Your Admin ID is ${adminId}. Kindly take note as it is required during Admin Login.`, 'warning');
            }
            App.logActivity('New admin registered', formData.email);
        } catch (err) {
            return showAlert(mapAuthError(err), 'danger');
        }
        // Done
    }
    // Handle logout
    function handleLogout() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser && currentUser.email) {
            App.logActivity(`${currentUser.role} logged out`, currentUser.email);
        }
        
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
    
    // Show alert message
    function showAlert(message, type = 'info') {
        // Remove any existing alerts to avoid stacking
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) existingAlert.remove();

        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Prefer placing inside an open modal so it's visible above the backdrop
        const modalBody = document.querySelector('.modal.show .modal-body');
        const modalContent = document.querySelector('.modal.show .modal-content');
        const container = modalBody || modalContent || document.querySelector('.container') || document.body;

        if (container.firstChild) {
            container.insertBefore(alertDiv, container.firstChild);
        } else {
            container.appendChild(alertDiv);
        }

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            try {
                const alert = bootstrap.Alert.getOrCreateInstance(alertDiv);
                if (alert) alert.close(); else alertDiv.remove();
            } catch (_) {
                alertDiv.remove();
            }
        }, 5000);
    }
    
    // Toggle between login types
    function setupLoginTypeToggle() {
        // Toggle between student and admin login (prompt for Admin ID 4 digits when switching to Admin)
        document.querySelectorAll('input[name="loginType"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const switchingToAdmin = this.id === 'adminLogin' && this.checked;
                if (switchingToAdmin) {
                    const code = window.prompt('Enter Admin Access Code (4 digits from your Admin ID, e.g. AD-1234). This code will be verified after you enter your email and password.');
                    if (!/^\d{4}$/.test(code || '')) {
                        // Revert to Student tab on invalid/missing code
                        const studentRadio = document.getElementById('studentLogin');
                        if (studentRadio) studentRadio.checked = true;
                        document.getElementById('studentLoginFields').style.display = 'block';
                        document.getElementById('adminLoginFields').style.display = 'none';
                        try { showAlert('Invalid Admin ID. Please enter the 4 digits from AD-1234.', 'danger'); } catch(_) {}
                        return;
                    }
                    // Populate Admin ID field for convenience
                    const adminIdInput = document.getElementById('adminIdCode');
                    if (adminIdInput) adminIdInput.value = code;
                }

                const isStudentLogin = document.getElementById('studentLogin').checked;
                document.getElementById('studentLoginFields').style.display = isStudentLogin ? 'block' : 'none';
                document.getElementById('adminLoginFields').style.display = isStudentLogin ? 'none' : 'block';
                document.getElementById('registerPrompt').textContent = isStudentLogin ?
                    "Don't have a student account? " :
                    "Don't have an admin account? ";
            });
        });
        
        // Toggle between student and admin registration
        document.querySelectorAll('input[name="registerType"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const isStudentRegister = this.id === 'studentRegister';
                document.getElementById('studentRegisterForm').style.display = isStudentRegister ? 'block' : 'none';
                document.getElementById('adminRegisterForm').style.display = isStudentRegister ? 'none' : 'block';
            });
        });
    }
    
    // Initialize authentication module
    function init() {
        togglePasswordVisibility();
        setupLoginTypeToggle();
        
        // Initialize default admin if none exists
        const admins = JSON.parse(localStorage.getItem('admins') || '[]');
        if (admins.length === 0) {
            const defaultAdmin = {
                id: 'ADM' + Date.now().toString().slice(-6),
                fullName: 'System Administrator',
                email: 'admin@college.edu',
                phone: '0123456789',
                icNumber: '000000000000',
                password: 'Admin@123', // In production, this should be hashed
                role: 'admin',
                registeredAt: new Date().toISOString()
            };
            localStorage.setItem('admins', JSON.stringify([defaultAdmin]));
            console.log('Default admin created:', defaultAdmin);
        }
        
        // Sync UI with Firebase auth state if available
        if (window.FirebaseAPI?.onAuthStateChanged) {
            window.FirebaseAPI.onAuthStateChanged(async (fbUser) => {
                if (fbUser) {
                    try {
                        const profile = await window.FirebaseAPI.getUserProfile(fbUser.uid);
                        const userData = profile ? { ...profile, uid: fbUser.uid, email: fbUser.email } : { uid: fbUser.uid, email: fbUser.email };
                        localStorage.setItem('currentUser', JSON.stringify(userData));
                        if (typeof App !== 'undefined') {
                            App.setCurrentUser(userData);
                            App.loadDashboard();
                        }
                    } catch (_) {}
                } else {
                    localStorage.removeItem('currentUser');
                    if (typeof App !== 'undefined') {
                        // Show login button/modal and reset main content
                        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                        loginModal.show();
                    }
                }
            });
        }

        // Event listeners for login forms
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                const isStudentLogin = document.getElementById('studentLogin').checked;
                if (isStudentLogin) {
                    handleStudentLogin(e);
                } else {
                    handleAdminLogin(e);
                }
            });
        }
        // Forgot password (student)
        document.getElementById('forgotStudentPwd')?.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = (document.getElementById('studentEmail')?.value || '').trim();
            if (!isValidEmail(email)) { showAlert('Enter your student email to reset password', 'warning'); return; }
            try { await window.FirebaseAPI?.sendPasswordReset?.(email); showAlert('Password reset email sent. Please check your inbox.', 'success'); }
            catch (err) { showAlert(mapAuthError(err), 'danger'); }
        });
        // Forgot password (admin)
        document.getElementById('forgotAdminPwd')?.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = (document.getElementById('adminEmail')?.value || '').trim();
            if (!isValidEmail(email)) { showAlert('Enter your admin email to reset password', 'warning'); return; }
            try { await window.FirebaseAPI?.sendPasswordReset?.(email); showAlert('Password reset email sent. Please check your inbox.', 'success'); }
            catch (err) { showAlert(mapAuthError(err), 'danger'); }
        });
        
        // Event listeners for registration forms
        const studentRegisterForm = document.getElementById('studentRegisterForm');
        if (studentRegisterForm) {
            studentRegisterForm.addEventListener('submit', handleStudentRegister);
        }
        
        const adminRegisterForm = document.getElementById('adminRegisterForm');
        if (adminRegisterForm) {
            adminRegisterForm.addEventListener('submit', handleAdminRegister);
        }
        
        // Check for remembered email
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            const studentEmailInput = document.getElementById('studentEmail');
            const adminEmailInput = document.getElementById('adminEmail');
            
            if (studentEmailInput) {
                studentEmailInput.value = rememberedEmail;
                document.getElementById('rememberMe').checked = true;
                document.getElementById('studentPassword').focus();
            } else if (adminEmailInput) {
                adminEmailInput.value = rememberedEmail;
                document.getElementById('rememberMe').checked = true;
                document.getElementById('adminPassword').focus();
            }
        }

        // Live password indicators on registration fields
        const studentPwd = document.getElementById('studentRegPassword');
        if (studentPwd){
            studentPwd.addEventListener('input', () => updatePwdHints('student', studentPwd.value));
            updatePwdHints('student', studentPwd.value);
        }
        const adminPwd = document.getElementById('adminRegPassword');
        if (adminPwd){
            adminPwd.addEventListener('input', () => updatePwdHints('admin', adminPwd.value));
            updatePwdHints('admin', adminPwd.value);
        }
    }
    
    // Public API
    return {
        init: init,
        checkAuth: checkAuth,
        handleLogout: handleLogout,
        showAlert: showAlert
    };
})();

// Initialize auth module when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    Auth.init();
});
