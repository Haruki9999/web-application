// Teacher Dashboard Logic

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (!checkAuth('teacher')) return;

    const user = getCurrentUser();
    document.getElementById('teacherName').textContent = `Welcome, ${user.name}`;

    // Update header profile card
    const headerTeacherName = document.getElementById('headerTeacherName');
    const headerTeacherId = document.getElementById('headerTeacherId');
    if (headerTeacherName) headerTeacherName.textContent = user.name;
    if (headerTeacherId) headerTeacherId.textContent = `ID: ${user.id}`;

    // Load initial data
    loadDashboardStats(user);
    loadClasses(user);
    loadProfile(user);

    // Sidebar
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');

    // Start sidebar expanded
    sidebar.classList.add('active');

    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Global function for sidebar brand toggle
    window.toggleSidebar = function () {
        const sidebarEl = document.getElementById('sidebar');
        if (sidebarEl) {
            sidebarEl.classList.toggle('active');
        }
    };


    // Forms
    const createClassForm = document.getElementById('createClassForm');
    if (createClassForm) {
        createClassForm.addEventListener('submit', handleCreateClass);
    }

    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleSaveProfile);
    }
});

// Profile Functions
function loadProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    // Header Icon
    const headerImg = document.getElementById('headerProfileImg');
    if (headerImg) headerImg.src = currentUser.profileImage || 'https://via.placeholder.com/150';

    // Populate Read-Only View (Sidebar Section)
    const img = document.getElementById('viewProfileImg');
    const name = document.getElementById('viewProfileName');
    const specs = document.getElementById('viewProfileSpecs');
    const bio = document.getElementById('viewProfileBio');

    if (img) img.src = currentUser.profileImage || 'https://via.placeholder.com/150';
    if (name) name.textContent = currentUser.name;
    if (specs) specs.textContent = currentUser.specialization || 'General Mathematics';
    if (bio) bio.textContent = currentUser.bio || 'Welcome to my profile! I am excited to teach at Pi Math Center.';

    // Load Reviews
    loadTeacherReviews();
}

function loadTeacherReviews() {
    const currentUser = getCurrentUser();
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const teacher = teachers.find(t => t.id === currentUser.id);

    if (!teacher || !teacher.reviews || teacher.reviews.length === 0) {
        const reviewsList = document.getElementById('teacherReviewsList');
        const avgRating = document.getElementById('averageRating');
        const reviewCount = document.getElementById('reviewCount');

        if (reviewsList) reviewsList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No reviews yet.</p>';
        if (avgRating) avgRating.textContent = '0.0';
        if (reviewCount) reviewCount.textContent = '(0 reviews)';
        return;
    }

    const reviews = teacher.reviews;

    // Calculate average rating
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    // Update UI
    const avgRatingEl = document.getElementById('averageRating');
    const reviewCountEl = document.getElementById('reviewCount');
    const reviewsList = document.getElementById('teacherReviewsList');

    if (avgRatingEl) avgRatingEl.textContent = avgRating.toFixed(1);
    if (reviewCountEl) reviewCountEl.textContent = `(${reviews.length} review${reviews.length !== 1 ? 's' : ''})`;

    if (reviewsList) {
        reviewsList.innerHTML = reviews.map(r => `
            <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius-md); margin-bottom: 0.75rem; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                            <strong style="font-size: 0.9rem;">${r.studentName}</strong>
                            <span style="color: #fbbf24;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                        </div>
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${r.date || formatDate(new Date().toISOString())}</span>
                    </div>
                    <button onclick="deleteReview('${r.id}')" class="btn btn-sm" style="padding: 0.25rem 0.5rem; background: #fee; color: #ef4444; border: 1px solid #fca5a5; font-size: 0.75rem;">
                        Delete
                    </button>
                </div>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">${r.comment || 'No comment provided.'}</p>
            </div>
        `).join('');
    }
}

window.deleteReview = function (reviewId) {
    showModal('Delete Review', 'Are you sure you want to delete this review? This action cannot be undone.', 'warning', () => {
        const currentUser = getCurrentUser();
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const teacherIdx = teachers.findIndex(t => t.id === currentUser.id);

        if (teacherIdx !== -1 && teachers[teacherIdx].reviews) {
            teachers[teacherIdx].reviews = teachers[teacherIdx].reviews.filter(r => r.id !== reviewId);
            localStorage.setItem('teachers', JSON.stringify(teachers));

            showToast('Review deleted successfully', 'success');
            loadTeacherReviews();
        }
    });
};

