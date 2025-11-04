// Search functionality for home page
let searchFilters = {
    students: true,
    subjects: true,
    exams: true,
    notifications: true,
    reports: true,
    calendar: true
};

let searchTimeout = null;
let autocompleteTimeout = null;
let selectedSuggestionIndex = -1;
let currentSuggestions = [];

// Initialize search functionality
function initializeSearch() {
    const desktopSearchInput = document.getElementById('desktopSearchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const desktopFiltersBtn = document.getElementById('desktopFiltersBtn');
    const mobileFiltersBtn = document.getElementById('mobileFiltersBtn');
    const searchFiltersModal = document.getElementById('searchFiltersModal');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');

    // Handle search input with autocomplete
    if (desktopSearchInput) {
        desktopSearchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            handleSearchInput(query, 'desktop');
        });
        
        desktopSearchInput.addEventListener('focus', () => {
            showAutocompleteSuggestions(desktopSearchInput.value || '', 'desktop');
        });

        desktopSearchInput.addEventListener('keydown', (e) => {
            handleSearchKeydown(e, 'desktop');
        });
    }

    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            handleSearchInput(query, 'mobile');
        });
        
        mobileSearchInput.addEventListener('focus', () => {
            showAutocompleteSuggestions(mobileSearchInput.value || '', 'mobile');
        });

        mobileSearchInput.addEventListener('keydown', (e) => {
            handleSearchKeydown(e, 'mobile');
        });
    }

    // Sync search inputs
    if (desktopSearchInput && mobileSearchInput) {
        desktopSearchInput.addEventListener('input', () => {
            mobileSearchInput.value = desktopSearchInput.value;
        });
        
        mobileSearchInput.addEventListener('input', () => {
            desktopSearchInput.value = mobileSearchInput.value;
        });
    }

    // Handle filters button
    if (desktopFiltersBtn) {
        desktopFiltersBtn.addEventListener('click', () => {
            openFiltersModal();
        });
    }

    if (mobileFiltersBtn) {
        mobileFiltersBtn.addEventListener('click', () => {
            openFiltersModal();
        });
    }

    // Reset filters
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            resetFilters();
        });
    }

    // Close modal handlers are handled by setupModalHandlers in utils.js
    // No need to add them manually here

    // Update filter button states based on active filters
    updateFilterButtonStates();
}

// Open filters modal
function openFiltersModal() {
    const searchFiltersModal = document.getElementById('searchFiltersModal');
    if (!searchFiltersModal) return;

    // Update checkboxes based on current filters
    Object.keys(searchFilters).forEach(filter => {
        const checkbox = document.querySelector(`.filter-checkbox[data-filter="${filter}"]`);
        if (checkbox) {
            checkbox.checked = searchFilters[filter];
        }
    });

    // Use existing modal utility
    if (typeof showModal === 'function') {
        showModal('searchFiltersModal');
    } else {
        searchFiltersModal.classList.add('active');
    }
    
    // Setup modal handlers if available
    if (typeof setupModalHandlers === 'function') {
        setupModalHandlers('searchFiltersModal');
    }
    
    // Add event listeners to checkboxes
    const checkboxes = searchFiltersModal.querySelectorAll('.filter-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.removeEventListener('change', handleFilterChange);
        checkbox.addEventListener('change', handleFilterChange);
    });
}

// Handle filter checkbox change
function handleFilterChange(e) {
    const filter = e.target.dataset.filter;
    searchFilters[filter] = e.target.checked;
    updateFilterButtonStates();
    
    // Re-search if there's a search query
    const desktopSearchInput = document.getElementById('desktopSearchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const searchQuery = desktopSearchInput?.value || mobileSearchInput?.value || '';
    
    if (searchQuery) {
        handleSearch(searchQuery);
    }
}

// Reset all filters to default (all enabled)
function resetFilters() {
    Object.keys(searchFilters).forEach(key => {
        searchFilters[key] = true;
    });

    // Update checkboxes
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });

    updateFilterButtonStates();
    
    // Re-search if there's a search query
    const desktopSearchInput = document.getElementById('desktopSearchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const searchQuery = desktopSearchInput?.value || mobileSearchInput?.value || '';
    
    if (searchQuery) {
        handleSearch(searchQuery);
    }
}

