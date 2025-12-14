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
// Logout function
function logout() {
    const content = `
        <div style="text-align: center; padding: 1rem 0;">
            <p style="margin-bottom: 2rem; color: var(--text-muted); font-size: 1.1rem;">Are you sure you want to end your session?</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="closeModal()" class="btn btn-secondary" style="min-width: 120px;">Cancel</button>
                <button onclick="performLogout()" class="btn" style="min-width: 120px; background-color: #ef4444; color: white; border: none; box-shadow: var(--shadow-sm);">Log Out</button>
            </div>
        </div>
    `;

    showModal('Confirm Logout', content, 'warning');

    // Hide default footer since we have custom buttons
    const footer = document.querySelector('#globalModal .modal-actions');
    if (footer) footer.style.display = 'none';
}

window.performLogout = function () {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
};

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
            if (onConfirm) {
                try {
                    console.log('Modal confirm clicked');
                    const result = onConfirm();
                    // If callback explicitly returns false, do not close (e.g. validation failed)
                    if (result === false) return;
                } catch (err) {
                    console.error('Error in modal confirm:', err);
                    alert('An error occurred: ' + err.message); // Fallback for visibility
                }
            }
            closeModal();
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
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initFloatingIcons(); // New Feature
});

// Floating Icons System
function initFloatingIcons() {
    if (document.querySelector('.floating-container')) return;

    const container = document.createElement('div');
    container.className = 'floating-container';

    // Math Symbols
    const symbols = ['π', '∑', '∫', '∞', '√', '÷', '×', '≈', '≠', '≤'];

    // Create random distribution
    let html = '';

    // Fixed big ones
    html += `<div class="float-item" style="left: 5%; animation-duration: 25s;">π</div>`;
    html += `<div class="float-item" style="left: 85%; animation-duration: 30s; animation-delay: 5s;">∑</div>`;

    // Random ones
    for (let i = 0; i < 15; i++) {
        const left = Math.floor(Math.random() * 100);
        const duration = 15 + Math.floor(Math.random() * 20);
        const delay = Math.floor(Math.random() * 10);
        const size = 1 + Math.random() * 3;
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];

        html += `<div class="float-item" style="
            left: ${left}%; 
            animation-duration: ${duration}s; 
            animation-delay: -${delay}s; /* Start mid-animation */
            font-size: ${size}rem;
        ">${symbol}</div>`;
    }

    container.innerHTML = html;
    document.body.prepend(container);

    // Inject CSS if not present
    if (!document.querySelector('link[href*="floating.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';

        // Determine path based on location
        // If we are deep in src/ (e.g. src/teacher-dashboard.html), path is styles/floating.css
        // If we are at root (index.html), path is src/styles/floating.css
        const isInSrc = window.location.pathname.includes('/src/');
        link.href = isInSrc ? 'styles/floating.css' : 'src/styles/floating.css';

        document.head.appendChild(link);
    }
}