window.openEditProfileModal = function () {
    const currentUser = getCurrentUser();

    const modalContent = `
        <button onclick="closeModal()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; padding: 0.5rem; line-height: 1;">
            &times;
        </button>

        <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-top: 1rem;">
             <div style="position: relative;">
                <img src="${currentUser.profileImage || 'https://via.placeholder.com/150'}" 
                     id="previewProfileImage"
                     style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: var(--shadow-md);">
                <button onclick="triggerPhotoUpload()" title="Change Photo" style="position: absolute; bottom: 0; right: 0; background: var(--primary-main); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <input type="file" id="photoUploadInput" style="display: none;" accept="image/*" onchange="handlePhotoPreview(this)">
             </div>
             <div>
                 <h3 style="margin-bottom: 0.25rem;">${currentUser.name}</h3>
                 <p style="color: var(--text-muted); margin-bottom: 0.5rem;">Teacher ID: ${currentUser.id}</p>
                 <button onclick="logout()" class="btn btn-sm btn-outline-danger" style="font-size: 0.75rem; padding: 0.25rem 0.75rem; border-color: #fca5a5; color: #ef4444; background: white;">
                    Log Out
                 </button>
             </div>
        </div>

        <form id="modalProfileForm" onsubmit="event.preventDefault();">
            <div style="background: #f8fafc; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid #f1f5f9;">
                <div style="margin-bottom: 1rem;">
                    <label class="form-label" style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">My Phone Number</label>
                    <input type="tel" id="editTeacherPhone" class="form-input" value="${currentUser.phone || ''}" placeholder="+976 8888-8888" 
                        style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: var(--radius-md); transition: all 0.2s;"
                        onchange="saveTeacherProfile(true)">
                </div>
                
                <div style="border-top: 1px solid #e2e8f0; margin: 1rem 0;"></div>
                
                <div>
                    <label class="form-label" style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; color: var(--secondary-dark);">Email Address</label>
                    <input type="email" id="editTeacherEmail" class="form-input" value="${currentUser.email || ''}" placeholder="teacher@pimath.edu" 
                        style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: var(--radius-md); transition: all 0.2s;"
                        onchange="saveTeacherProfile(true)">
                    <small style="color: var(--text-muted); display: block; margin-top: 0.5rem;">For official communications & updates.</small>
                </div>
            </div>
        </form>
        <div id="saveIndicator" style="text-align: center; color: var(--success); font-size: 0.85rem; height: 1.5rem; margin-top: 0.5rem; opacity: 0; transition: opacity 0.3s;">
            <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                Saved
            </span>
        </div>
    `;

    showModal('Edit Profile', modalContent, 'info');

    const footer = document.querySelector('#globalModal .modal-actions');
    if (footer) footer.style.display = 'none';
};

window.triggerPhotoUpload = function () {
    document.getElementById('photoUploadInput').click();
};

