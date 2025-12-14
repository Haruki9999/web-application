// Authentication JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        
        // Password confirmation validation
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const passwordError = document.getElementById('passwordError');
        
        confirmPassword.addEventListener('input', function() {
            if (password.value !== confirmPassword.value) {
                passwordError.classList.add('active');
            } else {
                passwordError.classList.remove('active');
            }
        });
    }
});

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => 
        u.email === email && 
        u.password === password && 
        u.role === role
    );
    
    if (user) {
        // Check if teacher is approved
        if (role === 'teacher' && !user.isApproved) {
            showAlert('Your teacher account is pending admin approval.', 'error');
            return;
        }
        
        // Save current user
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Redirect based on role
        switch (role) {
            case 'student':
                window.location.href = '/student-dashboard.html';
                break;
            case 'teacher':
                window.location.href = '/teacher-dashboard.html';
                break;
            case 'admin':
                window.location.href = '/admin-dashboard.html';
                break;
        }
    } else {
        showAlert('Invalid email, password, or role selection.', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phone = document.getElementById('phone').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showAlert('Passwords do not match.', 'error');
        return;
    }
    
    // Check if email already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
        showAlert('Email already registered. Please login instead.', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        email,
        password,
        role: 'student',
        name,
        phone,
        enrolledPrograms: [],
        completedHours: 0,
        upcomingClasses: []
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showAlert('Account created successfully! Redirecting to login...', 'success');
    
    setTimeout(() => {
        window.location.href = '/login.html';
    }, 2000);
}

function showAlert(message, type) {
    const container = document.getElementById('alertContainer');
    container.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}
