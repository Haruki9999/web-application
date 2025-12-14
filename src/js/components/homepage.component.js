// Homepage Component

class HomepageComponent {
    constructor() {
        this.init();
    }

    init() {
        // Wait for data to be initialized, then load content
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                // Small delay to ensure data.js has initialized
                setTimeout(() => {
                    this.loadFeaturedPrograms();
                    this.loadFeaturedTeachers();
                }, 100);
            });
        } else {
            // DOM already loaded
            setTimeout(() => {
                this.loadFeaturedPrograms();
                this.loadFeaturedTeachers();
            }, 100);
        }
    }

    loadFeaturedPrograms() {
        const container = document.getElementById('featuredPrograms');
        if (!container) return;

        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        
        if (programs.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6B7280; padding: 2rem;">No programs available at the moment.</p>';
            return;
        }
        
        const featured = programs.slice(0, 3);
        
        container.innerHTML = featured.map(program => this.renderProgramCard(program)).join('');
    }

    renderProgramCard(program) {
        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-badge">${program.qualification}</div>
                    </div>
                </div>
                <h3 class="card-title">${program.name}</h3>
                <p class="card-subtitle">${program.level} • ${program.duration}</p>
                <p style="color: #4B5563; margin: 1rem 0;">${program.description}</p>
                <ul class="card-features">
                    ${program.features.map(f => `<li>${f}</li>`).join('')}
                </ul>
                <div class="card-price">$${program.price}</div>
                <div class="card-actions">
                    <a href="/programs.html#${program.id}" class="btn-primary">View Details</a>
                </div>
            </div>
        `;
    }

    loadFeaturedTeachers() {
        const container = document.getElementById('featuredTeachers');
        if (!container) return;

        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        
        if (teachers.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #6B7280; padding: 2rem;">No teachers available at the moment.</p>';
            return;
        }
        
        const featured = teachers.slice(0, 3);
        
        container.innerHTML = featured.map(teacher => this.renderTeacherCard(teacher)).join('');
    }

    renderTeacherCard(teacher) {
        return `
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
                    <a href="/teachers.html#${teacher.id}" class="btn-secondary">View Profile</a>
                </div>
            </div>
        `;
    }
}

// Initialize homepage component
new HomepageComponent();
