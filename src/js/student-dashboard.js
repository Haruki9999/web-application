/**
 * STUDENT DASHBOARD - REWRITTEN FOR STABILITY
 * Handles: Auth, Course View, History, Profile
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Strict Auth Check
    let user = getCurrentUser(); // From utils.js
    if (!user || user.role !== 'student') {
        // Debugging: Instead of redirect loop, show why
        document.body.innerHTML = `
            <div style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column; font-family:sans-serif;">
                <h1 style="color:red;">Нэвтрэх эрхгүй байна</h1>
                <p>Шалтгаан: ${!user ? 'Хэрэглэгч олдсонгүй (Not logged in)' : 'Та сурагч биш байна (Role mismatch)'}</p>
                <p>Role: ${user ? user.role : 'N/A'}</p>
                <a href="login.html" style="padding:10px 20px; background:blue; color:white; text-decoration:none; border-radius:5px;">Дахин нэвтрэх</a>
            </div>
        `;
        return;
    }

    // 2. Refresh User Data (READ ONLY, NO WRITE to avoid loop)
    // We fetch the latest version of this user from the 'users' array to ensure stats are up to date.
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const latestUser = users.find(u => String(u.id) === String(user.id));
    if (latestUser) {
        user = latestUser;
        // Optimization: valid to update session storage, but safeguard it
        // setCurrentUser(user); <--- Skipped to prevent any potential loop if storage is flaky
    }

    initDashboard(user);

    // Sidebar
    window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('active');
    const st = document.getElementById('sidebarToggle');
    if (st) st.addEventListener('click', window.toggleSidebar);
});

function initDashboard(user) {
    safeSetText('welcomeName', `Сайн байна уу, ${user.name}`);
    safeSetText('headerUserName', user.name);
    safeSetText('headerUserPhone', `Утас: ${user.phone || '99112233'}`);
    safeSetText('headerParentPhone', `Эцэг/эх: ${user.parentPhone || '88001122'}`);

    const img = document.getElementById('headerProfileImg');
    if (img) img.src = user.profileImage || 'https://via.placeholder.com/150';

    loadStats(user);
    loadMyCourses(user);
    loadAllTeachers(); // "Find Teachers" tab
    loadHistory(user); // If on history page
}

function loadStats(user) {
    const totalHours = user.completedHours || 0;
    const max = 75;
    const percent = Math.min(100, Math.round((totalHours / max) * 100));

    safeSetText('totalHours', totalHours);
    safeSetText('hoursRemaining', Math.max(0, max - totalHours));
    safeSetText('activeCoursesCount', (user.enrolledCourses || []).length);
    safeSetText('progressPercentage', `${percent}%`);

    const bar = document.getElementById('mainProgressBar');
    if (bar) bar.style.width = `${percent}%`;
}

function loadMyCourses(user) {
    const container = document.getElementById('myCoursesList');
    if (!container) return;

    const enrolledIds = user.enrolledCourses || [];

    if (enrolledIds.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; background: #f8fafc; border-radius: 12px;">
                <p>Та сургалтанд хамрагдаагүй байна.</p>
                <button class="btn btn-primary" onclick="switchTab('teachers')">Багш хайх</button>
            </div>
        `;
        return;
    }

    const allClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    const todayStr = new Date().toISOString().split('T')[0];

    // Filter: From enrolled teachers AND Upcoming (or today)
    const myClasses = allClasses.filter(c => {
        // Is enrolled teacher?
        if (!enrolledIds.map(String).includes(String(c.teacherId))) return false;
        // Is upcoming?
        return c.date >= todayStr;
    }).sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

    if (myClasses.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; background: #f8fafc; border-radius: 12px;">
                <p>Одоогоор хуваарьт хичээл алга байна.</p>
                <button class="btn btn-secondary" onclick="switchTab('teachers')">Багш нарыг харах</button>
            </div>
        `;
        return;
    }

    container.innerHTML = myClasses.map(c => `
        <div class="course-card">
            <div class="course-header" style="border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: start;">
                <div>
                     <h3 style="margin: 0; font-size: 1.1rem;">${c.subject}</h3>
                     <p style="color: #64748b; font-size: 0.9rem; margin: 0.25rem 0 0 0;">Багш: ${c.teacher}</p>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: var(--primary-main);">${formatDate(c.date)}</div>
                    <div style="font-size: 0.85rem; color: #64748b;">${c.time}</div>
                </div>
            </div>
             <div class="course-body" style="margin-top: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.8rem; padding: 0.2rem 0.6rem; background: #eff6ff; color: #1e40af; border-radius: 99px;">
                        Upcoming
                    </span>
                    <button class="btn btn-primary btn-sm" onclick="alert('Joining ${c.subject}...')">
                        Хичээлд суух
                    </button>
                </div>
             </div>
        </div>
    `).join('');
}

function loadAllTeachers() {
    const grid = document.getElementById('teachersGrid');
    if (!grid) return;

    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    grid.innerHTML = teachers.map(t => `
        <div class="course-card" style="text-align: center;">
            <img src="${t.photo}" style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 1rem; object-fit: cover;">
            <h3>${t.name}</h3>
            <p style="font-size: 0.9rem; color: #666;">${Array.isArray(t.specialization) ? t.specialization.join(', ') : t.specialization}</p>
            <div style="margin-top: 1rem;">
                <button class="btn btn-primary btn-sm" onclick="enroll('${t.id}')">Enroll/View</button>
            </div>
        </div>
    `).join('');
}

function loadHistory(user) {
    const list = document.getElementById('allClassesList');
    if (!list) return;

    const history = user.attendanceHistory || [];
    if (history.length === 0) {
        list.innerHTML = '<p style="text-align: center; padding: 2rem;">Түүх байхгүй.</p>';
        return;
    }

    // Need access to classes to get subject name
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');

    list.innerHTML = history.reverse().map(h => {
        const cls = classes.find(c => String(c.id) === String(h.classId)) || { subject: 'Unknown', teacher: 'Unknown' };

        return `
        <div class="course-card" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem;">
            <div>
                <h3>${cls.subject}</h3>
                <p class="text-muted">${formatDate(h.date)} • ${h.hours} цаг</p>
            </div>
            <span style="padding: 0.5rem 1rem; border-radius: 20px; background: #dcfce7; color: #166534; font-weight: bold;">
                ${h.status}
            </span>
        </div>
        `;
    }).join('');
}

// --- ACTIONS ---

window.enroll = function (teacherId) {
    const user = getCurrentUser(); // Get fresh

    // 1. Check if already enrolled in THIS course
    if (user.enrolledCourses && user.enrolledCourses.map(String).includes(String(teacherId))) {
        showModal('Бүртгэлтэй байна', 'Та энэ багшийн хичээлд аль хэдийн бүртгүүлсэн байна.', 'info');
        return;
    }

    // 2. Check "1 Teacher at a Time" Rule
    const hasActiveCourse = user.enrolledCourses && user.enrolledCourses.length > 0;
    const currentHours = user.completedHours || 0;
    const REQUIRED_HOURS = 75;

    if (hasActiveCourse) {
        if (currentHours < REQUIRED_HOURS) {
            showModal('Бүртгүүлэх боломжгүй', `Та одоогийн багштайгаа ${REQUIRED_HOURS} цаг хичээллэсний дараа багшаа солих боломжтой. Одоогоор: ${currentHours} цаг.`, 'warning');
            return;
        } else {
            // Hours reached 75 -> Allow Switch
            const confirmSwitch = confirm('Та 75 цаг хичээллэсэн тул багшаа солих эрхтэй боллоо. Та шинэ багш руу шилжихдээ итгэлтэй байна уу? (Одоогийн цаг тэглэгдэх болно)');
            if (!confirmSwitch) return;

            // Proceed to switch logic below... (We will reset hours)
        }
    } else {
        // No active course -> Regular enroll
        if (!confirm('Та энэ багшийн ангид бүртгүүлэх үү?')) return;
    }

    // Perform Enrollment / Switch
    const globalUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const uIdx = globalUsers.findIndex(u => String(u.id) === String(user.id));

    if (uIdx !== -1) {
        // Reset or Initialize
        if (hasActiveCourse) {
            // Archiving old hours (optional, for record)
            globalUsers[uIdx].archivedHours = (globalUsers[uIdx].archivedHours || 0) + currentHours;
            globalUsers[uIdx].completedHours = 0; // Reset for new teacher
            globalUsers[uIdx].enrolledCourses = [teacherId]; // Replace old teacher
        } else {
            if (!globalUsers[uIdx].enrolledCourses) globalUsers[uIdx].enrolledCourses = [];
            globalUsers[uIdx].enrolledCourses.push(teacherId);
        }

        localStorage.setItem('users', JSON.stringify(globalUsers));
        // Update session
        localStorage.setItem('currentUser', JSON.stringify(globalUsers[uIdx]));

        showModal('Амжилттай', hasActiveCourse ? 'Багш солигдлоо!' : 'Амжилттай бүртгүүлээ!', 'success', () => {
            window.location.reload();
        });
    }
};

window.switchTab = function (tab) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById('tab-' + tab).style.display = 'block';

    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    const activeLink = Array.from(document.querySelectorAll('.nav-link')).find(n => n.getAttribute('onclick') && n.getAttribute('onclick').includes(tab));
    if (activeLink) activeLink.classList.add('active');
};

// Utils
function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// --- PROFILE EDITING ---

window.openStudentProfileModal = function () {
    const user = getCurrentUser();

    // Create Modal Content
    const content = `
        <div class="profile-edit-form">
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="position: relative; display: inline-block;">
                    <img src="${user.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.name}" 
                         id="previewStudentImg" 
                         style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #e0e7ff;">
                    <button onclick="document.getElementById('editStudentImgInput').click()" 
                            style="position: absolute; bottom: 0; right: 0; background: var(--primary-main); color: white; border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </button>
                    <input type="file" id="editStudentImgInput" hidden accept="image/*" onchange="handleStudentImagePreview(this)">
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Нэр</label>
                <input type="text" id="editStudentName" class="form-input" value="${user.name}">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label class="form-label">Утас</label>
                    <input type="tel" id="editStudentPhone" class="form-input" value="${user.phone}">
                </div>
                <div class="form-group">
                    <label class="form-label">Имэйл</label>
                    <input type="email" id="editStudentEmail" class="form-input" value="${user.email || ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Эцэг/эхийн утас</label>
                <input type="tel" id="editParentPhone" class="form-input" value="${user.parentPhone || ''}">
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
                <button onclick="closeModal()" class="btn btn-secondary">Болих</button>
                <button onclick="saveStudentProfile()" class="btn btn-primary">Хадгалах</button>
            </div>
        </div>
    `;

    showModal('Профайл засах', content, 'info');

    // Hide default footer
    const footer = document.querySelector('#globalModal .modal-actions');
    if (footer) footer.style.display = 'none';
};

window.handleStudentImagePreview = function (input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('previewStudentImg').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.saveStudentProfile = function () {
    const user = getCurrentUser();
    const newName = document.getElementById('editStudentName').value;
    const newPhone = document.getElementById('editStudentPhone').value;
    const newEmail = document.getElementById('editStudentEmail').value;
    const newParentPhone = document.getElementById('editParentPhone').value;
    const newImgSrc = document.getElementById('previewStudentImg').src;

    if (!newName) {
        showToast('Нэр оруулна уу', 'error');
        return;
    }

    // Update Object
    user.name = newName;
    user.phone = newPhone;
    user.email = newEmail;
    user.parentPhone = newParentPhone;
    user.profileImage = newImgSrc;

    // Save to DB
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => String(u.id) === String(user.id));
    if (idx !== -1) {
        users[idx] = { ...users[idx], ...user };
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Update Session
    setCurrentUser(user);

    showToast('Амжилттай хадгалагдлаа', 'success');
    closeModal();

    // Refresh UI
    initDashboard(user);
};