// Update filter button active states
function updateFilterButtonStates() {
    const activeFiltersCount = Object.values(searchFilters).filter(v => v).length;
    const totalFilters = Object.keys(searchFilters).length;
    
    const desktopFiltersBtn = document.getElementById('desktopFiltersBtn');
    const mobileFiltersBtn = document.getElementById('mobileFiltersBtn');
    
    if (desktopFiltersBtn) {
        if (activeFiltersCount < totalFilters) {
            desktopFiltersBtn.classList.add('active');
        } else {
            desktopFiltersBtn.classList.remove('active');
        }
    }
    
    if (mobileFiltersBtn) {
        if (activeFiltersCount < totalFilters) {
            mobileFiltersBtn.classList.add('active');
        } else {
            mobileFiltersBtn.classList.remove('active');
        }
    }
}

// Handle search input with autocomplete
function handleSearchInput(query, type) {
    // Clear previous timeouts
    if (autocompleteTimeout) {
        clearTimeout(autocompleteTimeout);
    }
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }

    // Reset selected suggestion index
    selectedSuggestionIndex = -1;

    // Show autocomplete suggestions
    if (query.trim()) {
        autocompleteTimeout = setTimeout(() => {
            showAutocompleteSuggestions(query, type);
        }, 150);
    } else {
        showAutocompleteSuggestions('', type);
    }

    // Also perform full search after a longer delay
    searchTimeout = setTimeout(() => {
        performSearch(query.trim());
    }, 500);
}

// Handle keyboard navigation in search
function handleSearchKeydown(e, type) {
    const suggestionsContainer = document.querySelector('.search-suggestions-container.active');
    if (!suggestionsContainer) return;

    const suggestions = suggestionsContainer.querySelectorAll('.search-suggestion-item');
    if (suggestions.length === 0) return;

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
            updateSuggestionHighlight(suggestions, selectedSuggestionIndex);
            break;
        case 'ArrowUp':
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
            updateSuggestionHighlight(suggestions, selectedSuggestionIndex);
            break;
        case 'Enter':
            e.preventDefault();
            if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                suggestions[selectedSuggestionIndex].click();
            }
            break;
        case 'Escape':
            clearSearchSuggestions();
            break;
    }
}

// Update suggestion highlight
function updateSuggestionHighlight(suggestions, index) {
    suggestions.forEach((suggestion, i) => {
        if (i === index) {
            suggestion.classList.add('highlighted');
            suggestion.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            suggestion.classList.remove('highlighted');
        }
    });
}

// Show autocomplete suggestions
function showAutocompleteSuggestions(query, type) {
    const desktopSearchContainer = document.querySelector('.nav-search-container');
    const mobileSearchContainer = document.querySelector('.mobile-search-container');
    const searchContainer = type === 'desktop' ? desktopSearchContainer : mobileSearchContainer;
    
    if (!searchContainer) return;

    // Remove existing suggestions
    clearSearchSuggestions();

    const suggestions = generateSuggestions(query);
    currentSuggestions = suggestions;

    if (suggestions.length === 0) {
        return;
    }

    // Create suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions-container active';

    // Group suggestions by category
    const groupedSuggestions = groupSuggestionsByCategory(suggestions);

    Object.keys(groupedSuggestions).forEach(category => {
        const categoryGroup = document.createElement('div');
        categoryGroup.className = 'suggestions-category-group';

        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'suggestions-category-header';
        categoryHeader.textContent = category;
        categoryGroup.appendChild(categoryHeader);

        groupedSuggestions[category].forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'search-suggestion-item';
            
            const icon = getSuggestionIcon(suggestion.type);
            const highlightedText = query ? highlightText(suggestion.text, query) : suggestion.text;

            suggestionItem.innerHTML = `
                <i class="${icon}"></i>
                <span class="suggestion-text">${highlightedText}</span>
                <span class="suggestion-type">${suggestion.category || ''}</span>
            `;

            suggestionItem.addEventListener('click', () => {
                selectSuggestion(suggestion, type);
            });

            categoryGroup.appendChild(suggestionItem);
        });

        suggestionsContainer.appendChild(categoryGroup);
    });

    // Add suggestions container to search container
    searchContainer.appendChild(suggestionsContainer);

    // Close suggestions when clicking outside
    document.addEventListener('click', handleClickOutsideSuggestions);
}

