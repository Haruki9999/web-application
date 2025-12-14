// Search Component

class SearchComponent {
    constructor() {
        this.searchInput = null;
        this.searchResults = null;
        this.searchClear = null;
        this.searchTimeout = null;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.searchInput = document.getElementById('searchInput');
            this.searchResults = document.getElementById('searchResults');
            this.searchClear = document.getElementById('searchClear');
            
            if (!this.searchInput) return;

            this.bindEvents();
            this.hideSearchClear();
        });
    }

    bindEvents() {
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.searchClear.addEventListener('click', () => this.clearSearch());
        document.addEventListener('click', (e) => this.handleClickOutside(e));
        document.addEventListener('keydown', (e) => this.handleEscape(e));
    }

    handleSearch(e) {
        const query = e.target.value.trim();
        
        if (query) {
            this.showSearchClear();
        } else {
            this.hideSearchClear();
            this.hideResults();
            return;
        }

        // Debounce search
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }

    performSearch(query) {
        const programs = JSON.parse(localStorage.getItem('programs') || '[]');
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');

        const lowerQuery = query.toLowerCase();

        // Search programs
        const matchedPrograms = programs.filter(program => 
            program.name.toLowerCase().includes(lowerQuery) ||
            program.qualification.toLowerCase().includes(lowerQuery) ||
            program.level.toLowerCase().includes(lowerQuery) ||
            program.description.toLowerCase().includes(lowerQuery)
        ).slice(0, 3);

        // Search teachers
        const matchedTeachers = teachers.filter(teacher => 
            teacher.name.toLowerCase().includes(lowerQuery) ||
            teacher.specialization.some(s => s.toLowerCase().includes(lowerQuery)) ||
            teacher.bio.toLowerCase().includes(lowerQuery)
        ).slice(0, 3);

        this.displayResults(matchedPrograms, matchedTeachers);
    }

    displayResults(programs, teachers) {
        if (programs.length === 0 && teachers.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-no-results">
                    <p>No results found. Try a different search term.</p>
                </div>
            `;
            this.showResults();
            return;
        }

        let html = '';

        if (programs.length > 0) {
            html += '<div class="search-category">Programs</div>';
            programs.forEach(program => {
                html += this.renderProgramResult(program);
            });
        }

        if (teachers.length > 0) {
            html += '<div class="search-category">Teachers</div>';
            teachers.forEach(teacher => {
                html += this.renderTeacherResult(teacher);
            });
        }

        this.searchResults.innerHTML = html;
        this.showResults();
    }

    renderProgramResult(program) {
        return `
            <div class="search-item" onclick="window.location.href='/programs.html#${program.id}'">
                <h4>${program.name}</h4>
                <p>${program.qualification} • ${program.duration} • $${program.price}</p>
            </div>
        `;
    }

    renderTeacherResult(teacher) {
        return `
            <div class="search-item" onclick="window.location.href='/teachers.html#${teacher.id}'">
                <h4>${teacher.name}</h4>
                <p>${teacher.specialization.join(', ')} • ${teacher.experience} experience • ⭐ ${teacher.rating}</p>
            </div>
        `;
    }

    clearSearch() {
        this.searchInput.value = '';
        this.hideSearchClear();
        this.hideResults();
        this.searchInput.focus();
    }

    handleClickOutside(e) {
        if (!e.target.closest('.search-wrapper')) {
            this.hideResults();
        }
    }

    handleEscape(e) {
        if (e.key === 'Escape') {
            this.hideResults();
        }
    }

    showSearchClear() {
        if (this.searchClear) {
            this.searchClear.style.display = 'flex';
        }
    }

    hideSearchClear() {
        if (this.searchClear) {
            this.searchClear.style.display = 'none';
        }
    }

    showResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'block';
        }
    }

    hideResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'none';
        }
    }
}

// Initialize search component
new SearchComponent();
