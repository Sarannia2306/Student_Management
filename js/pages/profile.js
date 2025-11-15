// Profile Page Module
const ProfilePage = (function() {
    function maskIC(ic){
        const s = String(ic||'');
        if (!s) return '';
        if (s.length <= 4) return '*'.repeat(Math.max(0, s.length));
        return s.slice(0,2) + '*'.repeat(s.length - 4) + s.slice(-2);
    }
    // Initialize the profile page
    function init() {
        loadProfileData();
        setupEventListeners();
    }

// Save admin profile data
function saveAdminProfile(currentUser, formData) {
    console.log('saveAdminProfile called with:', currentUser, formData);
    // Add admin-specific fields (position)
    formData.position = document.getElementById('position')?.value || currentUser.position || 'Administrator';

    // Check if user is from Firebase (has uid) or localStorage
    if (currentUser.uid) {
        // Firebase user - update in Firebase Realtime Database
        console.log('Updating Firebase admin profile...');
        
        // Ensure required fields for Firebase rules are included
        const updateData = {
            ...formData,
            email: currentUser.email, // Required by validation rules
            role: currentUser.role,   // Required by validation rules
            uid: currentUser.uid     // Include uid for reference
        };
        
        // Use FirebaseAPI.updateUserProfile which preserves existing fields
        window.FirebaseAPI?.updateUserProfile(currentUser.uid, updateData)
            .then(() => {
                console.log('Firebase admin profile updated successfully');
                
                // Update current user data in localStorage
                const updatedUser = { ...currentUser, ...formData };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                console.log('Current admin user updated in localStorage');
                
                // Form fields remain enabled after saving
                const form = document.getElementById('profileForm');
                const inputs = form.querySelectorAll('input:not([readonly]), select, textarea');
                // Keep inputs enabled for continuous editing
                
                // No button toggling needed - Save Changes is always visible
                
                showAlert('Profile updated successfully!', 'success');
                App.logActivity('Updated admin profile', currentUser.email);
            })
            .catch((error) => {
                console.error('Error updating Firebase admin profile:', error);
                showAlert('Error updating profile: ' + error.message, 'danger');
            });
    } else {
        // LocalStorage user - update in localStorage
        const admins = JSON.parse(localStorage.getItem('admins') || '[]');
        const adminIndex = admins.findIndex(a => a.id === currentUser.id);

        if (adminIndex !== -1) {
            admins[adminIndex] = { ...admins[adminIndex], ...formData };
            localStorage.setItem('admins', JSON.stringify(admins));
        }

        // Update current user data regardless (handles Firebase case where list may not exist)
        const updatedUser = { ...currentUser, ...formData };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        // Form fields remain enabled after saving
        const form = document.getElementById('profileForm');
        const inputs = form.querySelectorAll('input:not([readonly]), select, textarea');
        // Keep inputs enabled for continuous editing

        // No button toggling needed - Save Changes is always visible

        showAlert('Profile updated successfully!', 'success');
        App.logActivity('Updated admin profile', currentUser.email);
    }
}

    // Load profile data for the current user
    function loadProfileData() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const isAdmin = currentUser.role === 'admin';
        
        if (isAdmin) {
            loadAdminProfile(currentUser);
        } else {
            loadStudentProfile(currentUser);
        }
    }

    // Load student profile data
    function loadStudentProfile(student) {
        const maskedIC = student.maskedIC || (student.icNumber ? maskIC(student.icNumber) : '');
        // Disable all form fields by default
        const formFields = `
            <div class="card">
                <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h4 class="mb-0">My Profile</h4>
                    <span class="badge bg-light text-primary">${student.role || 'Student'}</span>
                </div>
                <div class="card-body">
                    <form id="profileForm">
                        <div class="row mb-4">
                            <div class="col-md-3 text-center">
                                <div class="mb-3">
                                    <div class="position-relative d-inline-block">
                                        <img id="profileImg" src="${student.photoURL || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(student.fullName || 'Student') + '&background=4e73df&color=fff&size=150')}" 
                                             class="rounded-circle img-thumbnail" 
                                             alt="Profile Picture" 
                                             style="width: 150px; height: 150px; object-fit: cover;">
                                        <button type="button" id="changePhotoBtn" class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle" 
                                                style="width: 36px; height: 36px;"
                                                data-bs-toggle="tooltip" 
                                                data-bs-placement="bottom" 
                                                title="Change Photo">
                                            <i class="fas fa-camera"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="text-muted">
                                    <small>PNG, JPG, or GIF (Max 2MB)</small>
                                </div>
                                <input type="file" id="profileFile" accept="image/*" class="d-none">
                            </div>
                            <div class="col-md-9">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="fullName" class="form-label">Full Name</label>
                                        <input type="text" class="form-control" id="fullName" value="${student.fullName || ''}" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="studentId" class="form-label">Student ID</label>
                                        <input type="text" class="form-control" id="studentId" value="${student.id || ''}" readonly>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="email" class="form-label">Email Address</label>
                                        <input type="email" class="form-control" id="email" value="${student.email || ''}" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="phone" class="form-label">Phone Number</label>
                                        <input type="tel" class="form-control" id="phone" value="${student.phone || ''}">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="icNumber" class="form-label">IC Number</label>
                                        <input type="text" class="form-control" id="icNumber" value="${maskedIC || 'Not provided'}" readonly>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="academicLevel" class="form-label">Academic Level</label>
                                        <select class="form-select" id="academicLevel" ${student.id ? 'disabled' : ''}>
                                            <option value="">Select Level</option>
                                            <option value="Foundation" ${student.academicLevel === 'Foundation' ? 'selected' : ''}>Foundation</option>
                                            <option value="Diploma" ${student.academicLevel === 'Diploma' ? 'selected' : ''}>Diploma</option>
                                            <option value="Degree" ${student.academicLevel === 'Degree' ? 'selected' : ''}>Degree</option>
                                            <option value="A-levels" ${student.academicLevel === 'A-levels' ? 'selected' : ''}>A-levels</option>
                                            <option value="Masters" ${student.academicLevel === 'Masters' ? 'selected' : ''}>Masters</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-12 mb-3">
                                        <label for="address" class="form-label">Address</label>
                                        <textarea class="form-control" id="address" rows="2">${student.address || ''}</textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card mb-4">
                            <div class="card-header bg-light">
                                <h5 class="mb-0">Change Password</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="currentPassword" class="form-label">Current Password</label>
                                        <div class="input-group">
                                            <input type="password" class="form-control" id="currentPassword">
                                            <button class="btn btn-outline-secondary toggle-password" type="button">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="newPassword" class="form-label">New Password</label>
                                        <div class="input-group">
                                            <input type="password" class="form-control" id="newPassword">
                                            <button class="btn btn-outline-secondary toggle-password" type="button">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                        <div class="form-text">Leave blank to keep current password</div>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="confirmNewPassword" class="form-label">Confirm New Password</label>
                                        <div class="input-group">
                                            <input type="password" class="form-control" id="confirmNewPassword">
                                            <button class="btn btn-outline-secondary toggle-password" type="button">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between">
                            <button type="button" class="btn btn-outline-secondary" onclick="App.loadPage('dashboard')">
                                <i class="fas fa-arrow-left me-1"></i> Back
                            </button>
                            <div>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i> Save Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = `
            <div class="container-fluid py-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="mb-0">My Profile</h2>
                    <div class="text-muted">
                        Last updated: ${student.updatedAt ? new Date(student.updatedAt).toLocaleString() : 'Never'}
                    </div>
                </div>
                ${formFields}
            </div>
        `;
        
        // Initialize tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Load admin profile data
    function loadAdminProfile(admin) {
        const maskedIC = admin.maskedIC || (admin.icNumber ? maskIC(admin.icNumber) : '');
        const profileHTML = `
            <div class="card">
                <div class="card-header bg-primary text-white">
                    <h4 class="mb-0">Admin Profile</h4>
                </div>
                <div class="card-body">
                    <form id="profileForm">
                        <div class="row mb-4">
                            <div class="col-md-3 text-center">
                                <div class="mb-3">
                                    <div class="position-relative d-inline-block">
                                        <img id="profileImg" src="${admin.photoURL || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(admin.fullName || 'Admin') + '&background=4e73df&color=fff&size=150')}" 
                                             class="rounded-circle img-thumbnail" 
                                             alt="Profile Picture" 
                                             style="width: 150px; height: 150px; object-fit: cover;">
                                        <button type="button" id="changePhotoBtn" class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle" 
                                                style="width: 36px; height: 36px;"
                                                data-bs-toggle="tooltip" 
                                                data-bs-placement="bottom" 
                                                title="Change Photo">
                                            <i class="fas fa-camera"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="text-muted">
                                    <small>PNG, JPG, or GIF (Max 2MB)</small>
                                </div>
                                <input type="file" id="profileFile" accept="image/*" class="d-none">
                            </div>
                            <div class="col-md-9">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="fullName" class="form-label">Full Name</label>
                                        <input type="text" class="form-control" id="fullName" value="${admin.fullName || ''}" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="adminId" class="form-label">Admin ID</label>
                                        <input type="text" class="form-control" id="adminId" value="${admin.id || ''}" readonly>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="email" class="form-label">Email Address</label>
                                        <input type="email" class="form-control" id="email" value="${admin.email || ''}" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="phone" class="form-label">Phone Number</label>
                                        <input type="tel" class="form-control" id="phone" value="${admin.phone || ''}">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="icNumber" class="form-label">IC Number</label>
                                        <input type="text" class="form-control" id="icNumber" value="${maskedIC || 'Not provided'}" readonly>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="position" class="form-label">Position</label>
                                        <input type="text" class="form-control" id="position" value="${admin.position || 'Administrator'}">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card mb-4">
                            <div class="card-header bg-light">
                                <h5 class="mb-0">Change Password</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <label for="currentPassword" class="form-label">Current Password</label>
                                        <div class="input-group">
                                            <input type="password" class="form-control" id="currentPassword">
                                            <button class="btn btn-outline-secondary toggle-password" type="button">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="newPassword" class="form-label">New Password</label>
                                        <div class="input-group">
                                            <input type="password" class="form-control" id="newPassword">
                                            <button class="btn btn-outline-secondary toggle-password" type="button">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                        <div class="form-text">Leave blank to keep current password</div>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <label for="confirmNewPassword" class="form-label">Confirm New Password</label>
                                        <div class="input-group">
                                            <input type="password" class="form-control" id="confirmNewPassword">
                                            <button class="btn btn-outline-secondary toggle-password" type="button">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between">
                            <button type="button" class="btn btn-outline-secondary" onclick="App.loadPage('dashboard')">
                                <i class="fas fa-arrow-left me-1"></i> Back
                            </button>
                            <div>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i> Save Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.getElementById('mainContent').innerHTML = `
            <div class="container-fluid py-4">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="mb-0">Admin Profile</h2>
                    <div class="text-muted">
                        Last updated: ${admin.updatedAt ? new Date(admin.updatedAt).toLocaleString() : 'Never'}
                    </div>
                </div>
                ${profileHTML}
            </div>
        `;
        
        // Initialize tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Setup event listeners for the profile page
    function setupEventListeners() {
        // Toggle password visibility
        document.addEventListener('click', function(e) {
            if (e.target.closest('.toggle-password')) {
                const button = e.target.closest('.toggle-password');
                // Only handle toggles within the profile form to avoid double-toggling with auth modals
                if (!button.closest('#profileForm')) return;
                const group = button.closest('.input-group');
                const input = group ? group.querySelector('input') : button.previousElementSibling;
                const icon = button.querySelector('i');
                if (!input) return;
                if (String(input.type).toLowerCase() === 'password') {
                    input.type = 'text';
                    if (icon) { icon.classList.remove('fa-eye'); icon.classList.add('fa-eye-slash'); }
                } else {
                    input.type = 'password';
                    if (icon) { icon.classList.remove('fa-eye-slash'); icon.classList.add('fa-eye'); }
                }
            }
            
            // Handle edit button click
            if (e.target.closest('#editProfileBtn')) {
                e.preventDefault();
                // Enable form fields
                const form = document.getElementById('profileForm');
                const inputs = form.querySelectorAll('input:not([readonly]), select, textarea');
                inputs.forEach(input => input.disabled = false);
                
                // Show save button and hide edit button
                document.getElementById('editProfileBtn').classList.add('d-none');
                document.getElementById('saveProfileBtn').classList.remove('d-none');
                document.getElementById('cancelEditBtn').classList.remove('d-none');
            }
            
            // Handle cancel button click
            if (e.target.closest('#cancelEditBtn')) {
                e.preventDefault();
                // Reload the profile data to discard changes
                loadProfileData();
            }
            
            // Handle save button click
            if (e.target.closest('#saveProfileBtn')) {
                e.preventDefault();
                saveProfile();
            }
            
            // Handle change password button click
            if (e.target.closest('#changePasswordBtn')) {
                e.preventDefault();
                saveProfile();
            }
        });

        // Handle profile form submit (save changes + password logic)
        document.addEventListener('submit', function(e){
            const form = e.target;
            console.log('Form submitted:', form?.id);
            if (form && form.id === 'profileForm') {
                e.preventDefault();
                console.log('Calling saveProfile');
                saveProfile();
            }
        });

        // Trigger file picker when clicking the camera button
        document.addEventListener('click', function(e){
            const btn = e.target.closest('#changePhotoBtn');
            if (btn) {
                e.preventDefault();
                document.getElementById('profileFile')?.click();
            }
        });

        // Handle file selection
        document.addEventListener('change', async function(e){
            if (e.target && e.target.id === 'profileFile') {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                // Validate type and size (<= 2MB)
                const allowed = ['image/jpeg','image/png','image/gif','image/webp'];
                if (!allowed.includes(file.type)) {
                    showAlert('Please select a valid image (JPG, PNG, GIF, or WebP).', 'warning');
                    e.target.value = '';
                    return;
                }
                if (file.size > 2 * 1024 * 1024) {
                    showAlert('Image is too large. Max size is 2MB.', 'warning');
                    e.target.value = '';
                    return;
                }

                // Optimistic preview
                try {
                    const imgEl = document.getElementById('profileImg');
                    if (imgEl) {
                        const blobUrl = URL.createObjectURL(file);
                        imgEl.src = blobUrl;
                    }
                } catch(_) {}

                // Create compressed data URL and persist (no Firebase Storage)
                try {
                    const cu = JSON.parse(localStorage.getItem('currentUser') || '{}');
                    const dataUrl = await (async function(file){
                        const img = document.createElement('img');
                        const reader = new FileReader();
                        const loadFile = new Promise((resolve, reject) => {
                            reader.onload = () => { img.src = reader.result; resolve(); };
                            reader.onerror = reject; reader.readAsDataURL(file);
                        });
                        await loadFile;
                        await new Promise(res => img.onload = res);
                        const maxSize = 256; // px
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
                        const w = Math.max(1, Math.round(img.width * ratio));
                        const h = Math.max(1, Math.round(img.height * ratio));
                        canvas.width = w; canvas.height = h;
                        ctx.drawImage(img, 0, 0, w, h);
                        return canvas.toDataURL('image/jpeg', 0.8);
                    })(file);

                    // Update user profile photoURL in RTDB by merging
                    try {
                        const uid = cu?.uid;
                        if (uid && window.FirebaseAPI?.getUserProfile && window.FirebaseAPI?.setUserProfile) {
                            const existing = await window.FirebaseAPI.getUserProfile(uid);
                            const merged = existing ? { ...existing, photoURL: dataUrl } : { photoURL: dataUrl };
                            await window.FirebaseAPI.setUserProfile(uid, merged);
                        }
                    } catch(_) {}

                    // Update local currentUser and image src
                    const updatedUser = { ...cu, photoURL: dataUrl };
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    const imgEl2 = document.getElementById('profileImg');
                    if (imgEl2) imgEl2.src = dataUrl;
                    showAlert('Profile photo updated successfully!', 'success');
                } catch(err) {
                    console.error('Photo update error:', err);
                    showAlert('Unable to update photo right now. Please try again later.', 'danger');
                } finally {
                    e.target.value = '';
                }
            }
        });
    }
    
    // Save profile changes
    function saveProfile() {
        console.log('saveProfile function called');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        console.log('Current user:', currentUser);
        const isAdmin = currentUser.role === 'admin';
        
        try {
            // Get form data
            const formData = {
                fullName: document.getElementById('fullName')?.value || '',
                email: document.getElementById('email')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                updatedAt: new Date().toISOString()
            };
            
            // Basic validation
            if (!formData.fullName || !formData.email) {
                throw new Error('Full name and email are required');
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                throw new Error('Please enter a valid email address');
            }

            // Route to role-specific save
            if (isAdmin) {
                saveAdminProfile(currentUser, formData);
            } else {
                saveStudentProfile(currentUser, formData);
            }

            // Handle password change if any
            handlePasswordChange(currentUser, isAdmin);

        } catch (error) {
            console.error('Error saving profile:', error);
            showAlert(error.message || 'An error occurred while saving the profile', 'danger');
        }
    }

// Save student profile data
function saveStudentProfile(currentUser, formData) {
    console.log('saveStudentProfile called with:', currentUser, formData);
    // Add student-specific fields
    formData.academicLevel = document.getElementById('academicLevel')?.value || '';
    formData.address = document.getElementById('address')?.value || '';
    
    // Check if user is from Firebase (has uid) or localStorage
    if (currentUser.uid) {
        // Firebase user - update in Firebase Realtime Database
        console.log('Updating Firebase user profile...');
        
        // Ensure required fields for Firebase rules are included
        const updateData = {
            ...formData,
            email: currentUser.email, // Required by validation rules
            role: currentUser.role,   // Required by validation rules
            uid: currentUser.uid     // Include uid for reference
        };
        
        // Use FirebaseAPI.updateUserProfile which preserves existing fields
        window.FirebaseAPI?.updateUserProfile(currentUser.uid, updateData)
            .then(() => {
                console.log('Firebase profile updated successfully');
                
                // Update current user data in localStorage
                const updatedUser = { ...currentUser, ...formData };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                console.log('Current user updated in localStorage');
                
                // Show success message
                console.log('About to show success message');
                showAlert('Profile updated successfully!', 'success');
                
                // Log the activity
                App.logActivity('Updated student profile', currentUser.email);
            })
            .catch((error) => {
                console.error('Error updating Firebase profile:', error);
                showAlert('Error updating profile: ' + error.message, 'danger');
            });
    } else {
        // LocalStorage user - update in localStorage
        console.log('Updating localStorage user profile...');
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        console.log('Students array:', students);
        console.log('Looking for student with id:', currentUser.id);
        const studentIndex = students.findIndex(s => s.id === currentUser.id);
        console.log('Student index found:', studentIndex);
        
        if (studentIndex !== -1) {
            console.log('Student found, updating data...');
            students[studentIndex] = { ...students[studentIndex], ...formData };
            localStorage.setItem('students', JSON.stringify(students));
            console.log('Students array updated');
            
            // Update current user data
            const updatedUser = { ...currentUser, ...formData };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            console.log('Current user updated');
            
            // Show success message
            console.log('About to show success message');
            showAlert('Profile updated successfully!', 'success');
            
            // Log the activity
            App.logActivity('Updated student profile', currentUser.email);
        } else {
            console.log('Student not found in students array');
            showAlert('Student profile not found', 'danger');
        }
    }
}

// Handle password change
function handlePasswordChange(currentUser, isAdmin) {
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmNewPassword = document.getElementById('confirmNewPassword')?.value;
    const currentPassword = document.getElementById('currentPassword')?.value;
    
    if (newPassword && confirmNewPassword && currentPassword) {
        // Reject if new password is same as current password
        if (newPassword === currentPassword) {
            throw new Error('New password must be different from current password');
        }
        if (newPassword === confirmNewPassword) {
            // In a real app, you would verify the current password first
            // For this demo, we'll just update it
            const users = isAdmin ? 
                JSON.parse(localStorage.getItem('admins') || '[]') : 
                JSON.parse(localStorage.getItem('students') || '[]');
            
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                // In a real app, you should hash the password before storing
                users[userIndex].password = newPassword;
                
                if (isAdmin) {
                    localStorage.setItem('admins', JSON.stringify(users));
                } else {
                    localStorage.setItem('students', JSON.stringify(users));
                }
                
                // Update current user data
                const updatedUser = { ...currentUser, password: newPassword };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                
                showAlert('Password changed successfully!', 'success');
                
                // Clear password fields
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmNewPassword').value = '';
                
                // Log the activity
                App.logActivity('Changed password', currentUser.email);
            } else {
                throw new Error('User not found!');
            }
        } else {
            throw new Error('New passwords do not match!');
        }
    }
}

// Show alert message
function showAlert(message, type = 'info') {
    console.log('showAlert called:', message, type);
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
    if (container.firstChild) {
        container.insertBefore(alertDiv, container.firstChild);
    } else {
        container.appendChild(alertDiv);
    }

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        try {
            const alert = bootstrap.Alert.getOrCreateInstance(alertDiv);
            if (alert) {
                alert.close();
            } else {
                alertDiv.remove();
            }
        } catch (_) {
            alertDiv.remove();
        }
    }, 5000);
}
    
    // Public API
    return {
        init,
        saveProfile
    };
})();
