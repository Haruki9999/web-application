// Utility Functions
const ACADEMIC_HOUR_MINS = 40; // Kept from previous logic

// Mobile menu toggle
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            mobileMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.nav-content') && !e.target.closest('.mobile-menu')) {
                mobileMenu.classList.remove('active');
            }
        });
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
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
    showModal('Confirm Logout', 'Are you sure you want to log out?', 'warning', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
}

// Check authentication and redirect
function checkAuth(requiredRole = null) {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }

    if (requiredRole && currentUser.role !== requiredRole) {
        showToast('Unauthorized access', 'error');
        window.location.href = 'login.html';
        return false;
    }

    return true;
}

// --- Global Modal System ---

function createModalContainer() {
    if (document.getElementById('globalModal')) return;

    const modalHTML = `
        <div id="globalModal" class="modal-backdrop">
            <div class="modal-container">
                <div class="modal-header">
                    <h3 id="globalModalTitle" class="modal-title">Title</h3>
                </div>
                <div id="globalModalMessage" class="modal-message">
                    Message goes here...
                </div>
                <div class="modal-actions" id="globalModalActions">
                    <!-- Buttons injected here -->
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Show a global modal
 * @param {string} title 
 * @param {string} message 
 * @param {'success'|'error'|'warning'|'info'} type 
 * @param {Function} onConfirm - Optional callback for confirmation
 */
function showModal(title, message, type = 'info', onConfirm = null) {
    createModalContainer();

    const modal = document.getElementById('globalModal');
    const container = modal.querySelector('.modal-container');
    const titleEl = document.getElementById('globalModalTitle');
    const messageEl = document.getElementById('globalModalMessage');
    const actionsEl = document.getElementById('globalModalActions');

    // Reset classes
    container.className = 'modal-container';
    container.classList.add(`modal-type-${type}`);

    titleEl.textContent = title;
    messageEl.innerHTML = message;

    // Build Actions
    actionsEl.innerHTML = '';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-secondary';
    closeBtn.textContent = onConfirm ? 'Cancel' : 'Close';
    closeBtn.onclick = () => closeModal();
    actionsEl.appendChild(closeBtn);

    if (onConfirm) {
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'btn btn-primary';
        confirmBtn.textContent = 'Confirm';
        confirmBtn.onclick = () => {
            closeModal();
            onConfirm();
        };
        actionsEl.appendChild(confirmBtn);
    }

    // Show
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('globalModal');
    if (modal) modal.classList.remove('active');
}

// --- Toast System ---

function createToastContainer() {
    if (document.getElementById('toastContainer')) return;
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
}

function showToast(title, type = 'success', message = '') {
    createToastContainer();
    const container = document.getElementById('toastContainer');

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            ${message ? `<div class="toast-message">${message}</div>` : ''}
        </div>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize mobile menu on page load
document.addEventListener('DOMContentLoaded', initMobileMenu);
