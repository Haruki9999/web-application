// Teachers page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadTeachers();
    
    const filterSelect = document.getElementById('filterSpecialization');
    if (filterSelect) {
        filterSelect.addEventListener('change', loadTeachers);
    }
});

function loadTeachers() {
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const filterValue = document.getElementById('filterSpecialization')?.value || 'all';
    
    const filteredTeachers = filterValue === 'all' 
        ? teachers.filter(t => t.isApproved)
        : teachers.filter(t => t.isApproved && t.specialization.includes(filterValue));
    
    const container = document.getElementById('teachersGrid');
    
    if (filteredTeachers.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <h3>No teachers found</h3>
                <p style="color: #6B7280;">Try selecting a different filter</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTeachers.map(teacher => `
        <div class="card teacher-card" id="${teacher.id}">
            <img src="${teacher.photo}" alt="${teacher.name}" class="teacher-photo">
            <h3 class="teacher-name">${teacher.name}</h3>
            <p class="teacher-specialization">${teacher.specialization.join(', ')}</p>
            <div class="teacher-rating">
                <span>⭐</span>
                <span>${teacher.rating}</span>
            </div>
            <p class="teacher-experience">${teacher.experience} experience</p>
            <p style="margin: 1rem 0; color: #6B7280; font-size: 0.875rem;">${teacher.bio}</p>
            <div class="card-actions mt-3">
                <button onclick="bookClass('${teacher.id}')" class="btn-primary">Book Class</button>
                <button onclick="viewTeacherProfile('${teacher.id}')" class="btn-secondary">View Profile</button>
            </div>
        </div>
    `).join('');
    
    // Scroll to teacher if hash exists
    if (window.location.hash) {
        const id = window.location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.style.animation = 'highlight 1s';
            }, 100);
        }
    }
}

function bookClass(teacherId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (!currentUser) {
        alert('Please login as a student to book classes.');
        window.location.href = '/login.html';
        return;
    }
    
    if (currentUser.role !== 'student') {
        alert('Only students can book classes.');
        return;
    }
    
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const teacher = teachers.find(t => t.id === teacherId);
    
    // Simple booking confirmation
    const date = prompt('Enter preferred date (YYYY-MM-DD):', '2025-12-05');
    if (!date) return;
    
    const time = prompt('Enter preferred time (HH:MM):', '14:00');
    if (!time) return;
    
    const subject = prompt('Enter subject/topic:', teacher.specialization[0]);
    if (!subject) return;
    
    if (confirm(`Book class with ${teacher.name}?\n\nDate: ${date}\nTime: ${time}\nSubject: ${subject}`)) {
        const newClass = {
            id: Date.now().toString(),
            subject: subject,
            teacher: teacher.name,
            date: date,
            time: time,
            duration: 1.5
        };
        
        currentUser.upcomingClasses.push(newClass);
        
        // Update user in storage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        alert('Class booked successfully! Check your dashboard.');
        window.location.href = '/student-dashboard.html';
    }
}

function viewTeacherProfile(teacherId) {
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const teacher = teachers.find(t => t.id === teacherId);
    
    alert(`
${teacher.name}

Specializations: ${teacher.specialization.join(', ')}
Experience: ${teacher.experience}
Rating: ${teacher.rating} ⭐

Bio:
${teacher.bio}

Click "Book Class" to schedule a session!
    `);
}

// Add highlight animation
const style = document.createElement('style');
style.textContent = `
    @keyframes highlight {
        0%, 100% { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
        50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
    }
`;
document.head.appendChild(style);