window.handlePhotoPreview = function (input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('previewProfileImage').src = e.target.result;
            saveTeacherProfile(true);
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.saveTeacherProfile = function (silent = false) {
    const phone = document.getElementById('editTeacherPhone').value;
    const email = document.getElementById('editTeacherEmail').value;
    const profileImgSrc = document.getElementById('previewProfileImage').src;

    const currentUser = getCurrentUser();

    currentUser.phone = phone;
    currentUser.email = email;

    if (profileImgSrc && !profileImgSrc.includes('via.placeholder.com')) {
        currentUser.profileImage = profileImgSrc;
    }

    setCurrentUser(currentUser);

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIdx = users.findIndex(u => u.id === currentUser.id);
    if (userIdx !== -1) {
        users[userIdx] = { ...users[userIdx], ...currentUser };
        localStorage.setItem('users', JSON.stringify(users));
    }

    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const tIdx = teachers.findIndex(t => t.id === currentUser.id);
    if (tIdx !== -1) {
        teachers[tIdx] = { ...teachers[tIdx], photo: currentUser.profileImage, email: currentUser.email };
        localStorage.setItem('teachers', JSON.stringify(teachers));
    }

    loadProfile();

    if (silent) {
        const indicator = document.getElementById('saveIndicator');
        if (indicator) {
            indicator.style.opacity = '1';
            setTimeout(() => { if (indicator) indicator.style.opacity = '0'; }, 2000);
        }
    } else {
        showToast('Profile saved', 'success');
        closeModal();
    }
};


// Open Create Class Modal
window.openCreateClassModal = function () {
    const modalContent = `
        <form id="modalCreateClassForm" style="padding: 0.5rem 0;">
            <div style="background: #fdf2f8; border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem; border: 1px solid #fce7f3;">
                <p style="color: var(--secondary-main); font-size: 0.9rem; margin: 0;">
                    <strong>✨ Schedule a New Session</strong><br>
                    Create a new class for your students. The session will immediately appear in their upcoming schedule.
                </p>
            </div>

            <div class="form-group" style="margin-bottom: 1.25rem;">
                <label class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-main);">Subject / Topic</label>
                <div style="position: relative;">
                    <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); opacity: 0.5;">📚</span>
                    <input type="text" id="mSubject" class="form-input" placeholder="e.g. Advanced Calculus Review" required 
                           style="padding-left: 2.5rem; width: 100%; border: 1px solid #e2e8f0; border-radius: var(--radius-md); height: 45px;">
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                <div class="form-group">
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-main);">Date</label>
                    <input type="date" id="mDate" class="form-input" required 
                           style="width: 100%; border: 1px solid #e2e8f0; border-radius: var(--radius-md); height: 45px;">
                </div>
                <div class="form-group">
                    <label class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-main);">Time</label>
                    <input type="time" id="mTime" class="form-input" required
                           style="width: 100%; border: 1px solid #e2e8f0; border-radius: var(--radius-md); height: 45px;">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-main);">Duration & Credits</label>
                <div style="position: relative;">
                    <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); opacity: 0.5;">⏱️</span>
                    <select id="mUnits" class="form-input" style="padding-left: 2.5rem; width: 100%; border: 1px solid #e2e8f0; border-radius: var(--radius-md); height: 45px; background-color: white;">
                        <option value="3">3 Hours (Standard Session)</option>
                        <option value="1.5">1.5 Hours (Short Session)</option>
                        <option value="1">1 Hour (Quick Review)</option>
                        <option value="4">4 Hours (Intensive)</option>
                    </select>
                </div>
                <small style="display: block; margin-top: 0.5rem; color: var(--text-muted); font-size: 0.8rem;">
                    * 3 Hours is the standard credit for main curriculum classes.
                </small>
            </div>
        </form>
    `;

    showModal('Schedule Class', modalContent, 'primary', () => {
        submitClassCreation();
    });

    // Rename Modal Button
    setTimeout(() => {
        const btn = document.querySelector('#globalModal .btn-primary');
        if (btn) {
            btn.textContent = 'Confirm Schedule';
            btn.style.background = 'var(--secondary-main)';
            btn.style.borderColor = 'var(--secondary-main)';
        }
    }, 0);
};

// ... keep submitClassCreation (it calls loadDashboardStats/loadClasses) ...

// ... (logic for submitClassCreation is skipped in replacement unless specific lines targeted) ... 
// Wait, I must ensure I don't delete submitClassCreation if I am replacing a block.
// The previous block for openCreateClassModal ended at line 71.
// I will target lines 37 to 71.

// Also need to update loadDashboardStats (line 146) to use formatDate
// And loadClasses (line 169) to use formatDate

window.submitClassCreation = function () {
    const subject = document.getElementById('mSubject').value;
    const date = document.getElementById('mDate').value;
    const time = document.getElementById('mTime').value;
    const duration = document.getElementById('mUnits').value;

    if (!subject || !date || !time) {
        showToast('Please fill all fields', 'error');
        return false; // Keep modal open
    }

    const currentUser = getCurrentUser();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const teacherIdx = users.findIndex(u => u.phone === currentUser.phone);

    if (teacherIdx === -1) return;

    // Add to upcoming classes
    // Fix: Check if it's not an array (e.g. legacy number from mock stats)
    if (!Array.isArray(users[teacherIdx].upcomingClasses)) {
        users[teacherIdx].upcomingClasses = [];
    }

    const newClass = {
        id: Date.now().toString(),
        teacherId: currentUser.id, // Important for filtering
        subject,
        teacher: currentUser.name,
        date,
        time,
        duration: parseFloat(duration),
        students: 0,
        attendanceTaken: false
    };

    // 1. Update User's local history (optional but good for syncing)
    users[teacherIdx].upcomingClasses.push(newClass);
    localStorage.setItem('users', JSON.stringify(users));
    setCurrentUser(users[teacherIdx]);

    // 2. Update Global Classes List (CRITICAL for Dashboard Display)
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    console.log('Before push, classes:', classes); // Debug
    classes.push(newClass);
    localStorage.setItem('classes', JSON.stringify(classes));
    console.log('After push, classes:', classes); // Debug

    showToast('Class Scheduled Successfully!', 'success');

    // Slight delay to ensure storage write (rarely needed but safer)
    setTimeout(() => {
        loadClasses(currentUser);
        loadDashboardStats(currentUser);
    }, 50);
};

function showSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

    document.getElementById(`section-${sectionId}`).style.display = 'block';

    // Highlight Nav
    const link = document.querySelector(`.nav-link[onclick="showSection('${sectionId}')"]`);
    if (link) link.classList.add('active');

    if (window.innerWidth < 1024) {
        const sb = document.getElementById('sidebar');
        if (sb) sb.classList.remove('active');
    }
}

