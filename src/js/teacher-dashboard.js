/**
 * TEACHER DASHBOARD - REWRITTEN FOR STABILITY
 * Handles: Auth, Class Management, Attendance, Profile, History
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Strict Auth Check
    const user = getCurrentUser();
    if (!user || user.role !== 'teacher') {
        window.location.href = 'login.html';
        return;
    }

    // 2. Initialize UI
    initDashboard(user);

    // 3. Global Event Handlers
    window.toggleSidebar = () => document.getElementById('sidebar').classList.toggle('active');

    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) sidebarToggle.onclick = window.toggleSidebar;
});

function initDashboard(user) {
    // Header Info
    safeSetText('teacherName', `Тавтай морил, ${user.name}`);
    safeSetText('headerTeacherName', user.name);
    safeSetText('headerTeacherId', `ID: ${user.id}`);

    const headerImg = document.getElementById('headerProfileImg');
    if (headerImg) headerImg.src = user.profileImage || 'https://via.placeholder.com/150';

    // Load Sections
    loadDashboardStats(user);
    loadClasses(user);
    loadProfile(user);
    loadHistory(user); // If on history page
}

// --- CORE FEATURES ---

function loadDashboardStats(user) {
    // Stats
    safeSetText('totalStudents', user.totalStudents || 0);
    safeSetText('materialsCount', user.materialsUploaded || 0);

    // Get Classes safe
    const classes = getClassesSafe();
    const myClasses = classes.filter(c => String(c.teacherId) === String(user.id));

    safeSetText('weeklyClasses', myClasses.length);

    // Weekly Schedule (Next 7 Days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const container = document.getElementById('todaySchedule');
    if (container) {
        const schedule = myClasses.filter(c => {
            const d = new Date(c.date);
            return d >= today && d <= nextWeek;
        }).sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

        if (schedule.length === 0) {
            container.innerHTML = `<div class="class-card" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Энэ долоо хоногт хичээл байхгүй байна.</div>`;
        } else {
            container.innerHTML = schedule.map(c => `
                <div style="background: white; border-radius: 12px; padding: 1rem 1.5rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    <div>
                        <h4 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #1e293b;">${c.subject}</h4>
                        <p style="margin: 0.25rem 0 0 0; color: #94a3b8; font-size: 0.9rem;">
                            ${formatDate(c.date)} @ ${c.time}
                        </p>
                    </div>
                    <button onclick="openAttendanceModal('${c.id}')" class="btn-icon" title="${c.attendanceTaken ? 'Ирц засах' : 'Ирц бүртгэх'}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width: 24px; height: 24px;">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </button>
                </div>
            `).join('');
        }
    }
}

function loadClasses(user) {
    const list = document.getElementById('classesList');
    if (!list) return;

    const classes = getClassesSafe();
    // Strict Filter: converting both to string handles "1" vs 1 mismatch
    const myClasses = classes.filter(c => String(c.teacherId) === String(user.id))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (myClasses.length === 0) {
        list.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                <p>Хичээл олдсонгүй.</p>
                <button class="btn btn-primary" onclick="openCreateClassModal()">+ Шинэ хичээл</button>
            </div>
        `;
        return;
    }

    list.innerHTML = myClasses.map(c => renderClassCard(c)).join('');
}

function renderClassCard(c) {
    const isTaken = c.attendanceTaken;
    const studentCount = getStudentCount(c);

    return `
    <div class="class-card">
        <div class="class-header" style="justify-content: space-between; display: flex; align-items: flex-start;">
            <div>
                <h3 style="margin-bottom: 0.25rem;">${c.subject}</h3>
                <span class="text-muted">${formatDate(c.date)} at ${c.time} • ${c.duration}h</span>
            </div>
            <div title="${isTaken ? 'Ирц бүртгэгдсэн' : 'Хүлээгдэж буй'}" 
                 style="width: 12px; height: 12px; border-radius: 50%; background: ${isTaken ? '#22c55e' : '#f97316'}; box-shadow: 0 0 0 2px white, 0 0 0 3px ${isTaken ? '#dcfce7' : '#ffedd5'};">
            </div>
        </div>
        <div class="class-body" style="border-top: 1px solid #f1f5f9; margin-top: 1rem; padding-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <p style="margin: 0;"><strong>${studentCount}</strong> сурагч</p>
            <div style="display: gap: 0.5rem;">
                <button class="btn btn-primary btn-sm" onclick="openAttendanceModal('${c.id}')">
                     ${isTaken ? 'Ирц засах' : 'Ирц бүртгэх'}
                </button>
            </div>
        </div>
    </div>`;
}

// --- HISTORY PAGE ---
function loadHistory(user) {
    const list = document.getElementById('historyList');
    if (!list) return;

    const classes = getClassesSafe();
    const myClasses = classes.filter(c => String(c.teacherId) === String(user.id))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Simple Table Render
    if (myClasses.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding: 2rem;">Түүх байхгүй байна.</p>';
        return;
    }

    list.innerHTML = `
    <table style="width: 100%; text-align: left; border-collapse: collapse;">
        <thead>
            <tr style="border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 1rem;">Огноо</th>
                <th style="padding: 1rem;">Хичээл</th>
                <th style="padding: 1rem;">Сурагчид</th>
                <th style="padding: 1rem;">Төлөв</th>
                <th style="padding: 1rem;">Үйлдэл</th>
            </tr>
        </thead>
        <tbody>
            ${myClasses.map(c => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 1rem;">${formatDate(c.date)}</td>
                    <td style="padding: 1rem;">
                        <strong>${c.subject}</strong><br>
                        <small class="text-muted">${c.time}</small>
                    </td>
                    <td style="padding: 1rem;">${getStudentCount(c)}</td>
                    <td style="padding: 1rem;">
                        <span style="color: ${c.attendanceTaken ? 'green' : 'orange'}">
                            ${c.attendanceTaken ? 'Бүртгэсэн' : 'Дутуу'}
                        </span>
                    </td>
                    <td style="padding: 1rem;">
                        <button class="btn btn-sm btn-secondary" onclick="openAttendanceModal('${c.id}')">Засах</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>`;
}

// --- ACTIONS & MODALS ---

window.openCreateClassModal = function () {
    const content = `
        <form id="createClassForm">
            <label class="form-label">Subject</label>
            <input type="text" id="newSubject" class="form-input" required placeholder="Subject Name">
            
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                <div style="flex: 1;">
                    <label class="form-label">Date</label>
                    <input type="date" id="newDate" class="form-input" required>
                </div>
                <div style="flex: 1;">
                    <label class="form-label">Time</label>
                    <input type="time" id="newTime" class="form-input" required>
                </div>
            </div>
             <div style="margin-top: 1rem;">
                <label class="form-label">Duration (Hours)</label>
                <select id="newDuration" class="form-input">
                    <option value="1.5">1.5</option>
                    <option value="2">2</option>
                    <option value="3" selected>3</option>
                </select>
            </div>
        </form>
    `;

    showModal('Шинэ хичээл товлох', content, 'info', () => {
        const user = getCurrentUser();
        const subject = document.getElementById('newSubject').value;
        const date = document.getElementById('newDate').value;
        const time = document.getElementById('newTime').value;
        const duration = document.getElementById('newDuration').value;

        if (!subject || !date || !time) {
            alert('Please fill all fields');
            return false;
        }

        const newClass = {
            id: Date.now().toString(),
            teacherId: user.id,
            teacher: user.name,
            subject,
            date,
            time,
            duration: parseFloat(duration),
            students: 0,
            attendanceTaken: false
        };

        const classes = getClassesSafe();
        classes.push(newClass);
        localStorage.setItem('classes', JSON.stringify(classes));

        showToast('Success', 'success', 'Class Created');

        // Sync to user upcoming for legacy support
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const uIdx = users.findIndex(u => String(u.id) === String(user.id));
        if (uIdx !== -1) {
            if (!users[uIdx].upcomingClasses) users[uIdx].upcomingClasses = [];
            users[uIdx].upcomingClasses.push(newClass);
            localStorage.setItem('users', JSON.stringify(users));
        }

        setTimeout(() => window.location.reload(), 500);
    });
};

window.openAttendanceModal = function (classId) {
    const classes = getClassesSafe();
    const cls = classes.find(c => String(c.id) === String(classId));
    if (!cls) return;

    // Get all students for now (simplified for robustness)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const students = users.filter(u => u.role === 'student');

    let html = `<div style="max-height: 400px; overflow-y: auto;">`;
    students.forEach(s => {
        // Check if student was present
        const isPresent = s.attendanceHistory && s.attendanceHistory.some(r => String(r.classId) === String(classId) && r.status === 'Present');

        html += `
            <div style="display: flex; align-items: center; padding: 0.5rem; border-bottom: 1px solid #f1f5f9;">
                <input type="checkbox" id="chk_${s.id}" ${isPresent ? 'checked' : ''} style="margin-right: 1rem; width: 20px; height: 20px;">
                <div>
                     <div style="font-weight: 600;">${s.name}</div>
                     <div style="font-size: 0.8rem; color: #64748b;">${s.phone || 'No Phone'}</div>
                </div>
            </div>
        `;
    });
    html += `</div>`;

    showModal(`Attendance: ${cls.subject}`, html, 'info', () => {
        // Save
        const boxes = document.querySelectorAll('input[id^="chk_"]:checked');
        const presentIds = Array.from(boxes).map(b => b.id.replace('chk_', ''));

        saveAttendanceRecursive(classId, presentIds, cls.date, cls.duration || 3);

        showToast('Saved', 'success');
        setTimeout(() => window.location.reload(), 500);
    });
};

function saveAttendanceRecursive(classId, presentIds, date, hours) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    users.forEach(u => {
        if (u.role !== 'student') return;

        // Clean previous records for this class
        u.attendanceHistory = (u.attendanceHistory || []).filter(r => String(r.classId) !== String(classId));

        // Add if present
        if (presentIds.includes(String(u.id))) {
            u.attendanceHistory.push({
                classId,
                date,
                hours,
                status: 'Present'
            });
        }

        // Recalc total
        u.completedHours = u.attendanceHistory.reduce((sum, r) => sum + (r.hours || 0), 0);
    });

    localStorage.setItem('users', JSON.stringify(users));

    // Update Class Stats
    const classes = getClassesSafe();
    const cIdx = classes.findIndex(c => String(c.id) === String(classId));
    if (cIdx !== -1) {
        classes[cIdx].attendanceTaken = true;
        classes[cIdx].students = presentIds.length;
        localStorage.setItem('classes', JSON.stringify(classes));
    }
}


// --- UTILS & PROFILE ---

// --- UTILS & PROFILE ---
function loadProfile(user) {
    safeSetText('viewProfileName', user.name);
    safeSetText('viewProfileSpecs', Array.isArray(user.specialization) ? user.specialization.join(', ') : (user.specialization || 'Мэргэшил тохируулаагүй'));
    safeSetText('viewProfileBio', user.bio || 'Намтар оруулаагүй байна.');
    safeSetText('viewProfilePhone', user.phone || 'Утас оруулаагүй');
    safeSetText('viewProfileEmail', user.email || 'Имэйл оруулаагүй');

    const img = document.getElementById('viewProfileImg');
    if (img) img.src = user.profileImage || 'https://via.placeholder.com/150';
}

window.openEditProfileModal = function () {
    const user = getCurrentUser();

    // Custom Content with Design
    const content = `
        <div style="padding: 0 0.5rem;">
            <!-- Profile Image Section -->
            <div style="margin-bottom: 1.5rem; text-align: center; display: flex; align-items: center; justify-content: center; gap: 1.5rem;">
                 <div style="position: relative;">
                    <img src="${user.profileImage || 'https://via.placeholder.com/150'}" id="previewEditImg" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 1px solid #e2e8f0;">
                 </div>
                 <label for="profileImageInput" class="btn" style="background: white; border: 1px solid #e2e8f0; color: var(--text-main); font-weight: 500; padding: 0.4rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">
                    Зураг солих
                 </label>
                 <input type="file" id="profileImageInput" accept="image/*" style="display: none;" onchange="handleImagePreview(this)">
            </div>

            <form id="editProfileForm">
                <div style="margin-bottom: 0.75rem;">
                    <label class="form-label" style="display: block; margin-bottom: 0.25rem; color: var(--text-muted); font-size: 0.9rem;">Нэр</label>
                    <input type="text" id="editName" class="form-input" value="${user.name || ''}" required 
                        style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;">
                </div>

                <div style="margin-bottom: 0.75rem;">
                    <label class="form-label" style="display: block; margin-bottom: 0.25rem; color: var(--text-muted); font-size: 0.9rem;">Мэргэшил</label>
                    <input type="text" id="editSpecs" class="form-input" value="${Array.isArray(user.specialization) ? user.specialization.join(', ') : (user.specialization || '')}"
                        style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.75rem;">
                    <div>
                         <label class="form-label" style="display: block; margin-bottom: 0.25rem; color: var(--text-muted); font-size: 0.9rem;">Утас</label>
                         <input type="tel" id="editPhone" class="form-input" value="${user.phone || ''}"
                            style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;">
                    </div>
                    <div>
                         <label class="form-label" style="display: block; margin-bottom: 0.25rem; color: var(--text-muted); font-size: 0.9rem;">Имэйл</label>
                         <input type="email" id="editEmail" class="form-input" value="${user.email || ''}"
                            style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px;">
                    </div>
                </div>

                <div style="margin-bottom: 1.5rem;">
                    <label class="form-label" style="display: block; margin-bottom: 0.25rem; color: var(--text-muted); font-size: 0.9rem;">Намтар</label>
                    <textarea id="editBio" class="form-input" rows="2" 
                        style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; resize: none;">${user.bio || ''}</textarea>
                </div>

                <!-- Custom Actions -->
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1rem;">
                    <button type="button" onclick="closeModal()" class="btn" 
                        style="background: white; border: 1px solid #e2e8f0; color: var(--text-main); padding: 0.5rem 1.5rem; border-radius: 8px;">
                        Болих
                    </button>
                    <button type="button" onclick="saveProfileChanges()" class="btn" 
                        style="background: #6366f1; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);">
                        Баталгаажуулах
                    </button>
                </div>
            </form>
        </div>
    `;

    // Show modal without standard buttons
    showModal('Профайл засах', content, 'info'); // No callback = 'Close' button only

    // Hide default footer
    setTimeout(() => {
        const footer = document.querySelector('#globalModal .modal-actions');
        if (footer) footer.style.display = 'none';
    }, 10);
};

// Save Logic
window.saveProfileChanges = function () {
    const user = getCurrentUser();
    const newName = document.getElementById('editName').value;
    const newSpecs = document.getElementById('editSpecs').value;
    const newPhone = document.getElementById('editPhone').value;
    const newEmail = document.getElementById('editEmail').value;
    const newBio = document.getElementById('editBio').value;
    const newImgSrc = document.getElementById('previewEditImg').src;

    if (!newName) {
        showToast('Нэр оруулна уу', 'error');
        return;
    }

    // Update User Object
    user.name = newName;
    user.specialization = newSpecs.split(',').map(s => s.trim()).filter(s => s);
    user.phone = newPhone;
    user.email = newEmail;
    user.bio = newBio;
    user.profileImage = newImgSrc === 'https://via.placeholder.com/150' ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}` : newImgSrc;

    // 1. Save to LocalStorage (Users array) - The Source of Truth for Login
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => String(u.id) === String(user.id));
    if (idx !== -1) {
        users[idx] = { ...users[idx], ...user };
        localStorage.setItem('users', JSON.stringify(users));
    }

    // 2. Sync to Teachers List (Public Profile) - Uses teacherId
    // Note: User ID '2' maps to Teacher ID '1' in main data.
    if (user.role === 'teacher' && user.teacherId) {
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const tIdx = teachers.findIndex(t => String(t.id) === String(user.teacherId));
        if (tIdx !== -1) {
            teachers[tIdx] = {
                ...teachers[tIdx],
                name: user.name,
                photo: user.profileImage,
                specialization: user.specialization,
                bio: user.bio
            };
            localStorage.setItem('teachers', JSON.stringify(teachers));
        }
    }

    // 3. Sync to Classes List (For Student Dashboard Cards) - Uses User ID as teacherId
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    let classesChanged = false;
    classes.forEach(c => {
        // Classes created by this user are linked via teacherId = user.id (see data.js init)
        if (String(c.teacherId) === String(user.id)) {
            c.teacher = user.name; // Update the display name
            classesChanged = true;
        }
    });
    if (classesChanged) {
        localStorage.setItem('classes', JSON.stringify(classes));
    }

    // Update Session
    setCurrentUser(user);

    showToast('Амжилттай хадгалагдлаа', 'success');
    closeModal();
    initDashboard(user);
};

// Helper for image preview logic inside modal
window.handleImagePreview = function (input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('previewEditImg').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// Helpers
function getClassesSafe() {
    try {
        return JSON.parse(localStorage.getItem('classes') || '[]');
    } catch {
        return [];
    }
}

function getStudentCount(c) {
    if (Array.isArray(c.students)) return c.students.length;
    if (typeof c.students === 'number') return c.students;
    return 0;
}

function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function showbSection(id) {
    document.querySelectorAll('.dashboard-section').forEach(d => d.style.display = 'none');
    document.getElementById(`section-${id}`).style.display = 'block';

    // Update Sidebar
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    // Find link that calls this section
    const activeLink = Array.from(document.querySelectorAll('.nav-link')).find(n => n.getAttribute('onclick').includes(id));
    if (activeLink) activeLink.classList.add('active');
}

// Expose for HTML onClick
window.showSection = showbSection;
