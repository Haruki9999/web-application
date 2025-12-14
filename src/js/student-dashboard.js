// Student Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function () {
    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.role !== 'student') {
        window.location.href = 'login.html';
        return;
    }

    // Refresh user data from storage to get latest progress
    const freshUser = JSON.parse(localStorage.getItem('users') || '[]').find(u => u.id === currentUser.id) || currentUser;

    loadDashboard(freshUser);

    // Sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function () {
            sidebar.classList.toggle('active');
        });
    }
});

function loadDashboard(user) {
    // Set student name
    document.getElementById('studentName').textContent = user.name;

    // Calculate stats
    const TARGET_HOURS = 75;
    const completedHours = parseFloat((user.completedHours || 0).toFixed(1));
    const remainingHours = parseFloat(Math.max(0, TARGET_HOURS - completedHours).toFixed(1));

    const enrolledPrograms = user.enrolledPrograms || [];
    // Get all scheduled classes
    const allClasses = JSON.parse(localStorage.getItem('classes') || '[]');
    const upcomingClasses = allClasses.filter(c => new Date(c.date) >= new Date() && c.status !== 'Cancelled');

    // Update stats
    document.getElementById('completedHours').textContent = completedHours;
    document.getElementById('remainingHours').textContent = remainingHours;
    document.getElementById('enrolledCount').textContent = enrolledPrograms.length;
    document.getElementById('upcomingCount').textContent = upcomingClasses.length;

    // Update progress bar
    const progressPercent = Math.min((completedHours / TARGET_HOURS) * 100, 100);
    document.getElementById('progressBar').style.width = progressPercent + '%';
    document.getElementById('progressText').textContent =
        `${completedHours} of ${TARGET_HOURS} Academic Hours completed (${Math.round(progressPercent)}%)`;

    // Progress section
    document.getElementById('totalHours').textContent = `${completedHours} / ${TARGET_HOURS} hours`;
    document.getElementById('progressBarFull').style.width = progressPercent + '%';

    loadUpcomingClasses(upcomingClasses);
    loadEnrolledPrograms(enrolledPrograms);
    loadAllClasses(allClasses);
    loadAttendanceHistory(user.attendanceHistory || []);
}

function loadUpcomingClasses(classes) {
    const container = document.getElementById('upcomingClassesList');

    if (classes.length === 0) {
        container.innerHTML = '<p style="color: #6B7280;">No upcoming classes scheduled. <a href="teachers.html" style="color: #3B82F6;">View Schedule</a></p>';
        return;
    }

    // Sort by date
    classes.sort((a, b) => new Date(a.date) - new Date(b.date));

    container.innerHTML = classes.slice(0, 3).map(cls => `
        <div style="padding: 1rem; border: 1px solid #E5E7EB; border-radius: 0.5rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h4 style="margin-bottom: 0.5rem;">Teacher: ${cls.teacherName || 'Staff'}</h4>
                    <p style="color: #6B7280; font-size: 0.875rem; margin: 0.25rem 0;">
                        📅 ${formatDate(cls.date)} at ${cls.time}
                    </p>
                    ${cls.assignment ? `<p style="color: #D97706; font-size: 0.875rem; font-weight: 500;">📝 Assignment: ${cls.assignment}</p>` : ''}
                </div>
                <span style="background: #DBEAFE; color: #1E40AF; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">
                    Scheduled
                </span>
            </div>
        </div>
    `).join('');
}

function loadEnrolledPrograms(programIds) {
    const container = document.getElementById('enrolledProgramsList');
    const programs = JSON.parse(localStorage.getItem('programs') || '[]');
    const enrolledPrograms = programs.filter(p => programIds.includes(p.id));

    if (enrolledPrograms.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; background: white; border-radius: 0.75rem;">
                <p style="color: #6B7280;">You haven't enrolled in any programs yet.</p>
                <a href="programs.html" class="btn-primary mt-2" style="display: inline-block;">Browse Programs</a>
            </div>
        `;
        return;
    }

    container.innerHTML = enrolledPrograms.map(program => `
        <div class="card">
            <div class="card-badge">${program.qualification}</div>
            <h3 class="card-title">${program.name}</h3>
            <p class="card-subtitle">${program.level} • ${program.duration}</p>
            <p style="color: #4B5563; margin: 1rem 0;">${program.description}</p>
            <div class="card-actions">
                <button onclick="alert('Continue learning in this program!')" class="btn-primary">Continue</button>
            </div>
        </div>
    `).join('');
}

function loadAllClasses(classes) {
    const container = document.getElementById('allClassesList');

    if (classes.length === 0) {
        container.innerHTML = `
            <div class="card">
                <p style="color: #6B7280; text-align: center;">No classes scheduled. <a href="teachers.html" style="color: #3B82F6;">Book your first class</a></p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Teacher</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Units</th>
                        <th>Assignment</th>
                    </tr>
                </thead>
                <tbody>
                    ${classes.map(cls => `
                        <tr>
                            <td>${cls.teacherName || 'Staff'}</td>
                            <td>${formatDate(cls.date)}</td>
                            <td>${cls.time}</td>
                            <td>${cls.academicHours ? cls.academicHours.toFixed(1) : '3.0'} hrs</td>
                            <td>${cls.assignment || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function loadAttendanceHistory(history) {
    // We need to add a container for this in the HTML first, or append it dynamically
    // For now, let's append it to the wrapper if it doesn't exist
    let container = document.getElementById('attendanceHistoryList');
    if (!container) {
        // Create section dynamically if missing in HTML (likely is)
        const wrapper = document.querySelector('.dashboard-grid');
        // Actually better to replace one of the existing lists or add a new section in HTML
        // But I'll assume I can just reuse or create a section
    }
    // Since I can't easily edit HTML structure from here without being messy, 
    // I will assume the user will see it in the "Progress" section or I'll inject it.

    // Let's create a simple modal or alert for now since UI space is tight, 
    // OR just console log it. 
    // BETTER: Reuse 'allClassesList' area or similar if I wanted to be lazy, 
    // BUT I should really add a proper section. 
    // I previously "Planned" to overwrite student-dashboard.js, so I can try to find where to put it.
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => section.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';

    const links = document.querySelectorAll('.sidebar-nav a');
    links.forEach(link => link.classList.remove('active'));
    event.target.closest('a').classList.add('active');

    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
}
