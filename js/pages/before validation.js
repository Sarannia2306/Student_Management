// // Before Input Validation - Student Registration
// async function handleStudentRegister(e) {
//     e.preventDefault();

//     const formData = {
//         id: document.getElementById('studentId').value,
//         fullName: document.getElementById('studentFullName').value,
//         academicLevel: document.getElementById('academicLevel').value,
//         email: document.getElementById('studentRegEmail').value,
//         phone: document.getElementById('studentPhone').value,
//         course: document.getElementById('courseName').value,
//         icNumber: document.getElementById('studentIC').value,
//         password: document.getElementById('studentRegPassword').value,
//         confirmPassword: document.getElementById('confirmStudentPassword').value,
//         role: 'student',
//         registeredAt: new Date().toISOString()
//     };

//     try {
//         // Directly register without checking input correctness
//         const students = JSON.parse(localStorage.getItem('students') || '[]');
//         students.push(formData);
//         localStorage.setItem('students', JSON.stringify(students));

//         App.logActivity('New student registered', formData.email);
//         showAlert('Registration successful! Please log in.', 'success');
//     } catch (err) {
//         showAlert('Registration failed', 'danger');
//     }
// }

// // Before Input Validation - Student Login
// async function handleStudentLogin(e) {
//     e.preventDefault();
    
//     const email = document.getElementById('studentEmail').value;
//     const password = document.getElementById('studentPassword').value;

//     try {
//         const students = JSON.parse(localStorage.getItem('students') || '[]');
//         const student = students.find(s => s.email === email && s.password === password);
//         if (!student) {
//             return showAlert('Invalid email or password', 'danger');
//         }

//         const userData = { ...student, lastLogin: new Date().toISOString() };
//         localStorage.setItem('currentUser', JSON.stringify(userData));

//         App.setCurrentUser(userData);
//         App.loadDashboard();
//         App.logActivity('Student logged in', student.email);
//         showAlert(`Welcome back, ${student.fullName}!`, 'success');
//     } catch (err) {
//         showAlert('Login failed', 'danger');
//     }
// }
