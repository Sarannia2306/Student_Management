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

    // Handle student login
    async function handleStudentLogin(e) {
        e.preventDefault();
        const email = document.getElementById('studentEmail').value.trim();
        const password = document.getElementById('studentPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!email || !password) return showAlert('Please enter email and password', 'danger');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return showAlert('Please enter a valid email', 'danger');
        
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
            showAlert(err?.message || 'Login failed', 'danger');
        }
    }
    
    // Handle admin login
    async function handleAdminLogin(e) {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (!email || !password) return showAlert('Please enter email and password', 'danger');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return showAlert('Please enter a valid email', 'danger');
        
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
            showAlert(err?.message || 'Login failed', 'danger');
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
        
        // Validation
        if (formData.password !== formData.confirmPassword) {
            return showAlert('Passwords do not match', 'danger');
        }
        
        if (formData.password.length < 6) {
            return showAlert('Password must be at least 6 characters long', 'danger');
        }
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
            return showAlert(err?.message || 'Registration failed', 'danger');
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
        
        // Validation
        if (formData.password !== formData.confirmPassword) {
            return showAlert('Passwords do not match', 'danger');
        }
        
        if (formData.password.length < 8) {
            return showAlert('Admin password must be at least 8 characters long', 'danger');
        }
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
            return showAlert(err?.message || 'Registration failed', 'danger');
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
