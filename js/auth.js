// Authentication Module
const Auth = (function() {
    // Check if user is logged in
    function checkAuth() {
        return localStorage.getItem('currentUser') !== null;
    }

    // Toggle password visibility
    function togglePasswordVisibility() {
        document.addEventListener('click', function(e) {
            if (e.target.closest('.toggle-password')) {
                const button = e.target.closest('.toggle-password');
                const input = button.previousElementSibling;
                const icon = button.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });
    }

    function isValidEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v||'');}
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
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!email){ showAlert('Email is required', 'danger'); document.getElementById('adminEmail').focus(); return; }
        if (!isValidEmail(email)){ showAlert('Please enter a valid email', 'danger'); document.getElementById('adminEmail').focus(); return; }
        if (!password){ showAlert('Password is required', 'danger'); document.getElementById('adminPassword').focus(); return; }
        
        try {
            if (window.FirebaseAPI?.signIn) {
                const user = await window.FirebaseAPI.signIn(email, password);
                if (!user || (user.role && user.role !== 'admin')) {
                    return showAlert('This account is not an Admin', 'danger');
                }
                const userData = { ...user, role: 'admin', lastLogin: new Date().toISOString() };
                localStorage.setItem('currentUser', JSON.stringify(userData));
            } else {
                const admins = JSON.parse(localStorage.getItem('admins') || '[]');
                const admin = admins.find(a => a.email === email && a.password === password);
                if (!admin) return showAlert('Invalid admin email or password', 'danger');
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
        
        const formData = {
            id: document.getElementById('studentId').value.trim(),
            fullName: document.getElementById('studentFullName').value.trim(),
            academicLevel: document.getElementById('academicLevel').value,
            email: document.getElementById('studentRegEmail').value.trim().toLowerCase(),
            phone: document.getElementById('studentPhone').value.trim(),
            course: document.getElementById('courseName').value.trim(),
            icNumber: document.getElementById('studentIC').value.trim(),
            password: document.getElementById('studentRegPassword').value,
            confirmPassword: document.getElementById('confirmStudentPassword').value,
            role: 'student',
            registeredAt: new Date().toISOString()
        };
        if (!formData.id){ showAlert('Student ID is required', 'danger'); document.getElementById('studentId').focus(); return; }
        if (!formData.fullName){ showAlert('Full name is required', 'danger'); document.getElementById('studentFullName').focus(); return; }
        if (!isValidEmail(formData.email)){ showAlert('Please enter a valid email', 'danger'); document.getElementById('studentRegEmail').focus(); return; }
        if (!formData.password){ showAlert('Password is required', 'danger'); document.getElementById('studentRegPassword').focus(); return; }
        if (formData.password.length < 6){ showAlert('Password must be at least 6 characters long', 'danger'); document.getElementById('studentRegPassword').focus(); return; }
        if (formData.password !== formData.confirmPassword){ showAlert('Passwords do not match', 'danger'); document.getElementById('confirmStudentPassword').focus(); return; }
        try {
            if (window.FirebaseAPI?.registerUser) {
                await window.FirebaseAPI.registerUser(formData.email, formData.password, 'student', {
                    id: formData.id,
                    fullName: formData.fullName,
                    academicLevel: formData.academicLevel,
                    phone: formData.phone,
                    course: formData.course,
                    icNumber: formData.icNumber
                });
            } else {
                const students = JSON.parse(localStorage.getItem('students') || '[]');
                if (students.some(s => s.email === formData.email)) return showAlert('Email already registered', 'danger');
                if (students.some(s => s.id === formData.id)) return showAlert('Student ID already exists', 'danger');
                const { confirmPassword, ...studentData } = formData;
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
        
        const formData = {
            id: document.getElementById('adminId').value.trim(),
            fullName: document.getElementById('adminFullName').value.trim(),
            email: document.getElementById('adminRegEmail').value.trim().toLowerCase(),
            phone: document.getElementById('adminPhone').value.trim(),
            icNumber: document.getElementById('adminIC').value.trim(),
            password: document.getElementById('adminRegPassword').value,
            confirmPassword: document.getElementById('confirmAdminPassword').value,
            role: 'admin',
            registeredAt: new Date().toISOString()
        };
        if (!formData.id){ showAlert('Admin ID is required', 'danger'); document.getElementById('adminId').focus(); return; }
        if (!formData.fullName){ showAlert('Full name is required', 'danger'); document.getElementById('adminFullName').focus(); return; }
        if (!isValidEmail(formData.email)){ showAlert('Please enter a valid email', 'danger'); document.getElementById('adminRegEmail').focus(); return; }
        if (!formData.password){ showAlert('Password is required', 'danger'); document.getElementById('adminRegPassword').focus(); return; }
        if (formData.password.length < 8){ showAlert('Admin password must be at least 8 characters long', 'danger'); document.getElementById('adminRegPassword').focus(); return; }
        if (formData.password !== formData.confirmPassword){ showAlert('Passwords do not match', 'danger'); document.getElementById('confirmAdminPassword').focus(); return; }
        try {
            if (window.FirebaseAPI?.registerUser) {
                await window.FirebaseAPI.registerUser(formData.email, formData.password, 'admin', {
                    id: formData.id,
                    fullName: formData.fullName,
                    phone: formData.phone,
                    icNumber: formData.icNumber
                });
            } else {
                const admins = JSON.parse(localStorage.getItem('admins') || '[]');
                if (admins.some(a => a.email === formData.email)) return showAlert('Admin email already registered', 'danger');
                if (admins.some(a => a.id === formData.id)) return showAlert('Admin ID already exists', 'danger');
                const { confirmPassword, ...adminData } = formData;
                admins.push(adminData);
                localStorage.setItem('admins', JSON.stringify(admins));
            }
            App.logActivity('New admin registered', formData.email);
            showAlert('Admin registration successful! Please log in.', 'success');
        } catch (err) {
            return showAlert(mapAuthError(err), 'danger');
        }
        
        // Switch to login
        const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        registerModal.hide();
        loginModal.show();
        
        // Pre-fill email in login form
        document.getElementById('adminLogin').click();
        document.getElementById('adminEmail').value = formData.email;
        document.getElementById('adminPassword').focus();
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
        // Remove any existing alerts
        const existingAlert = document.querySelector('.alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        // Add alert to the page
        const container = document.querySelector('.container') || document.body;
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = bootstrap.Alert.getOrCreateInstance(alertDiv);
            if (alert) alert.close();
        }, 5000);
    }
    
    // Toggle between login types
    function setupLoginTypeToggle() {
        // Toggle between student and admin login
        document.querySelectorAll('input[name="loginType"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const isStudentLogin = this.id === 'studentLogin';
                document.getElementById('studentLoginFields').style.display = isStudentLogin ? 'block' : 'none';
                document.getElementById('adminLoginFields').style.display = isStudentLogin ? 'none' : 'block';
                
                // Update register prompt
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