function loadDashboardStats(user) {
    // Mock calculations
    document.getElementById('totalStudents').textContent = user.totalStudents || 25;
    document.getElementById('materialsCount').textContent = user.materialsUploaded || 12;

    // Classes
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const myClasses = classes.filter(c => c.teacherId === user.id);
    document.getElementById('weeklyClasses').textContent = myClasses.length;

    // Today Schedule
    const today = new Date().toISOString().split('T')[0];
    // Fix: Ensure date comparison works with string formats if needed, but ISO YYYY-MM-DD should match
    const todaysClasses = myClasses.filter(c => c.date === today);
    const todayContainer = document.getElementById('todaySchedule');

    if (todaysClasses.length > 0) {
        todayContainer.innerHTML = todaysClasses.map(c => `
            <div class="class-card" style="margin-bottom: 1rem;">
                <div class="class-body" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin-bottom: 0.25rem;">${c.subject}</h4>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">${formatDate(c.date)} @ ${c.time} | 3 Hours</p>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="openAttendanceModal('${c.id}')">Take Attendance</button>
                </div>
            </div>
        `).join('');
    } else {
        // Optional: clear if empty
        // todayContainer.innerHTML = '...'; 
    }
}

function loadClasses(user) {
    console.log('Loading classes for user:', user.id);
    const list = document.getElementById('classesList');
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    console.log('All classes:', classes);

    // Filter by teacherId matches user.id
    const myClasses = classes.filter(c => c.teacherId === user.id);
    console.log('Filtered classes:', myClasses);

    if (myClasses.length === 0) {
        list.innerHTML = '<p class="text-muted">No classes scheduled.</p>';
        return;
    }
    // ... rest of map

    list.innerHTML = myClasses.map(c => `
        <div class="class-card">
            <div class="class-header">
                <h3>${c.subject}</h3>
                <span style="font-size: 0.9rem; color: var(--text-muted);">${formatDate(c.date)} @ ${c.time}</span>
            </div>
            <div class="class-body">
                <p>Enrolled Students: ${c.students || 0}</p>
                <div class="attendance-status" style="margin-top: 1rem;">
                    Status: <span style="color: ${c.attendanceTaken ? 'var(--success)' : 'var(--warning)'}; font-weight: 600;">
                        ${c.attendanceTaken ? 'Attendance Taken' : 'Pending'}
                    </span>
                </div>
            </div>
            <div class="class-footer">
                <button class="btn btn-secondary btn-sm">Upload Assignment</button>
                <button class="btn btn-primary btn-sm" onclick="openAttendanceModal('${c.id}')">
                    ${c.attendanceTaken ? 'Edit Attendance' : 'Take Attendance'}
                </button>
            </div>
        </div>
    `).join('');
}

