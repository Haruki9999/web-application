// Utility Functions

// Mobile menu toggle
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-content') && !e.target.closest('.mobile-menu')) {
                mobileMenu.classList.remove('active');
            }
        });
    }
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

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/login.html';
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
    toast.style.maxWidth = '500px';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Check authentication and redirect
function checkAuth(requiredRole = null) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        window.location.href = '/login.html';
        return false;
    }
    
    if (requiredRole && currentUser.role !== requiredRole) {
        window.location.href = '/login.html';
        return false;
    }
    
    return true;
}

// Initialize mobile menu on page load
document.addEventListener('DOMContentLoaded', initMobileMenu);
