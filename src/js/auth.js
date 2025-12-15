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
                showModal('Утасны дугаар буруу', 'Зөв утасны дугаар оруулна уу (дор хаяж 8 оронтой).', 'error');
                return;
            }

            // Mock Authentication
            let users = [];
            try {
                users = JSON.parse(localStorage.getItem('users') || '[]');
            } catch (err) {
                console.error('LocalStorage corrupted, resetting...', err);
                localStorage.removeItem('users');
                localStorage.removeItem('teachers');
                localStorage.removeItem('classes');
                alert('System data corrupted. Resetting data...');
                window.location.reload();
                return;
            }

            const user = users.find(u => u.phone === phone && u.password === password && u.role === currentRole);

            if (user) {
                // Success
                setCurrentUser(user);
                showToast(`Тавтай морил, ${user.name}!`, 'success');

                setTimeout(() => {
                    if (user.role === 'student') {
                        window.location.href = 'student-dashboard.html';
                    } else if (user.role === 'teacher') {
                        window.location.href = 'teacher-dashboard.html';
                    }
                }, 1000);
            } else {
                // Failure - Specific Feedback
                const exists = users.find(u => u.phone === phone);
                if (!exists) {
                    showModal('Нэвтрэх амжилтгүй', 'Бүртгэлгүй утасны дугаар байна.', 'error');
                } else if (exists.password !== password) {
                    showModal('Нэвтрэх амжилтгүй', 'Нууц үг буруу байна.', 'error');
                } else if (exists.role !== currentRole) {
                    showModal('Нэвтрэх амжилтгүй', `Та '${exists.role === 'student' ? 'Сурагч' : 'Багш'}' эрхтэй хэрэглэгч байна. Дүрээ зөв сонгоно уу.`, 'warning');
                } else {
                    showModal('Нэвтрэх амжилтгүй', 'Мэдээлэл буруу байна.', 'error');
                }
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
                showModal('Нууц үг таарахгүй байна', 'Нууц үгс таарахгүй байна.', 'error');
                return;
            }

            if (!/^\d{8,}$/.test(phone)) {
                showModal('Утасны дугаар буруу', 'Зөв утасны дугаар оруулна уу.', 'error');
                return;
            }

            // Check existing
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.find(u => u.phone === phone)) {
                showModal('Бүртгэлтэй байна', 'Энэ утасны дугаар аль хэдийн бүртгэлтэй байна.', 'warning');
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

            showModal('Бүртгэл амжилттай', 'Бүртгэл үүслээ! Нэвтэрнэ үү.', 'success', () => {
                window.location.href = 'login.html';
            });
        });
    }
});
