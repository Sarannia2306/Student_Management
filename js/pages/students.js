// Students Management Page Module
const StudentsPage = (function() {
    // Initialize the students page
    function init() {
        loadStudents();
        setupEventListeners();
    }

    // Load students data
    function loadStudents(searchTerm = '') {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        let filteredStudents = [...students];
        
        // Filter students if search term is provided
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredStudents = students.filter(student => 
                (student.fullName && student.fullName.toLowerCase().includes(term)) ||
                (student.email && student.email.toLowerCase().includes(term)) ||
                (student.id && student.id.toString().toLowerCase().includes(term))
            );
        }

        // Generate students table rows
        const studentsRows = filteredStudents.map(student => `
            <tr>
                <td>${student.id || 'N/A'}</td>
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
                <td>${student.icNumber || 'N/A'}</td>
                <td>${student.phone || 'N/A'}</td>
                <td>
                    <span class="badge bg-info text-dark">${student.academicLevel || 'N/A'}</span>
                </td>
                <td>
                    <span class="badge bg-success">Active</span>
                </td>
                <td>
                    <div class="dropdown
                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" 
                                data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item view-student" href="#" data-id="${student.id}">
                                <i class="fas fa-eye me-2"></i>View Details
                            </a></li>
                            <li><a class="dropdown-item edit-student" href="#" data-id="${student.id}">
                                <i class="fas fa-edit me-2"></i>Edit
                            </a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger delete-student" href="#" data-id="${student.id}">
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
                    <div class="d-flex
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
                            <span class="fw-semibold">${students.length}</span> students
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

        // Re-attach event listeners
        setupEventListeners();
    }

    // Show add/edit student modal
    function showStudentForm(studentId = null) {
        let student = null;
        let isEdit = false;
        
        if (studentId) {
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            student = students.find(s => s.id === studentId);
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
                                                       value="${student?.icNumber || ''}" required>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="studentEmail" class="form-label">Email Address <span class="text-danger">*</span></label>
                                                <input type="email" class="form-control" id="studentEmail" 
                                                       value="${student?.email || ''}" required>
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
                                    </div>
                                    
                                    <!-- Academic Info Tab -->
                                    <div class="tab-pane fade" id="academic" role="tabpanel" aria-labelledby="academic-tab">
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="studentId" class="form-label">Student ID</label>
                                                <input type="text" class="form-control" id="studentId" 
                                                       value="${student?.id || generateStudentId()}" readonly>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label for="studentIntake" class="form-label">Intake</label>
                                                <select class="form-select" id="studentIntake">
                                                    <option value="">Select Intake</option>
                                                    <option value="January 2024" ${student?.intake === 'January 2024' ? 'selected' : ''}>January 2024</option>
                                                    <option value="April 2024" ${student?.intake === 'April 2024' ? 'selected' : ''}>April 2024</option>
                                                    <option value="July 2024" ${student?.intake === 'July 2024' ? 'selected' : ''}>July 2024</option>
                                                    <option value="October 2024" ${student?.intake === 'October 2024' ? 'selected' : ''}>October 2024</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="studentProgram" class="form-label">Program</label>
                                                <select class="form-select" id="studentProgram">
                                                    <option value="">Select Program</option>
                                                    <option value="Computer Science" ${student?.program === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                                                    <option value="Information Technology" ${student?.program === 'Information Technology' ? 'selected' : ''}>Information Technology</option>
                                                    <option value="Business Administration" ${student?.program === 'Business Administration' ? 'selected' : ''}>Business Administration</option>
                                                    <option value="Engineering" ${student?.program === 'Engineering' ? 'selected' : ''}>Engineering</option>
                                                </select>
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
                                        <div class="mb-3">
                                            <label for="studentCourses" class="form-label">Enrolled Courses</label>
                                            <select class="form-select" id="studentCourses" multiple>
                                                <option value="CS101" ${student?.courses?.includes('CS101') ? 'selected' : ''}>CS101 - Introduction to Programming</option>
                                                <option value="MATH201" ${student?.courses?.includes('MATH201') ? 'selected' : ''}>MATH201 - Calculus</option>
                                                <option value="ENG101" ${student?.courses?.includes('ENG101') ? 'selected' : ''}>ENG101 - English Composition</option>
                                                <option value="PHY301" ${student?.courses?.includes('PHY301') ? 'selected' : ''}>PHY301 - Physics</option>
                                                <option value="CHEM101" ${student?.courses?.includes('CHEM101') ? 'selected' : ''}>CHEM101 - Chemistry</option>
                                            </select>
                                            <div class="form-text">Hold Ctrl/Cmd to select multiple courses</div>
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
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-times me-1"></i> Cancel
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i> ${isEdit ? 'Update' : 'Save'} Student
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
        const modal = new bootstrap.Modal(document.getElementById('studentFormModal'));
        modal.show();
        
        // Initialize select2 for better dropdowns (if available)
        if (typeof $ !== 'undefined' && $.fn.select2) {
            $('#studentCourses').select2({
                placeholder: 'Select courses',
                width: '100%',
                dropdownParent: $('#studentFormModal')
            });
        }
        
        // Handle form submission
        document.getElementById('studentForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            saveStudent(student?.id);
        });
        
        // Remove modal from DOM when hidden
        document.getElementById('studentFormModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Generate a new student ID
    function generateStudentId() {
        const prefix = 'STU';
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        return `${prefix}${randomNum}`;
    }
    
    // Save student data
    function saveStudent(studentId = null) {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const isEdit = !!studentId;
        
        // Get form data
        const studentData = {
            id: studentId || generateStudentId(),
            fullName: document.getElementById('studentFullName').value,
            icNumber: document.getElementById('studentIcNumber').value,
            email: document.getElementById('studentEmail').value,
            phone: document.getElementById('studentPhone').value,
            address: document.getElementById('studentAddress').value,
            gender: document.getElementById('studentGender').value,
            dob: document.getElementById('studentDob').value,
            nationality: document.getElementById('studentNationality').value,
            intake: document.getElementById('studentIntake').value,
            program: document.getElementById('studentProgram').value,
            academicLevel: document.getElementById('studentLevel').value,
            courses: Array.from(document.getElementById('studentCourses').selectedOptions).map(opt => opt.value),
            guardian: {
                name: document.getElementById('guardianName').value,
                relationship: document.getElementById('guardianRelationship').value,
                phone: document.getElementById('guardianPhone').value,
                email: document.getElementById('guardianEmail').value,
                address: document.getElementById('guardianAddress').value
            },
            status: 'Active',
            createdAt: isEdit ? students.find(s => s.id === studentId)?.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Validate required fields
        if (!studentData.fullName || !studentData.icNumber || !studentData.email || !studentData.phone) {
            showAlert('Please fill in all required fields', 'danger');
            return;
        }
        
        // Check if email already exists (for new students or when email is changed)
        const emailExists = students.some(s => 
            s.email === studentData.email && (!isEdit || s.id !== studentId)
        );
        
        if (emailExists) {
            showAlert('A student with this email already exists', 'danger');
            return;
        }
        
        // Save to localStorage
        if (isEdit) {
            // Update existing student
            const index = students.findIndex(s => s.id === studentId);
            if (index !== -1) {
                students[index] = { ...students[index], ...studentData };
            }
        } else {
            // Add new student
            students.push(studentData);
        }
        
        localStorage.setItem('students', JSON.stringify(students));
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('studentFormModal'));
        if (modal) modal.hide();
        
        // Reload the students list
        loadStudents();
        
        // Show success message
        showAlert(`Student ${isEdit ? 'updated' : 'added'} successfully!`, 'success');
        
        // Log the activity
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        App.logActivity(`${isEdit ? 'Updated' : 'Added'} student: ${studentData.fullName} (${studentData.id})`, currentUser.email);
    }
    
    // Delete student
    function deleteStudent(studentId) {
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
    function viewStudentDetails(studentId) {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const student = students.find(s => s.id === studentId);
        
        if (!student) {
            showAlert('Student not found', 'danger');
            return;
        }
        
        // Format courses for display
        const coursesList = student.courses?.length 
            ? student.courses.map(course => `<span class="badge bg-secondary me-1 mb-1">${course}</span>`).join('')
            : 'No courses enrolled';
        
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
            <div class="modal fade" id="studentDetailsModal" tabindex="-1" aria-labelledby="studentDetailsModalLabel" aria-hidden="true">
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
                                        <span class="badge ${student.status === 'Active' ? 'bg-success' : 'bg-secondary'}">
                                            ${student.status || 'Inactive'}
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
                                                    <p class="mb-1"><strong>Student ID:</strong> ${student.id || 'N/A'}</p>
                                                    <p class="mb-1"><strong>IC/Passport:</strong> ${student.icNumber || 'N/A'}</p>
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
                                    
                                    <div class="card mb-3">
                                        <div class="card-header bg-light">
                                            <h5 class="mb-0">Academic Information</h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <p class="mb-1"><strong>Program:</strong> ${student.program || 'N/A'}</p>
                                                    <p class="mb-1"><strong>Level:</strong> ${student.academicLevel || 'N/A'}</p>
                                                </div>
                                                <div class="col-md-6">
                                                    <p class="mb-1"><strong>Intake:</strong> ${student.intake || 'N/A'}</p>
                                                    <p class="mb-1"><strong>Status:</strong> ${student.status || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div class="mt-2">
                                                <p class="mb-1"><strong>Enrolled Courses:</strong></p>
                                                <div>${coursesList}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            ${guardianInfo}
                        </div>
                        <div class="modal-footer
                            <button type="button" class="btn btn-primary" onclick="StudentsPage.editStudent('${student.id}')">
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
        const modal = new bootstrap.Modal(document.getElementById('studentDetailsModal'));
        modal.show();
        
        // Remove modal from DOM when hidden
        document.getElementById('studentDetailsModal').addEventListener('hidden.bs.modal', function() {
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
        editStudent: showStudentForm,
        viewStudent: viewStudentDetails
    };
})();
