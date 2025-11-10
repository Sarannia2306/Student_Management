// Attendance Management Page Module
const AttendancePage = (function() {
    // Initialize the attendance page
    function init() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (currentUser.role === 'admin') {
            loadAdminAttendance();
        } else {
            loadStudentAttendance(currentUser.id);
        }
        
        setupEventListeners();
    }

    // Load attendance data for admin view
    function loadAdminAttendance() {
        const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        
        // Group attendance by date
        const attendanceByDate = {};
        attendance.forEach(record => {
            if (!attendanceByDate[record.date]) {
                attendanceByDate[record.date] = [];
            }
            attendanceByDate[record.date].push(record);
        });
        
        // Generate attendance table rows
        const attendanceRows = Object.entries(attendanceByDate).map(([date, records]) => {
            const presentCount = records.filter(r => r.status === 'Present').length;
            const totalCount = records.length;
            const percentage = Math.round((presentCount / totalCount) * 100) || 0;
            
            return `
                <tr>
                    <td>${formatDate(date)}</td>
                    <td>${totalCount}</td>
                    <td>${presentCount}</td>
                    <td>
                        <div class="progress" style="height: 20px;">
                            <div class="progress-bar bg-success" role="progressbar" 
                                 style="width: ${percentage}%" 
                                 aria-valuenow="${percentage}" 
                                 aria-valuemin="0" 
                                 aria-valuemax="100">
                                ${percentage}%
                            </div>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-attendance" data-date="${date}">
                            <i class="fas fa-eye me-1"></i> View
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Set the HTML content for admin
        document.getElementById('mainContent').innerHTML = `
            <div class="container-fluid py-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="mb-0">Attendance Management</h2>
                    <div>
                        <button class="btn btn-primary" id="markAttendanceBtn">
                            <i class="fas fa-plus me-1"></i> Mark Attendance
                        </button>
                    </div>
                </div>
                
                <div class="card shadow-sm mb-4">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Total Students</th>
                                        <th>Present</th>
                                        <th>Attendance Rate</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${attendanceRows || '<tr><td colspan="5" class="text-center py-4">No attendance records found</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Re-attach event listeners
        setupEventListeners();
    }
    
    // Load attendance data for student view
    function loadStudentAttendance(studentId) {
        const attendance = JSON.parse(localStorage.getItem('attendance') || '[]')
            .filter(record => record.studentId === studentId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Calculate attendance summary
        const totalDays = attendance.length;
        const presentDays = attendance.filter(r => r.status === 'Present').length;
        const absentDays = totalDays - presentDays;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        
        // Generate attendance rows
        const attendanceRows = attendance.map(record => `
            <tr>
                <td>${formatDate(record.date)}</td>
                <td>
                    <span class="badge bg-${record.status === 'Present' ? 'success' : 'danger'}">
                        ${record.status}
                    </span>
                </td>
                <td>${record.remarks || '-'}</td>
            </tr>
        `).join('');
        
        // Set the HTML content for student
        document.getElementById('mainContent').innerHTML = `
            <div class="container-fluid py-4">
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="card bg-primary text-white">
                            <div class="card-body">
                                <h5 class="card-title">Attendance Rate</h5>
                                <div class="d-flex justify-content-between align-items-center">
                                    <h2 class="mb-0">${attendancePercentage}%</h2>
                                    <i class="fas fa-calendar-check fa-2x opacity-50"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-success text-white">
                            <div class="card-body">
                                <h5 class="card-title">Present</h5>
                                <div class="d-flex justify-content-between align-items-center">
                                    <h2 class="mb-0">${presentDays}</h2>
                                    <i class="fas fa-user-check fa-2x opacity-50"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-danger text-white">
                            <div class="card-body">
                                <h5 class="card-title">Absent</h5>
                                <div class="d-flex justify-content-between align-items-center">
                                    <h2 class="mb-0">${absentDays}</h2>
                                    <i class="fas fa-user-times fa-2x opacity-50"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card shadow-sm">
                    <div class="card-header bg-white">
                        <h5 class="mb-0">Attendance History</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${attendanceRows || '<tr><td colspan="3" class="text-center py-4">No attendance records found</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Show mark attendance modal
    function showMarkAttendanceModal() {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const today = new Date().toISOString().split('T')[0];
        
        // Generate student rows with Present/Absent selection
        const studentRows = students.map(student => `
            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                <div>
                    <strong>${student.fullName}</strong> <small class="text-muted">(${student.id})</small>
                </div>
                <div class="btn-group" role="group" aria-label="Status">
                    <input type="radio" class="btn-check status-radio" name="status-${student.id}" id="present-${student.id}" value="Present" checked>
                    <label class="btn btn-outline-success btn-sm" for="present-${student.id}">Present</label>
                    <input type="radio" class="btn-check status-radio" name="status-${student.id}" id="absent-${student.id}" value="Absent">
                    <label class="btn btn-outline-danger btn-sm" for="absent-${student.id}">Absent</label>
                </div>
            </div>
        `).join('');
        
        const modalHTML = `
            <div class="modal fade" id="markAttendanceModal" tabindex="-1" aria-labelledby="markAttendanceModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="markAttendanceModalLabel">Mark Attendance</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form id="markAttendanceForm">
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label for="attendanceDate" class="form-label">Date</label>
                                    <input type="date" class="form-control" id="attendanceDate" value="${today}" required>
                                </div>
                                
                                <div class="mb-3">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <label class="form-label mb-0">Select Students & Status</label>
                                        <div>
                                            <button type="button" class="btn btn-sm btn-outline-success me-2" id="markAllPresentBtn">
                                                <i class="fas fa-check me-1"></i> Mark All Present
                                            </button>
                                            <button type="button" class="btn btn-sm btn-outline-danger" id="markAllAbsentBtn">
                                                <i class="fas fa-times me-1"></i> Mark All Absent
                                            </button>
                                        </div>
                                    </div>
                                    <div class="border rounded p-3" style="max-height: 300px; overflow-y: auto;">
                                        ${studentRows || 'No students found'}
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="attendanceRemarks" class="form-label">Remarks (Optional)</label>
                                    <textarea class="form-control" id="attendanceRemarks" rows="2"></textarea>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-times me-1"></i> Cancel
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i> Save Attendance
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to the DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Initialize the modal
        const modal = new bootstrap.Modal(document.getElementById('markAttendanceModal'));
        modal.show();
        
        // Handle mark all present/absent buttons
        document.getElementById('markAllPresentBtn')?.addEventListener('click', function() {
            document.querySelectorAll('.status-radio').forEach(input => {
                if (input.value === 'Present') input.checked = true;
            });
        });
        document.getElementById('markAllAbsentBtn')?.addEventListener('click', function() {
            document.querySelectorAll('.status-radio').forEach(input => {
                if (input.value === 'Absent') input.checked = true;
            });
        });
        
        // Handle form submission
        document.getElementById('markAttendanceForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAttendance();
        });
        
        // Remove modal from DOM when hidden
        document.getElementById('markAttendanceModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Save attendance
    function saveAttendance() {
        const date = document.getElementById('attendanceDate').value;
        const remarks = document.getElementById('attendanceRemarks').value;
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        
        if (!date) {
            showAlert('Please select a date', 'danger');
            return;
        }
        
        const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
        const currentAttendance = [];
        
        // Remove existing attendance for this date
        const filteredAttendance = attendance.filter(record => record.date !== date);
        
        // Add new attendance records from radio selection per student
        students.forEach(s => {
            const selected = document.querySelector(`input[name="status-${s.id}"]:checked`);
            if (!selected) return;
            currentAttendance.push({
                id: 'ATT' + Date.now() + Math.floor(Math.random() * 1000),
                studentId: s.id,
                date: date,
                status: selected.value,
                remarks: remarks,
                markedAt: new Date().toISOString()
            });
        });
        
        // Save to localStorage
        localStorage.setItem('attendance', JSON.stringify([...filteredAttendance, ...currentAttendance]));
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('markAttendanceModal'));
        if (modal) modal.hide();
        
        // Reload the attendance list
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (currentUser.role === 'admin') {
            loadAdminAttendance();
        } else {
            loadStudentAttendance(currentUser.id);
        }
        
        // Show success message
        showAlert('Attendance saved successfully!', 'success');
        
        // Log the activity
        App.logActivity(`Marked attendance for ${currentAttendance.length} students on ${formatDate(date)}`, currentUser.email);
    }
    
    // View attendance details for a specific date
    function viewAttendanceDetails(date) {
        const attendance = JSON.parse(localStorage.getItem('attendance') || '[]')
            .filter(record => record.date === date);
        
        const students = JSON.parse(localStorage.getItem('students') || '{}');
        
        // Create a map of student IDs to student objects for faster lookup
        const studentMap = {};
        students.forEach(student => {
            studentMap[student.id] = student;
        });
        
        // Generate attendance rows
        const attendanceRows = attendance.map(record => {
            const student = studentMap[record.studentId] || {};
            return `
                <tr>
                    <td>${student.id || 'N/A'}</td>
                    <td>${student.fullName || 'Unknown Student'}</td>
                    <td>
                        <span class="badge bg-${record.status === 'Present' ? 'success' : 'danger'}">
                            ${record.status}
                        </span>
                    </td>
                    <td>${record.remarks || '-'}</td>
                    <td>${formatDateTime(record.markedAt)}</td>
                </tr>
            `;
        }).join('');
        
        // Calculate attendance summary
        const totalStudents = attendance.length;
        const presentCount = attendance.filter(r => r.status === 'Present').length;
        const attendancePercentage = Math.round((presentCount / totalStudents) * 100) || 0;
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="attendanceDetailsModal" tabindex="-1" aria-labelledby="attendanceDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="attendanceDetailsModalLabel">
                                Attendance for ${formatDate(date)}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-4">
                                <div class="col-md-4">
                                    <div class="card bg-light">
                                        <div class="card-body text-center">
                                            <h6 class="text-muted mb-1">Total Students</h6>
                                            <h3 class="mb-0">${totalStudents}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="card bg-success text-white">
                                        <div class="card-body text-center">
                                            <h6 class="mb-1">Present</h6>
                                            <h3 class="mb-0">${presentCount}</h3>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="card bg-primary text-white">
                                        <div class="card-body text-center">
                                            <h6 class="mb-1">Attendance Rate</h6>
                                            <h3 class="mb-0">${attendancePercentage}%</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Student ID</th>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Remarks</th>
                                            <th>Marked At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${attendanceRows || '<tr><td colspan="5" class="text-center py-4">No attendance records found</td></tr>'}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i> Close
                            </button>
                            <button type="button" class="btn btn-primary" onclick="printAttendance('${date}')">
                                <i class="fas fa-print me-1"></i> Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to the DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Initialize the modal
        const modal = new bootstrap.Modal(document.getElementById('attendanceDetailsModal'));
        modal.show();
        
        // Remove modal from DOM when hidden
        document.getElementById('attendanceDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Format date to display in a user-friendly way
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    // Format date and time
    function formatDateTime(dateTimeString) {
        if (!dateTimeString) return 'N/A';
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateTimeString).toLocaleString('en-US', options);
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Mark attendance button (admin only)
        const markAttendanceBtn = document.getElementById('markAttendanceBtn');
        if (markAttendanceBtn) {
            markAttendanceBtn.addEventListener('click', showMarkAttendanceModal);
        }
        
        // View attendance details
        document.addEventListener('click', function(e) {
            if (e.target.closest('.view-attendance')) {
                e.preventDefault();
                const date = e.target.closest('.view-attendance').getAttribute('data-date');
                viewAttendanceDetails(date);
            }
        });
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
        const container = document.querySelector('.container-fluid') || document.body;
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = bootstrap.Alert.getOrCreateInstance(alertDiv);
            if (alert) alert.close();
        }, 5000);
    }
    
    // Public API
    return {
        init,
        viewAttendance: viewAttendanceDetails
    };
})();

// Global function for printing attendance
function printAttendance(date) {
    // This function can be implemented to print the attendance
    alert(`Printing attendance for ${date}`);
}
