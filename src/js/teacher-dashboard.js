// Teacher Dashboard Logic

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (!checkAuth('teacher')) return;

    const user = getCurrentUser();
    document.getElementById('teacherName').textContent = `Welcome, ${user.name}`;

    // Load initial data
    loadDashboardStats(user);
    loadClasses(user);
    loadProfile(user);

    // Sidebar
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

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
    loadClasses(user);
    loadDashboardStats(user);
    showSection('classes');
}

function loadProfile(user) {
    document.getElementById('profileName').value = user.name;
    // Mock additional fields
    document.getElementById('profileSpecs').value = user.specialization ? user.specialization.join(', ') : 'SAT Math';
    document.getElementById('profileBio').value = user.bio || '';
    if (user.photo) document.getElementById('profilePreview').src = user.photo;
}

function handleSaveProfile(e) {
    e.preventDefault();
    const user = getCurrentUser();

    // Update local Mock object
    user.bio = document.getElementById('profileBio').value;

    // Save
    setCurrentUser(user);
    showToast('Profile Updated', 'success');
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
