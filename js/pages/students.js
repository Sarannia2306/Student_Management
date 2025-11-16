// Students Management Page Module
const StudentsPage = (function() {
    const state = { students: [] };
    function maskIC(ic){
        const s = String(ic || '');
        if (s.length <= 4) return '*'.repeat(Math.max(0, s.length));
        const head = s.slice(0,2), tail = s.slice(-2);
        return head + '*'.repeat(s.length - 4) + tail;
    }
    // Initialize the students page
    function init() {
        loadStudents();
        setupEventListeners();
    }

    // Load students data
    function loadStudents(searchTerm = '') {
        const useFirebase = !!window.FirebaseAPI?.listStudents;
        const render = (students) => {
            state.students = students || [];
            let filteredStudents = [...state.students];

            // Filter students if search term is provided
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filteredStudents = state.students.filter(student => 
                    (student.fullName && student.fullName.toLowerCase().includes(term)) ||
                    (student.email && student.email.toLowerCase().includes(term)) ||
                    ((student.id || student.studentId || '').toString().toLowerCase().includes(term))
                );
            }
            const studentsRows = filteredStudents.map(student => `
                <tr>
                    <td>${student.studentId || student.id || 'N/A'}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName || 'Student')}&background=4e73df&color=fff&size=40" 
                                 class="rounded-circle me-2" 
                                 alt="${student.fullName || 'Student'}"
                                 style="width: 32px; height: 32px; object-fit: cover;">
                            <div>
                                <div class="fw-semibold">${student.fullName || 'N/A'}</div>
                                <div class="text-muted small">${student.email || ''}</div>
                            </div>
                        </div>
                    </td>
                    <td>${student.maskedIC || student.icNumber || 'N/A'}</td>
                    <td>${student.phone || 'N/A'}</td>
                    <td>
                        <span class="badge bg-info text-dark">${student.academicLevel || 'N/A'}</span>
                    </td>
                    <td>
                        <span class="badge bg-success">Active</span>
                    </td>
                    <td>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" 
                                    data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li><a class="dropdown-item view-student" href="#" data-id="${student.uid || student.id}">
                                    <i class="fas fa-eye me-2"></i>View Details
                                </a></li>
                                <li><a class="dropdown-item edit-student" href="#" data-id="${student.uid || student.id}">
                                    <i class="fas fa-edit me-2"></i>Edit
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger delete-student" href="#" data-id="${student.uid || student.id}">
                                    <i class="fas fa-trash-alt me-2"></i>Delete
                                </a></li>
                            </ul>
                        </div>
                    </td>
                </tr>
            `).join('');

        // Generate the students table HTML
        const studentsHTML = `
            <div class="card shadow-sm mb-4">
                <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Students List</h5>
                    <div class="d-flex">
                        <div class="input-group me-2" style="max-width: 300px;">
                            <span class="input-group-text bg-transparent"><i class="fas fa-search"></i></span>
                            <input type="text" class="form-control" id="searchStudents" placeholder="Search students..." 
                                   value="${searchTerm}">
                        </div>
                        <button class="btn btn-primary" id="addStudentBtn">
                            <i class="fas fa-plus me-1"></i> Add Student
                        </button>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>ID</th>
                                    <th>Student</th>
                                    <th>IC Number</th>
                                    <th>Phone</th>
                                    <th>Level</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${studentsRows || '<tr><td colspan="7" class="text-center py-4">No students found</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer bg-white py-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted small">
                            Showing <span class="fw-semibold">${filteredStudents.length}</span> of 
                            <span class="fw-semibold">${state.students.length}</span> students
                        </div>
                        <nav aria-label="Students pagination">
                            <ul class="pagination pagination-sm mb-0">
                                <li class="page-item disabled">
                                    <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
                                </li>
                                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                                <li class="page-item"><a class="page-link" href="#">2</a></li>
                                <li class="page-item"><a class="page-link" href="#">3</a></li>
                                <li class="page-item">
                                    <a class="page-link" href="#">Next</a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        `;

        // Set the HTML content
        document.getElementById('mainContent').innerHTML = `
            <div class="container-fluid py-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="mb-0">Students Management</h2>
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb mb-0">
                            <li class="breadcrumb-item"><a href="#" data-page="dashboard">Dashboard</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Students</li>
                        </ol>
                    </nav>
                </div>
                ${studentsHTML}
            </div>
        `;

        // In Firebase mode, hide Add Student (cannot create other users due to DB rules)
        if (useFirebase) {
            const addBtn = document.getElementById('addStudentBtn');
            if (addBtn) addBtn.style.display = 'none';
        }
        // Re-attach event listeners
        setupEventListeners();
        };

        if (useFirebase) {
            window.FirebaseAPI.listStudents()
                .then(render)
                .catch((err) => {
                    try { showAlert('Failed to load students: ' + (err?.message || err), 'danger'); } catch(_){ console.error(err); }
                    render([]);
                });
        } else {
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            render(students);
        }
    }

    // Show add/edit student modal
    async function showStudentForm(studentId = null) {
        let student = null;
        let isEdit = false;
        
        if (studentId) {
            student = state.students.find(s => (s.uid && s.uid === studentId) || (s.id === studentId));
            // Fallback: fetch from Firebase if not found in state
            if (!student && window.FirebaseAPI?.getUserProfile) {
                try {
                    const prof = await window.FirebaseAPI.getUserProfile(studentId);
                    if (prof) student = { ...prof, uid: studentId };
                } catch (_) {}
            }
            isEdit = true;
        }
        
        const modalHTML = `
            <div class="modal fade" id="studentFormModal" tabindex="-1" aria-labelledby="studentFormModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="studentFormModalLabel">
                                ${isEdit ? 'Edit' : 'Add New'} Student
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form id="studentForm">
                            <div class="modal-body">
                                <ul class="nav nav-tabs nav-fill mb-4" id="studentTabs" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active" id="personal-tab" data-bs-toggle="tab" 
                                                data-bs-target="#personal" type="button" role="tab" 
                                                aria-controls="personal" aria-selected="true">
                                            <i class="fas fa-user me-1"></i> Personal Info
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="academic-tab" data-bs-toggle="tab" 
                                                data-bs-target="#academic" type="button" role="tab" 
                                                aria-controls="academic" aria-selected="false">
                                            <i class="fas fa-graduation-cap me-1"></i> Academic Info
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="guardian-tab" data-bs-toggle="tab" 
                                                data-bs-target="#guardian" type="button" role="tab" 
                                                aria-controls="guardian" aria-selected="false">
                                            <i class="fas fa-users me-1"></i> Guardian Info
                                        </button>
                                    </li>
                                </ul>
                                
                                <div class="tab-content" id="studentTabsContent">
                                    <!-- Personal Info Tab -->
                                    <div class="tab-pane fade show active" id="personal" role="tabpanel" aria-labelledby="personal-tab">
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="studentFullName" class="form-label">Full Name <span class="text-danger">*</span></label>
                                                <input type="text" class="form-control" id="studentFullName" 
                                                       value="${student?.fullName || ''}" required>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label for="studentIcNumber" class="form-label">IC/Passport Number <span class="text-danger">*</span></label>
                                                <input type="text" class="form-control" id="studentIcNumber" 
                                                       value="${student?.maskedIC || student?.icNumber || ''}" readonly required>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="studentEmail" class="form-label">Email Address <span class="text-danger">*</span></label>
                                                <input type="email" class="form-control" id="studentEmail" 
                                                       value="${student?.email || ''}" readonly required>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label for="studentPhone" class="form-label">Phone Number <span class="text-danger">*</span></label>
                                                <input type="tel" class="form-control" id="studentPhone" 
                                                       value="${student?.phone || ''}" required>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label for="studentAddress" class="form-label">Address</label>
                                            <textarea class="form-control" id="studentAddress" rows="2">${student?.address || ''}</textarea>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-4 mb-3">
                                                <label for="studentGender" class="form-label">Gender</label>
                                                <select class="form-select" id="studentGender">
                                                    <option value="">Select Gender</option>
                                                    <option value="Male" ${student?.gender === 'Male' ? 'selected' : ''}>Male</option>
                                                    <option value="Female" ${student?.gender === 'Female' ? 'selected' : ''}>Female</option>
                                                    <option value="Other" ${student?.gender === 'Other' ? 'selected' : ''}>Other</option>
                                                </select>
                                            </div>
                                            <div class="col-md-4 mb-3">
                                                <label for="studentDob" class="form-label">Date of Birth</label>
                                                <input type="date" class="form-control" id="studentDob" 
                                                       value="${student?.dob || ''}">
                                            </div>
                                            <div class="col-md-4 mb-3">
                                                <label for="studentNationality" class="form-label">Nationality</label>
                                                <input type="text" class="form-control" id="studentNationality" 
                                                       value="${student?.nationality || 'Malaysian'}">
                                            </div>
                                        </div>
                                        <div class="d-flex justify-content-end">
                                            <button type="button" class="btn btn-primary" id="savePersonalBtn">
                                                <i class="fas fa-save me-1"></i> Save Personal
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- Academic Info Tab -->
                                    <div class="tab-pane fade" id="academic" role="tabpanel" aria-labelledby="academic-tab">
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="studentId" class="form-label">Student ID</label>
                                                <input type="text" class="form-control" id="studentId" 
                                                       value="${student?.studentId || student?.id || generateStudentId()}" placeholder="e.g., STU25-1234" readonly>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label for="studentLevel" class="form-label">Academic Level</label>
                                                <select class="form-select" id="studentLevel">
                                                    <option value="">Select Level</option>
                                                    <option value="Foundation" ${student?.academicLevel === 'Foundation' ? 'selected' : ''}>Foundation</option>
                                                    <option value="Diploma" ${student?.academicLevel === 'Diploma' ? 'selected' : ''}>Diploma</option>
                                                    <option value="Degree" ${student?.academicLevel === 'Degree' ? 'selected' : ''}>Degree</option>
                                                    <option value="Masters" ${student?.academicLevel === 'Masters' ? 'selected' : ''}>Masters</option>
                                                    <option value="PhD" ${student?.academicLevel === 'PhD' ? 'selected' : ''}>PhD</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="studentCourse" class="form-label">Course Name</label>
                                                <input type="text" class="form-control" id="studentCourse" value="${student?.course || ''}" placeholder="e.g., Bachelor's in Computing">
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label for="studentSemester" class="form-label">Semester</label>
                                                <input type="text" class="form-control" id="studentSemester" value="${student?.semester || ''}" placeholder="e.g., Semester 1">
                                            </div>
                                        </div>
                                        <div class="d-flex justify-content-end">
                                            <button type="button" class="btn btn-primary" id="saveAcademicBtn">
                                                <i class="fas fa-save me-1"></i> Save Academic
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- Guardian Info Tab -->
                                    <div class="tab-pane fade" id="guardian" role="tabpanel" aria-labelledby="guardian-tab">
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="guardianName" class="form-label">Guardian Name</label>
                                                <input type="text" class="form-control" id="guardianName" 
                                                       value="${student?.guardian?.name || ''}">
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label for="guardianRelationship" class="form-label">Relationship</label>
                                                <select class="form-select" id="guardianRelationship">
                                                    <option value="">Select Relationship</option>
                                                    <option value="Father" ${student?.guardian?.relationship === 'Father' ? 'selected' : ''}>Father</option>
                                                    <option value="Mother" ${student?.guardian?.relationship === 'Mother' ? 'selected' : ''}>Mother</option>
                                                    <option value="Brother" ${student?.guardian?.relationship === 'Brother' ? 'selected' : ''}>Brother</option>
                                                    <option value="Sister" ${student?.guardian?.relationship === 'Sister' ? 'selected' : ''}>Sister</option>
                                                    <option value="Other" ${student?.guardian?.relationship === 'Other' ? 'selected' : ''}>Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="guardianPhone" class="form-label">Phone Number</label>
                                                <input type="tel" class="form-control" id="guardianPhone" 
                                                       value="${student?.guardian?.phone || ''}">
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label for="guardianEmail" class="form-label">Email Address</label>
                                                <input type="email" class="form-control" id="guardianEmail" 
                                                       value="${student?.guardian?.email || ''}">
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label for="guardianAddress" class="form-label">Address</label>
                                            <textarea class="form-control" id="guardianAddress" rows="2">${student?.guardian?.address || ''}</textarea>
                                        </div>
                                        <div class="d-flex justify-content-end">
                                            <button type="button" class="btn btn-primary" id="saveGuardianBtn">
                                                <i class="fas fa-save me-1"></i> Save Guardian
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-times me-1"></i> Close
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // If view details modal is open, close and remove it to avoid stacking
        try {
            const viewEl = document.getElementById('studentDetailsModal');
            if (viewEl) {
                try { (bootstrap.Modal.getInstance(viewEl) || new bootstrap.Modal(viewEl)).hide(); } catch(_) {}
                setTimeout(() => { try { viewEl.remove(); } catch(_) {} }, 150);
            }
        } catch(_) {}

        // Add modal to the DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Initialize the modal
        const modalRoot = document.getElementById('studentFormModal');
        const modal = new bootstrap.Modal(modalRoot);
        modal.show();
        
        // Per-tab save handlers
        const key = student?.uid || student?.id || null;
        const savePersonal = async () => {
            const fullName = (modalRoot.querySelector('#studentFullName')?.value || '').trim();
            const email = (modalRoot.querySelector('#studentEmail')?.value || '').trim();
            const phone = (modalRoot.querySelector('#studentPhone')?.value || '').trim();
            const address = (modalRoot.querySelector('#studentAddress')?.value || '').trim();
            const gender = (modalRoot.querySelector('#studentGender')?.value || '').trim();
            const dob = (modalRoot.querySelector('#studentDob')?.value || '').trim();
            const nationality = (modalRoot.querySelector('#studentNationality')?.value || '').trim();
            const missing = [];
            if (!fullName) missing.push('Full Name');
            if (!email) missing.push('Email');
            if (!phone) missing.push('Phone');
            if (missing.length) {
                showAlert(`Please fill in all required fields in Personal Info: ${missing.join(', ')}`, 'danger');
                return;
            }
            const data = { fullName, email, phone, address, gender, dob, nationality, role: 'student', updatedAt: new Date().toISOString() };
            if (window.FirebaseAPI?.updateUserProfile && key) {
                try { await window.FirebaseAPI.updateUserProfile(key, data); showAlert('Personal information saved successfully', 'success'); }
                catch (e) { showAlert('Failed to save personal information: ' + (e?.message || e), 'danger'); }
            } else {
                // localStorage fallback
                const students = JSON.parse(localStorage.getItem('students') || '[]');
                const idx = students.findIndex(s => s.id === key);
                if (idx !== -1) { students[idx] = { ...students[idx], ...data }; localStorage.setItem('students', JSON.stringify(students)); showAlert('Personal information saved', 'success'); }
            }
        };
        const saveAcademic = async () => {
            const studentIdVal = (modalRoot.querySelector('#studentId')?.value || '').trim();
            const academicLevel = (modalRoot.querySelector('#studentLevel')?.value || '').trim();
            const course = (modalRoot.querySelector('#studentCourse')?.value || '').trim();
            const semester = (modalRoot.querySelector('#studentSemester')?.value || '').trim();
            const email = (modalRoot.querySelector('#studentEmail')?.value || '').trim();
            const missing = [];
            if (!studentIdVal) missing.push('Student ID');
            if (!academicLevel) missing.push('Academic Level');
            if (!course) missing.push('Course');
            if (!semester) missing.push('Semester');
            if (missing.length) {
                showAlert(`Please fill in all required fields in Academic Info: ${missing.join(', ')}`, 'danger');
                return;
            }
            const data = { studentId: studentIdVal, academicLevel, course, semester, role: 'student', email, updatedAt: new Date().toISOString() };
            if (window.FirebaseAPI?.updateUserProfile && key) {
                try { await window.FirebaseAPI.updateUserProfile(key, data); showAlert('Academic information saved successfully', 'success'); }
                catch (e) { showAlert('Failed to save academic information: ' + (e?.message || e), 'danger'); }
            } else {
                const students = JSON.parse(localStorage.getItem('students') || '[]');
                const idx = students.findIndex(s => s.id === key);
                if (idx !== -1) { students[idx] = { ...students[idx], ...data }; localStorage.setItem('students', JSON.stringify(students)); showAlert('Academic information saved', 'success'); }
            }
        };
        const saveGuardian = async () => {
            const name = (modalRoot.querySelector('#guardianName')?.value || '').trim();
            const relationship = (modalRoot.querySelector('#guardianRelationship')?.value || '').trim();
            const phone = (modalRoot.querySelector('#guardianPhone')?.value || '').trim();
            const email = (modalRoot.querySelector('#guardianEmail')?.value || '').trim();
            const address = (modalRoot.querySelector('#guardianAddress')?.value || '').trim();
            const missing = [];
            if (!name) missing.push('Guardian Name');
            if (!relationship) missing.push('Relationship');
            if (!phone) missing.push('Guardian Phone');
            if (!email) missing.push('Guardian Email');
            if (missing.length) {
                showAlert(`Please fill in all required fields in Guardian Info: ${missing.join(', ')}`, 'danger');
                return;
            }
            const data = { guardian: { name, relationship, phone, email, address }, role: 'student', updatedAt: new Date().toISOString() };
            if (window.FirebaseAPI?.updateUserProfile && key) {
                try { await window.FirebaseAPI.updateUserProfile(key, data); showAlert('Guardian information saved successfully', 'success'); }
                catch (e) { showAlert('Failed to save guardian information: ' + (e?.message || e), 'danger'); }
            } else {
                const students = JSON.parse(localStorage.getItem('students') || '[]');
                const idx = students.findIndex(s => s.id === key);
                if (idx !== -1) { students[idx] = { ...students[idx], ...data }; localStorage.setItem('students', JSON.stringify(students)); showAlert('Guardian information saved', 'success'); }
            }
        };
        document.getElementById('savePersonalBtn')?.addEventListener('click', savePersonal);
        document.getElementById('saveAcademicBtn')?.addEventListener('click', saveAcademic);
        document.getElementById('saveGuardianBtn')?.addEventListener('click', saveGuardian);
        
        // Remove modal from DOM when hidden
        document.getElementById('studentFormModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Generate a new student ID: STU<YY>-<4digits>
    function generateStudentId() {
        const yy = String(new Date().getFullYear()).slice(-2);
        const rnd4 = Math.floor(1000 + Math.random() * 9000);
        return `STU${yy}-${rnd4}`;
    }
    
    // Save student data
    function saveStudent(studentKey = null) {
        const useFirebase = !!window.FirebaseAPI?.updateUserProfile;
        const isEdit = !!studentKey;

        // Get form data (aligned to requested editable fields)
        const updateData = {
            fullName: document.getElementById('studentFullName').value,
            email: document.getElementById('studentEmail').value,
            phone: document.getElementById('studentPhone').value,
            address: document.getElementById('studentAddress').value,
            gender: document.getElementById('studentGender').value,
            dob: document.getElementById('studentDob').value,
            nationality: document.getElementById('studentNationality').value,
            studentId: document.getElementById('studentId').value,
            academicLevel: document.getElementById('studentLevel').value,
            course: document.getElementById('studentCourse').value,
            semester: document.getElementById('studentSemester').value,
            role: 'student',
            updatedAt: new Date().toISOString()
        };

        // Basic validation
        if (!updateData.fullName || !updateData.email || !updateData.phone) {
            showAlert('Please fill in all required fields', 'danger');
            return;
        }

        if (useFirebase && isEdit) {
            (async () => {
                try {
                    await window.FirebaseAPI.updateUserProfile(studentKey, updateData);
                    const modal = bootstrap.Modal.getInstance(document.getElementById('studentFormModal'));
                    if (modal) modal.hide();
                    loadStudents();
                    showAlert('Student updated successfully!', 'success');
                    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    App.logActivity(`Updated student: ${updateData.fullName} (${studentKey})`, currentUser.email);
                } catch (err) {
                    showAlert('Failed to update student: ' + (err?.message || err), 'danger');
                }
            })();
            // Firebase: update existing user profile by uid
            return;
        }

        // LocalStorage fallback (supports Add/Edit)
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        if (isEdit) {
            const idx = students.findIndex(s => s.id === studentKey);
            if (idx !== -1) {
                const createdAt = students[idx].createdAt || new Date().toISOString();
                students[idx] = { ...students[idx], ...updateData, id: studentKey, createdAt };
            }
        } else {
            const id = generateStudentId();
            students.push({ ...updateData, id, status: 'Active', createdAt: new Date().toISOString() });
        }
        localStorage.setItem('students', JSON.stringify(students));
        const modal = bootstrap.Modal.getInstance(document.getElementById('studentFormModal'));
        if (modal) modal.hide();
        loadStudents();
        showAlert(`Student ${isEdit ? 'updated' : 'added'} successfully!`, 'success');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        App.logActivity(`${isEdit ? 'Updated' : 'Added'} student: ${updateData.fullName} (${updateData.studentId || studentKey || ''})`, currentUser.email);
    }
    
    // Delete student
    function deleteStudent(studentId) {
        if (window.FirebaseAPI?.updateUserProfile) {
            // Admin cannot delete user profiles due to database rules; show message
            showAlert('Deleting students is not supported from Admin panel.', 'warning');
            return;
        }
        if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            return;
        }
        
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const studentToDelete = students.find(s => s.id === studentId);
        
        if (!studentToDelete) {
            showAlert('Student not found', 'danger');
            return;
        }
        
        // Remove student from the array
        const updatedStudents = students.filter(s => s.id !== studentId);
        localStorage.setItem('students', JSON.stringify(updatedStudents));
        
        // Reload the students list
        loadStudents();
        
        // Show success message
        showAlert('Student deleted successfully', 'success');
        
        // Log the activity
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        App.logActivity(`Deleted student: ${studentToDelete.fullName} (${studentId})`, currentUser.email);
    }
    
    // View student details
    async function viewStudentDetails(studentId) {
        let student = state.students.find(s => (s.uid && s.uid === studentId) || (s.id === studentId));
        // Fetch latest from Firebase to include guardian/status updates
        if ((!student || !student.guardian) && window.FirebaseAPI?.getUserProfile) {
            try {
                const prof = await window.FirebaseAPI.getUserProfile(studentId);
                if (prof) student = { ...prof, uid: studentId };
            } catch (_) {}
        }
        if (!student) {
            showAlert('Student not found', 'danger');
            return;
        }

        // Load enrolments from Firebase /students/{uid}/enrolments or localStorage fallback
        let enrolments = [];
        const uid = student.uid || student.id;
        if (uid && window.FirebaseAPI?.getStudentEnrolments) {
            try {
                const fromDb = await window.FirebaseAPI.getStudentEnrolments(uid);
                if (Array.isArray(fromDb)) enrolments = fromDb;
            } catch (_) {}
        }
        if (!Array.isArray(enrolments) || enrolments.length === 0) {
            const studentsLS = JSON.parse(localStorage.getItem('students') || '[]');
            const st = studentsLS.find(s => (s.uid && s.uid === uid) || s.id === uid);
            if (st && Array.isArray(st.enrolments)) enrolments = st.enrolments;
        }

        // Group enrolments by semester and compute totals
        let enrolmentsSection = '<p class="text-muted">No subject enrolments recorded for this student.</p>';
        if (Array.isArray(enrolments) && enrolments.length > 0) {
            const bySemester = {};
            enrolments.forEach(e => {
                const sem = e.semester || 'Semester';
                if (!bySemester[sem]) bySemester[sem] = [];
                bySemester[sem].push(e);
            });

            enrolmentsSection = `
                <div class="card mb-4">
                    <div class="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Subject Enrolments</h5>
                        <small class="text-muted">Admin can update status, add or remove subjects for this student.</small>
                    </div>
                    <div class="card-body">
                        ${Object.keys(bySemester).sort().map(sem => {
                            const list = bySemester[sem];
                            const totalCredits = list.reduce((sum, e) => sum + (Number(e.credits) || 0), 0);
                            return `
                                <div class="mb-4">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <h6 class="mb-0">${sem}</h6>
                                        <div class="d-flex align-items-center gap-2">
                                            <span class="badge bg-primary">Total Credits: ${totalCredits}</span>
                                            <button type="button" class="btn btn-sm btn-outline-primary add-enrolment-btn" data-semester="${sem}">
                                                <i class="fas fa-plus me-1"></i>Add Subject
                                            </button>
                                        </div>
                                    </div>
                                    <div class="table-responsive">
                                        <table class="table table-sm align-middle mb-0">
                                            <thead class="table-light">
                                                <tr>
                                                    <th style="width: 18%;">Code</th>
                                                    <th>Subject Name</th>
                                                    <th style="width: 12%;">Credits</th>
                                                    <th style="width: 18%;">Status</th>
                                                    <th style="width: 6%;"></th>
                                                </tr>
                                            </thead>
                                            <tbody class="enrolment-tbody" data-semester="${sem}">
                                                ${list.map(e => `
                                                    <tr class="enrolment-row" data-course-id="${e.courseId || ''}">
                                                        <td><input type="text" class="form-control form-control-sm border-0 bg-transparent px-1 enrol-code" value="${e.code || ''}" placeholder="Code"></td>
                                                        <td><input type="text" class="form-control form-control-sm border-0 bg-transparent px-1 enrol-name" value="${e.name || ''}" placeholder="Subject name"></td>
                                                        <td><input type="number" class="form-control form-control-sm border-0 bg-transparent px-1 enrol-credits" value="${e.credits != null ? e.credits : ''}" min="0" step="0.5" placeholder="0"></td>
                                                        <td>
                                                            <select class="form-select form-select-sm enrol-status">
                                                                <option value="enrolled" ${(e.status || 'enrolled') === 'enrolled' ? 'selected' : ''}>Enrolled</option>
                                                                <option value="completed" ${e.status === 'completed' ? 'selected' : ''}>Completed</option>
                                                                <option value="dropped" ${e.status === 'dropped' ? 'selected' : ''}>Dropped</option>
                                                            </select>
                                                        </td>
                                                        <td class="text-center">
                                                            <button type="button" class="btn btn-sm btn-link text-danger p-0 remove-enrolment-row" title="Remove subject">
                                                                <i class="fas fa-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="card-footer d-flex justify-content-between align-items-center">
                        <small class="text-muted">Changes here only affect this student's enrolment records.</small>
                        <button type="button" class="btn btn-primary" id="saveEnrolmentsAdminBtn">
                            <i class="fas fa-save me-1"></i>Save Enrolments
                        </button>
                    </div>
                </div>
            `;
        }
        
        // Format guardian info
        const guardianInfo = student.guardian ? `
            <div class="card mb-4">
                <div class="card-header bg-light">
                    <h5 class="mb-0">Guardian Information</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Name:</strong> ${student.guardian.name || 'N/A'}</p>
                            <p class="mb-1"><strong>Relationship:</strong> ${student.guardian.relationship || 'N/A'}</p>
                            <p class="mb-1"><strong>Phone:</strong> ${student.guardian.phone || 'N/A'}</p>
                            <p class="mb-1"><strong>Email:</strong> ${student.guardian.email || 'N/A'}</p>
                        </div>
                        <div class="col-md-6">
                            <p class="mb-1"><strong>Address:</strong></p>
                            <p class="mb-0">${student.guardian.address || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        ` : '<p class="text-muted">No guardian information available</p>';
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="studentDetailsModal" tabindex="-1" aria-labelledby="studentDetailsModalLabel" aria-hidden="true" data-student-uid="${student.uid || student.id}" data-program-name="${student.course || ''}">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="studentDetailsModalLabel">Student Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-4">
                                <div class="col-md-3 text-center">
                                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName || 'Student')}&background=4e73df&color=fff&size=120" 
                                         class="rounded-circle img-thumbnail mb-2" 
                                         alt="${student.fullName || 'Student'}"
                                         style="width: 120px; height: 120px; object-fit: cover;">
                                    <h5 class="mb-1">${student.fullName || 'N/A'}</h5>
                                    <span class="badge bg-primary">${student.academicLevel || 'N/A'}</span>
                                    <div class="mt-2">
                                        <span class="badge ${(student.status || 'Active') === 'Active' ? 'bg-success' : 'bg-secondary'}">
                                            ${student.status || 'Active'}
                                        </span>
                                    </div>
                                </div>
                                <div class="col-md-9">
                                    <div class="card mb-4">
                                        <div class="card-header bg-light">
                                            <h5 class="mb-0">Personal Information</h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <p class="mb-1"><strong>Student ID:</strong> ${student.studentId || student.id || 'N/A'}</p>
                                                    <p class="mb-1"><strong>IC/Passport:</strong> ${student.maskedIC || student.icNumber || 'N/A'}</p>
                                                    <p class="mb-1"><strong>Gender:</strong> ${student.gender || 'N/A'}</p>
                                                    <p class="mb-1"><strong>Date of Birth:</strong> ${student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</p>
                                                </div>
                                                <div class="col-md-6">
                                                    <p class="mb-1"><strong>Email:</strong> ${student.email || 'N/A'}</p>
                                                    <p class="mb-1"><strong>Phone:</strong> ${student.phone || 'N/A'}</p>
                                                    <p class="mb-1"><strong>Nationality:</strong> ${student.nationality || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div class="mt-2">
                                                <p class="mb-1"><strong>Address:</strong></p>
                                                <p class="mb-0">${student.address || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="card mb-3">
                                <div class="card-header bg-light">
                                    <h5 class="mb-0">Academic Information</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <p class="mb-1"><strong>Course:</strong> ${student.course || 'N/A'}</p>
                                            <p class="mb-1"><strong>Level:</strong> ${student.academicLevel || 'N/A'}</p>
                                        </div>
                                        <div class="col-md-6">
                                            <p class="mb-1"><strong>Semester:</strong> ${student.semester || 'N/A'}</p>
                                            <p class="mb-1"><strong>Status:</strong> ${student.status || 'Active'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            ${enrolmentsSection}

                            ${guardianInfo}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" onclick="StudentsPage.editStudent('${student.uid || student.id}')">
                                <i class="fas fa-edit me-1"></i> Edit Student
                            </button>
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i> Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to the DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Initialize the modal
        const modalRoot = document.getElementById('studentDetailsModal');
        const modal = new bootstrap.Modal(modalRoot);
        modal.show();
        
        // Wire up admin enrolment management inside this modal
        const saveBtn = modalRoot.querySelector('#saveEnrolmentsAdminBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const uidTarget = modalRoot.getAttribute('data-student-uid');
                if (!uidTarget) return;
                const updatedEnrolments = [];
                const defaultProgramName = modalRoot.getAttribute('data-program-name') || '';
                modalRoot.querySelectorAll('.enrolment-tbody').forEach(tbody => {
                    const sem = tbody.getAttribute('data-semester') || 'Semester';
                    tbody.querySelectorAll('.enrolment-row').forEach(row => {
                        const code = row.querySelector('.enrol-code')?.value.trim() || '';
                        const name = row.querySelector('.enrol-name')?.value.trim() || '';
                        const creditsVal = row.querySelector('.enrol-credits')?.value || '';
                        const credits = creditsVal === '' ? null : Number(creditsVal);
                        const programName = defaultProgramName;
                        const status = row.querySelector('.enrol-status')?.value || 'enrolled';
                        if (!code && !name) return; // skip empty rows
                        updatedEnrolments.push({
                            courseId: row.getAttribute('data-course-id') || '',
                            code,
                            name,
                            credits,
                            programName,
                            semester: sem,
                            status
                        });
                    });
                });

                try {
                    if (window.FirebaseAPI?.saveStudentEnrolments) {
                        await window.FirebaseAPI.saveStudentEnrolments(uidTarget, updatedEnrolments);
                    } else {
                        const studentsLS = JSON.parse(localStorage.getItem('students') || '[]');
                        const idx = studentsLS.findIndex(s => (s.uid && s.uid === uidTarget) || s.id === uidTarget);
                        if (idx !== -1) {
                            studentsLS[idx].enrolments = updatedEnrolments;
                            localStorage.setItem('students', JSON.stringify(studentsLS));
                        }
                    }
                    showAlert('Subject enrolments updated successfully.', 'success');
                } catch (e) {
                    console.error('Failed to update enrolments from admin side', e);
                    showAlert('Failed to update enrolments. Please try again later.', 'danger');
                }
            });
        }

        // Handle remove and add buttons within this modal
        modalRoot.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-enrolment-row');
            if (removeBtn) {
                e.preventDefault();
                const row = removeBtn.closest('.enrolment-row');
                if (row) row.remove();
                return;
            }
            const addBtn = e.target.closest('.add-enrolment-btn');
            if (addBtn) {
                e.preventDefault();
                const sem = addBtn.getAttribute('data-semester') || 'Semester';
                const tbody = modalRoot.querySelector(`.enrolment-tbody[data-semester="${sem}"]`);
                if (!tbody) return;
                const tr = document.createElement('tr');
                tr.className = 'enrolment-row';
                tr.innerHTML = `
                    <td><input type="text" class="form-control form-control-sm border-0 bg-transparent px-1 enrol-code" value="" placeholder="Code"></td>
                    <td><input type="text" class="form-control form-control-sm border-0 bg-transparent px-1 enrol-name" value="" placeholder="Subject name"></td>
                    <td><input type="number" class="form-control form-control-sm border-0 bg-transparent px-1 enrol-credits" value="" min="0" step="0.5" placeholder="0"></td>
                    <td>
                        <select class="form-select form-select-sm enrol-status">
                            <option value="enrolled" selected>Enrolled</option>
                            <option value="completed">Completed</option>
                            <option value="dropped">Dropped</option>
                        </select>
                    </td>
                    <td class="text-center">
                        <button type="button" class="btn btn-sm btn-outline-danger remove-enrolment-row" title="Remove subject">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            }
        });

        // Remove modal from DOM when hidden
        modalRoot.addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Search students
        const searchInput = document.getElementById('searchStudents');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                loadStudents(this.value);
            });
        }
        
        // Add student button
        const addStudentBtn = document.getElementById('addStudentBtn');
        if (addStudentBtn) {
            addStudentBtn.addEventListener('click', function() {
                showStudentForm();
            });
        }
        
        // View student details
        document.addEventListener('click', function(e) {
            // View student
            if (e.target.closest('.view-student')) {
                e.preventDefault();
                const studentId = e.target.closest('.view-student').getAttribute('data-id');
                viewStudentDetails(studentId);
            }
            
            // Edit student
            if (e.target.closest('.edit-student')) {
                e.preventDefault();
                const studentId = e.target.closest('.edit-student').getAttribute('data-id');
                showStudentForm(studentId);
            }
            
            // Delete student
            if (e.target.closest('.delete-student')) {
                e.preventDefault();
                const studentId = e.target.closest('.delete-student').getAttribute('data-id');
                deleteStudent(studentId);
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
        
        // Prefer placing inside an open modal so it's visible above the backdrop
        const modalBody = document.querySelector('#studentFormModal.show .modal-body') || document.querySelector('#studentFormModal .modal-body');
        const modalContent = document.querySelector('#studentFormModal.show .modal-content') || document.querySelector('#studentFormModal .modal-content');
        const globalContainer = document.querySelector('.container-fluid') || document.body;
        const container = modalBody || modalContent || document.querySelector('.modal.show .modal-body') || document.querySelector('.modal.show .modal-content') || globalContainer;
        
        if (container.firstChild) {
            container.insertBefore(alertDiv, container.firstChild);
        } else {
            container.appendChild(alertDiv);
        }
        
        // Ensure alert is visible at top of modal
        try { container.scrollTop = 0; } catch(_) {}
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            try {
                const alert = bootstrap.Alert.getOrCreateInstance(alertDiv);
                if (alert) alert.close();
            } catch(_) {
                alertDiv.remove();
            }
        }, 5000);
    }
    
    // Public API
    return {
        init,
        editStudent: showStudentForm,
        viewStudent: viewStudentDetails
    };
})();
