// Authentication Logic

document.addEventListener('DOMContentLoaded', () => {
    // Role Selector Logic
    const roleOptions = document.querySelectorAll('.role-option');
    let currentRole = 'student'; // Default

    roleOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Update UI
            roleOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');

            // Update State
            currentRole = option.dataset.role;
        });
    });

    // Login Form Logic
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;

            // Validate Input
            if (!/^\d{8,}$/.test(phone)) {
                showModal('Invalid Phonenumber', 'Please enter a valid phone number (at least 8 digits).', 'error');
                return;
            }

            // Mock Authentication
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.phone === phone && u.password === password && u.role === currentRole);

            if (user) {
                // Success
                setCurrentUser(user);
                showToast(`Welcome back, ${user.name}!`, 'success');

                setTimeout(() => {
                    if (user.role === 'student') {
                        window.location.href = 'student-dashboard.html';
                    } else if (user.role === 'teacher') {
                        window.location.href = 'teacher-dashboard.html';
                    }
                }, 1000);
            } else {
                // Failure
                showModal('Login Failed', 'Invalid phone number or password, or incorrect role selected.', 'error');
            }
        });
    }

    // Register Form Logic
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Validation
            if (password !== confirmPassword) {
                showModal('Password Mismatch', 'Passwords do not match.', 'error');
                return;
            }

            if (!/^\d{8,}$/.test(phone)) {
                showModal('Invalid Phone', 'Please enter a valid phone number.', 'error');
                return;
            }

            // Check existing
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.find(u => u.phone === phone)) {
                showModal('Account Exists', 'This phone number is already registered.', 'warning');
                return;
            }

            // Create User (Student only via public register)
            const newUser = {
                id: Date.now().toString(),
                name,
                phone,
                password,
                role: 'student',
                enrolledCourses: [],
                attendanceHistory: [],
                completedHours: 0
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            showModal('Registration Successful', 'Account created! Please log in.', 'success', () => {
                window.location.href = 'login.html';
            });
        });
    }
});
