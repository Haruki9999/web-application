// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '/login.html';
        return;
    }
    
    loadDashboard();
    
    // Sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
});

function loadDashboard() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const pendingTeachers = JSON.parse(localStorage.getItem('pendingTeachers') || '[]');
    
    // Calculate stats
    const students = users.filter(u => u.role === 'student');
    const teachers = users.filter(u => u.role === 'teacher');
    
    // Update stats
    document.getElementById('totalStudents').textContent = students.length;
    document.getElementById('totalTeachers').textContent = teachers.length;
    document.getElementById('pendingApprovals').textContent = pendingTeachers.length;
    document.getElementById('activeClasses').textContent = 28;
    
    // Load sections
    loadRecentRegistrations(users);
    loadPendingTeachers(pendingTeachers);
    loadAllUsers();
    loadAllClasses();
}

function loadRecentRegistrations(users) {
    const container = document.getElementById('recentRegistrations');
    const recentUsers = users.slice(-5).reverse();
    
    if (recentUsers.length === 0) {
        container.innerHTML = '<p style="color: #6B7280;">No recent registrations</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentUsers.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td><span style="background: ${user.role === 'student' ? '#DBEAFE' : '#E0E7FF'}; color: ${user.role === 'student' ? '#1E40AF' : '#3730A3'}; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">${user.role}</span></td>
                            <td><span style="background: #D1FAE5; color: #065F46; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">Active</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function loadPendingTeachers(pendingTeachers) {
    const container = document.getElementById('pendingTeachersList');
    
    if (pendingTeachers.length === 0) {
        container.innerHTML = `
            <div class="card">
                <p style="color: #6B7280; text-align: center;">No pending teacher applications</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pendingTeachers.map(teacher => `
        <div class="card" style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <h3 style="margin-bottom: 0.5rem;">${teacher.name}</h3>
                    <p style="color: #6B7280; margin: 0.25rem 0;"><strong>Email:</strong> ${teacher.email}</p>
                    <p style="color: #6B7280; margin: 0.25rem 0;"><strong>Specialization:</strong> ${teacher.specialization}</p>
                    <p style="color: #6B7280; margin: 0.25rem 0;"><strong>Experience:</strong> ${teacher.experience}</p>
                    <p style="color: #6B7280; margin: 0.25rem 0;"><strong>Qualifications:</strong> ${teacher.qualifications}</p>
                    <p style="color: #6B7280; margin: 0.25rem 0; font-size: 0.875rem;"><strong>Applied:</strong> ${formatDate(teacher.appliedDate)}</p>
                </div>
                <span style="background: #FEF3C7; color: #92400E; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">Pending</span>
            </div>
            <div style="display: flex; gap: 0.75rem;">
                <button class="btn-success" onclick="approveTeacher('${teacher.id}')">Approve</button>
                <button class="btn-danger" onclick="rejectTeacher('${teacher.id}')">Reject</button>
            </div>
        </div>
    `).join('');
}

function loadAllUsers() {
    const container = document.getElementById('usersList');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const filterValue = document.getElementById('userRoleFilter')?.value || 'all';
    
    const filteredUsers = filterValue === 'all' 
        ? users 
        : users.filter(u => u.role === filterValue);
    
    container.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredUsers.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td><span style="background: ${getRoleColor(user.role)}; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">${user.role}</span></td>
                            <td><span style="background: #D1FAE5; color: #065F46; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem;">Active</span></td>
                            <td>
                                <button class="btn-secondary" style="padding: 0.375rem 0.75rem; font-size: 0.875rem;" onclick="viewUser('${user.id}')">View</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function loadAllClasses() {
    const container = document.getElementById('classesList');
    
    // Mock classes data
    const classes = [
        { id: '1', subject: 'SAT Mathematics', teacher: 'Dr. Sarah Johnson', date: '2025-12-02', time: '09:00', students: 8 },
        { id: '2', subject: 'IGCSE Algebra', teacher: 'Prof. Michael Chen', date: '2025-12-02', time: '14:00', students: 12 },
        { id: '3', subject: 'A Level Calculus', teacher: 'Dr. James Wilson', date: '2025-12-03', time: '16:00', students: 6 },
        { id: '4', subject: 'IB Mathematics HL', teacher: 'Ms. Emily Rodriguez', date: '2025-12-04', time: '10:00', students: 10 },
        { id: '5', subject: 'ACT Math', teacher: 'Mr. David Kim', date: '2025-12-04', time: '14:00', students: 15 }
    ];
    
    container.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Teacher</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Students</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${classes.map(cls => `
                        <tr>
                            <td>${cls.subject}</td>
                            <td>${cls.teacher}</td>
                            <td>${formatDate(cls.date)}</td>
                            <td>${cls.time}</td>
                            <td>${cls.students}</td>
                            <td>
                                <button class="btn-secondary" style="padding: 0.375rem 0.75rem; font-size: 0.875rem;" onclick="viewClass('${cls.id}')">View</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function approveTeacher(teacherId) {
    if (!confirm('Are you sure you want to approve this teacher?')) return;
    
    let pendingTeachers = JSON.parse(localStorage.getItem('pendingTeachers') || '[]');
    const teacher = pendingTeachers.find(t => t.id === teacherId);
    
    if (!teacher) return;
    
    // Remove from pending
    pendingTeachers = pendingTeachers.filter(t => t.id !== teacherId);
    localStorage.setItem('pendingTeachers', JSON.stringify(pendingTeachers));
    
    // Add to users as approved teacher
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push({
        id: Date.now().toString(),
        email: teacher.email,
        password: 'tempPassword123',
        role: 'teacher',
        name: teacher.name,
        isApproved: true,
        totalStudents: 0,
        upcomingClasses: 0,
        materialsUploaded: 0
    });
    localStorage.setItem('users', JSON.stringify(users));
    
    // Add to teachers list
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    teachers.push({
        id: Date.now().toString(),
        name: teacher.name,
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
        specialization: teacher.specialization.split(',').map(s => s.trim()),
        rating: 5.0,
        experience: teacher.experience,
        isApproved: true,
        bio: `${teacher.qualifications} with ${teacher.experience} of teaching experience`
    });
    localStorage.setItem('teachers', JSON.stringify(teachers));
    
    showToast('Teacher approved successfully!', 'success');
    loadDashboard();
}

function rejectTeacher(teacherId) {
    if (!confirm('Are you sure you want to reject this teacher application?')) return;
    
    let pendingTeachers = JSON.parse(localStorage.getItem('pendingTeachers') || '[]');
    pendingTeachers = pendingTeachers.filter(t => t.id !== teacherId);
    localStorage.setItem('pendingTeachers', JSON.stringify(pendingTeachers));
    
    showToast('Teacher application rejected', 'error');
    loadDashboard();
}

function viewUser(userId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    let details = `User Details:\n\nName: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}`;
    
    if (user.role === 'student') {
        details += `\n\nEnrolled Programs: ${user.enrolledPrograms?.length || 0}`;
        details += `\nCompleted Hours: ${user.completedHours || 0}/75`;
        details += `\nUpcoming Classes: ${user.upcomingClasses?.length || 0}`;
    } else if (user.role === 'teacher') {
        details += `\n\nTotal Students: ${user.totalStudents || 0}`;
        details += `\nUpcoming Classes: ${user.upcomingClasses || 0}`;
        details += `\nMaterials Uploaded: ${user.materialsUploaded || 0}`;
    }
    
    alert(details);
}

function viewClass(classId) {
    alert(`Viewing class details for class ${classId}\n\nFeatures:\n- Student list\n- Attendance records\n- Materials\n- Performance metrics`);
}

function getRoleColor(role) {
    switch (role) {
        case 'student': return '#DBEAFE; color: #1E40AF';
        case 'teacher': return '#E0E7FF; color: #3730A3';
        case 'admin': return '#FEE2E2; color: #991B1B';
        default: return '#F3F4F6; color: #4B5563';
    }
}

function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => section.style.display = 'none');
    
    // Show selected section
    document.getElementById(sectionId).style.display = 'block';
    
    // Update active nav link
    const links = document.querySelectorAll('.sidebar-nav a');
    links.forEach(link => link.classList.remove('active'));
    event.target.closest('a').classList.add('active');
    
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
}