function handleCreateClass(e) {
    e.preventDefault();
    const user = getCurrentUser();

    const subject = document.getElementById('newClassSubject').value;
    const date = document.getElementById('newClassDate').value;
    const time = document.getElementById('newClassTime').value;

    const newClass = {
        id: Date.now().toString(),
        teacherId: user.id,
        subject,
        date,
        time,
        students: 0,
        attendanceTaken: false
    };

    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    classes.push(newClass);
    localStorage.setItem('classes', JSON.stringify(classes));

    showToast('Class Scheduled', 'success');
    e.target.reset();

    // Refresh
    // Load Profile View (Read Only) & Header Image
    function loadProfile() {
        const currentUser = getCurrentUser();
        if (!currentUser) return;

        // Header Icon
        const headerImg = document.getElementById('headerProfileImg');
        if (headerImg) headerImg.src = currentUser.profileImage || 'https://via.placeholder.com/150';

        // Populate Read-Only View (Sidebar Section)
        const img = document.getElementById('viewProfileImg');
        const name = document.getElementById('viewProfileName');
        const specs = document.getElementById('viewProfileSpecs');
        const bio = document.getElementById('viewProfileBio');

        if (img) img.src = currentUser.profileImage || 'https://via.placeholder.com/150';
        if (name) name.textContent = currentUser.name;
        if (specs) specs.textContent = currentUser.specialization || 'General Mathematics';
        if (bio) bio.textContent = currentUser.bio || 'Welcome to my profile! I am excited to teach at Pi Math Center.';
    }

    // Initial Load
    loadProfile();

    // Open Edit Profile Modal
    window.openEditProfileModal = function () {
        const currentUser = getCurrentUser();

        const modalContent = `
            <button onclick="closeModal()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; padding: 0.5rem; line-height: 1;">
                &times;
            </button>

            <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-top: 1rem;">
                 <div style="position: relative;">
                    <img src="${currentUser.profileImage || 'https://via.placeholder.com/150'}" 
                         id="previewProfileImage"
                         style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: var(--shadow-md);">
                    <button onclick="triggerPhotoUpload()" title="Change Photo" style="position: absolute; bottom: 0; right: 0; background: var(--primary-main); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <input type="file" id="photoUploadInput" style="display: none;" accept="image/*" onchange="handlePhotoPreview(this)">
                 </div>
                 <div>
                     <h3 style="margin-bottom: 0.25rem;">${currentUser.name}</h3>
                     <p style="color: var(--text-muted); margin-bottom: 0.5rem;">Teacher ID: ${currentUser.id}</p>
                     <button onclick="logout()" class="btn btn-sm btn-outline-danger" style="font-size: 0.75rem; padding: 0.25rem 0.75rem; border-color: #fca5a5; color: #ef4444; background: white;">
                        Log Out
                     </button>
                 </div>
            </div>

            <form id="modalProfileForm" onsubmit="event.preventDefault();">
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid #f1f5f9;">
                    <div style="margin-bottom: 1rem;">
                        <label class="form-label" style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">My Phone Number</label>
                        <input type="tel" id="editTeacherPhone" class="form-input" value="${currentUser.phone || ''}" placeholder="+976 8888-8888" 
                            style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: var(--radius-md); transition: all 0.2s;"
                            onchange="saveTeacherProfile(true)">
                    </div>
                    
                    <div style="border-top: 1px solid #e2e8f0; margin: 1rem 0;"></div>
                    
                    <div>
                        <label class="form-label" style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; color: var(--secondary-dark);">Email Address</label>
                        <input type="email" id="editTeacherEmail" class="form-input" value="${currentUser.email || ''}" placeholder="teacher@pimath.edu" 
                            style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: var(--radius-md); transition: all 0.2s;"
                            onchange="saveTeacherProfile(true)">
                        <small style="color: var(--text-muted); display: block; margin-top: 0.5rem;">For official communications & updates.</small>
                    </div>
                </div>
            </form>
            <div id="saveIndicator" style="text-align: center; color: var(--success); font-size: 0.85rem; height: 1.5rem; margin-top: 0.5rem; opacity: 0; transition: opacity 0.3s;">
                <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    Saved
                </span>
            </div>
        `;

        showModal('Edit Profile', modalContent, 'info');

        // Hide default footer globally for this modal
        const footer = document.querySelector('#globalModal .modal-actions');
        if (footer) footer.style.display = 'none';
    };

    window.triggerPhotoUpload = function () {
        document.getElementById('photoUploadInput').click();
    };

    window.handlePhotoPreview = function (input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('previewProfileImage').src = e.target.result;
                saveTeacherProfile(true); // Autosave image
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    window.saveTeacherProfile = function (silent = false) {
        const phone = document.getElementById('editTeacherPhone').value;
        const email = document.getElementById('editTeacherEmail').value;
        const profileImgSrc = document.getElementById('previewProfileImage').src;

        const currentUser = getCurrentUser();

        // Update User Object
        currentUser.phone = phone;
        currentUser.email = email;

        if (profileImgSrc && !profileImgSrc.includes('via.placeholder.com')) {
            currentUser.profileImage = profileImgSrc;
        }

        // Save
        setCurrentUser(currentUser);

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIdx = users.findIndex(u => u.id === currentUser.id);
        if (userIdx !== -1) {
            users[userIdx] = { ...users[userIdx], ...currentUser };
            localStorage.setItem('users', JSON.stringify(users));
        }

        // Also update teacher list for students (crucial for finding teachers)
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const tIdx = teachers.findIndex(t => t.id === currentUser.id);
        if (tIdx !== -1) {
            teachers[tIdx] = { ...teachers[tIdx], photo: currentUser.profileImage, email: currentUser.email };
            localStorage.setItem('teachers', JSON.stringify(teachers));
        }

        // Refresh Views
        loadProfile();

        // Feedback
        if (silent) {
            const indicator = document.getElementById('saveIndicator');
            if (indicator) {
                indicator.style.opacity = '1';
                setTimeout(() => { if (indicator) indicator.style.opacity = '0'; }, 2000);
            }
        } else {
            showToast('Profile saved', 'success');
            closeModal();
        }
    };
}

// Attendance Logic using Global Modal
function openAttendanceModal(classId) {
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;

    // Get Students
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const students = users.filter(u => u.role === 'student');
    // In real app, filter for students enrolled in this course/teacher
    // For now, list all students for demo

    // Build Modal Content with Form
    let html = `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
            <p style="margin-bottom: 1rem;">Mark students present for <strong>${cls.subject}</strong> (3 Hours).</p>
            <div style="display: grid; gap: 0.5rem;">
    `;

    students.forEach(s => {
        // Check if previously present
        const isPresent = s.attendanceHistory && s.attendanceHistory.some(r => r.classId === classId && r.status === 'Present');

        html += `
            <div style="display: flex; align-items: center; padding: 0.5rem; background: #f8fafc; border-radius: var(--radius-md);">
                <input type="checkbox" id="att_${s.id}" ${isPresent ? 'checked' : ''} style="width: 20px; height: 20px; margin-right: 1rem;">
                <label for="att_${s.id}" style="cursor: pointer; flex: 1; font-weight: 500;">${s.name}</label>
                <span style="font-size: 0.8rem; color: var(--text-muted);">${s.phone || 'No ID'}</span>
            </div>
        `;
    });

    html += `</div></div>`;

    showModal(`Attendance: ${cls.subject}`, html, 'info', () => {
        // Find checked Ids manually because Modal System Callback doesn't pass form data directly
        // We will need to query the document since the modal is in the DOM
        const checks = document.querySelectorAll('input[id^="att_"]:checked');
        const presentIds = Array.from(checks).map(cb => cb.id.replace('att_', ''));

        saveAttendance(classId, presentIds);
    });
}

function saveAttendance(classId, presentIds) {
    // Update Class
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const clsIndex = classes.findIndex(c => c.id === classId);
    if (clsIndex === -1) return;

    classes[clsIndex].attendanceTaken = true;
    classes[clsIndex].students = presentIds.length;
    localStorage.setItem('classes', JSON.stringify(classes));

    // Update Students
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // Logic: If check -> Add attendance record (3 hours). If uncheck -> Remove.
    // Simplifying: Clear previous record for this class, add new if present.

    users.forEach(u => {
        if (u.role !== 'student') return;

        if (!u.attendanceHistory) u.attendanceHistory = [];

        // Remove old for this class
        u.attendanceHistory = u.attendanceHistory.filter(r => r.classId !== classId);

        // Check if present now
        if (presentIds.includes(u.id)) {
            u.attendanceHistory.push({
                classId: classId,
                date: classes[clsIndex].date,
                status: 'Present',
                hours: 3
            });
            // Update total hours (recalc from history to be safe)
            u.completedHours = u.attendanceHistory.reduce((acc, curr) => acc + (curr.hours || 0), 0);
        } else {
            // ensure total hours is accurate if removed
            u.completedHours = u.attendanceHistory.reduce((acc, curr) => acc + (curr.hours || 0), 0);
        }
    });

    localStorage.setItem('users', JSON.stringify(users));

    showToast('Attendance Saved', 'success');

    const user = getCurrentUser();
    loadClasses(user); // refresh UI
    loadDashboardStats(user);
}
