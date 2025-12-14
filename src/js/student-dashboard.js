// Student Dashboard Logic

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (!checkAuth('student')) return;

    // Load User Data
    const user = getCurrentUser();
    document.getElementById('welcomeName').textContent = `Hello, ${user.name.split(' ')[0]}!`;
    const headerImg = document.getElementById('headerProfileImg');
    if (headerImg) headerImg.src = user.profileImage || 'https://via.placeholder.com/150';

    // Update header profile card
    const headerUserName = document.getElementById('headerUserName');
    const headerUserId = document.getElementById('headerUserId');
    if (headerUserName) headerUserName.textContent = user.name;
    if (headerUserId) headerUserId.textContent = `ID: ${user.id}`;

    // Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Modal For Student Profile
    window.openStudentProfileModal = function () {
        const u = getCurrentUser();

        const modalContent = `
            <button onclick="closeModal()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; padding: 0.5rem; line-height: 1;">
                &times;
            </button>

            <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-top: 1rem;">
                 <div style="position: relative;">
                    <img src="${u.profileImage || 'https://via.placeholder.com/150'}" 
                         id="previewProfileImage"
                         style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: var(--shadow-md);">
                    <button onclick="triggerPhotoUpload()" title="Change Photo" style="position: absolute; bottom: 0; right: 0; background: var(--primary-main); color: white; border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <input type="file" id="photoUploadInput" style="display: none;" accept="image/*" onchange="handlePhotoPreview(this)">
                 </div>
                 <div>
                     <h3 style="margin-bottom: 0.25rem;">${u.name}</h3>
                     <p style="color: var(--text-muted); margin-bottom: 0.5rem;">Student ID: ${u.id}</p>
                     <button onclick="logout()" class="btn btn-sm btn-outline-danger" style="font-size: 0.75rem; padding: 0.25rem 0.75rem; border-color: #fca5a5; color: #ef4444; background: white;">
                        Log Out
                     </button>
                 </div>
            </div>

            <form id="studentProfileForm" onsubmit="event.preventDefault();">
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid #f1f5f9;">
                    <div style="margin-bottom: 1rem;">
                        <label class="form-label" style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">My Phone Number</label>
                        <input type="tel" id="editStudentPhone" class="form-input" value="${u.phone || ''}" placeholder="+976 8888-8888" 
                            style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: var(--radius-md); transition: all 0.2s;"
                            onchange="saveStudentProfile(true)">
                    </div>
                    
                    <div style="border-top: 1px solid #e2e8f0; margin: 1rem 0;"></div>
                    
                    <div>
                        <label class="form-label" style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; color: var(--secondary-dark);">Parent's Contact</label>
                        <input type="tel" id="editParentPhone" class="form-input" value="${u.parentPhone || ''}" placeholder="+976 9999-9999" 
                            style="width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: var(--radius-md); transition: all 0.2s;"
                            onchange="saveStudentProfile(true)">
                        <small style="color: var(--text-muted); display: block; margin-top: 0.5rem;">Emergency contact & updates will be sent here.</small>
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

        // Safety: Ensure footer is restored when other modals might use it (though simplified here)
    };

    window.triggerPhotoUpload = function () {
        document.getElementById('photoUploadInput').click();
    };

    window.handlePhotoPreview = function (input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('previewProfileImage').src = e.target.result;
                saveStudentProfile(true); // Autosave image immediately
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    window.saveStudentProfile = function (silent = false) {
        const phone = document.getElementById('editStudentPhone').value;
        const parentPhone = document.getElementById('editParentPhone').value;
        const profileImgSrc = document.getElementById('previewProfileImage').src;

        const user = getCurrentUser();

        // Update User Object
        user.phone = phone;
        user.parentPhone = parentPhone;

        if (profileImgSrc && !profileImgSrc.includes('via.placeholder.com')) {
            user.profileImage = profileImgSrc;
        }

        // Save
        setCurrentUser(user);

        // Update Global Users List
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
            users[idx] = user;
            localStorage.setItem('users', JSON.stringify(users));
        }

        // Update UI
        refreshDashboard(user);
        const headerImg = document.getElementById('headerProfileImg');
        if (headerImg) headerImg.src = user.profileImage || 'https://via.placeholder.com/150';

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

    // Initial Load
    refreshDashboard(user);
    loadTeachers();
});

function switchTab(tabId) {
    // Hide all
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

    // Show Target
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.style.display = 'block';

    // Highlight Nav
    const navLink = document.querySelector(`.nav-link[onclick="switchTab('${tabId}')"]`);
    if (navLink) navLink.classList.add('active');

    // Close mobile sidebar if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('active');
}

function refreshDashboard(user) {
    // Stats
    const totalHours = user.completedHours || 0;
    const maxHours = 75;
    const percentage = Math.min(100, Math.round((totalHours / maxHours) * 100));

    const elTotal = document.getElementById('totalHours');
    if (elTotal) elTotal.textContent = totalHours;

    const elRem = document.getElementById('hoursRemaining');
    if (elRem) elRem.textContent = Math.max(0, maxHours - totalHours);

    const elProgBar = document.getElementById('mainProgressBar');
    if (elProgBar) elProgBar.style.width = `${percentage}%`;

    const elProgPerc = document.getElementById('progressPercentage');
    if (elProgPerc) elProgPerc.textContent = `${percentage}%`;

    // Active Courses
    const enrolledIds = user.enrolledCourses || [];
    const elActiveCount = document.getElementById('activeCoursesCount');
    if (elActiveCount) elActiveCount.textContent = enrolledIds.length;

    // Load Enrolled List
    const coursesEl = document.getElementById('myCoursesList');
    if (!coursesEl) return;

    coursesEl.innerHTML = '';

    if (enrolledIds.length === 0) {
        coursesEl.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: white; border-radius: var(--radius-lg);">
                <p>You haven't enrolled in any courses yet.</p>
                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="switchTab('teachers')">Find a Teacher</button>
            </div>
        `;
    } else {
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        enrolledIds.forEach(courseId => {
            const teacher = teachers.find(t => t.id === courseId) || { name: 'Unknown', specialization: [] };

            const card = document.createElement('div');
            card.className = 'course-card';
            card.innerHTML = `
                <div class="course-header">
                    <h3>Course with ${teacher.name}</h3>
                    <div style="margin-top: 0.5rem; color: var(--text-muted);">${teacher.specialization.join(', ')}</div>
                </div>
                <div class="course-body">
                    <p>Status: <span style="color: var(--success); font-weight: 600;">Active</span></p>
                    <div style="margin-top: 1rem;">
                        <button class="btn btn-secondary" style="width: 100%;">View Assignments</button>
                    </div>
                </div>
            `;
            coursesEl.appendChild(card);
        });
    }
}

