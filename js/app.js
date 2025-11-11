// Main Application Module
const App = (function() {
    // Current user data
    let currentUser = null;

    // Initialize the application
    function init() {
        // Check if user is logged in
        const userData = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (userData) {
            setCurrentUser(userData);
            loadDashboard();
        } else {
            // Show login modal if not logged in
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            updateUIForUser();
        }

        // Add event listeners
        document.addEventListener('click', handleNavigation);
        
        // Initialize auth buttons if they exist
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                const modal = new bootstrap.Modal(document.getElementById('loginModal'));
                modal.show();
            });
        }
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }

    // Set current user
    function setCurrentUser(userData) {
        currentUser = userData;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        updateUIForUser();
    }

    // Update UI based on user role
    function updateUIForUser() {
        const navItems = document.querySelectorAll('.nav-item');
        const isAdmin = currentUser && currentUser.role === 'admin';
        const isLoggedIn = !!currentUser;
        
        // Show/hide nav items based on auth + role
        navItems.forEach(item => {
            const isAdminItem = item.classList.contains('admin-only');
            const isStudentItem = item.classList.contains('student-only');
            if (!isLoggedIn) {
                item.style.display = 'none';
                return;
            }
            if (isAdminItem) {
                item.style.display = isAdmin ? 'block' : 'none';
            } else if (isStudentItem) {
                item.style.display = isAdmin ? 'none' : 'block';
            } else {
                item.style.display = 'block';
            }
        });

        // Update user info in navbar
        const userGreeting = document.getElementById('userGreeting');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        if (userGreeting) {
            userGreeting.textContent = isLoggedIn ? (currentUser.fullName || currentUser.name || currentUser.email) : '';
        }
        if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : 'inline-block';
        if (logoutBtn) logoutBtn.style.display = isLoggedIn ? 'inline-block' : 'none';
    }

    // Log activity entries to localStorage
    function logActivity(action, userEmail) {
        const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]');
        logs.unshift({ action, user: userEmail || 'System', timestamp: new Date().toISOString() });
        localStorage.setItem('activityLogs', JSON.stringify(logs));
    }

    // Handle navigation
    function handleNavigation(e) {
        const navLink = e.target.closest('[data-page]');
        if (!navLink) return;
        
        e.preventDefault();
        const page = navLink.getAttribute('data-page');
        loadPage(page);
    }

    // Highlight active navigation link
    function updateActiveNav(page) {
        try {
            document.querySelectorAll('[data-page]').forEach(el => el.classList.remove('active'));
            const active = document.querySelector(`[data-page="${page}"]`);
            if (active) active.classList.add('active');
        } catch (_) {}
    }

    // Load dashboard based on user role
    function loadDashboard() {
        if (currentUser.role === 'admin') {
            loadAdminDashboard();
        } else {
            loadStudentDashboard();
        }
    }

    // Attendance helpers
    function getStudentAttendance(studentId) {
        const all = JSON.parse(localStorage.getItem('attendance') || '[]');
        const list = Array.isArray(all) ? all.filter(r => String(r.studentId) === String(studentId)) : [];
        // Sort by date desc
        return list.sort((a,b) => new Date(b.date) - new Date(a.date));
    }

    function calculateAttendancePercentage(records) {
        if (!Array.isArray(records) || records.length === 0) return 0;
        const present = records.filter(r => String(r.status || '').toLowerCase() === 'present').length;
        return Math.round((present / records.length) * 100);
    }

    function getTodaysAttendanceCount() {
        const all = JSON.parse(localStorage.getItem('attendance') || '[]');
        const today = new Date().toISOString().slice(0,10);
        return (Array.isArray(all) ? all : []).filter(r => (r.date || '').slice(0,10) === today && String(r.status||'').toLowerCase() === 'present').length;
    }

    function formatDateTime(value) {
        try { return new Date(value).toLocaleString(); } catch (_) { return value || ''; }
    }

    function formatDate(value) {
        try { return new Date(value).toLocaleDateString(); } catch (_) { return value || ''; }
    }

    // Load admin dashboard
    async function loadAdminDashboard() {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        const logs = JSON.parse(localStorage.getItem('activityLogs') || '[]').slice(0, 5);
        
        // Render dashboard
        const dashboardHTML = `
            <div class="row g-4">
                <!-- Students Card -->
                <div class="col-md-6 col-lg-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <div class="card-icon text-primary mb-3">
                                <i class="fas fa-users fa-3x"></i>
                            </div>
                            <h3 class="card-title">${students.length}</h3>
                            <p class="card-text">Total Students</p>
                            <a href="#" class="btn btn-outline-primary btn-sm" data-page="students">View All</a>
                        </div>
                    </div>
                </div>
                
                <!-- Programs Card -->
                <div class="col-md-6 col-lg-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <div class="card-icon text-success mb-3">
                                <i class="fas fa-graduation-cap fa-3x"></i>
                            </div>
                            <h3 class="card-title">${programs.length}</h3>
                            <p class="card-text">Programs</p>
                            <a href="#" class="btn btn-outline-success btn-sm" data-page="programs">Manage</a>
                        </div>
                    </div>
                </div>
                
                <!-- Attendance Card -->
                <div class="col-md-6 col-lg-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <div class="card-icon text-info mb-3">
                                <i class="fas fa-calendar-check fa-3x"></i>
                            </div>
                            <h3 class="card-title">${getTodaysAttendanceCount()}</h3>
                            <p class="card-text">Today's Attendance</p>
                            <a href="#" class="btn btn-outline-info btn-sm" data-page="attendance">Mark Attendance</a>
                        </div>
                    </div>
                </div>
                
                <!-- Activity Logs Card -->
                <div class="col-md-6 col-lg-3">
                    <div class="card h-100">
                        <div class="card-body text-center">
                            <div class="card-icon text-warning mb-3">
                                <i class="fas fa-history fa-3x"></i>
                            </div>
                            <h3 class="card-title">${logs.length}+</h3>
                            <p class="card-text">Recent Activities</p>
                            <a href="#" class="btn btn-outline-warning btn-sm" data-page="logs">View Logs</a>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Recent Activities -->
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Recent Activities</h5>
                        </div>
                        <div class="card-body">
                            ${logs.length > 0 ? 
                                `<div class="list-group list-group-flush">
                                    ${logs.map(log => `
                                        <div class="list-group-item">
                                            <div class="d-flex w-100 justify-content-between">
                                                <p class="mb-1">${log.action}</p>
                                                <small class="text-muted">${formatDateTime(log.timestamp)}</small>
                                            </div>
                                            <small class="text-muted">By: ${log.user || 'System'}</small>
                                        </div>
                                    `).join('')}
                                </div>`
                                : '<p class="text-muted">No recent activities</p>'
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = `
            <div class="container-fluid py-4">
                <h2 class="mb-4">Admin Dashboard</h2>
                ${dashboardHTML}
            </div>
        `;
        
        // Update active nav item
        updateActiveNav('dashboard');
    }

    // Load student dashboard
    async function loadStudentDashboard() {
        const studentData = currentUser;
        const attendance = getStudentAttendance(studentData.id);
        const attendancePercentage = calculateAttendancePercentage(attendance);
        const lastLogin = studentData.lastLogin ? new Date(studentData.lastLogin).toLocaleString() : 'First login';
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]').slice(0, 5);
        
        // Render dashboard
        const dashboardHTML = `
            <div class="row">
                <div class="col-12 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="mb-1">Welcome back, ${studentData.fullName || 'Student'}!</h3>
                            <p class="text-muted mb-4">Last login: ${lastLogin}</p>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="d-flex align-items-center">
                                        <div class="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                            <i class="fas fa-user-graduate text-primary fa-2x"></i>
                                        </div>
                                        <div>
                                            <p class="mb-0 text-muted">Student ID</p>
                                            <h5 class="mb-0">${studentData.id || 'N/A'}</h5>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="d-flex align-items-center">
                                        <div class="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                                            <i class="fas fa-book text-success fa-2x"></i>
                                        </div>
                                        <div>
                                            <p class="mb-0 text-muted">Program</p>
                                            <h5 class="mb-0">${studentData.course || 'Not enrolled'}</h5>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="d-flex align-items-center">
                                        <div class="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                                            <i class="fas fa-calendar-check text-info fa-2x"></i>
                                        </div>
                                        <div>
                                            <p class="mb-0 text-muted">Attendance</p>
                                            <h5 class="mb-0">${attendancePercentage}%</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <!-- Recent Attendance -->
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Recent Attendance</h5>
                        </div>
                        <div class="card-body">
                            ${attendance.length > 0 ? `
                                <div class="table-responsive">
                                    <table class="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${attendance.slice(0, 5).map(record => {
                                                const status = (record.status || '').toLowerCase();
                                                const isPresent = status === 'present';
                                                return `
                                                    <tr>
                                                        <td>${formatDate(record.date)}</td>
                                                        <td>
                                                            <span class="badge bg-${isPresent ? 'success' : 'danger'}">
                                                                ${isPresent ? 'Present' : 'Absent'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                `;
                                            }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                                <a href="#" class="btn btn-outline-primary btn-sm mt-2" data-page="attendance">View All</a>
                            ` : '<p class="text-muted">No attendance records found</p>'}
                        </div>
                    </div>
                </div>
                
                <!-- Profile Summary -->
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">My Profile</h5>
                            <a href="#" class="btn btn-sm btn-outline-primary" data-page="profile">
                                <i class="fas fa-edit me-1"></i> Edit
                            </a>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <p class="mb-1 text-muted">Full Name</p>
                                <p class="mb-3">${studentData.fullName || 'N/A'}</p>
                                
                                <p class="mb-1 text-muted">Email</p>
                                <p class="mb-3">${studentData.email || 'N/A'}</p>
                                
                                <p class="mb-1 text-muted">Phone</p>
                                <p class="mb-3">${studentData.phone || 'N/A'}</p>
                                
                                <p class="mb-1 text-muted">Academic Level</p>
                                <p class="mb-0">${studentData.academicLevel || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <!-- Announcements -->
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">Announcements</h5>
                            <a href="#" class="btn btn-sm btn-outline-secondary" data-page="announcements">View All</a>
                        </div>
                        <div class="card-body">
                            ${announcements.length > 0 ? `
                                <div class="list-group list-group-flush">
                                    ${announcements.map(a => `
                                        <div class="list-group-item">
                                            <div class="d-flex w-100 justify-content-between">
                                                <p class="mb-1">${a.title}</p>
                                                <small class="text-muted">${new Date(a.createdAt).toLocaleDateString()}</small>
                                            </div>
                                            <small class="text-muted">${a.createdBy || 'Admin'}</small>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : '<p class="text-muted">No announcements</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = `
            <div class="container-fluid py-4">
                ${dashboardHTML}
            </div>
        `;
        
        // Update active nav item
        updateActiveNav('dashboard');
    }

    // Import page modules
    const pageModules = {
        profile: () => {
            // Initialize profile page
            if (typeof ProfilePage !== 'undefined') {
                ProfilePage.init();
            } else {
                console.error('ProfilePage module not loaded');
            }
        },
        verify: () => {
            if (typeof VerifyPage !== 'undefined') {
                VerifyPage.init();
            } else {
                console.error('VerifyPage module not loaded');
            }
        },
        announcements: () => {
            if (typeof AnnouncementsPage !== 'undefined') {
                AnnouncementsPage.init();
            } else {
                console.error('AnnouncementsPage module not loaded');
            }
        },
        attendance: () => {
            // Initialize attendance page
            if (typeof AttendancePage !== 'undefined') {
                AttendancePage.init();
            } else {
                console.error('AttendancePage module not loaded');
            }
        },
        students: () => {
            // Initialize students page
            if (typeof StudentsPage !== 'undefined') {
                StudentsPage.init();
            } else {
                console.error('StudentsPage module not loaded');
            }
        },
        programs: () => {
            // Initialize programs page
            if (typeof ProgramsPage !== 'undefined') {
                ProgramsPage.init();
            } else {
                console.error('ProgramsPage module not loaded');
            }
        },
        logs: () => {
            // Initialize activity logs page
            if (typeof ActivityLogsPage !== 'undefined') {
                ActivityLogsPage.init();
            } else {
                console.error('ActivityLogsPage module not loaded');
            }
        }
    };

    // Load a specific page
    async function loadPage(page) {
        // Prevent stuck overlays before navigating
        cleanupModals();
        try {
            // Update active nav first
            updateActiveNav(page);
            // Role-based access guard for admin-only pages
            const adminOnlyPages = ['students', 'programs', 'logs'];
            const notAdmin = !currentUser || String(currentUser.role) !== 'admin';
            if (adminOnlyPages.includes(page) && notAdmin) {
                try { Auth?.showAlert?.('Access denied: Admins only', 'danger'); } catch (_) {}
                // Redirect to dashboard instead
                loadDashboard();
                return;
            }
            
            // Show loading state
            document.getElementById('mainContent').innerHTML = `
                <div class="d-flex justify-content-center align-items-center" style="height: 300px;">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <span class="ms-3">Loading ${page} page...</span>
                </div>
            `;
            
            // Load the appropriate page or dashboard
            if (page === 'dashboard') {
                loadDashboard();
            } else if (pageModules[page]) {
                pageModules[page]();
            } else {
                console.warn(`Page '${page}' not found, loading dashboard`);
                loadDashboard();
            }
        } catch (error) {
            console.error(`Error loading page '${page}':`, error);
            // Show error message
            document.getElementById('mainContent').innerHTML = `
                <div class="alert alert-danger">
                    <h4>Something went wrong</h4>
                    <p>An unexpected error occurred while loading the page. Please try again.</p>
                    <p class="mb-0"><small class="text-muted">If the problem persists, contact support.</small></p>
                    <button class="btn btn-primary" onclick="App.loadPage('dashboard')">
                        Return to Dashboard
                    </button>
                </div>
            `;
        }
    }

    // ... (rest of the code remains the same)

    // Utility: ensure no stuck Bootstrap modal/backdrop blocks the UI
    function cleanupModals() {
        try {
            // Hide any visible modals
            document.querySelectorAll('.modal.show').forEach(m => {
                try {
                    const inst = bootstrap.Modal.getInstance(m) || new bootstrap.Modal(m);
                    inst.hide();
                } catch (_) {}
            });
        } catch (_) {}
        // Remove body state and leftover backdrops
        document.body.classList.remove('modal-open');
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    }

    // Global safety: whenever any modal hides, make sure backdrop/body are sane
    document.addEventListener('hidden.bs.modal', function () {
        setTimeout(() => {
            if (!document.querySelector('.modal.show')) {
                document.body.classList.remove('modal-open');
                document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            }
        }, 0);
    });

    // Handle logout
    async function handleLogout() {
        // Log the logout activity
        if (currentUser) {
            logActivity(`User logged out`, currentUser.email);
        }
        
        // Firebase sign out if available
        try { await window.FirebaseAPI?.doSignOut?.(); } catch (_) {}

        // Clear current user
        localStorage.removeItem('currentUser');
        currentUser = null;
        // Clean up any stuck overlays before showing login
        cleanupModals();

        // Redirect to login
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
        updateUIForUser();
        document.getElementById('mainContent').innerHTML = `
            <div class="text-center my-5">
                <h2>Welcome to Student Management System</h2>
                <p class="lead">Please log in to continue</p>
            </div>
        `;
    }

    return {
        init,
        setCurrentUser,
        loadDashboard,
        loadPage,
        logActivity,
        handleLogout
    };
})();
