// Main Application Module
const App = (function() {
    // Private variables
    let currentUser = null;
    
    // Mock data - In a real app, this would come from a backend API
    const mockData = {
        students: JSON.parse(localStorage.getItem('students')) || [],
        programs: JSON.parse(localStorage.getItem('programs')) || [
            { id: 1, name: 'Diploma in Information Technology', code: 'DIT', duration: '2 years' },
            { id: 2, name: 'Bachelor of Business Administration', code: 'BBA', duration: '3 years' },
            { id: 3, name: 'Bachelor of Computer Science', code: 'BCS', duration: '4 years' }
        ],
        users: JSON.parse(localStorage.getItem('users')) || [
            { id: 1, email: 'admin@example.com', password: 'admin123', firstName: 'Admin', lastName: 'User', role: 'admin' },
            { id: 2, email: 'student@example.com', password: 'student123', firstName: 'John', lastName: 'Doe', role: 'student' }
        ],
        attendance: JSON.parse(localStorage.getItem('attendance')) || [],
        logs: JSON.parse(localStorage.getItem('logs')) || []
    };

    // Initialize the application
    function init() {
        // Save initial data to localStorage if not exists
        if (!localStorage.getItem('programs')) {
            localStorage.setItem('programs', JSON.stringify(mockData.programs));
        }
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify(mockData.users));
        }
        
        // Check if user is already logged in
        const loggedInUser = localStorage.getItem('currentUser');
        if (loggedInUser) {
            currentUser = JSON.parse(loggedInUser);
            updateUIForUser();
            loadDashboard();
        } else {
            // Show login modal if not logged in
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        }

        // Event listeners for modals
        document.getElementById('showRegister')?.addEventListener('click', function(e) {
            e.preventDefault();
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
            loginModal.hide();
            registerModal.show();
        });

        document.getElementById('showLogin')?.addEventListener('click', function(e) {
            e.preventDefault();
            const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            registerModal.hide();
            loginModal.show();
        });

        // Navigation event listeners
        document.getElementById('dashboardLink')?.addEventListener('click', function(e) {
            e.preventDefault();
            loadDashboard();
        });

        document.getElementById('studentsLink')?.addEventListener('click', function(e) {
            e.preventDefault();
            loadStudents();
        });

        document.getElementById('programsLink')?.addEventListener('click', function(e) {
            e.preventDefault();
            loadPrograms();
        });

        document.getElementById('attendanceLink')?.addEventListener('click', function(e) {
            e.preventDefault();
            loadAttendance();
        });

        document.getElementById('logsLink')?.addEventListener('click', function(e) {
            e.preventDefault();
            loadLogs();
        });

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', function() {
            logActivity('Logged out', currentUser.email);
            currentUser = null;
            localStorage.removeItem('currentUser');
            window.location.reload();
        });
    }

    // Update UI based on user role
    function updateUIForUser() {
        const userGreeting = document.getElementById('userGreeting');
        if (userGreeting && currentUser) {
            userGreeting.textContent = `Welcome, ${currentUser.firstName} ${currentUser.lastName} (${currentUser.role})`;
        }

        // Show/hide admin-only elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            el.style.display = currentUser?.role === 'admin' ? 'block' : 'none';
        });
    }

    // Load dashboard content
    function loadDashboard() {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
        
        const content = `
            <div class="row">
                <div class="col-md-12">
                    <h2 class="mb-4">Dashboard</h2>
                </div>
            </div>
            <div class="row">
                <div class="col-md-3">
                    <div class="stat-card bg-primary">
                        <i class="fas fa-users"></i>
                        <span class="count">${students.length}</span>
                        <span>Total Students</span>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-success">
                        <i class="fas fa-graduation-cap"></i>
                        <span class="count">${programs.length}</span>
                        <span>Programs</span>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-info">
                        <i class="fas fa-calendar-check"></i>
                        <span class="count">${attendance.filter(a => a.status === 'Present').length}</span>
                        <span>Present Today</span>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card bg-warning">
                        <i class="fas fa-clock"></i>
                        <span class="count">${new Date().getHours()}:${String(new Date().getMinutes()).padStart(2, '0')}</span>
                        <span>Current Time</span>
                    </div>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            Recent Students
                            <a href="#" class="btn btn-sm btn-outline-primary float-end" id="viewAllStudents">View All</a>
                        </div>
                        <div class="card-body">
                            ${students.length > 0 ? 
                                `<ul class="list-group">
                                    ${students.slice(0, 5).map(student => `
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            ${student.firstName} ${student.lastName}
                                            <span class="badge bg-primary">${student.program || 'N/A'}</span>
                                        </li>
                                    `).join('')}
                                </ul>`
                                : '<p class="text-muted">No students found</p>'
                            }
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            Recent Activity
                            <a href="#" class="btn btn-sm btn-outline-primary float-end" id="viewAllLogs">View All</a>
                        </div>
                        <div class="card-body">
                            ${mockData.logs.length > 0 ? 
                                `<ul class="list-group">
                                    ${mockData.logs.slice(0, 5).map(log => `
                                        <li class="list-group-item">
                                            <small class="text-muted">${new Date(log.timestamp).toLocaleString()}</small><br>
                                            ${log.action}
                                        </li>
                                    `).join('')}
                                </ul>`
                                : '<p class="text-muted">No recent activity</p>'
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = content;
        
        // Add event listeners for dashboard buttons
        document.getElementById('viewAllStudents')?.addEventListener('click', function(e) {
            e.preventDefault();
            loadStudents();
        });
        
        document.getElementById('viewAllLogs')?.addEventListener('click', function(e) {
            e.preventDefault();
            loadLogs();
        });
    }

    // Load students management page
    function loadStudents() {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        
        let content = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Student Management</h2>
                <button class="btn btn-primary" id="addStudentBtn">
                    <i class="fas fa-plus"></i> Add Student
                </button>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Program</th>
                                    <th>GPA</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        students.forEach(student => {
            const program = programs.find(p => p.id == student.programId);
            content += `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.firstName} ${student.lastName}</td>
                    <td>${student.email}</td>
                    <td>${program ? program.name : 'N/A'}</td>
                    <td>${student.gpa || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-student" data-id="${student.id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning edit-student" data-id="${student.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-student" data-id="${student.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary id-card-student" data-id="${student.id}">
                            <i class="fas fa-id-card"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        content += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = content;
        
        // Add event listeners for student actions
        document.getElementById('addStudentBtn')?.addEventListener('click', showAddStudentForm);
        document.querySelectorAll('.view-student').forEach(btn => {
            btn.addEventListener('click', function() {
                const studentId = this.getAttribute('data-id');
                viewStudent(studentId);
            });
        });
        document.querySelectorAll('.edit-student').forEach(btn => {
            btn.addEventListener('click', function() {
                const studentId = this.getAttribute('data-id');
                editStudent(studentId);
            });
        });
        document.querySelectorAll('.delete-student').forEach(btn => {
            btn.addEventListener('click', function() {
                const studentId = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this student?')) {
                    deleteStudent(studentId);
                }
            });
        });
        document.querySelectorAll('.id-card-student').forEach(btn => {
            btn.addEventListener('click', function() {
                const studentId = this.getAttribute('data-id');
                showIdCard(studentId);
            });
        });
    }

    // Show add student form
    function showAddStudentForm() {
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        
        let programOptions = programs.map(program => 
            `<option value="${program.id}">${program.name}</option>`
        ).join('');
        
        const content = `
            <div class="row">
                <div class="col-md-8 offset-md-2">
                    <div class="card">
                        <div class="card-header">
                            <h4>Add New Student</h4>
                        </div>
                        <div class="card-body">
                            <form id="studentForm">
                                <input type="hidden" id="studentId">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="firstName" class="form-label">First Name</label>
                                        <input type="text" class="form-control" id="firstName" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="lastName" class="form-label">Last Name</label>
                                        <input type="text" class="form-control" id="lastName" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="email" required>
                                </div>
                                <div class="mb-3">
                                    <label for="phone" class="form-label">Phone</label>
                                    <input type="tel" class="form-control" id="phone">
                                </div>
                                <div class="mb-3">
                                    <label for="programId" class="form-label">Program</label>
                                    <select class="form-select" id="programId" required>
                                        <option value="">Select Program</option>
                                        ${programOptions}
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="gpa" class="form-label">GPA</label>
                                    <input type="number" step="0.01" min="0" max="4.0" class="form-control" id="gpa">
                                </div>
                                <div class="mb-3">
                                    <label for="address" class="form-label">Address</label>
                                    <textarea class="form-control" id="address" rows="3"></textarea>
                                </div>
                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button type="button" class="btn btn-secondary me-md-2" id="cancelStudentForm">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save Student</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = content;
        
        // Add form submission handler
        document.getElementById('studentForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveStudent();
        });
        
        // Add cancel button handler
        document.getElementById('cancelStudentForm').addEventListener('click', function() {
            loadStudents();
        });
    }

    // Save student (add or update)
    function saveStudent() {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const studentId = document.getElementById('studentId').value;
        const studentData = {
            id: studentId || Date.now().toString(),
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            programId: document.getElementById('programId').value,
            gpa: document.getElementById('gpa').value,
            address: document.getElementById('address').value,
            createdAt: studentId ? students.find(s => s.id === studentId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        let updatedStudents;
        if (studentId) {
            // Update existing student
            updatedStudents = students.map(student => 
                student.id === studentId ? studentData : student
            );
            logActivity(`Updated student: ${studentData.firstName} ${studentData.lastName}`, currentUser.email);
        } else {
            // Add new student
            updatedStudents = [...students, studentData];
            logActivity(`Added new student: ${studentData.firstName} ${studentData.lastName}`, currentUser.email);
        }

        localStorage.setItem('students', JSON.stringify(updatedStudents));
        loadStudents();
    }

    // View student details
    function viewStudent(studentId) {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        
        const student = students.find(s => s.id === studentId);
        if (!student) {
            alert('Student not found');
            return;
        }
        
        const program = programs.find(p => p.id == student.programId);
        
        const content = `
            <div class="row">
                <div class="col-md-8 offset-md-2">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h4>Student Details</h4>
                            <div>
                                <button class="btn btn-sm btn-warning me-2" id="editStudentBtn">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-secondary" id="printIdCardBtn">
                                    <i class="fas fa-print"></i> Print ID Card
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="row mb-4">
                                <div class="col-md-3 text-center">
                                    <div class="student-photo mb-3">
                                        <i class="fas fa-user-graduate fa-3x text-muted"></i>
                                    </div>
                                    <button class="btn btn-sm btn-outline-primary">Upload Photo</button>
                                </div>
                                <div class="col-md-9">
                                    <h3>${student.firstName} ${student.lastName}</h3>
                                    <p class="text-muted">${student.email}</p>
                                    <hr>
                                    <div class="row">
                                        <div class="col-md-6">
                                            <p><strong>Student ID:</strong> ${student.id}</p>
                                            <p><strong>Program:</strong> ${program ? program.name : 'N/A'}</p>
                                            <p><strong>GPA:</strong> ${student.gpa || 'N/A'}</p>
                                        </div>
                                        <div class="col-md-6">
                                            <p><strong>Phone:</strong> ${student.phone || 'N/A'}</p>
                                            <p><strong>Enrollment Date:</strong> ${new Date(student.createdAt).toLocaleDateString()}</p>
                                            <p><strong>Last Updated:</strong> ${new Date(student.updatedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12">
                                    <h5>Contact Information</h5>
                                    <p><strong>Address:</strong> ${student.address || 'N/A'}</p>
                                    <p><strong>Email:</strong> ${student.email}</p>
                                    <p><strong>Phone:</strong> ${student.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div class="mt-4">
                                <button class="btn btn-secondary" id="backToStudents">
                                    <i class="fas fa-arrow-left"></i> Back to Students
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = content;
        
        // Add event listeners
        document.getElementById('backToStudents').addEventListener('click', loadStudents);
        document.getElementById('editStudentBtn').addEventListener('click', () => editStudent(studentId));
        document.getElementById('printIdCardBtn').addEventListener('click', () => showIdCard(studentId, true));
    }

    // Edit student
    function editStudent(studentId) {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        
        const student = students.find(s => s.id === studentId);
        if (!student) {
            alert('Student not found');
            return;
        }
        
        let programOptions = programs.map(program => 
            `<option value="${program.id}" ${program.id == student.programId ? 'selected' : ''}>${program.name}</option>`
        ).join('');
        
        const content = `
            <div class="row">
                <div class="col-md-8 offset-md-2">
                    <div class="card">
                        <div class="card-header">
                            <h4>Edit Student</h4>
                        </div>
                        <div class="card-body">
                            <form id="studentForm">
                                <input type="hidden" id="studentId" value="${student.id}">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="firstName" class="form-label">First Name</label>
                                        <input type="text" class="form-control" id="firstName" value="${student.firstName || ''}" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="lastName" class="form-label">Last Name</label>
                                        <input type="text" class="form-control" id="lastName" value="${student.lastName || ''}" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="email" class="form-label">Email</label>
                                    <input type="email" class="form-control" id="email" value="${student.email || ''}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="phone" class="form-label">Phone</label>
                                    <input type="tel" class="form-control" id="phone" value="${student.phone || ''}">
                                </div>
                                <div class="mb-3">
                                    <label for="programId" class="form-label">Program</label>
                                    <select class="form-select" id="programId" required>
                                        <option value="">Select Program</option>
                                        ${programOptions}
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="gpa" class="form-label">GPA</label>
                                    <input type="number" step="0.01" min="0" max="4.0" class="form-control" id="gpa" value="${student.gpa || ''}">
                                </div>
                                <div class="mb-3">
                                    <label for="address" class="form-label">Address</label>
                                    <textarea class="form-control" id="address" rows="3">${student.address || ''}</textarea>
                                </div>
                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button type="button" class="btn btn-secondary me-md-2" id="cancelEditStudent">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Update Student</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = content;
        
        // Add form submission handler
        document.getElementById('studentForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveStudent();
        });
        
        // Add cancel button handler
        document.getElementById('cancelEditStudent').addEventListener('click', function() {
            viewStudent(studentId);
        });
    }

    // Delete student
    function deleteStudent(studentId) {
        let students = JSON.parse(localStorage.getItem('students') || '[]');
        const student = students.find(s => s.id === studentId);
        
        if (!student) {
            alert('Student not found');
            return;
        }
        
        students = students.filter(s => s.id !== studentId);
        localStorage.setItem('students', JSON.stringify(students));
        
        // Also remove attendance records for this student
        let attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
        attendance = attendance.filter(a => a.studentId !== studentId);
        localStorage.setItem('attendance', JSON.stringify(attendance));
        
        logActivity(`Deleted student: ${student.firstName} ${student.lastName}`, currentUser.email);
        loadStudents();
    }

    // Show student ID card
    function showIdCard(studentId, isPrintView = false) {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        
        const student = students.find(s => s.id === studentId);
        if (!student) {
            alert('Student not found');
            return;
        }
        
        const program = programs.find(p => p.id == student.programId);
        
        const content = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Student ID Card</h2>
                <div>
                    <button class="btn btn-secondary me-2" id="backToStudent">
                        <i class="fas fa-arrow-left"></i> Back to Student
                    </button>
                    <button class="btn btn-primary" onclick="window.print()">
                        <i class="fas fa-print"></i> Print ID Card
                    </button>
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="id-card">
                        <div class="id-card-header text-center">
                            <h4 class="mb-0">STUDENT ID CARD</h4>
                            <p class="mb-0">${program ? program.name : 'Student Management System'}</p>
                        </div>
                        <div class="id-card-body">
                            <div class="row">
                                <div class="col-md-4 text-center">
                                    <div class="student-photo mb-2">
                                        <i class="fas fa-user-graduate fa-3x text-muted"></i>
                                    </div>
                                    <div class="barcode">
                                        <small>ID: ${student.id}</small>
                                    </div>
                                </div>
                                <div class="col-md-8">
                                    <p class="mb-1"><strong>Name:</strong> ${student.firstName} ${student.lastName}</p>
                                    <p class="mb-1"><strong>Program:</strong> ${program ? program.code : 'N/A'}</p>
                                    <p class="mb-1"><strong>Email:</strong> ${student.email}</p>
                                    <p class="mb-1"><strong>Valid Until:</strong> ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}</p>
                                    <div class="mt-3 text-center">
                                        <div class="signature">
                                            <div class="signature-line"></div>
                                            <small>Authorized Signature</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ${!isPrintView ? `
                <div class="row mt-4">
                    <div class="col-12 text-center">
                        <p class="text-muted">This is a preview of the student ID card. Click the print button to print or save as PDF.</p>
                    </div>
                </div>
            ` : ''}
            <style>
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #mainContent, #mainContent * {
                        visibility: visible;
                    }
                    #mainContent {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .id-card {
                        box-shadow: none;
                        border: 1px solid #000;
                    }
                    .btn, #backToStudent {
                        display: none !important;
                    }
                }
                .id-card {
                    max-width: 100%;
                }
                .signature-line {
                    border-top: 1px solid #000;
                    width: 150px;
                    margin: 0 auto 5px;
                }
                .barcode {
                    font-family: 'Libre Barcode 39', cursive;
                    font-size: 24px;
                    letter-spacing: 2px;
                }
            </style>
        `;

        if (isPrintView) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Student ID Card - ${student.firstName} ${student.lastName}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .id-card { max-width: 400px; margin: 0 auto; border: 1px solid #000; border-radius: 10px; overflow: hidden; }
                        .id-card-header { background: #0d6efd; color: white; padding: 15px; text-align: center; }
                        .id-card-body { padding: 20px; }
                        .student-photo { width: 100px; height: 120px; margin: 0 auto 15px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border: 1px solid #ddd; }
                        .barcode { font-family: 'Libre Barcode 39', cursive; font-size: 24px; letter-spacing: 2px; text-align: center; }
                        .signature-line { border-top: 1px solid #000; width: 150px; margin: 0 auto 5px; }
                        .signature { text-align: center; margin-top: 20px; }
                        @page { size: auto; margin: 5mm; }
                    </style>
                </head>
                <body onload="window.print();window.close()">
                    ${document.getElementById('mainContent').innerHTML}
                </body>
                </html>
            `);
            printWindow.document.close();
        } else {
            document.getElementById('mainContent').innerHTML = content;
            document.getElementById('backToStudent').addEventListener('click', () => viewStudent(studentId));
        }
    }

    // Load programs management page
    function loadPrograms() {
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        
        let content = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Program Management</h2>
                <button class="btn btn-primary" id="addProgramBtn">
                    <i class="fas fa-plus"></i> Add Program
                </button>
            </div>
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Program Name</th>
                                    <th>Duration</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        programs.forEach(program => {
            content += `
                <tr>
                    <td>${program.code}</td>
                    <td>${program.name}</td>
                    <td>${program.duration}</td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-program" data-id="${program.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-program" data-id="${program.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        content += `
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = content;
        
        // Add event listeners for program actions
        document.getElementById('addProgramBtn')?.addEventListener('click', showAddProgramForm);
        document.querySelectorAll('.edit-program').forEach(btn => {
            btn.addEventListener('click', function() {
                const programId = this.getAttribute('data-id');
                editProgram(programId);
            });
        });
        document.querySelectorAll('.delete-program').forEach(btn => {
            btn.addEventListener('click', function() {
                const programId = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
                    deleteProgram(programId);
                }
            });
        });
    }

    // Show add program form
    function showAddProgramForm() {
        const content = `
            <div class="row">
                <div class="col-md-8 offset-md-2">
                    <div class="card">
                        <div class="card-header">
                            <h4>Add New Program</h4>
                        </div>
                        <div class="card-body">
                            <form id="programForm">
                                <input type="hidden" id="programId">
                                <div class="mb-3">
                                    <label for="programName" class="form-label">Program Name</label>
                                    <input type="text" class="form-control" id="programName" required>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="programCode" class="form-label">Program Code</label>
                                        <input type="text" class="form-control" id="programCode" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="programDuration" class="form-label">Duration</label>
                                        <input type="text" class="form-control" id="programDuration" placeholder="e.g., 4 years" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="programDescription" class="form-label">Description</label>
                                    <textarea class="form-control" id="programDescription" rows="3"></textarea>
                                </div>
                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button type="button" class="btn btn-secondary me-md-2" id="cancelProgramForm">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Save Program</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = content;
        
        // Add form submission handler
        document.getElementById('programForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveProgram();
        });
        
        // Add cancel button handler
        document.getElementById('cancelProgramForm').addEventListener('click', function() {
            loadPrograms();
        });
    }

    // Save program (add or update)
    function saveProgram() {
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        const programId = document.getElementById('programId').value;
        const programData = {
            id: programId || Date.now().toString(),
            name: document.getElementById('programName').value,
            code: document.getElementById('programCode').value,
            duration: document.getElementById('programDuration').value,
            description: document.getElementById('programDescription').value,
            createdAt: programId ? programs.find(p => p.id === programId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        let updatedPrograms;
        if (programId) {
            // Update existing program
            updatedPrograms = programs.map(program => 
                program.id === programId ? programData : program
            );
            logActivity(`Updated program: ${programData.name}`, currentUser.email);
        } else {
            // Add new program
            updatedPrograms = [...programs, programData];
            logActivity(`Added new program: ${programData.name}`, currentUser.email);
        }

        localStorage.setItem('programs', JSON.stringify(updatedPrograms));
        loadPrograms();
    }

    // Edit program
    function editProgram(programId) {
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        const program = programs.find(p => p.id === programId);
        
        if (!program) {
            alert('Program not found');
            return;
        }
        
        const content = `
            <div class="row">
                <div class="col-md-8 offset-md-2">
                    <div class="card">
                        <div class="card-header">
                            <h4>Edit Program</h4>
                        </div>
                        <div class="card-body">
                            <form id="programForm">
                                <input type="hidden" id="programId" value="${program.id}">
                                <div class="mb-3">
                                    <label for="programName" class="form-label">Program Name</label>
                                    <input type="text" class="form-control" id="programName" value="${program.name || ''}" required>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <label for="programCode" class="form-label">Program Code</label>
                                        <input type="text" class="form-control" id="programCode" value="${program.code || ''}" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="programDuration" class="form-label">Duration</label>
                                        <input type="text" class="form-control" id="programDuration" value="${program.duration || ''}" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="programDescription" class="form-label">Description</label>
                                    <textarea class="form-control" id="programDescription" rows="3">${program.description || ''}</textarea>
                                </div>
                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button type="button" class="btn btn-secondary me-md-2" id="cancelEditProgram">Cancel</button>
                                    <button type="submit" class="btn btn-primary">Update Program</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = content;
        
        // Add form submission handler
        document.getElementById('programForm').addEventListener('submit', function(e) {
            e.preventDefault();
            saveProgram();
        });
        
        // Add cancel button handler
        document.getElementById('cancelEditProgram')?.addEventListener('click', function() {
            loadPrograms();
        });
    }

    // Delete program
    function deleteProgram(programId) {
        let programs = JSON.parse(localStorage.getItem('programs') || '[]');
        const program = programs.find(p => p.id === programId);
        
        if (!program) {
            alert('Program not found');
            return;
        }
        
        // Check if any students are enrolled in this program
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const studentsInProgram = students.filter(s => s.programId === programId);
        
        if (studentsInProgram.length > 0) {
            alert(`Cannot delete program. There are ${studentsInProgram.length} students enrolled in this program.`);
            return;
        }
        
        programs = programs.filter(p => p.id !== programId);
        localStorage.setItem('programs', JSON.stringify(programs));
        
        logActivity(`Deleted program: ${program.name}`, currentUser.email);
        loadPrograms();
    }

    // Load attendance management page
    function loadAttendance() {
        const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        
        // Group attendance by date
        const attendanceByDate = {};
        attendance.forEach(record => {
            const date = new Date(record.date).toDateString();
            if (!attendanceByDate[date]) {
                attendanceByDate[date] = [];
            }
            attendanceByDate[date].push(record);
        });
        
        let content = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Attendance Management</h2>
                <div>
                    <button class="btn btn-primary" id="markAttendanceBtn">
                        <i class="fas fa-calendar-plus"></i> Mark Attendance
                    </button>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">Attendance Records</h5>
                </div>
                <div class="card-body">
        `;
        
        if (Object.keys(attendanceByDate).length === 0) {
            content += `
                <div class="alert alert-info">
                    No attendance records found. Click "Mark Attendance" to add new records.
                </div>
            `;
        } else {
            // Sort dates in descending order (newest first)
            const sortedDates = Object.keys(attendanceByDate).sort((a, b) => new Date(b) - new Date(a));
            
            // Show attendance by date
            sortedDates.forEach(date => {
                const records = attendanceByDate[date];
                const presentCount = records.filter(r => r.status === 'Present').length;
                const totalCount = records.length;
                const percentage = Math.round((presentCount / totalCount) * 100) || 0;
                
                content += `
                    <div class="card mb-3">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">${date}</h6>
                            <div>
                                <span class="badge bg-success">Present: ${presentCount}</span>
                                <span class="badge bg-danger">Absent: ${totalCount - presentCount}</span>
                                <span class="badge bg-primary">${percentage}% Present</span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Student ID</th>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Time</th>
                                            <th>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                `;
                
                records.forEach(record => {
                    const student = students.find(s => s.id === record.studentId) || {};
                    content += `
                        <tr>
                            <td>${student.id || 'N/A'}</td>
                            <td>${student.firstName || ''} ${student.lastName || ''}</td>
                            <td><span class="badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'}">${record.status}</span></td>
                            <td>${new Date(record.timestamp).toLocaleTimeString()}</td>
                            <td>${record.remarks || ''}</td>
                        </tr>
                    `;
                });
                
                content += `
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        content += `
                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = content;
        
        // Add event listener for mark attendance button
        document.getElementById('markAttendanceBtn')?.addEventListener('click', showMarkAttendanceForm);
    }

    // Show mark attendance form
    function showMarkAttendanceForm() {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        const today = new Date().toISOString().split('T')[0];
        
        let programFilter = '';
        if (programs.length > 0) {
            programFilter = `
                <div class="col-md-4 mb-3">
                    <label for="filterProgram" class="form-label">Filter by Program</label>
                    <select class="form-select" id="filterProgram">
                        <option value="">All Programs</option>
                        ${programs.map(program => 
                            `<option value="${program.id}">${program.name}</option>`
                        ).join('')}
                    </select>
                </div>
            `;
        }
        
        const content = `
            <div class="row">
                <div class="col-12">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="mb-0">Mark Attendance</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label for="attendanceDate" class="form-label">Date</label>
                                    <input type="date" class="form-control" id="attendanceDate" value="${today}">
                                </div>
                                ${programFilter}
                                <div class="col-md-4 mb-3 d-flex align-items-end">
                                    <button class="btn btn-primary" id="applyFilter">
                                        <i class="fas fa-filter"></i> Apply Filter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <form id="attendanceForm">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Student List</h5>
                                <div>
                                    <button type="button" class="btn btn-sm btn-success me-2" id="markAllPresent">
                                        <i class="fas fa-check"></i> Mark All Present
                                    </button>
                                    <button type="button" class="btn btn-sm btn-danger" id="markAllAbsent">
                                        <i class="fas fa-times"></i> Mark All Absent
                                    </button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-hover" id="attendanceTable">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Student ID</th>
                                                <th>Name</th>
                                                <th>Program</th>
                                                <th>Status</th>
                                                <th>Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
        `;
        
        students.forEach((student, index) => {
            const program = programs.find(p => p.id == student.programId);
            content += `
                <tr data-student-id="${student.id}" data-program-id="${student.programId || ''}">
                    <td>${index + 1}</td>
                    <td>${student.id}</td>
                    <td>${student.firstName} ${student.lastName}</td>
                    <td>${program ? program.name : 'N/A'}</td>
                    <td>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input attendance-status" type="radio" name="status_${student.id}" 
                                   id="present_${student.id}" value="Present" checked>
                            <label class="form-check-label" for="present_${student.id}">Present</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input attendance-status" type="radio" name="status_${student.id}" 
                                   id="absent_${student.id}" value="Absent">
                            <label class="form-check-label" for="absent_${student.id}">Absent</label>
                        </div>
                    </td>
                    <td>
                        <input type="text" class="form-control form-control-sm remarks" 
                               id="remarks_${student.id}" placeholder="Remarks">
                    </td>
                </tr>
            `;
        });
        
        content += `
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="card-footer text-end">
                                <button type="button" class="btn btn-secondary me-2" id="cancelAttendance">
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Save Attendance
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = content;
        
        // Add event listeners
        document.getElementById('cancelAttendance')?.addEventListener('click', loadAttendance);
        
        document.getElementById('markAllPresent')?.addEventListener('click', function() {
            document.querySelectorAll('.attendance-status[value="Present"]').forEach(radio => {
                radio.checked = true;
            });
        });
        
        document.getElementById('markAllAbsent')?.addEventListener('click', function() {
            document.querySelectorAll('.attendance-status[value="Absent"]').forEach(radio => {
                radio.checked = true;
            });
        });
        
        document.getElementById('applyFilter')?.addEventListener('click', function() {
            const programId = document.getElementById('filterProgram')?.value;
            const rows = document.querySelectorAll('#attendanceTable tbody tr');
            
            rows.forEach(row => {
                const rowProgramId = row.getAttribute('data-program-id');
                if (!programId || programId === rowProgramId) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
        
        document.getElementById('attendanceForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAttendance();
        });
    }

    // Save attendance
    function saveAttendance() {
        const date = document.getElementById('attendanceDate').value || new Date().toISOString().split('T')[0];
        const rows = document.querySelectorAll('#attendanceTable tbody tr');
        const attendanceRecords = [];
        const timestamp = new Date().toISOString();
        
        rows.forEach(row => {
            if (row.style.display !== 'none') {
                const studentId = row.getAttribute('data-student-id');
                const status = row.querySelector('.attendance-status:checked').value;
                const remarks = row.querySelector('.remarks').value;
                
                attendanceRecords.push({
                    id: `${date}_${studentId}`,
                    studentId,
                    date,
                    status,
                    remarks,
                    timestamp,
                    markedBy: currentUser.email
                });
            }
        });
        
        // Get existing attendance and filter out any records for the same date
        const existingAttendance = JSON.parse(localStorage.getItem('attendance') || '[]');
        const updatedAttendance = [
            ...existingAttendance.filter(record => record.date !== date),
            ...attendanceRecords
        ];
        
        localStorage.setItem('attendance', JSON.stringify(updatedAttendance));
        
        logActivity(`Marked attendance for ${date}: ${attendanceRecords.length} students`, currentUser.email);
        
        // Show success message and return to attendance list
        alert('Attendance saved successfully!');
        loadAttendance();
    }

    // Load activity logs
    function loadLogs() {
        const logs = JSON.parse(localStorage.getItem('logs') || '[]');
        
        let content = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Activity Logs</h2>
                <button class="btn btn-outline-secondary" id="refreshLogs">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
            </div>
            <div class="card">
                <div class="card-header">
                    <div class="row">
                        <div class="col-md-6">
                            <h5 class="mb-0">System Activities</h5>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="text" class="form-control" id="searchLogs" placeholder="Search logs...">
                                <button class="btn btn-outline-secondary" type="button" id="clearSearch">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body">
        `;
        
        if (logs.length === 0) {
            content += `
                <div class="alert alert-info">
                    No activity logs found.
                </div>
            `;
        } else {
            content += `
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Date & Time</th>
                                <th>Action</th>
                                <th>User</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody id="logsTableBody">
            `;
            
            // Sort logs by timestamp (newest first)
            const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            sortedLogs.forEach(log => {
                content += `
                    <tr>
                        <td>${new Date(log.timestamp).toLocaleString()}</td>
                        <td>${log.action}</td>
                        <td>${log.user || 'System'}</td>
                        <td>${log.ip || 'N/A'}</td>
                    </tr>
                `;
            });
            
            content += `
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        content += `
                </div>
                <div class="card-footer text-muted">
                    Showing ${logs.length} log entries
                </div>
            </div>
        `;

        document.getElementById('mainContent').innerHTML = content;
        
        // Add event listeners
        document.getElementById('refreshLogs')?.addEventListener('click', loadLogs);
        
        const searchInput = document.getElementById('searchLogs');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const rows = document.querySelectorAll('#logsTableBody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }
        
        document.getElementById('clearSearch')?.addEventListener('click', function() {
            if (searchInput) {
                searchInput.value = '';
                const event = new Event('input');
                searchInput.dispatchEvent(event);
            }
        });
    }

    // Log activity
    function logActivity(action, user = 'System') {
        const logs = JSON.parse(localStorage.getItem('logs') || '[]');
        
        logs.push({
            id: Date.now().toString(),
            action,
            user,
            timestamp: new Date().toISOString(),
            // In a real app, you might want to capture IP address from the server
            ip: '127.0.0.1' // Mock IP address
        });
        
        // Keep only the last 1000 logs to prevent localStorage from getting too large
        const maxLogs = 1000;
        const trimmedLogs = logs.slice(-maxLogs);
        
        localStorage.setItem('logs', JSON.stringify(trimmedLogs));
    }

    // Public API
    return {
        init: init,
        currentUser: () => currentUser,
        setCurrentUser: (user) => { currentUser = user; },
        loadDashboard: loadDashboard,
        loadStudents: loadStudents,
        loadPrograms: loadPrograms,
        loadAttendance: loadAttendance,
        loadLogs: loadLogs,
        logActivity: logActivity
    };
})();

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    App.init();
});