function loadTeachers() {
    const grid = document.getElementById('teachersGrid');
    if (!grid) return;

    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');

    grid.innerHTML = teachers.map(t => `
        <div class="course-card">
            <div style="padding: 1.5rem; text-align: center;">
                <img src="${t.photo}" alt="${t.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem;">
                <h3>${t.name}</h3>
                <p style="color: var(--primary-main); font-size: 0.9rem; margin-bottom: 0.5rem;">${t.specialization.join(', ')}</p>
                <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">
                    ⭐ ${t.rating} | 🎓 ${t.experience}
                </div>
                <button class="btn btn-secondary" onclick="viewTeacherProfile('${t.id}')">View Profile</button>
            </div>
        </div>
    `).join('');
}

function viewTeacherProfile(teacherId) {
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const t = teachers.find(x => x.id === teacherId);
    if (!t) return;

    // Render Reviews
    const reviewsHtml = (t.reviews || []).map(r => `
        <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius-md); margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <strong style="font-size: 0.9rem;">${r.studentName}</strong>
                <span style="color: #fbbf24;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: auto; padding-left: 1rem;">${formatDate(r.date)}</span>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">${r.comment}</p>
        </div>
    `).join('') || '<p style="color: var(--text-muted); font-style: italic;">No reviews yet.</p>';

    const modalContent = `
        <div style="text-align: center;">
            <div style="display: flex; align-items: center; gap: 1.5rem; text-align: left; margin-bottom: 1.5rem;">
                <img src="${t.photo}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; flex-shrink: 0; box-shadow: var(--shadow-sm);">
                <div>
                    <h3 style="margin-bottom: 0.25rem;">${t.name}</h3>
                    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem;">${t.bio}</p>
                    <div style="font-size: 0.85rem; background: #f1f5f9; display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px;">
                        ${t.specialization.join(', ')} • ${t.experience}
                    </div>
                </div>
            </div>

            <div style="text-align: left; margin-top: 1rem; border-top: 1px solid #f1f5f9; padding-top: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="font-size: 1rem; margin: 0;">Student Reviews</h4>
                    <button class="btn btn-secondary btn-sm" onclick="toggleReviewForm('${t.id}')" style="font-size: 0.8rem; padding: 0.25rem 0.75rem;">+ Write Review</button>
                </div>

                <form id="reviewForm-${t.id}" style="display: none; margin-bottom: 1rem; background: #f8fafc; padding: 1rem; border-radius: var(--radius-md);">
                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: end;">
                        <div class="form-group" style="margin-bottom: 0.5rem;">
                            <label class="form-label" style="font-size: 0.8rem;">Rating</label>
                            <select id="reviewRating-${t.id}" class="form-select" style="padding: 0.4rem;">
                                <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                                <option value="4">⭐⭐⭐⭐ (Good)</option>
                                <option value="3">⭐⭐⭐ (Okay)</option>
                                <option value="2">⭐⭐ (Poor)</option>
                                <option value="1">⭐ (Terrible)</option>
                            </select>
                        </div>
                        <button type="button" class="btn btn-primary btn-sm" onclick="submitReview('${t.id}')" style="height: 36px;">Submit</button>
                    </div>
                    <div class="form-group" style="margin-bottom: 0;">
                        <textarea id="reviewComment-${t.id}" class="form-input" rows="2" placeholder="Optional comment..." style="font-size: 0.9rem;"></textarea>
                    </div>
                </form>

                <div style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem;">
                    ${reviewsHtml}
                </div>
            </div>
        </div>
    `;

    showModal(`Teacher Profile`, modalContent, 'info', () => {
        // Enrollment Logic
        enrollInCourse(teacherId);
    });

    // Hack: Change the button text from "Confirm" to "Register" for this specific modal
    setTimeout(() => {
        const confirmBtn = document.querySelector('#globalModal .btn-primary');
        if (confirmBtn) confirmBtn.textContent = 'Register for this Course';
    }, 0);
}