// Generate suggestions based on query
function generateSuggestions(query) {
    const suggestions = [];
    const queryLower = query.toLowerCase().trim();

    // If query is empty, show quick options
    if (!queryLower) {
        return getQuickSearchOptions();
    }

    // Get app data if available (try multiple sources)
    const appData = window.appData || window.data || {};
    
    // Search students
    if (searchFilters.students && appData.estudiante) {
        appData.estudiante.forEach(student => {
            const fullName = `${student.Nombre || ''} ${student.Apellido || ''}`.trim().toLowerCase();
            if (fullName.includes(queryLower) || 
                (student.Nombre && student.Nombre.toLowerCase().includes(queryLower)) ||
                (student.Apellido && student.Apellido.toLowerCase().includes(queryLower))) {
                suggestions.push({
                    type: 'student',
                    text: `${student.Nombre || ''} ${student.Apellido || ''}`.trim(),
                    searchQuery: `${student.Nombre || ''} ${student.Apellido || ''}`.trim(),
                    category: 'Estudiantes',
                    section: 'student-management'
                });
            }
        });
    }

    // Search subjects
    if (searchFilters.subjects && appData.materia) {
        appData.materia.forEach(subject => {
            const subjectName = (subject.Nombre_materia || '').toLowerCase();
            if (subjectName.includes(queryLower)) {
                suggestions.push({
                    type: 'subject',
                    text: subject.Nombre_materia || 'Materia',
                    searchQuery: subject.Nombre_materia || '',
                    category: 'Materias',
                    section: 'subjects-management'
                });
            }
        });
    }

    // Search exams
    if (searchFilters.exams && appData.evaluacion) {
        appData.evaluacion.forEach(exam => {
            const examTitle = (exam.Titulo || '').toLowerCase();
            if (examTitle.includes(queryLower)) {
                suggestions.push({
                    type: 'exam',
                    text: exam.Titulo || 'Examen',
                    searchQuery: exam.Titulo || '',
                    category: 'Exámenes',
                    section: 'student-management'
                });
            }
        });
    }

    // Add common search terms
    const commonTerms = [
        { text: 'Ver todos los estudiantes', type: 'quick', category: 'Acciones rápidas', section: 'student-management' },
        { text: 'Ver todas las materias', type: 'quick', category: 'Acciones rápidas', section: 'subjects-management' },
        { text: 'Ver notificaciones', type: 'quick', category: 'Acciones rápidas', section: 'notifications' },
        { text: 'Ver reportes', type: 'quick', category: 'Acciones rápidas', section: 'reports' }
    ];

    commonTerms.forEach(term => {
        if (term.text.toLowerCase().includes(queryLower)) {
            suggestions.push({
                ...term,
                searchQuery: term.text
            });
        }
    });

    // Limit suggestions
    return suggestions.slice(0, 15);
}

// Get quick search options when input is empty
function getQuickSearchOptions() {
    return [
        { type: 'quick', text: 'Buscar estudiantes', category: 'Búsqueda rápida', section: 'student-management', searchQuery: '' },
        { type: 'quick', text: 'Buscar materias', category: 'Búsqueda rápida', section: 'subjects-management', searchQuery: '' },
        { type: 'quick', text: 'Buscar exámenes', category: 'Búsqueda rápida', section: 'student-management', searchQuery: '' },
        { type: 'quick', text: 'Ver notificaciones', category: 'Búsqueda rápida', section: 'notifications', searchQuery: '' },
        { type: 'quick', text: 'Ver reportes', category: 'Búsqueda rápida', section: 'reports', searchQuery: '' }
    ];
}

