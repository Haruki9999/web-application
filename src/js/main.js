// Main JavaScript file with shared utilities

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.nav-content')) {
                mobileMenu.classList.remove('active');
            }
        });
    }

    // Load featured programs on homepage
    const featuredProgramsContainer = document.getElementById('featuredPrograms');
    if (featuredProgramsContainer) {
        loadFeaturedPrograms();
    }

    // Load featured teachers on homepage
    const featuredTeachersContainer = document.getElementById('featuredTeachers');
    if (featuredTeachersContainer) {
        loadFeaturedTeachers();
    }

    // Check authentication on protected pages
    checkAuth();

    // Seed initial data if empty
    seedData();
});

// Seed data with correct business logic
function seedData() {
    if (!localStorage.getItem('programs')) {
        const programs = [
            {
                id: 'sat-math',
                name: 'SAT Mathematics',
                qualification: 'International',
                level: 'Advanced',
                duration: '75 Academic Hours', // 1 Academic Hour = 40 mins
                description: 'Comprehensive preparation for SAT Math section.',
                price: 1500000,
                features: ['Full Topic Coverage', 'Practice Tests', 'Teacher Assignments'],
                totalHours: 75
            },
            {
                id: 'mongolian-std',
                name: 'Mongolian Standard Math',
                qualification: 'National',
                level: 'Intermediate',
                duration: '75 Academic Hours',
                description: 'Standard curriculum following national guidelines.',
                price: 1050000,
                features: ['National Curriculum', 'Exam Preparation', 'Homework Tracking'],
                totalHours: 75
            },
            {
                id: 'ielts-prep',
                name: 'IELTS Preparation',
                qualification: 'International',
                level: 'All Levels',
                duration: '75 Academic Hours',
                description: 'Intensive English language training.',
                price: 1500000,
                features: ['Speaking Practice', 'Writing Feedback', 'Mock Exams'],
                totalHours: 75
            }
        ];
        localStorage.setItem('programs', JSON.stringify(programs));
    }

    if (!localStorage.getItem('teachers')) {
        const teachers = [
            {
                id: 't1',
                name: 'Dr. Sarah Johnson',
                photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
                specialization: ['Mathematics', 'SAT'],
                rating: 4.9,
                experience: '8 years',
                bio: 'Expert in SAT preparation with a proven track record.'
            },
            {
                id: 't2',
                name: 'Mr. Bat-Erdene',
                photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
                specialization: ['Algebra', 'Geometry'],
                rating: 4.8,
                experience: '12 years',
                bio: 'Specialist in national curriculum mathematics.'
            },
            {
                id: 't3',
                name: 'Ms. Emily Chen',
                photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
                specialization: ['English', 'IELTS'],
                rating: 5.0,
                experience: '6 years',
                bio: 'Certified IELTS instructor helping students achieve band 7+.'
            }
        ];
        localStorage.setItem('teachers', JSON.stringify(teachers));
    }
}

// Load featured programs
function loadFeaturedPrograms() {
    const programs = JSON.parse(localStorage.getItem('programs') || '[]');
    const featured = programs.slice(0, 3);

    const container = document.getElementById('featuredPrograms');
    container.innerHTML = featured.map(program => `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-badge">${program.qualification}</div>
                </div>
            </div>
            <h3 class="card-title">${program.name}</h3>
            <p class="card-subtitle">${program.level} • ${program.duration}</p>
            <p>${program.description}</p>
            <ul class="card-features">
                ${program.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            <div class="card-price">${program.price.toLocaleString()} MNT</div>
            <div class="card-actions">
                <a href="programs.html#${program.id}" class="btn-primary">View Details</a>
            </div>
        </div>
    `).join('');
}

// Load featured teachers
function loadFeaturedTeachers() {
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const featured = teachers.slice(0, 3);

    const container = document.getElementById('featuredTeachers');
    container.innerHTML = featured.map(teacher => `
        <div class="card teacher-card">
            <img src="${teacher.photo}" alt="${teacher.name}" class="teacher-photo">
            <h3 class="teacher-name">${teacher.name}</h3>
            <p class="teacher-specialization">${teacher.specialization.join(', ')}</p>
            <div class="teacher-rating">
                <span>⭐</span>
                <span>${teacher.rating}</span>
            </div>
            <p class="teacher-experience">${teacher.experience} experience</p>
            <div class="card-actions mt-3">
                <a href="teachers.html#${teacher.id}" class="btn-secondary">View Profile</a>
            </div>
        </div>
    `).join('');
}

// Authentication check
function checkAuth() {
    const currentPage = window.location.pathname;
    const protectedPages = [
        '/student-dashboard.html',
        '/teacher-dashboard.html',
        '/admin-dashboard.html'
    ];

    if (protectedPages.includes(currentPage)) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }

        // Check role-specific access
        if (currentPage.includes('student-dashboard.html') && currentUser.role !== 'student') {
            window.location.href = 'login.html';
        } else if (currentPage.includes('teacher-dashboard.html') && currentUser.role !== 'teacher') {
            window.location.href = 'login.html';
        } else if (currentPage.includes('admin-dashboard.html') && currentUser.role !== 'admin') {
            window.location.href = 'login.html';
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type}`;
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '2rem';
    toast.style.right = '2rem';
    toast.style.zIndex = '1000';
    toast.style.minWidth = '300px';

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Get current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

// Save current user
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}
