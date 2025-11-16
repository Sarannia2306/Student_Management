// Attendance Management Page Module
const AttendancePage = (function() {
    // Initialize the attendance page
    function init() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (currentUser.role === 'admin') {
            loadAdminAttendance();
        } else {
            const sid = currentUser.studentId || currentUser.id || currentUser.uid || '';
            loadStudentAttendance(sid);
        }
        
        setupEventListeners();
    }

    // Load attendance data for admin to view 
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

            const uniqueNames = Array.from(new Set(records.map(r => r.studentName || r.studentId || 'Student')));
            let namesDisplay = uniqueNames.join(', ');
            if (uniqueNames.length > 3) {
                namesDisplay = uniqueNames.slice(0, 3).join(', ') + ` +${uniqueNames.length - 3} more`;
            }
            
            return `
                <tr>
                    <td>${formatDate(date)}</td>
                    <td>${namesDisplay}</td>
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
                                        <th>Student Names</th>
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
    async function loadStudentAttendance(studentId) {
        let attendance = [];
        try {
            if (window.FirebaseAPI?.listAttendanceForStudent) {
                attendance = await window.FirebaseAPI.listAttendanceForStudent(studentId);
            } else {
                attendance = JSON.parse(localStorage.getItem('attendance') || '[]')
                    .filter(record => record.studentId === studentId);
            }
        } catch (e) {
            console.error('Failed to load attendance for student portal', e);
            attendance = JSON.parse(localStorage.getItem('attendance') || '[]')
                .filter(record => record.studentId === studentId);
        }

        // Ensure newest first
        attendance.sort((a, b) => new Date(b.date || b.markedAt || 0) - new Date(a.date || a.markedAt || 0));

        // Calculate attendance summary
        const totalDays = attendance.length;
        const presentDays = attendance.filter(r => r.status === 'Present').length;
        const lateDays = attendance.filter(r => r.status === 'Late').length;
        const absentDays = totalDays - presentDays - lateDays;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        
        // Generate attendance rows
        const attendanceRows = attendance.map(record => {
            let badgeClass = 'secondary';
            if (record.status === 'Present') badgeClass = 'success';
            else if (record.status === 'Absent') badgeClass = 'danger';
            else if (record.status === 'Late') badgeClass = 'warning';
            return `
                <tr>
                    <td>${formatDate(record.date)}</td>
                    <td>
                        <span class="badge bg-${badgeClass}">
                            ${record.status}
                        </span>
                    </td>
                    <td>${record.subjectCode || ''}${record.subjectName ? ' - ' + record.subjectName : ''}</td>
                    <td>${record.remarks || '-'}</td>
                </tr>
            `;
        }).join('');
        
        // Set the HTML content for student
        document.getElementById('mainContent').innerHTML = `
            <div class="container-fluid py-4">
                <div class="row g-3 mb-4">
                    <div class="col-md-3">
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
                    <div class="col-6 col-md-3">
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
                    <div class="col-6 col-md-3">
                        <div class="card bg-warning text-white">
                            <div class="card-body">
                                <h5 class="card-title">Late</h5>
                                <div class="d-flex justify-content-between align-items-center">
                                    <h2 class="mb-0">${lateDays}</h2>
                                    <i class="fas fa-user-clock fa-2x opacity-50"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
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
                                        <th>Subject</th>
                                        <th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${attendanceRows || '<tr><td colspan="4" class="text-center py-4">No attendance records found</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Show mark attendance modal (admin)
    function showMarkAttendanceModal() {
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        const today = new Date().toISOString().split('T')[0];

        const programOptions = programs.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

        const modalHTML = `
            <div class="modal fade" id="markAttendanceModal" tabindex="-1" aria-labelledby="markAttendanceModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="markAttendanceModalLabel">Mark Attendance</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form id="markAttendanceForm">
                            <div class="modal-body">
                                <div class="row g-3 mb-3">
                                    <div class="col-md-3">
                                        <label for="attendanceDate" class="form-label">Date</label>
                                        <input type="date" class="form-control" id="attendanceDate" value="${today}" required>
                                    </div>
                                    <div class="col-md-3">
                                        <label for="attendanceProgram" class="form-label">Program</label>
                                        <select id="attendanceProgram" class="form-select" required>
                                            <option value="">Select Program</option>
                                            ${programOptions}
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label for="attendanceSemester" class="form-label">Semester</label>
                                        <select id="attendanceSemester" class="form-select" required>
                                            <option value="">Select Semester</option>
                                            <option value="Semester 1">Semester 1</option>
                                            <option value="Semester 2">Semester 2</option>
                                            <option value="Semester 3">Semester 3</option>
                                            <option value="Semester 4">Semester 4</option>
                                            <option value="Semester 5">Semester 5</option>
                                            <option value="Semester 6">Semester 6</option>
                                            <option value="Semester 7">Semester 7</option>
                                            <option value="Semester 8">Semester 8</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label for="attendanceSubject" class="form-label">Subject</label>
                                        <select id="attendanceSubject" class="form-select" required>
                                            <option value="">Select Subject</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <h6 class="mb-0">Students</h6>
                                    <div class="btn-group btn-group-sm" role="group" aria-label="Mark all">
                                        <button type="button" class="btn btn-outline-success" id="markAllPresentBtn">All Present</button>
                                        <button type="button" class="btn btn-outline-danger" id="markAllAbsentBtn">All Absent</button>
                                        <button type="button" class="btn btn-outline-warning" id="markAllLateBtn">All Late</button>
                                    </div>
                                </div>
                                <div class="border rounded p-2" style="max-height: 360px; overflow-y: auto;">
                                    <table class="table table-sm align-middle mb-0" id="attendanceStudentsTable">
                                        <thead class="table-light">
                                            <tr>
                                                <th style="width: 18%;">Student ID</th>
                                                <th>Student Name</th>
                                                <th style="width: 22%;">Status</th>
                                                <th style="width: 30%;">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr><td colspan="4" class="text-center py-3 text-muted">Select program, semester, and subject, then students will appear here.</td></tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div class="mt-3">
                                    <small class="text-muted">Students are filtered by Program (course) and Semester from their profile.</small>
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

        const modalEl = document.getElementById('markAttendanceModal');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

        const programSelect = document.getElementById('attendanceProgram');
        const semesterSelect = document.getElementById('attendanceSemester');
        const subjectSelect = document.getElementById('attendanceSubject');
        const tableBody = document.querySelector('#attendanceStudentsTable tbody');

        function refreshSubjects() {
            const programId = programSelect.value;
            subjectSelect.innerHTML = '<option value="">Select Subject</option>';
            const program = programs.find(p => p.id === programId);
            if (!program || !Array.isArray(program.courses)) return;
            program.courses.forEach(course => {
                const opt = document.createElement('option');
                opt.value = course.code || '';
                opt.textContent = `${course.code || ''} - ${course.name || ''}`.trim();
                opt.dataset.subjectName = course.name || '';
                subjectSelect.appendChild(opt);
            });
        }

        async function loadEnrolledStudents(programName, semester, subjectCode) {
            const out = [];
            try {
                if (window.FirebaseAPI?.listStudents && window.FirebaseAPI?.getStudentEnrolments) {
                    const list = await window.FirebaseAPI.listStudents();
                    if (Array.isArray(list)) {
                        for (const s of list) {
                            if (!s || s.role !== 'student') continue;
                            if (programName && s.course !== programName) continue;
                            if (semester && s.semester !== semester) continue;
                            const enrolments = await window.FirebaseAPI.getStudentEnrolments(s.uid);
                            if (Array.isArray(enrolments) && enrolments.some(e => (e.code === subjectCode) && (!e.semester || e.semester === semester))) {
                                out.push({
                                    uid: s.uid,
                                    studentId: s.studentId || s.id || s.uid,
                                    fullName: s.fullName || s.name || 'Student'
                                });
                            }
                        }
                    }
                } else {
                    const studentsLS = JSON.parse(localStorage.getItem('students') || '[]');
                    studentsLS.forEach(s => {
                        if (!s) return;
                        if (programName && s.course !== programName) return;
                        if (semester && s.semester !== semester) return;
                        const enrolments = Array.isArray(s.enrolments) ? s.enrolments : [];
                        if (enrolments.some(e => (e.code === subjectCode) && (!e.semester || e.semester === semester))) {
                            out.push({
                                uid: s.uid || s.id,
                                studentId: s.studentId || s.id,
                                fullName: s.fullName || 'Student'
                            });
                        }
                    });
                }
            } catch (e) {
                console.error('Failed to load enrolled students for attendance', e);
            }
            return out;
        }

        async function refreshStudentsTable() {
            const programId = programSelect.value;
            const semester = semesterSelect.value;
            const subjectCode = subjectSelect.value;
            if (!programId || !semester || !subjectCode) {
                tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-3 text-muted">Select program, semester, and subject above.</td></tr>';
                return;
            }
            const program = programs.find(p => p.id === programId);
            const programName = program ? program.name : '';

            tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-3 text-muted">Loading students enrolled in this subject...</td></tr>';
            const filtered = await loadEnrolledStudents(programName, semester, subjectCode);
            if (!filtered || filtered.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4" class="text-center py-3 text-muted">No students found who are enrolled in this subject for the selected semester.</td></tr>';
                return;
            }
            tableBody.innerHTML = filtered.map(s => `
                <tr data-student-id="${s.studentId || ''}" data-student-name="${s.fullName || ''}">
                    <td>${s.studentId || '-'}</td>
                    <td>${s.fullName || '-'}</td>
                    <td>
                        <select class="form-select form-select-sm attendance-status">
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" class="form-control form-control-sm attendance-remarks" placeholder="Optional remarks">
                    </td>
                </tr>
            `).join('');
        }

        programSelect.addEventListener('change', () => {
            refreshSubjects();
            refreshStudentsTable();
        });
        semesterSelect.addEventListener('change', () => { refreshStudentsTable(); });
        subjectSelect.addEventListener('change', () => { refreshStudentsTable(); });

        document.getElementById('markAllPresentBtn')?.addEventListener('click', () => {
            document.querySelectorAll('#attendanceStudentsTable .attendance-status').forEach(sel => {
                sel.value = 'Present';
            });
        });
        document.getElementById('markAllAbsentBtn')?.addEventListener('click', () => {
            document.querySelectorAll('#attendanceStudentsTable .attendance-status').forEach(sel => {
                sel.value = 'Absent';
            });
        });
        document.getElementById('markAllLateBtn')?.addEventListener('click', () => {
            document.querySelectorAll('#attendanceStudentsTable .attendance-status').forEach(sel => {
                sel.value = 'Late';
            });
        });

        document.getElementById('markAttendanceForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAttendance();
        });

        modalEl.addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // Save attendance (admin)
    async function saveAttendance() {
        const date = document.getElementById('attendanceDate').value;
        const programId = document.getElementById('attendanceProgram').value;
        const semester = document.getElementById('attendanceSemester').value;
        const subjectCode = document.getElementById('attendanceSubject').value;
        const subjectSelect = document.getElementById('attendanceSubject');
        const subjectName = subjectSelect.options[subjectSelect.selectedIndex]?.text.split(' - ').slice(1).join(' - ') || '';

        if (!date || !programId || !semester || !subjectCode) {
            showAlert('Please fill in date, program, semester, and subject before saving.', 'danger');
            return;
        }

        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        const program = programs.find(p => p.id === programId);
        const programName = program ? program.name : '';

        const attendance = JSON.parse(localStorage.getItem('attendance') || '[]');
        const updated = [];
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

        // Keep all other records, but remove any for same date + program + semester + subject
        const filteredAttendance = attendance.filter(r => !(
            r.date === date &&
            r.programId === programId &&
            r.semester === semester &&
            r.subjectCode === subjectCode
        ));

        document.querySelectorAll('#attendanceStudentsTable tbody tr[data-student-id]').forEach(row => {
            const studentId = row.getAttribute('data-student-id') || '';
            const studentName = row.getAttribute('data-student-name') || '';
            const statusSel = row.querySelector('.attendance-status');
            const remarksInput = row.querySelector('.attendance-remarks');
            if (!statusSel) return;
            const status = statusSel.value || 'Present';
            const remarks = remarksInput?.value.trim() || '';

            updated.push({
                id: 'ATT' + Date.now() + Math.floor(Math.random() * 1000),
                date,
                studentId,
                studentName,
                programId,
                programName,
                semester,
                subjectCode,
                subjectName,
                status,
                remarks,
                markedBy: currentUser?.email || '',
                markedAt: new Date().toISOString()
            });
        });

        localStorage.setItem('attendance', JSON.stringify([...filteredAttendance, ...updated]));

        // Save to Firebase if available
        try {
            if (window.FirebaseAPI?.saveAttendanceRecords && updated.length > 0) {
                await window.FirebaseAPI.saveAttendanceRecords(updated);
            }
        } catch (e) {
            console.error('Failed to save attendance records to Firebase', e);
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('markAttendanceModal'));
        if (modal) modal.hide();

        // Reload admin list
        loadAdminAttendance();

        showAlert(`Attendance saved for ${updated.length} students.`, 'success');
        if (updated.length > 0 && currentUser && currentUser.email) {
            App.logActivity(`Marked attendance for ${updated.length} students on ${formatDate(date)}`, currentUser.email);
        }
    }
    
    // View attendance details for a specific date
    async function viewAttendanceDetails(date) {
        const attendance = JSON.parse(localStorage.getItem('attendance') || '[]')
            .filter(record => record.date === date);

        let studentsArr = [];
        try {
            if (window.FirebaseAPI?.listStudents) {
                const list = await window.FirebaseAPI.listStudents();
                if (Array.isArray(list)) studentsArr = list;
            } else {
                const ls = JSON.parse(localStorage.getItem('students') || '[]');
                if (Array.isArray(ls)) studentsArr = ls;
            }
        } catch (e) {
            console.error('Failed to load students for attendance details', e);
            const fallback = JSON.parse(localStorage.getItem('students') || '[]');
            if (Array.isArray(fallback)) studentsArr = fallback;
        }

        // Create a map of student IDs to student objects for faster lookup
        const studentMap = {};
        studentsArr.forEach(student => {
            if (!student) return;
            const sid = student.studentId || student.id || student.uid;
            if (!sid) return;
            studentMap[sid] = student;
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
