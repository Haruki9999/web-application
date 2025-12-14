// Student Dashboard Logic

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    if (!checkAuth('student')) return;

    const user = getCurrentUser();
    document.getElementById('welcomeName').textContent = `Hello, ${user.name}`;

    // Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Initial Load
    refreshDashboard(user);
    loadTeachers();
});

function switchTab(tabId) {
    // Hide all
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));

    // Show Target
    document.getElementById(`tab-${tabId}`).style.display = 'block';

    // Highlight Nav (Simple match)
    const navLink = document.querySelector(`.nav-link[onclick="switchTab('${tabId}')"]`);
    if (navLink) navLink.classList.add('active');

    // Close mobile sidebar if open
    document.getElementById('sidebar').classList.remove('active');
}

function refreshDashboard(user) {
    // Calc Stats
    const totalHours = user.completedHours || 0;
    const maxHours = 75;
    const percentage = Math.min(100, Math.round((totalHours / maxHours) * 100));

    document.getElementById('totalHours').textContent = totalHours;
    document.getElementById('hoursRemaining').textContent = Math.max(0, maxHours - totalHours);
    document.getElementById('mainProgressBar').style.width = `${percentage}%`;
    document.getElementById('progressPercentage').textContent = `${percentage}%`;

    // Active Courses
    const enrolledIds = user.enrolledCourses || [];
    document.getElementById('activeCoursesCount').textContent = enrolledIds.length;

    // Load Enrolled List
    const coursesEl = document.getElementById('myCoursesList');
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
            // In this schema, enrollment is implied by teacher/course selection. 
            // Simplified: "Course" = "Teacher's Class". 
            // Let's assume courseId refers to a teacher ID for simplicity if specific course objects aren't granular enough, 
            // OR find the course in 'programs'.
            // Based on earlier logic: Single teacher selection? 
            // RULES: "Each student can attend only one teacher’s course". 
            // So if enrolled, it's basically "Enrolled with Teacher X".

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
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const user = getCurrentUser();

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
    const user = getCurrentUser();
    const t = teachers.find(x => x.id === teacherId);
    if (!t) return;

    // Render Reviews
    const reviewsHtml = (t.reviews || []).map(r => `
        <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius-md); margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <strong style="font-size: 0.9rem;">${r.studentName}</strong>
                <span style="color: #fbbf24;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
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

// Global functions for inline event handlers (since modularity is simple here)
window.toggleReviewForm = function (id) {
    const form = document.getElementById(`reviewForm-${id}`);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
};

window.submitReview = function (teacherId) {
    const rating = parseInt(document.getElementById(`reviewRating-${teacherId}`).value);
    const comment = document.getElementById(`reviewComment-${teacherId}`).value;
    const user = getCurrentUser();

    // Comment is now optional


    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const idx = teachers.findIndex(t => t.id === teacherId);

    if (idx !== -1) {
        if (!teachers[idx].reviews) teachers[idx].reviews = [];
        teachers[idx].reviews.unshift({
            id: Date.now().toString(),
            studentName: user.name || 'Anonymous',
            rating,
            comment,
            date: new Date().toISOString().split('T')[0]
        });

        localStorage.setItem('teachers', JSON.stringify(teachers));
        showToast('Review submitted!', 'success');

        // Refresh modal content by re-opening (simple hack) or manual DOM update
        // Let's just reload the list for now or close modal
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
    // Basic filter logic placeholder
    // In real app, filter 'teachers' array by specialization type if we added that metadata
    // For now, just re-render all or show toast
    if (type === 'all') {
        loadTeachers();
    } else {
        // Demo filter
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        // Let's assume some keywords map to International vs National
        const keywords = type === 'International' ? ['SAT', 'IB', 'IGCSE', 'ACT'] : ['National', 'Olympiad', 'EEC'];

        const filtered = teachers.filter(t => t.specialization.some(s => keywords.some(k => s.includes(k))));

        const grid = document.getElementById('teachersGrid');
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

    // Update active button
    document.querySelectorAll('.btn-secondary[onclick^="filterTeachers"]').forEach(btn => {
        if (btn.innerText === (type === 'all' ? 'All' : type)) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}
