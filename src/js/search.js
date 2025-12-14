// Search functionality for homepage

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchClear = document.getElementById('searchClear');
    
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        
        // Show/hide clear button
        if (query) {
            searchClear.style.display = 'flex';
        } else {
            searchClear.style.display = 'none';
            searchResults.style.display = 'none';
            return;
        }

        // Debounce search
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });

    searchClear.addEventListener('click', function() {
        searchInput.value = '';
        searchClear.style.display = 'none';
        searchResults.style.display = 'none';
        searchInput.focus();
    });

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-wrapper')) {
            searchResults.style.display = 'none';
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchResults.style.display = 'none';
        }
    });

    function performSearch(query) {
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

        displayResults(matchedPrograms, matchedTeachers);
    }

    function displayResults(programs, teachers) {
        if (programs.length === 0 && teachers.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <p>No results found. Try a different search term.</p>
                </div>
            `;
            searchResults.style.display = 'block';
            return;
        }

        let html = '';

        if (programs.length > 0) {
            html += '<div class="search-category">Programs</div>';
            programs.forEach(program => {
                html += `
                    <div class="search-item" onclick="window.location.href='/programs.html#${program.id}'">
                        <h4>${program.name}</h4>
                        <p>${program.qualification} • ${program.duration} • $${program.price}</p>
                    </div>
                `;
            });
        }

        if (teachers.length > 0) {
            html += '<div class="search-category">Teachers</div>';
            teachers.forEach(teacher => {
                html += `
                    <div class="search-item" onclick="window.location.href='/teachers.html#${teacher.id}'">
                        <h4>${teacher.name}</h4>
                        <p>${teacher.specialization.join(', ')} • ${teacher.experience} experience • ⭐ ${teacher.rating}</p>
                    </div>
                `;
            });
        }

        searchResults.innerHTML = html;
        searchResults.style.display = 'block';
    }
});
