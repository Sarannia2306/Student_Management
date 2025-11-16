// Student Subject Enrolment Page
const StudentSubjectsPage = (function() {
  const state = {
    program: null,
    courses: [],
    enrolments: [],
    semester: 'Semester 1'
  };

  function init() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser || currentUser.role !== 'student') {
      document.getElementById('mainContent').innerHTML = `
        <div class="container-fluid py-4">
          <div class="alert alert-danger">Subject enrolment is only available for logged-in students.</div>
        </div>`;
      return;
    }

    loadData(currentUser).then(() => {
      renderPage(currentUser);
      attachHandlers(currentUser);
    }).catch(err => {
      console.error('Failed to load subject enrolment data', err);
      document.getElementById('mainContent').innerHTML = `
        <div class="container-fluid py-4">
          <div class="alert alert-danger">Unable to load subject enrolment data.</div>
        </div>`;
    });
  }

  async function loadData(currentUser) {
    const useFirebase = !!window.FirebaseAPI?.listPrograms;

    // Prefer semester from student profile if available
    if (currentUser.semester) {
      state.semester = currentUser.semester;
    }

    // Load programs
    let programs = [];
    if (useFirebase) {
      try {
        programs = await window.FirebaseAPI.listPrograms();
      } catch (e) {
        console.error('Failed to load programs from Firebase', e);
      }
    }
    if (!Array.isArray(programs) || programs.length === 0) {
      programs = JSON.parse(localStorage.getItem('programs') || '[]');
    }

    const programName = currentUser.course || '';
    const program = programs.find(p => p.name === programName);
    state.program = program || null;
    state.courses = Array.isArray(program?.courses) ? program.courses : [];

    // Load existing enrolments
    let enrolments = [];
    const uid = currentUser.uid || currentUser.id;
    if (useFirebase && window.FirebaseAPI?.getStudentEnrolments && currentUser.uid) {
      try {
        const fromDb = await window.FirebaseAPI.getStudentEnrolments(currentUser.uid);
        if (Array.isArray(fromDb)) enrolments = fromDb;
      } catch (e) {
        console.warn('Failed to load enrolments from Firebase', e);
      }
    }
    if (!Array.isArray(enrolments) || enrolments.length === 0) {
      const students = JSON.parse(localStorage.getItem('students') || '[]');
      const st = students.find(s => (s.uid && s.uid === uid) || s.id === uid);
      if (st && Array.isArray(st.enrolments)) enrolments = st.enrolments;
    }

    state.enrolments = enrolments;

    // If there are enrolments but no semester on profile, default to first enrolment's semester
    if (!currentUser.semester && state.enrolments.length > 0) {
      state.semester = state.enrolments[0].semester || state.semester;
    }
  }

  function renderPage(currentUser) {
    const program = state.program;

    document.getElementById('mainContent').innerHTML = `
      <div class="container-fluid py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 class="mb-1">Subject Enrolment</h2>
            <p class="text-muted mb-0">Select subjects under your program to enrol for this semester.</p>
          </div>
        </div>

        <div class="card mb-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-4 mb-3">
                <p class="mb-1 text-muted">Student</p>
                <h5 class="mb-0">${currentUser.fullName || 'Student'}</h5>
                <small class="text-muted">ID: ${currentUser.studentId || currentUser.id || 'N/A'}</small>
              </div>
              <div class="col-md-4 mb-3">
                <p class="mb-1 text-muted">Program</p>
                <h5 class="mb-0">${program ? program.name : (currentUser.course || 'Not assigned')}</h5>
                <small class="text-muted">Level: ${program?.level || currentUser.academicLevel || 'N/A'}</small>
              </div>
              <div class="col-md-4 mb-3">
                <label for="subjectSemesterDisplay" class="form-label mb-1">Semester</label>
                <input type="text" class="form-control" id="subjectSemesterDisplay" value="${state.semester}" readonly>
              </div>
            </div>
          </div>
        </div>

        ${program ? renderSubjectsTable() : `
          <div class="alert alert-warning">No program is linked to your profile. Please contact admin.</div>
        `}
      </div>
    `;
  }

  function renderSubjectsTable() {
    const semester = state.semester;
    const enrolmentsForSemester = (state.enrolments || []).filter(e => e.semester === semester);

    const rows = state.courses.map(course => {
      const isEnrolled = enrolmentsForSemester.some(e => e.courseId === course.id);
      return `
        <tr>
          <td class="text-center">
            <input type="checkbox" class="form-check-input enrol-checkbox" data-course-id="${course.id}" ${isEnrolled ? 'checked' : ''}>
          </td>
          <td>${course.code}</td>
          <td>${course.name}</td>
          <td>${course.credits != null ? course.credits : '-'}</td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="4" class="text-center py-4">No subjects found for this program.</td></tr>';

    const html = `
      <div class="card">
        <div class="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Subjects for ${semester}</h5>
          <small class="text-muted">Tick the subjects you wish to enrol.</small>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th class="text-center" style="width: 5%;">Enrol</th>
                  <th style="width: 15%;">Code</th>
                  <th>Subject Name</th>
                  <th style="width: 10%;">Credits</th>
                </tr>
              </thead>
              <tbody id="enrolSubjectsBody">
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center">
          <div class="text-muted" id="totalCreditsInfo"></div>
          <div>
            <button class="btn btn-outline-secondary me-2" id="resetEnrolmentBtn">Reset</button>
            <button class="btn btn-primary" id="saveEnrolmentBtn">
              <i class="fas fa-save me-1"></i>Save Enrolment
            </button>
          </div>
        </div>
      </div>
    `;

    // Inject after page is rendered
    setTimeout(() => {
      const container = document.querySelector('.container-fluid.py-4');
      if (!container) return;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      container.appendChild(wrapper.firstElementChild);

      // After table exists, compute initial total credits based on pre-checked boxes
      syncCheckboxesAndCredits();
    }, 0);

    return '';
  }

  function syncCheckboxesAndCredits() {
    // Recalculate total credits based on current checkbox states in the DOM
    const semester = state.semester;
    let totalCredits = 0;

    document.querySelectorAll('#enrolSubjectsBody tr').forEach(row => {
      const cb = row.querySelector('.enrol-checkbox');
      if (cb && cb.checked) {
        const creditsText = row.children[3]?.textContent || '0';
        const cVal = parseFloat(creditsText) || 0;
        totalCredits += cVal;
      }
    });

    const info = document.getElementById('totalCreditsInfo');
    if (info) {
      info.textContent = `Total enrolled credits for ${semester}: ${totalCredits}`;
    }
  }

  function attachHandlers(currentUser) {
    document.addEventListener('change', (e) => {
      if (e.target.classList?.contains('enrol-checkbox')) {
        syncCheckboxesAndCredits();
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.id === 'saveEnrolmentBtn') {
        e.preventDefault();
        saveEnrolments(currentUser);
      } else if (e.target.id === 'resetEnrolmentBtn') {
        e.preventDefault();
        resetEnrolmentsForSemester();
      }
    }, { passive: false });
  }

  function resetEnrolmentsForSemester() {
    const semester = state.semester;
    state.enrolments = (state.enrolments || []).filter(e => e.semester !== semester);
    document.querySelectorAll('.enrol-checkbox').forEach(cb => { cb.checked = false; });
    syncCheckboxesAndCredits();
  }

  async function saveEnrolments(currentUser) {
    if (!state.program) {
      alert('No program found. Please contact admin.');
      return;
    }
    const semester = state.semester;

    const selectedCourseIds = [];
    document.querySelectorAll('.enrol-checkbox').forEach(cb => {
      if (cb.checked) {
        const id = cb.getAttribute('data-course-id');
        if (id) selectedCourseIds.push(id);
      }
    });

    const newEnrolmentsForSemester = selectedCourseIds.map(courseId => {
      const course = state.courses.find(c => c.id === courseId);
      return {
        programId: state.program.id,
        programName: state.program.name,
        courseId: courseId,
        code: course?.code || '',
        name: course?.name || '',
        credits: course?.credits ?? null,
        semester,
        status: 'enrolled'
      };
    });

    // Merge with existing enrolments (replace this semester only)
    const others = (state.enrolments || []).filter(e => e.semester !== semester);
    const finalEnrolments = others.concat(newEnrolmentsForSemester);
    state.enrolments = finalEnrolments;

    const useFirebase = !!window.FirebaseAPI?.getStudentEnrolments;
    const uid = currentUser.uid || currentUser.id;

    try {
      if (useFirebase && window.FirebaseAPI?.saveStudentEnrolments && currentUser.uid) {
        await window.FirebaseAPI.saveStudentEnrolments(currentUser.uid, finalEnrolments);
      } else {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const idx = students.findIndex(s => (s.uid && s.uid === uid) || s.id === uid);
        if (idx !== -1) {
          students[idx].enrolments = finalEnrolments;
          localStorage.setItem('students', JSON.stringify(students));
        }
      }
      alert('Subject enrolment saved successfully.');
    } catch (e) {
      console.error('Failed to save enrolments', e);
      alert('Failed to save enrolments. Please try again later.');
    }

    syncCheckboxesAndCredits();
  }

  return { init };
})();