// Group suggestions by category
function groupSuggestionsByCategory(suggestions) {
    const grouped = {};
    suggestions.forEach(suggestion => {
        const category = suggestion.category || 'Otros';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(suggestion);
    });
    return grouped;
}

// Get icon for suggestion type
function getSuggestionIcon(type) {
    const icons = {
        'student': 'fas fa-user',
        'subject': 'fas fa-book',
        'exam': 'fas fa-file-alt',
        'quick': 'fas fa-search',
        'notification': 'fas fa-bell',
        'report': 'fas fa-chart-bar'
    };
    return icons[type] || 'fas fa-circle';
}

// Select a suggestion
function selectSuggestion(suggestion, type) {
    const desktopSearchInput = document.getElementById('desktopSearchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const searchInput = type === 'desktop' ? desktopSearchInput : mobileSearchInput;

    if (searchInput) {
        searchInput.value = suggestion.searchQuery || suggestion.text;
        searchInput.focus();
    }

    // Navigate to section if it's a quick action
    if (suggestion.section && typeof showSection === 'function') {
        showSection(suggestion.section);
    }

    // Perform search if there's a query
    if (suggestion.searchQuery || suggestion.text) {
        handleSearchInput(suggestion.searchQuery || suggestion.text, type);
    }

    clearSearchSuggestions();
}

// Clear search suggestions
function clearSearchSuggestions() {
    const suggestionsContainers = document.querySelectorAll('.search-suggestions-container');
    suggestionsContainers.forEach(container => {
        container.remove();
    });
    selectedSuggestionIndex = -1;
    currentSuggestions = [];
    document.removeEventListener('click', handleClickOutsideSuggestions);
}

// Handle click outside suggestions
function handleClickOutsideSuggestions(e) {
    const desktopSearchContainer = document.querySelector('.nav-search-container');
    const mobileSearchContainer = document.querySelector('.mobile-search-container');
    const suggestionsContainer = document.querySelector('.search-suggestions-container');
    
    if (suggestionsContainer && 
        !desktopSearchContainer?.contains(e.target) && 
        !mobileSearchContainer?.contains(e.target) &&
        !suggestionsContainer.contains(e.target)) {
        clearSearchSuggestions();
    }
}

// Handle search (kept for backward compatibility)
function handleSearch(query) {
    handleSearchInput(query, 'desktop');
}

// Perform search across home page content
function performSearch(query) {
    if (!query) {
        clearSearchResults();
        return;
    }

    const results = [];
    const searchQuery = query.toLowerCase();

    // Search in students
    if (searchFilters.students) {
        searchStudents(searchQuery, results);
    }

    // Search in subjects
    if (searchFilters.subjects) {
        searchSubjects(searchQuery, results);
    }

    // Search in exams
    if (searchFilters.exams) {
        searchExams(searchQuery, results);
    }

    // Search in notifications
    if (searchFilters.notifications) {
        searchNotifications(searchQuery, results);
    }

    // Search in reports
    if (searchFilters.reports) {
        searchReports(searchQuery, results);
    }

    // Search in calendar
    if (searchFilters.calendar) {
        searchCalendar(searchQuery, results);
    }

    // Display results
    displaySearchResults(results, query);
}

// Search students
function searchStudents(query, results) {
    const studentList = document.getElementById('unifiedStudentList');
    const studentCards = document.getElementById('unifiedStudentCards');
    
    const searchableElements = [];
    if (studentList) {
        searchableElements.push(...studentList.querySelectorAll('.student-item, .student-card'));
    }
    if (studentCards) {
        searchableElements.push(...studentCards.querySelectorAll('.student-card'));
    }

    searchableElements.forEach(element => {
        const text = element.textContent.toLowerCase();
        if (text.includes(query)) {
            const studentName = element.querySelector('.student-name, h3, h4')?.textContent || 'Estudiante';
            results.push({
                type: 'students',
                title: studentName,
                description: element.textContent.substring(0, 100) + '...',
                element: element,
                section: 'student-management'
            });
        }
    });
}

// Search subjects
function searchSubjects(query, results) {
    const subjectsList = document.getElementById('subjectsList');
    const subjectsContainer = document.getElementById('subjectsContainer');
    
    const searchableElements = [];
    if (subjectsList) {
        searchableElements.push(...subjectsList.querySelectorAll('.subject-item, .subject-card'));
    }
    if (subjectsContainer) {
        searchableElements.push(...subjectsContainer.querySelectorAll('.subject-card'));
    }

    searchableElements.forEach(element => {
        const text = element.textContent.toLowerCase();
        if (text.includes(query)) {
            const subjectName = element.querySelector('.subject-name, h3, h4')?.textContent || 'Materia';
            results.push({
                type: 'subjects',
                title: subjectName,
                description: element.textContent.substring(0, 100) + '...',
                element: element,
                section: 'subjects-management'
            });
        }
    });
}

// Search exams
function searchExams(query, results) {
    const examsList = document.getElementById('examsList');
    const examsContainer = document.getElementById('examsContainer');
    
    const searchableElements = [];
    if (examsList) {
        searchableElements.push(...examsList.querySelectorAll('.exam-item, .exam-card'));
    }
    if (examsContainer) {
        searchableElements.push(...examsContainer.querySelectorAll('.exam-card'));
    }

    searchableElements.forEach(element => {
        const text = element.textContent.toLowerCase();
        if (text.includes(query)) {
            const examTitle = element.querySelector('.exam-title, h3, h4')?.textContent || 'Examen';
            results.push({
                type: 'exams',
                title: examTitle,
                description: element.textContent.substring(0, 100) + '...',
                element: element,
                section: 'student-management'
            });
        }
    });
}

// Search notifications
function searchNotifications(query, results) {
    const notificationsContainer = document.getElementById('notificationsContainer');
    const notificationsList = document.getElementById('notificationsList');
    
    const searchableElements = [];
    if (notificationsContainer) {
        searchableElements.push(...notificationsContainer.querySelectorAll('.notification-item, .notification-card'));
    }
    if (notificationsList) {
        searchableElements.push(...notificationsList.querySelectorAll('.notification-item'));
    }

    // Also check unified notifications list
    const unifiedNotificationsList = document.getElementById('unifiedNotificationsList');
    if (unifiedNotificationsList) {
        searchableElements.push(...unifiedNotificationsList.querySelectorAll('.notification-item, .class-item'));
    }

    searchableElements.forEach(element => {
        const text = element.textContent.toLowerCase();
        if (text.includes(query)) {
            const notificationTitle = element.querySelector('.notification-title, h3, h4, .class-title')?.textContent || 'Notificación';
            results.push({
                type: 'notifications',
                title: notificationTitle,
                description: element.textContent.substring(0, 100) + '...',
                element: element,
                section: 'notifications'
            });
        }
    });
}

// Search reports
function searchReports(query, results) {
    const reportsContainer = document.getElementById('reportsContainer');
    
    if (reportsContainer) {
        const searchableElements = reportsContainer.querySelectorAll('.report-item, .report-card, .chart-container');
        
        searchableElements.forEach(element => {
            const text = element.textContent.toLowerCase();
            if (text.includes(query)) {
                const reportTitle = element.querySelector('.report-title, h3, h4')?.textContent || 'Reporte';
                results.push({
                    type: 'reports',
                    title: reportTitle,
                    description: element.textContent.substring(0, 100) + '...',
                    element: element,
                    section: 'reports'
                });
            }
        });
    }
}

// Search calendar
function searchCalendar(query, results) {
    const calendarWeekView = document.getElementById('calendarWeekView');
    const calendarMonthView = document.getElementById('calendarMonthView');
    
    const searchableElements = [];
    if (calendarWeekView) {
        searchableElements.push(...calendarWeekView.querySelectorAll('.calendar-event, .calendar-day-event'));
    }
    if (calendarMonthView) {
        searchableElements.push(...calendarMonthView.querySelectorAll('.calendar-event, .calendar-day-event'));
    }

    searchableElements.forEach(element => {
        const text = element.textContent.toLowerCase();
        if (text.includes(query)) {
            const eventTitle = element.querySelector('.event-title, .event-name')?.textContent || 'Evento';
            results.push({
                type: 'calendar',
                title: eventTitle,
                description: element.textContent.substring(0, 100) + '...',
                element: element,
                section: 'calendar'
            });
        }
    });
}

// Display search results
function displaySearchResults(results, query) {
    const desktopSearchContainer = document.querySelector('.nav-search-container');
    const mobileSearchContainer = document.querySelector('.mobile-search-container');
    
    // Remove existing results and suggestions
    clearSearchResults();
    clearSearchSuggestions();

    if (results.length === 0) {
        // If no results, show suggestions again
        const desktopSearchInput = document.getElementById('desktopSearchInput');
        const mobileSearchInput = document.getElementById('mobileSearchInput');
        if (query && (desktopSearchInput?.value || mobileSearchInput?.value)) {
            const activeInput = desktopSearchInput?.value ? 'desktop' : 'mobile';
            showAutocompleteSuggestions(query, activeInput);
        }
        return;
    }

    // Create results container
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results-container active';

    // Limit results to 10
    const limitedResults = results.slice(0, 10);

    limitedResults.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        const highlightedTitle = highlightText(result.title, query);
        const highlightedDescription = highlightText(result.description, query);

        resultItem.innerHTML = `
            <div class="search-result-item-title">${highlightedTitle}</div>
            <div class="search-result-item-description">${highlightedDescription}</div>
            <span class="search-result-item-section">${getSectionLabel(result.section)}</span>
        `;

        resultItem.addEventListener('click', () => {
            navigateToResult(result);
        });

        resultsContainer.appendChild(resultItem);
    });

    // Add results container to search containers
    if (desktopSearchContainer) {
        desktopSearchContainer.appendChild(resultsContainer);
    }
    if (mobileSearchContainer) {
        mobileSearchContainer.appendChild(resultsContainer);
    }

    // Close results when clicking outside
    document.addEventListener('click', handleClickOutside);
}

