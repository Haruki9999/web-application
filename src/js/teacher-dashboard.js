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

function showSection(sectionId) {
    document.querySelectorAll('.dashboard-section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

    document.getElementById(`section-${sectionId}`).style.display = 'block';

    // Highlight Nav
    const link = document.querySelector(`.nav-link[onclick="showSection('${sectionId}')"]`);
    if (link) link.classList.add('active');

    if (window.innerWidth < 1024) document.getElementById('sidebar').classList.remove('active');
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
    const todaysClasses = myClasses.filter(c => c.date === today);
    const todayContainer = document.getElementById('todaySchedule');

    if (todaysClasses.length > 0) {
        todayContainer.innerHTML = todaysClasses.map(c => `
            <div class="class-card" style="margin-bottom: 1rem;">
                <div class="class-body" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin-bottom: 0.25rem;">${c.subject}</h4>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">${c.time} | 3 Hours</p>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="openAttendanceModal('${c.id}')">Take Attendance</button>
                </div>
            </div>
        `).join('');
    }
}

function loadClasses(user) {
    const list = document.getElementById('classesList');
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const myClasses = classes.filter(c => c.teacherId === user.id);

    if (myClasses.length === 0) {
        list.innerHTML = '<p class="text-muted">No classes scheduled.</p>';
        return;
    }

    list.innerHTML = myClasses.map(c => `
        <div class="class-card">
            <div class="class-header">
                <h3>${c.subject}</h3>
                <span style="font-size: 0.9rem; color: var(--text-muted);">${c.date} @ ${c.time}</span>
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
