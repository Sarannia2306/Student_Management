// Navigation Component
const Navigation = (function() {
    // Initialize navigation
    function init() {
        renderNavigation();
    }

    // Render navigation based on user role
    function renderNavigation() {
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const isAdmin = user && user.role === 'admin';
        
        const navHTML = `
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#" data-page="dashboard">
                        <i class="fas fa-graduation-cap me-2"></i>
                        Student Management
                    </a>
                    
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    
                    <div class="collapse navbar-collapse" id="mainNavbar">
                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                            <!-- Dashboard Link (Visible to all logged-in users) -->
                            <li class="nav-item">
                                <a class="nav-link" href="#" data-page="dashboard">
                                    <i class="fas fa-tachometer-alt me-1"></i> Dashboard
                                </a>
                            </li>
                            
                            ${isAdmin ? `
                                <!-- Admin Navigation -->
                                <li class="nav-item admin-only">
                                    <a class="nav-link" href="#" data-page="students">
                                        <i class="fas fa-users me-1"></i> Students
                                    </a>
                                </li>
                                <li class="nav-item admin-only">
                                    <a class="nav-link" href="#" data-page="programs">
                                        <i class="fas fa-book me-1"></i> Programs
                                    </a>
                                </li>
                                <li class="nav-item admin-only">
                                    <a class="nav-link" href="#" data-page="attendance">
                                        <i class="fas fa-calendar-check me-1"></i> Attendance
                                    </a>
                                </li>
                                <li class="nav-item admin-only">
                                    <a class="nav-link" href="#" data-page="logs">
                                        <i class="fas fa-history me-1"></i> Activity Logs
                                    </a>
                                </li>
                            ` : `
                                <!-- Student Navigation -->
                                <li class="nav-item student-only">
                                    <a class="nav-link" href="#" data-page="profile">
                                        <i class="fas fa-user me-1"></i> My Profile
                                    </a>
                                </li>
                                <li class="nav-item student-only">
                                    <a class="nav-link" href="#" data-page="attendance">
                                        <i class="fas fa-calendar-check me-1"></i> My Attendance
                                    </a>
                                </li>
                            `}
                        </ul>
                        
                        <!-- User Dropdown -->
                        ${user ? `
                            <div class="d-flex align-items-center">
                                <div class="dropdown">
                                    <button class="btn btn-outline-light dropdown-toggle" type="button" id="userDropdown" 
                                            data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="fas fa-user-circle me-1"></i>
                                        <span id="userInfo">${user.name || user.email}</span>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                        <li>
                                            <a class="dropdown-item" href="#" data-page="profile">
                                                <i class="fas fa-user-edit me-2"></i>My Profile
                                            </a>
                                        </li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li>
                                            <a class="dropdown-item text-danger" href="#" id="logoutBtn">
                                                <i class="fas fa-sign-out-alt me-2"></i>Logout
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        ` : `
                            <div class="d-flex">
                                <button class="btn btn-outline-light me-2" data-bs-toggle="modal" data-bs-target="#loginModal">
                                    Login
                                </button>
                                <button class="btn btn-light" data-bs-toggle="modal" data-bs-target="#registerModal">
                                    Register
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            </nav>
            
            <!-- Main Content Area -->
            <main id="mainContent" class="flex-grow-1">
                <!-- Content will be loaded here dynamically -->
                <div class="d-flex justify-content-center align-items-center h-100">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </main>
            
            <!-- Footer -->
            <footer class="bg-light py-3 mt-auto">
                <div class="container text-center">
                    <p class="text-muted mb-0">
                        &copy; ${new Date().getFullYear()} Student Management System. All rights reserved.
                    </p>
                </div>
            </footer>
        `;
        
        // Insert the navigation into the app container
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.innerHTML = navHTML;
            
            // Initialize tooltips
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
            
            // Add event listener for logout button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    App.handleLogout();
                });
            }
        }
    }
    
    // Public API
    return {
        init
    };
})();