// Navigate to search result
function navigateToResult(result) {
    // Navigate to the section
    if (typeof showSection === 'function') {
        showSection(result.section);
    }

    // Scroll to element after a short delay
    setTimeout(() => {
        if (result.element) {
            result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight element briefly
            result.element.style.transition = 'background-color 0.3s ease';
            result.element.style.backgroundColor = '#fff3cd';
            setTimeout(() => {
                result.element.style.backgroundColor = '';
            }, 2000);
        }
    }, 300);

    // Clear search
    const desktopSearchInput = document.getElementById('desktopSearchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    if (desktopSearchInput) desktopSearchInput.value = '';
    if (mobileSearchInput) mobileSearchInput.value = '';
    
    clearSearchResults();
}

// Highlight search text
function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// Get section label
function getSectionLabel(section) {
    const labels = {
        'dashboard': 'Panel de Control',
        'student-management': 'Estudiantes',
        'subjects-management': 'Materias',
        'notifications': 'Notificaciones',
        'reports': 'Reportes',
        'calendar': 'Calendario'
    };
    return labels[section] || section;
}

// Clear search results
function clearSearchResults() {
    const resultsContainers = document.querySelectorAll('.search-results-container');
    resultsContainers.forEach(container => {
        container.remove();
    });
    document.removeEventListener('click', handleClickOutside);
}

// Handle click outside search
function handleClickOutside(e) {
    const desktopSearchContainer = document.querySelector('.nav-search-container');
    const mobileSearchContainer = document.querySelector('.mobile-search-container');
    const resultsContainer = document.querySelector('.search-results-container');
    const suggestionsContainer = document.querySelector('.search-suggestions-container');
    
    if (resultsContainer && 
        !desktopSearchContainer?.contains(e.target) && 
        !mobileSearchContainer?.contains(e.target) &&
        !resultsContainer.contains(e.target)) {
        clearSearchResults();
    }
    
    if (suggestionsContainer && 
        !desktopSearchContainer?.contains(e.target) && 
        !mobileSearchContainer?.contains(e.target) &&
        !suggestionsContainer.contains(e.target)) {
        clearSearchSuggestions();
    }
}

// Make functions globally available
window.initializeSearch = initializeSearch;
