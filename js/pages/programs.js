// Programs Management Page Module
const ProgramsPage = (function() {
    // Initialize the programs page
    function init() {
        loadPrograms();
        setupEventListeners();
    }

    // Load programs data 
    function loadPrograms(searchTerm = '', departmentFilter = '', levelFilter = '') {
        const useFirebase = !!window.FirebaseAPI?.listPrograms;

        const render = (programsRaw) => {
            let programs = Array.isArray(programsRaw) ? programsRaw : [];

            if (!useFirebase && programs.length === 0) {
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
            }

            // Always sync latest programs list to localStorage so View/Edit can use it
            try {
                localStorage.setItem('programs', JSON.stringify(programs));
            } catch (_) {}

        // Build dynamic filter option lists from all programs
        const departmentOptions = Array.from(new Set(
            programs
                .map(p => (p && p.department ? String(p.department).trim() : ''))
                .filter(v => v)
        )).sort((a, b) => a.localeCompare(b));

        const levelOptions = Array.from(new Set(
            programs
                .map(p => (p && p.level ? String(p.level).trim() : ''))
                .filter(v => v)
        )).sort((a, b) => a.localeCompare(b));

        // Apply filters: search term, department, and level
        let filteredPrograms = [...programs];

        // Text search across name, code, department
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredPrograms = filteredPrograms.filter(program => 
                (program.name && program.name.toLowerCase().includes(term)) ||
                (program.code && program.code.toLowerCase().includes(term)) ||
                (program.department && program.department.toLowerCase().includes(term))
            );
        }

        // Department filter
        if (departmentFilter) {
            const dep = departmentFilter.toLowerCase();
            filteredPrograms = filteredPrograms.filter(program => 
                program.department && program.department.toLowerCase() === dep
            );
        }

        // Level filter
        if (levelFilter) {
            const lvl = levelFilter.toLowerCase();
            filteredPrograms = filteredPrograms.filter(program => 
                program.level && program.level.toLowerCase() === lvl
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
                                    ${departmentOptions.map(dep => `
                                        <option value="${dep}" ${departmentFilter === dep ? 'selected' : ''}>${dep}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="col-md-3">
                                <select class="form-select" id="filterLevel">
                                    <option value="">All Levels</option>
                                    ${levelOptions.map(lvl => `
                                        <option value="${lvl}" ${levelFilter === lvl ? 'selected' : ''}>${lvl}</option>
                                    `).join('')}
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

        try {
            const searchEl = document.getElementById('searchPrograms');
            if (searchEl) {
                const len = searchTerm ? String(searchTerm).length : 0;
                searchEl.focus();
                // Place caret at end
                if (typeof searchEl.setSelectionRange === 'function') {
                    searchEl.setSelectionRange(len, len);
                }
            }
        } catch (_) {}
        };

        if (useFirebase) {
            window.FirebaseAPI.listPrograms()
                .then(render)
                .catch((err) => {
                    try { showAlert('Failed to load programs: ' + (err?.message || err), 'danger'); } catch(_) { console.error(err); }
                    render([]);
                });
        } else {
            const programsLS = JSON.parse(localStorage.getItem('programs') || '[]');
            render(programsLS);
        }
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
        
        // Prepare existing subjects (courses) if any
        const existingSubjects = Array.isArray(program?.courses) ? program.courses : [];
        const subjectsRowsHTML = existingSubjects.map((subj, index) => `
            <tr class="subject-row" data-index="${index}">
                <td><input type="text" class="form-control subject-code" value="${subj.code || ''}" placeholder="e.g., A1506"></td>
                <td><input type="text" class="form-control subject-name" value="${subj.name || ''}" placeholder="Subject name"></td>
                <td><input type="number" class="form-control subject-credits" value="${subj.credits || ''}" min="0" step="1"></td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-outline-danger remove-subject-row">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        const modalHTML = `
            <div class="modal fade" id="programFormModal" tabindex="-1" aria-labelledby="programFormModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="programFormModalLabel">
                                ${isEdit ? 'Edit' : 'Add New'} Program
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form id="programForm">
                            <div class="modal-body">
                                <ul class="nav nav-tabs mb-3" id="programFormTabs" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active" id="program-info-tab" data-bs-toggle="tab" data-bs-target="#program-info" type="button" role="tab" aria-controls="program-info" aria-selected="true">Program Info</button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="program-subjects-tab" data-bs-toggle="tab" data-bs-target="#program-subjects" type="button" role="tab" aria-controls="program-subjects" aria-selected="false">Subjects</button>
                                    </li>
                                </ul>
                                <div class="tab-content">
                                    <!-- Program Info Tab -->
                                    <div class="tab-pane fade show active" id="program-info" role="tabpanel" aria-labelledby="program-info-tab">
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="programName" class="form-label">Program Name <span class="text-danger">*</span></label>
                                                <input type="text" class="form-control" id="programName" 
                                                       value="${program?.name || ''}">
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label for="programCode" class="form-label">Program Code <span class="text-danger">*</span></label>
                                                <input type="text" class="form-control" id="programCode" 
                                                       value="${program?.code || ''}" >
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="programLevel" class="form-label">Level <span class="text-danger">*</span></label>
                                                <select class="form-select" id="programLevel">
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
                                                <select class="form-select" id="programDepartment" >
                                                    <option value="">Select Department</option>
                                                    <option value="Computing" ${program?.department === 'Computing' ? 'selected' : ''}>Computing</option>
                                                    <option value="Business" ${program?.department === 'Business' ? 'selected' : ''}>Business</option>
                                                    <option value="Engineering" ${program?.department === 'Engineering' ? 'selected' : ''}>Engineering</option>
                                                    <option value="Computer Science" ${program?.department === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                                                    <option value="Arts" ${program?.department === 'Arts' ? 'selected' : ''}>Arts</option>
                                                    <option value="__custom__" ${program && ['Computing','Business','Engineering','Computer Science','Arts'].indexOf(program.department) === -1 ? 'selected' : ''}>Other / Custom</option>
                                                </select>
                                                <input type="text" class="form-control mt-2" id="programDepartmentCustom" placeholder="Enter department (for Other / Custom)" value="${program && ['Computing','Business','Engineering','Computer Science','Arts'].indexOf(program.department) === -1 ? (program.department || '') : ''}" style="display: none;">
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label for="programDuration" class="form-label">Duration <span class="text-danger">*</span></label>
                                                <div class="input-group">
                                                    <input type="number" class="form-control" id="programDuration" 
                                                           value="${program?.duration?.split(' ')[0] || ''}" step="0.5" min="0" >
                                                    <select class="form-select" id="programDurationUnit" style="max-width: 100px;">
                                                        <option value="months" ${program?.duration?.includes('month') ? 'selected' : ''}>Months</option>
                                                        <option value="years" ${!program?.duration || program?.duration?.includes('year') ? 'selected' : ''}>Years</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label for="programFee" class="form-label">Total Fee (RM) <span class="text-danger">*</span></label>
                                                <input type="number" class="form-control" id="programFee" 
                                                       value="${program?.fee || ''}" >
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label for="programDescription" class="form-label">Description</label>
                                            <textarea class="form-control" id="programDescription" rows="3">${program?.description || ''}</textarea>
                                        </div>
                                        <div class="mb-3">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="programStatus" 
                                                       ${!program || program.status === 'Active' ? 'checked' : ''}>
                                                <label class="form-check-label" for="programStatus">Active Program</label>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Subjects Tab -->
                                    <div class="tab-pane fade" id="program-subjects" role="tabpanel" aria-labelledby="program-subjects-tab">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <h6 class="mb-0">Subjects under this program</h6>
                                            <button type="button" class="btn btn-sm btn-outline-primary" id="addSubjectRowBtn">
                                                <i class="fas fa-plus me-1"></i> Add Subject
                                            </button>
                                        </div>
                                        <div class="table-responsive">
                                            <table class="table table-sm align-middle">
                                                <thead>
                                                    <tr>
                                                        <th style="width: 20%;">Code</th>
                                                        <th style="width: 45%;">Name</th>
                                                        <th style="width: 20%;">Credits</th>
                                                        <th style="width: 5%;"></th>
                                                    </tr>
                                                </thead>
                                                <tbody id="programSubjectsBody">
                                                    ${subjectsRowsHTML || ''}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div class="form-text">Leave a row empty to ignore it. Only rows with a Code and Name will be saved.</div>
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
        
        // Add subject row handler
        const subjectsBody = document.getElementById('programSubjectsBody');
        const addSubjectRow = () => {
            const row = document.createElement('tr');
            row.className = 'subject-row';
            row.innerHTML = `
                <td><input type="text" class="form-control subject-code" placeholder="e.g., A1506"></td>
                <td><input type="text" class="form-control subject-name" placeholder="Subject name"></td>
                <td><input type="number" class="form-control subject-credits" min="0" step="1"></td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-outline-danger remove-subject-row">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            subjectsBody.appendChild(row);
        };

        document.getElementById('addSubjectRowBtn')?.addEventListener('click', addSubjectRow);

        subjectsBody?.addEventListener('click', (e) => {
            if (e.target.closest('.remove-subject-row')) {
                e.preventDefault();
                const row = e.target.closest('tr');
                if (row) row.remove();
            }
        });
        
        // Show/hide custom department field
        const deptSelect = document.getElementById('programDepartment');
        const deptCustom = document.getElementById('programDepartmentCustom');
        
        function toggleCustomDepartment() {
            if (deptSelect.value === '__custom__') {
                deptCustom.style.display = 'block';
                //deptCustom.required = true;
            } else {
                deptCustom.style.display = 'none';
                //deptCustom.required = false;
                deptCustom.value = '';
            }
        }
        
        // Initial state
        toggleCustomDepartment();
        
        deptSelect?.addEventListener('change', toggleCustomDepartment);

        // Handle form submission
        document.getElementById('programForm')?.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form before saving
            if (validateProgramForm()) {
                saveProgram(program?.id);
            }
        });
        
        // Remove modal from DOM when hidden
        document.getElementById('programFormModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
    
    // Validate program form
    function validateProgramForm() {
        let isValid = true;
        const errors = [];

        // Remove existing error messages and styling
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        document.querySelectorAll('.invalid-feedback').forEach(el => el.remove());

        // Helper function to show field error
        function showFieldError(fieldId, message) {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.add('is-invalid');
                // Remove any previous feedback for this field
                if (field.nextSibling && field.nextSibling.classList && field.nextSibling.classList.contains('invalid-feedback')) {
                    field.nextSibling.remove();
                }
                // Create and insert error message after the field
                const errorDiv = document.createElement('div');
                errorDiv.className = 'invalid-feedback';
                errorDiv.textContent = message;
                field.after(errorDiv);
            }
            errors.push({ fieldId, message });
            isValid = false;
        }

        // Validate Program Name
        const programName = document.getElementById('programName').value.trim();
        if (!programName) {
            showFieldError('programName', 'Program name is required.');
        }

        // Validate Program Code
        const programCode = document.getElementById('programCode').value.trim();
        if (!programCode) {
            showFieldError('programCode', 'Program code is required.');
        }

        // Validate Level
        const programLevel = document.getElementById('programLevel').value;
        if (!programLevel) {
            showFieldError('programLevel', 'Level is required.');
        }

        // Validate Department
        const programDepartment = document.getElementById('programDepartment').value;
        if (!programDepartment) {
            showFieldError('programDepartment', 'Department is required.');
        } else if (programDepartment === '__custom__') {
            const customDept = document.getElementById('programDepartmentCustom').value.trim();
            if (!customDept) {
                showFieldError('programDepartmentCustom', 'Custom department name is required.');
            }
        }

        // Validate Duration
        const programDuration = document.getElementById('programDuration').value.trim();
        if (!programDuration) {
            showFieldError('programDuration', 'Duration is required.');
        } else if (parseFloat(programDuration) <= 0) {
            showFieldError('programDuration', 'Duration must be greater than 0.');
        }

        // Validate Fee
        const programFee = document.getElementById('programFee').value.trim();
        if (!programFee) {
            showFieldError('programFee', 'Total fee is required.');
        } else if (parseFloat(programFee) < 0) {
            showFieldError('programFee', 'Fee cannot be negative.');
        }

        // Show summary alert if there are errors
        if (!isValid) {
            // Show all error messages in a list
            const errorList = errors.map(e => `<li>${e.message}</li>`).join('');
            showAlert(`<strong>Please fix the following errors:</strong><ul class="mb-0">${errorList}</ul>`, 'danger');

            // Switch to the Program Info tab if errors exist there
            const programInfoTab = document.getElementById('program-info-tab');
            if (programInfoTab && errors.length > 0) {
                programInfoTab.click();
            }
        }

        return isValid;
    }
    
    // Save program data
    async function saveProgram(programId = null) {
        const useFirebase = !!window.FirebaseAPI?.saveProgramRecord;
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        const isEdit = !!programId;
        
        // Get form data
        const id = programId || 'PROG' + Math.floor(1000 + Math.random() * 9000);

        // Collect subjects from the Subjects tab table
        const subjectRows = Array.from(document.querySelectorAll('#programSubjectsBody .subject-row'));
        const subjects = subjectRows
            .map((row, idx) => {
                const code = row.querySelector('.subject-code')?.value.trim() || '';
                const name = row.querySelector('.subject-name')?.value.trim() || '';
                const creditsVal = row.querySelector('.subject-credits')?.value || '';
                const credits = creditsVal === '' ? null : Number(creditsVal);
                if (!code && !name && credits === null) return null; // entirely empty row
                if (!code || !name) return null; // require at least code and name
                return {
                    id: `C${Date.now()}${idx}`,
                    code,
                    name,
                    credits: Number.isFinite(credits) ? credits : null
                };
            })
            .filter(Boolean);

        // Resolve department (built-in option or custom)
        const deptSelectEl = document.getElementById('programDepartment');
        const deptCustomEl = document.getElementById('programDepartmentCustom');
        const resolvedDepartment = deptSelectEl?.value === '__custom__'
            ? (deptCustomEl?.value.trim() || '')
            : (deptSelectEl?.value || '');

        const programData = {
            id,
            name: document.getElementById('programName').value,
            code: document.getElementById('programCode').value,
            level: document.getElementById('programLevel').value,
            department: resolvedDepartment,
            duration: `${document.getElementById('programDuration').value} ${document.getElementById('programDurationUnit').value}`,
            fee: parseFloat(document.getElementById('programFee').value) || 0,
            description: document.getElementById('programDescription').value,
            courses: subjects.map(s => ({
                ...s,
                level: document.getElementById('programLevel').value,
                department: resolvedDepartment
            })),
            status: document.getElementById('programStatus').checked ? 'Active' : 'Inactive',
            createdAt: isEdit ? programs.find(p => p.id === programId)?.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        try {
            if (useFirebase) {
                // Save to Firebase under /programs/{id}
                const { id: _id, ...payload } = programData;
                await window.FirebaseAPI.saveProgramRecord(id, payload);
            } else {
                // Save to localStorage
                if (isEdit) {
                    const index = programs.findIndex(p => p.id === programId);
                    if (index !== -1) {
                        programs[index] = { ...programs[index], ...programData };
                    }
                } else {
                    programs.push(programData);
                }
                localStorage.setItem('programs', JSON.stringify(programs));
            }
        } catch (err) {
            showAlert('Failed to save program: ' + (err?.message || err), 'danger');
            return;
        }
        
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
    async function deleteProgram(programId) {
        if (!programId) {
            showAlert('Invalid program ID', 'danger');
            return;
        }

        if (!confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
            return;
        }

        const useFirebase = !!window.FirebaseAPI?.deleteProgramRecord;

        try {
            if (useFirebase) {
                // Check if any students are enrolled in this program (Firebase)
                let enrolledStudents = [];
                if (window.FirebaseAPI?.listStudents) {
                    const students = await window.FirebaseAPI.listStudents();
                    enrolledStudents = students.filter(s => s.programId === programId);
                }
                if (enrolledStudents.length > 0) {
                    showAlert(`Cannot delete program. ${enrolledStudents.length} student(s) are enrolled in this program.`, 'danger');
                    return;
                }

                // Delete from Firebase
                await window.FirebaseAPI.deleteProgramRecord(programId);
            } else {
                // LocalStorage fallback
                const programs = JSON.parse(localStorage.getItem('programs') || '[]');
                const programToDelete = programs.find(p => p.id === programId);

                if (!programToDelete) {
                    showAlert('Program not found', 'danger');
                    return;
                }

                const students = JSON.parse(localStorage.getItem('students') || '[]');
                const enrolledStudents = students.filter(s => s.programId === programId);

                if (enrolledStudents.length > 0) {
                    showAlert(`Cannot delete program. ${enrolledStudents.length} student(s) are enrolled in this program.`, 'danger');
                    return;
                }

                const updatedPrograms = programs.filter(p => p.id !== programId);
                localStorage.setItem('programs', JSON.stringify(updatedPrograms));
            }

            // Reload the programs list
            loadPrograms();

            // Show success message
            showAlert('Program deleted successfully', 'success');

            // Log the activity
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            App.logActivity(`Deleted program: ${programId}`, currentUser.email);

        } catch (err) {
            showAlert('Failed to delete program: ' + (err?.message || err), 'danger');
        }
    }
    
    // View program details
    function viewProgramDetails(programId) {
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        const program = programs.find(p => p.id === programId);
        
        if (!program) {
            showAlert('Program not found', 'danger');
            return;
        }

        // Courses for this program (subjects nested under program)
        const programCourses = Array.isArray(program.courses) ? program.courses : [];

        const coursesList = programCourses.length > 0
            ? programCourses.map(course => `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                        <h6 class="mb-0">${course.code} - ${course.name}</h6>
                        <small class="text-muted">${course.department || 'N/A'} &middot; Credits: ${course.credits != null ? course.credits : '-'}</small>
                    </div>
                    <span class="badge bg-light text-dark">${course.level || 'N/A'}</span>
                </div>
            `).join('')
            : '<div class="text-muted">No courses assigned to this program.</div>';

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
        const detailsEl = document.getElementById('programDetailsModal');
        const modal = new bootstrap.Modal(detailsEl);
        modal.show();

        // Remove modal from DOM when hidden and restore scroll/backdrop state
        detailsEl.addEventListener('hidden.bs.modal', function() {
            try {
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
            } catch (_) {}
            this.remove();
        });
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Helper to read current filter values and reload list
        const applyFilters = () => {
            const searchVal = document.getElementById('searchPrograms')?.value || '';
            const deptVal = document.getElementById('filterDepartment')?.value || '';
            const levelVal = document.getElementById('filterLevel')?.value || '';
            loadPrograms(searchVal, deptVal, levelVal);
        };

        // Search programs
        const searchInput = document.getElementById('searchPrograms');
        if (searchInput && !searchInput._programsBound) {
            searchInput._programsBound = true;
            searchInput.addEventListener('input', applyFilters);
        }
        
        // Filter programs by department
        const filterDepartment = document.getElementById('filterDepartment');
        if (filterDepartment && !filterDepartment._programsBound) {
            filterDepartment._programsBound = true;
            filterDepartment.addEventListener('change', applyFilters);
        }
        
        // Filter programs by level
        const filterLevel = document.getElementById('filterLevel');
        if (filterLevel && !filterLevel._programsBound) {
            filterLevel._programsBound = true;
            filterLevel.addEventListener('change', applyFilters);
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