// Global functions for inline event handlers
window.toggleReviewForm = function (id) {
    const form = document.getElementById(`reviewForm-${id}`);
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
};

window.submitReview = function (teacherId) {
    const elRating = document.getElementById(`reviewRating-${teacherId}`);
    const elComment = document.getElementById(`reviewComment-${teacherId}`);

    if (!elRating) return;

    const rating = parseInt(elRating.value);
    const comment = elComment ? elComment.value : '';
    const user = getCurrentUser();

    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const idx = teachers.findIndex(t => t.id === teacherId);

    if (idx !== -1) {
        if (!teachers[idx].reviews) teachers[idx].reviews = [];
        teachers[idx].reviews.unshift({
            id: Date.now().toString(),
            studentName: user.name || 'Anonymous',
            rating,
            comment,
            date: formatDate(new Date().toISOString().split('T')[0])
        });

        localStorage.setItem('teachers', JSON.stringify(teachers));
        showToast('Review submitted!', 'success');

        closeModal();
        viewTeacherProfile(teacherId);
    }
};

function enrollInCourse(teacherId) {
    const user = getCurrentUser();

    // 1. Check if already enrolled (Rule: Only one teacher/course)
    if (user.enrolledCourses && user.enrolledCourses.length > 0) {
        showModal('Enrollment Error', 'You can only register for ONE course at a time.', 'error');
        return;
    }

    // 2. Mock Enrollment
    if (!user.enrolledCourses) user.enrolledCourses = [];
    user.enrolledCourses.push(teacherId);

    // Save
    setCurrentUser(user);

    // Update Global User ListMock
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
        users[idx] = user;
        localStorage.setItem('users', JSON.stringify(users));
    }

    showToast('Successfully enrolled!', 'success');
    refreshDashboard(user);
    switchTab('dashboard');
}

function filterTeachers(type) {
    if (type === 'all') {
        loadTeachers();
    } else {
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const keywords = type === 'International' ? ['SAT', 'IB', 'IGCSE', 'ACT'] : ['National', 'Olympiad', 'EEC'];

        const filtered = teachers.filter(t => t.specialization.some(s => keywords.some(k => s.includes(k))));

        const grid = document.getElementById('teachersGrid');
        if (grid) {
            grid.innerHTML = filtered.length ? filtered.map(t => `
                <div class="course-card">
                    <div style="padding: 1.5rem; text-align: center;">
                        <img src="${t.photo}" alt="${t.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem;">
                        <h3>${t.name}</h3>
                        <p style="color: var(--primary-main); font-size: 0.9rem; margin-bottom: 0.5rem;">${t.specialization.join(', ')}</p>
                        <button class="btn btn-secondary" onclick="viewTeacherProfile('${t.id}')">View Profile</button>
                    </div>
                </div>
            `).join('') : '<p class="col-span-full text-center text-muted">No teachers found for this category.</p>';
        }
    }

    // Update active button
    document.querySelectorAll('.btn-secondary[onclick^="filterTeachers"]').forEach(btn => {
        if (btn.innerText === (type === 'all' ? 'All' : type)) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}
