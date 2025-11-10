// Programs Management Page Module
const ProgramsPage = (function() {
    // Initialize the programs page
    function init() {
        loadPrograms();
        setupEventListeners();
    }

    // Load programs data
    function loadPrograms(searchTerm = '') {
        let programs = JSON.parse(localStorage.getItem('programs') || '[]');
        
        // If no programs exist, create sample data
        if (programs.length === 0) {
            programs = [
                {
                    id: 'PROG001',
                    name: 'Computer Science',
                    code: 'CS',
                    duration: '3 years',
                    level: 'Degree',
                    department: 'Computing',
                    totalCredits: 120,
                    fee: 35000,
                    description: 'Bachelor of Computer Science program',
                    courses: ['CS101', 'CS102'],
                    status: 'Active',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'PROG002',
                    name: 'Business Administration',
                    code: 'BA',
                    duration: '3 years',
                    level: 'Degree',
                    department: 'Business',
                    totalCredits: 120,
                    fee: 32000,
                    description: 'Bachelor of Business Administration program',
                    courses: ['BUS101', 'BUS102'],
                    status: 'Active',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('programs', JSON.stringify(programs));
        }

        // Filter programs if search term is provided
        let filteredPrograms = [...programs];
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredPrograms = programs.filter(program => 
                (program.name && program.name.toLowerCase().includes(term)) ||
                (program.code && program.code.toLowerCase().includes(term)) ||
                (program.department && program.department.toLowerCase().includes(term))
            );
        }

        // Generate programs cards
        const programsHTML = filteredPrograms.map(program => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">${program.name}</h5>
                        <span class="badge bg-${program.status === 'Active' ? 'success' : 'secondary'}">${program.status}</span>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted">Code:</span>
                            <strong>${program.code}</strong>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span class="text-muted">Level:</span>
                            <strong>${program.level}</strong>
                        </div>
                        <div class="d-flex justify-content-between mb-3">
                            <span class="text-muted">Department:</span>
                            <strong>${program.department}</strong>
                        </div>
                        <div class="mb-3">
                            <p class="small text-muted mb-1">Description:</p>
                            <p class="small">${program.description || 'No description available.'}</p>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-primary">${program.courses?.length || 0} Courses</span>
                            <span class="text-primary fw-bold">RM${program.fee?.toLocaleString() || '0'}</span>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-top-0 pt-0">
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-sm btn-outline-primary view-program" data-id="${program.id}">
                                <i class="fas fa-eye me-1"></i> View
                            </button>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" 
                                        data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li><a class="dropdown-item edit-program" href="#" data-id="${program.id}">
                                        <i class="fas fa-edit me-2"></i>Edit
                                    </a></li>
                                    <li><a class="dropdown-item text-danger delete-program" href="#" data-id="${program.id}">
                                        <i class="fas fa-trash-alt me-2"></i>Delete
                                    </a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Set the HTML content
        document.getElementById('mainContent').innerHTML = `
            <div class="container-fluid py-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 class="mb-0">Programs Management</h2>
                        <nav aria-label="breadcrumb" class="d-none d-md-block mt-2">
                            <ol class="breadcrumb mb-0">
                                <li class="breadcrumb-item"><a href="#" data-page="dashboard">Dashboard</a></li>
                                <li class="breadcrumb-item active" aria-current="page">Programs</li>
                            </ol>
                        </nav>
                    </div>
                    <button class="btn btn-primary" id="addProgramBtn">
                        <i class="fas fa-plus me-1"></i> Add Program
                    </button>
                </div>
                
                <div class="card shadow-sm mb-4">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="input-group">
                                    <span class="input-group-text bg-transparent"><i class="fas fa-search"></i></span>
                                    <input type="text" class="form-control" id="searchPrograms" 
                                           placeholder="Search programs..." value="${searchTerm}">
                                </div>
                            </div>
                            <div class="col-md-3">
                                <select class="form-select" id="filterDepartment">
                                    <option value="">All Departments</option>
                                    <option value="Computing">Computing</option>
                                    <option value="Business">Business</option>
                                    <option value="Engineering">Engineering</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <select class="form-select" id="filterLevel">
                                    <option value="">All Levels</option>
                                    <option value="Foundation">Foundation</option>
                                    <option value="Diploma">Diploma</option>
                                    <option value="Degree">Degree</option>
                                    <option value="Masters">Masters</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row">
                    ${filteredPrograms.length > 0 ? programsHTML : `
                        <div class="col-12">
                            <div class="card shadow-sm">
                                <div class="card-body text-center py-5">
                                    <i class="fas fa-graduation-cap fa-3x text-muted mb-3"></i>
                                    <h5 class="mb-3">No programs found</h5>
                                    <p class="text-muted">Try adjusting your search or add a new program.</p>
                                    <button class="btn btn-primary" id="addFirstProgramBtn">
                                        <i class="fas fa-plus me-1"></i> Add Program
                                    </button>
                                </div>
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        // Re-attach event listeners
        setupEventListeners();
    }
    
    // Show add/edit program modal
    function showProgramForm(programId = null) {
        let program = null;
        let isEdit = false;
        
        if (programId) {
            const programs = JSON.parse(localStorage.getItem('programs') || '[]');
            program = programs.find(p => p.id === programId);
            isEdit = true;
        }
        
        // Get available courses for the courses multi-select
        const courses = JSON.parse(localStorage.getItem('courses') || '[]');
        const coursesOptions = courses.map(course => 
            `<option value="${course.code}" ${program?.courses?.includes(course.code) ? 'selected' : ''}>
                ${course.code} - ${course.name}
            </option>`
        ).join('');
        
        const modalHTML = `
            <div class="modal fade" id="programFormModal" tabindex="-1" aria-labelledby="programFormModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="programFormModalLabel">
                                ${isEdit ? 'Edit' : 'Add New'} Program
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form id="programForm">
                            <div class="modal-body">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="programName" class="form-label">Program Name <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="programName" 
                                               value="${program?.name || ''}" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="programCode" class="form-label">Program Code <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="programCode" 
                                               value="${program?.code || ''}" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="programLevel" class="form-label">Level <span class="text-danger">*</span></label>
                                        <select class="form-select" id="programLevel" required>
                                            <option value="">Select Level</option>
                                            <option value="Foundation" ${program?.level === 'Foundation' ? 'selected' : ''}>Foundation</option>
                                            <option value="Diploma" ${program?.level === 'Diploma' ? 'selected' : ''}>Diploma</option>
                                            <option value="Degree" ${program?.level === 'Degree' ? 'selected' : ''}>Degree</option>
                                            <option value="Masters" ${program?.level === 'Masters' ? 'selected' : ''}>Masters</option>
                                            <option value="PhD" ${program?.level === 'PhD' ? 'selected' : ''}>PhD</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="programDepartment" class="form-label">Department <span class="text-danger">*</span></label>
                                        <select class="form-select" id="programDepartment" required>
                                            <option value="">Select Department</option>
                                            <option value="Computing" ${program?.department === 'Computing' ? 'selected' : ''}>Computing</option>
                                            <option value="Business" ${program?.department === 'Business' ? 'selected' : ''}>Business</option>
                                            <option value="Engineering" ${program?.department === 'Engineering' ? 'selected' : ''}>Engineering</option>
                                            <option value="Science" ${program?.department === 'Science' ? 'selected' : ''}>Science</option>
                                            <option value="Arts" ${program?.department === 'Arts' ? 'selected' : ''}>Arts</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="programDuration" class="form-label">Duration <span class="text-danger">*</span></label>
                                        <div class="input-group">
                                            <input type="number" class="form-control" id="programDuration" 
                                                   value="${program?.duration?.split(' ')[0] || ''}" required>
                                            <select class="form-select" id="programDurationUnit" style="max-width: 100px;">
                                                <option value="months" ${program?.duration?.includes('month') ? 'selected' : ''}>Months</option>
                                                <option value="years" ${!program?.duration || program?.duration?.includes('year') ? 'selected' : ''}>Years</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="programFee" class="form-label">Total Fee (RM) <span class="text-danger">*</span></label>
                                        <input type="number" class="form-control" id="programFee" 
                                               value="${program?.fee || ''}" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="programDescription" class="form-label">Description</label>
                                    <textarea class="form-control" id="programDescription" rows="3">${program?.description || ''}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="programCourses" class="form-label">Courses</label>
                                    <select class="form-select" id="programCourses" multiple>
                                        ${coursesOptions}
                                    </select>
                                    <div class="form-text">Hold Ctrl/Cmd to select multiple courses</div>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="programStatus" 
                                               ${!program || program.status === 'Active' ? 'checked' : ''}>
                                        <label class="form-check-label" for="programStatus">Active Program</label>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                    <i class="fas fa-times me-1"></i> Cancel
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i> ${isEdit ? 'Update' : 'Save'} Program
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
        const modal = new bootstrap.Modal(document.getElementById('programFormModal'));
        modal.show();
        
        // Initialize select2 for better dropdowns (if available)
        if (typeof $ !== 'undefined' && $.fn.select2) {
            $('#programCourses').select2({
                placeholder: 'Select courses',
                width: '100%',
                dropdownParent: $('#programFormModal')
            });
        }
        
        // Handle form submission
        document.getElementById('programForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProgram(program?.id);
        });
        
        // Remove modal from DOM when hidden
        document.getElementById('programFormModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Save program data
    function saveProgram(programId = null) {
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        const isEdit = !!programId;
        
        // Get form data
        const programData = {
            id: programId || 'PROG' + Math.floor(1000 + Math.random() * 9000),
            name: document.getElementById('programName').value,
            code: document.getElementById('programCode').value,
            level: document.getElementById('programLevel').value,
            department: document.getElementById('programDepartment').value,
            duration: `${document.getElementById('programDuration').value} ${document.getElementById('programDurationUnit').value}`,
            fee: parseFloat(document.getElementById('programFee').value) || 0,
            description: document.getElementById('programDescription').value,
            courses: Array.from(document.getElementById('programCourses').selectedOptions).map(opt => opt.value),
            status: document.getElementById('programStatus').checked ? 'Active' : 'Inactive',
            createdAt: isEdit ? programs.find(p => p.id === programId)?.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Validate required fields
        if (!programData.name || !programData.code || !programData.level || !programData.department) {
            showAlert('Please fill in all required fields', 'danger');
            return;
        }
        
        // Save to localStorage
        if (isEdit) {
            // Update existing program
            const index = programs.findIndex(p => p.id === programId);
            if (index !== -1) {
                programs[index] = { ...programs[index], ...programData };
            }
        } else {
            // Add new program
            programs.push(programData);
        }
        
        localStorage.setItem('programs', JSON.stringify(programs));
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('programFormModal'));
        if (modal) modal.hide();
        
        // Reload the programs list
        loadPrograms();
        
        // Show success message
        showAlert(`Program ${isEdit ? 'updated' : 'added'} successfully!`, 'success');
        
        // Log the activity
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        App.logActivity(`${isEdit ? 'Updated' : 'Added'} program: ${programData.name} (${programData.code})`, currentUser.email);
    }
    
    // Delete program
    function deleteProgram(programId) {
        if (!confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
            return;
        }
        
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        const programToDelete = programs.find(p => p.id === programId);
        
        if (!programToDelete) {
            showAlert('Program not found', 'danger');
            return;
        }
        
        // Check if any students are enrolled in this program
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const enrolledStudents = students.filter(s => s.programId === programId);
        
        if (enrolledStudents.length > 0) {
            showAlert(`Cannot delete program. ${enrolledStudents.length} student(s) are enrolled in this program.`, 'danger');
            return;
        }
        
        // Remove program from the array
        const updatedPrograms = programs.filter(p => p.id !== programId);
        localStorage.setItem('programs', JSON.stringify(updatedPrograms));
        
        // Reload the programs list
        loadPrograms();
        
        // Show success message
        showAlert('Program deleted successfully', 'success');
        
        // Log the activity
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        App.logActivity(`Deleted program: ${programToDelete.name} (${programId})`, currentUser.email);
    }
    
    // View program details
    function viewProgramDetails(programId) {
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        const program = programs.find(p => p.id === programId);
        
        if (!program) {
            showAlert('Program not found', 'danger');
            return;
        }
        
        // Get courses details
        const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
        const programCourses = allCourses.filter(course => program.courses?.includes(course.code));
        
        // Format courses list
        const coursesList = programCourses.length > 0 
            ? programCourses.map(course => `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                        <h6 class="mb-0">${course.code} - ${course.name}</h6>
                        <small class="text-muted">${course.department} • ${course.credits} Credits</small>
                    </div>
                    <span class="badge bg-light text-dark">${course.level}</span>
                </div>
            `).join('')
            : '<div class="text-muted">No courses assigned to this program.</div>';
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="programDetailsModal" tabindex="-1" aria-labelledby="programDetailsModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="programDetailsModalLabel">Program Details</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-4">
                                <div class="col-md-8">
                                    <h3>${program.name}</h3>
                                    <p class="text-muted">${program.description || 'No description available.'}</p>
                                    
                                    <div class="row mt-4">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <h6 class="text-muted mb-1">Program Code</h6>
                                                <p class="mb-0">${program.code}</p>
                                            </div>
                                            <div class="mb-3">
                                                <h6 class="text-muted mb-1">Department</h6>
                                                <p class="mb-0">${program.department}</p>
                                            </div>
                                            <div class="mb-3">
                                                <h6 class="text-muted mb-1">Duration</h6>
                                                <p class="mb-0">${program.duration}</p>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <h6 class="text-muted mb-1">Level</h6>
                                                <p class="mb-0">${program.level}</p>
                                            </div>
                                            <div class="mb-3">
                                                <h6 class="text-muted mb-1">Total Credits</h6>
                                                <p class="mb-0">${program.totalCredits || 'N/A'}</p>
                                            </div>
                                            <div class="mb-3">
                                                <h6 class="text-muted mb-1">Total Fee</h6>
                                                <p class="mb-0">RM${program.fee?.toLocaleString() || '0.00'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 text-center">
                                    <div class="card shadow-sm h-100">
                                        <div class="card-body d-flex flex-column justify-content-center">
                                            <div class="mb-3">
                                                <i class="fas fa-graduation-cap fa-4x text-primary"></i>
                                            </div>
                                            <h5 class="mb-3">${program.name}</h5>
                                            <span class="badge bg-${program.status === 'Active' ? 'success' : 'secondary'} mb-3">
                                                ${program.status}
                                            </span>
                                            <p class="small text-muted mb-0">
                                                Last updated: ${new Date(program.updatedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="card shadow-sm mb-4">
                                <div class="card-header bg-light">
                                    <h5 class="mb-0">Program Courses</h5>
                                </div>
                                <div class="card-body">
                                    ${coursesList}
                                </div>
                            </div>
                            
                            <div class="card shadow-sm">
                                <div class="card-header bg-light">
                                    <h5 class="mb-0">Program Statistics</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row text-center">
                                        <div class="col-md-4 mb-3 mb-md-0">
                                            <div class="p-3 bg-light rounded">
                                                <h3 class="text-primary mb-0">${programCourses.length}</h3>
                                                <p class="mb-0 text-muted">Courses</p>
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-3 mb-md-0">
                                            <div class="p-3 bg-light rounded">
                                                <h3 class="text-primary mb-0">
                                                    ${JSON.parse(localStorage.getItem('students') || '[]').filter(s => s.programId === program.id).length}
                                                </h3>
                                                <p class="mb-0 text-muted">Enrolled Students</p>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="p-3 bg-light rounded">
                                                <h3 class="text-primary mb-0">${program.totalCredits || 'N/A'}</h3>
                                                <p class="mb-0 text-muted">Total Credits</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" onclick="ProgramsPage.editProgram('${program.id}')">
                                <i class="fas fa-edit me-1"></i> Edit Program
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
        const modal = new bootstrap.Modal(document.getElementById('programDetailsModal'));
        modal.show();
        
        // Remove modal from DOM when hidden
        document.getElementById('programDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Search programs
        const searchInput = document.getElementById('searchPrograms');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                loadPrograms(this.value);
            });
        }
        
        // Filter programs by department
        const filterDepartment = document.getElementById('filterDepartment');
        if (filterDepartment) {
            filterDepartment.addEventListener('change', function() {
                // Implement department filtering if needed
                // For now, just reload with search term
                loadPrograms(document.getElementById('searchPrograms')?.value || '');
            });
        }
        
        // Filter programs by level
        const filterLevel = document.getElementById('filterLevel');
        if (filterLevel) {
            filterLevel.addEventListener('change', function() {
                // Implement level filtering if needed
                // For now, just reload with search term
                loadPrograms(document.getElementById('searchPrograms')?.value || '');
            });
        }
        
        // Add program button
        const addProgramBtn = document.getElementById('addProgramBtn');
        if (addProgramBtn) {
            addProgramBtn.addEventListener('click', function() {
                showProgramForm();
            });
        }
        
        // Add first program button (shown when no programs exist)
        const addFirstProgramBtn = document.getElementById('addFirstProgramBtn');
        if (addFirstProgramBtn) {
            addFirstProgramBtn.addEventListener('click', function() {
                showProgramForm();
            });
        }
        
        // View program details
        document.addEventListener('click', function(e) {
            // View program
            if (e.target.closest('.view-program')) {
                e.preventDefault();
                const programId = e.target.closest('.view-program').getAttribute('data-id');
                viewProgramDetails(programId);
            }
            
            // Edit program
            if (e.target.closest('.edit-program')) {
                e.preventDefault();
                const programId = e.target.closest('.edit-program').getAttribute('data-id');
                showProgramForm(programId);
            }
            
            // Delete program
            if (e.target.closest('.delete-program')) {
                e.preventDefault();
                const programId = e.target.closest('.delete-program').getAttribute('data-id');
                deleteProgram(programId);
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
        editProgram: showProgramForm,
        viewProgram: viewProgramDetails
    };
})();
