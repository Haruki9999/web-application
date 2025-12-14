// Authentication Component

class AuthComponent {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initLoginForm();
            this.initRegisterForm();
        });
    }

    initLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    initRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) return;

        registerForm.addEventListener('submit', (e) => this.handleRegister(e));

        // Password confirmation validation
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const passwordError = document.getElementById('passwordError');

        if (password && confirmPassword && passwordError) {
            confirmPassword.addEventListener('input', () => {
                if (password.value !== confirmPassword.value) {
                    passwordError.classList.add('active');
                } else {
                    passwordError.classList.remove('active');
                }
            });
        }
    }

    handleLogin(e) {
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
                this.showAlert('Your teacher account is pending admin approval.', 'error');
                return;
            }

            // Save current user
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Redirect based on role
            switch (role) {
                case 'student':
                    window.location.href = 'student-dashboard.html';
                    break;
                case 'teacher':
                    window.location.href = 'teacher-dashboard.html';
                    break;
                case 'admin':
                    window.location.href = 'admin-dashboard.html';
                    break;
            }
        } else {
            this.showAlert('Invalid email, password, or role selection.', 'error');
        }
    }

    handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const phone = document.getElementById('phone').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            this.showAlert('Passwords do not match.', 'error');
            return;
        }

        // Check if email already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) {
            this.showAlert('Email already registered. Please login instead.', 'error');
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

        this.showAlert('Account created successfully! Redirecting to login...', 'success');

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }

    showAlert(message, type) {
        const container = document.getElementById('alertContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="alert alert-${type}">
                ${message}
            </div>
        `;

        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }
}

// Initialize auth component
new AuthComponent();
