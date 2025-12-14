// Teacher Dashboard JavaScript
const ACADEMIC_HOUR_MINS = 40;

document.addEventListener('DOMContentLoaded', function () {
    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.role !== 'teacher') {
        window.location.href = 'login.html';
        return;
    }

    loadDashboard(currentUser);

    // Sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function () {
            sidebar.classList.toggle('active');
        });
    }

    // Create class form
    const createClassForm = document.getElementById('createClassForm');
    if (createClassForm) {
        createClassForm.addEventListener('submit', handleCreateClass);
    }

    // Upload material form
    const uploadMaterialForm = document.getElementById('uploadMaterialForm');
    if (uploadMaterialForm) {
        uploadMaterialForm.addEventListener('submit', handleUploadMaterial);
    }
});

function loadDashboard(user) {
    // Set teacher name
    document.getElementById('teacherName').textContent = user.name;

    // Update stats from localStorage real data
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const myClasses = classes.filter(c => c.teacherId === user.id || !c.teacherId); // !teacherId for legacy mock data fallback

    document.getElementById('totalStudents').textContent = user.totalStudents || 0;
    document.getElementById('upcomingClasses').textContent = myClasses.length;
    document.getElementById('materialsCount').textContent = user.materialsUploaded || 0;
    document.getElementById('weeklyClasses').textContent = myClasses.filter(c => isThisWeek(c.date)).length;

    loadTodaySchedule(myClasses);
    loadClassesList(myClasses);
    loadMaterials();
}

function isThisWeek(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
    const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return date >= firstDay && date <= lastDay;
}

function loadTodaySchedule(classes) {
    const container = document.getElementById('todaySchedule');
    const today = new Date().toISOString().split('T')[0];
    const todaysClasses = classes.filter(c => c.date === today);

    if (todaysClasses.length === 0) {
        container.innerHTML = '<p style="color: #6B7280;">No classes scheduled for today.</p>';
        return;
    }

    container.innerHTML = todaysClasses.map(item => `
        <div style="padding: 1rem; border-left: 3px solid #3B82F6; background: #F9FAFB; border-radius: 0.5rem; margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="margin-bottom: 0.25rem;">${item.subject}</h4>
                    <p style="color: #6B7280; font-size: 0.875rem; margin: 0;">
                        ⏰ ${item.time} | 👥 ${item.students || 0} students
                    </p>
                    ${item.assignment ? `<p style="color: #4B5563; font-size: 0.875rem; margin-top: 0.25rem;">📝 Assignment: ${item.assignment}</p>` : ''}
                </div>
                <button class="btn-secondary" style="padding: 0.5rem 1rem;" onclick="takeAttendance('${item.id}')">Attendance</button>
            </div>
        </div>
    `).join('');
}

function loadClassesList(classes) {
    const container = document.getElementById('classesList');

    if (!localStorage.getItem('classes')) {
        if (classes.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">No classes created yet.</p>';
            return;
        }
    }

    container.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Students</th>
                        <th>Assignment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${classes.map(cls => `
                        <tr>
                            <td>${cls.subject}</td>
                            <td>${formatDate(cls.date)}</td>
                            <td>${cls.time}</td>
                            <td>${cls.students || 0}</td>
                            <td>${cls.assignment ? '✅ Assigned' : '<span style="color:#9CA3AF">None</span>'}</td>
                            <td>
                                <button class="btn-secondary" style="padding: 0.375rem 0.75rem; font-size: 0.875rem; margin-right: 5px;" onclick="takeAttendance('${cls.id}')">Attendance</button>
                                <button class="btn-primary" style="padding: 0.375rem 0.75rem; font-size: 0.875rem;" onclick="addAssignment('${cls.id}')">Assign</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function loadMaterials() {
    const container = document.getElementById('materialsList');
    const materials = [
        { id: '1', title: 'Algebra Fundamentals', type: 'PDF', uploadDate: '2025-11-25', downloads: 45 },
    ];
    container.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead><tr><th>Title</th><th>Type</th><th>Actions</th></tr></thead>
                <tbody>
                    ${materials.map(m => `<tr><td>${m.title}</td><td>${m.type}</td><td><button class="btn-danger">Delete</button></td></tr>`).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function handleCreateClass(e) {
    e.preventDefault();

    const subject = document.getElementById('classSubject').value;
    const date = document.getElementById('classDate').value;
    const time = document.getElementById('classTime').value;
    const durationMins = parseFloat(document.getElementById('classDuration').value) * 60; // Input is in hours
    const capacity = document.getElementById('classCapacity').value;

    const currentUser = getCurrentUser();

    // Create new class object
    const newClass = {
        id: Date.now().toString(),
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        subject,
        date,
        time,
        durationMins: durationMins || 120, // Default 2 hours if parsing fails
        academicHours: (durationMins || 120) / ACADEMIC_HOUR_MINS,
        students: 0,
        maxStudents: capacity,
        status: 'Scheduled',
        assignment: null,
        attendanceTaken: false
    };

    // Save to localStorage
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    classes.push(newClass);
    localStorage.setItem('classes', JSON.stringify(classes));

    // Update dashboard stats
    currentUser.upcomingClasses = (currentUser.upcomingClasses || 0) + 1;
    setCurrentUser(currentUser);

    alert(`Class Created Successfully!\nSubject: ${subject}\nDate: ${date}`);
    e.target.reset();
    loadDashboard(currentUser);
    showSection('classes');
}

function addAssignment(classId) {
    const assignmentText = prompt("Enter assignment details for this class:");
    if (!assignmentText) return;

    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const clsIndex = classes.findIndex(c => c.id === classId);

    if (clsIndex !== -1) {
        classes[clsIndex].assignment = assignmentText;
        localStorage.setItem('classes', JSON.stringify(classes));
        alert("Assignment added successfully!");
        loadDashboard(getCurrentUser());
    }
}

function takeAttendance(classId) {
    const classes = JSON.parse(localStorage.getItem('classes') || '[]');
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const students = users.filter(u => u.role === 'student');

    if (students.length === 0) {
        alert("No students found in the system to take attendance for.");
        return;
    }

    const presentStudents = [];
    students.forEach(student => {
        if (confirm(`Is ${student.name} present?`)) {
            presentStudents.push(student);
        }
    });

    if (presentStudents.length > 0) {
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]'); // Reload to be safe

        presentStudents.forEach(pStudent => {
            const userIndex = allUsers.findIndex(u => u.id === pStudent.id);
            if (userIndex !== -1) {
                const user = allUsers[userIndex];

                if (!user.attendanceHistory) user.attendanceHistory = [];

                user.attendanceHistory.push({
                    date: cls.date,
                    subject: cls.subject,
                    status: 'Present',
                    units: cls.academicHours || 3,
                    assignment: cls.assignment
                });

                user.completedHours = (user.completedHours || 0) + (cls.academicHours || 3);

                allUsers[userIndex] = user;
            }
        });

        localStorage.setItem('users', JSON.stringify(allUsers));

        cls.attendanceTaken = true;
        cls.students = presentStudents.length;
        const clsIndex = classes.findIndex(c => c.id === classId);
        classes[clsIndex] = cls;
        localStorage.setItem('classes', JSON.stringify(classes));

        alert(`Attendance recorded! ${presentStudents.length} students marked present. Progress updated.`);
        loadDashboard(getCurrentUser());
    }
}

function handleUploadMaterial(e) {
    e.preventDefault();
    alert("Material upload simulated.");
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
