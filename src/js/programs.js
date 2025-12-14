// Programs page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    loadPrograms();
    
    const filterSelect = document.getElementById('filterQualification');
    if (filterSelect) {
        filterSelect.addEventListener('change', loadPrograms);
    }
});

function loadPrograms() {
    const programs = JSON.parse(localStorage.getItem('programs') || '[]');
    const filterValue = document.getElementById('filterQualification')?.value || 'all';
    
    const filteredPrograms = filterValue === 'all' 
        ? programs 
        : programs.filter(p => p.qualification === filterValue);
    
    const container = document.getElementById('programsGrid');
    
    if (filteredPrograms.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <h3>No programs found</h3>
                <p style="color: #6B7280;">Try selecting a different filter</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredPrograms.map(program => `
        <div class="card" id="${program.id}">
            <div class="card-header">
                <div>
                    <div class="card-badge">${program.qualification}</div>
                </div>
            </div>
            <h3 class="card-title">${program.name}</h3>
            <p class="card-subtitle">${program.level} • ${program.duration}</p>
            <p style="margin: 1rem 0; color: #4B5563;">${program.description}</p>
            <ul class="card-features">
                ${program.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            <div class="card-price">$${program.price}</div>
            <div class="card-actions">
                <button onclick="enrollProgram('${program.id}')" class="btn-primary">Enroll Now</button>
                <button onclick="viewProgramDetails('${program.id}')" class="btn-secondary">Learn More</button>
            </div>
        </div>
    `).join('');
    
    // Scroll to program if hash exists
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

function enrollProgram(programId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (!currentUser) {
        alert('Please login as a student to enroll in programs.');
        window.location.href = '/login.html';
        return;
    }
    
    if (currentUser.role !== 'student') {
        alert('Only students can enroll in programs.');
        return;
    }
    
    const programs = JSON.parse(localStorage.getItem('programs') || '[]');
    const program = programs.find(p => p.id === programId);
    
    if (confirm(`Enroll in ${program.name} for $${program.price}?`)) {
        // Add to enrolled programs
        if (!currentUser.enrolledPrograms.includes(programId)) {
            currentUser.enrolledPrograms.push(programId);
            
            // Update user in storage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            alert('Successfully enrolled! Check your dashboard.');
            window.location.href = '/student-dashboard.html';
        } else {
            alert('You are already enrolled in this program.');
        }
    }
}

function viewProgramDetails(programId) {
    const programs = JSON.parse(localStorage.getItem('programs') || '[]');
    const program = programs.find(p => p.id === programId);
    
    alert(`
${program.name}

Qualification: ${program.qualification}
Level: ${program.level}
Duration: ${program.duration}
Price: $${program.price}

Description:
${program.description}

Features:
${program.features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Click "Enroll Now" to join this program!
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
