// Search functionality for home page
let searchFilters = {
    students: true,
    subjects: true,
    exams: true,
    topics: true,
    studentTopics: true,
    grades: true,
    attendance: true,
    files: true,
    reminders: true,
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
    
    if (!searchContainer) {
        console.warn('Search container not found:', { type, desktopSearchContainer, mobileSearchContainer });
        return;
    }

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

// Helper function to remove accents for accent-insensitive search
function removeAccents(str) {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Helper function to check if text matches query (accent-insensitive)
function matchesQuery(text, query) {
    if (!text || !query) return false;
    const textNormalized = removeAccents(text);
    const queryNormalized = removeAccents(query);
    return textNormalized.includes(queryNormalized);
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
    
    // Priority: Search subjects first (most common search)
    if (searchFilters.subjects && appData.materia) {
        appData.materia.forEach(subject => {
            const subjectName = subject.Nombre_materia || '';
            if (matchesQuery(subjectName, queryLower)) {
                suggestions.push({
                    type: 'subject',
                    text: subjectName || 'Materia',
                    searchQuery: subjectName || '',
                    category: 'Materias',
                    section: 'subjects-management',
                    priority: 1 // High priority for subjects
                });
            }
        });
    }
    
    // Search students
    if (searchFilters.students && appData.estudiante) {
        appData.estudiante.forEach(student => {
            const fullName = `${student.Nombre || ''} ${student.Apellido || ''}`.trim();
            const firstName = student.Nombre || '';
            const lastName = student.Apellido || '';
            
            if (matchesQuery(fullName, queryLower) || 
                matchesQuery(firstName, queryLower) ||
                matchesQuery(lastName, queryLower)) {
                suggestions.push({
                    type: 'student',
                    text: fullName || 'Estudiante',
                    searchQuery: fullName || '',
                    category: 'Estudiantes',
                    section: 'student-management',
                    priority: 2
                });
            }
        });
    }

    // Search exams
    if (searchFilters.exams && appData.evaluacion) {
        appData.evaluacion.forEach(exam => {
            const examTitle = exam.Titulo || '';
            if (matchesQuery(examTitle, queryLower)) {
                suggestions.push({
                    type: 'exam',
                    text: examTitle || 'Examen',
                    searchQuery: examTitle || '',
                    category: 'Exámenes',
                    section: 'student-management',
                    priority: 3
                });
            }
        });
    }

    // Search topics (contenido)
    if (searchFilters.topics && appData.contenido) {
        appData.contenido.forEach(topic => {
            const topicName = topic.Tema || '';
            if (matchesQuery(topicName, queryLower)) {
                // Get subject name for context
                const subject = appData.materia?.find(m => parseInt(m.ID_materia) === parseInt(topic.Materia_ID_materia));
                const subjectName = subject ? subject.Nombre_materia : '';
                suggestions.push({
                    type: 'topic',
                    text: topicName || 'Tema',
                    searchQuery: topicName || '',
                    category: 'Temas',
                    section: 'subjects-management',
                    metadata: { subjectName },
                    priority: 4
                });
            }
        });
    }

    // Search student topics (tema_estudiante)
    if (searchFilters.studentTopics && appData.tema_estudiante) {
        appData.tema_estudiante.forEach(studentTopic => {
            // Get content/topic name
            const content = appData.contenido?.find(c => parseInt(c.ID_contenido) === parseInt(studentTopic.Contenido_ID_contenido));
            if (content) {
                const topicName = content.Tema || '';
                const status = studentTopic.Estado || '';
                if (matchesQuery(topicName, queryLower) || matchesQuery(status, queryLower)) {
                    // Get student name
                    const student = appData.estudiante?.find(e => parseInt(e.ID_Estudiante) === parseInt(studentTopic.Estudiante_ID_Estudiante));
                    const studentName = student ? `${student.Nombre || ''} ${student.Apellido || ''}`.trim() : '';
                    suggestions.push({
                        type: 'studentTopic',
                        text: `${topicName || 'Tema'} - ${studentName}`,
                        searchQuery: topicName || '',
                        category: 'Progreso de Temas',
                        section: 'student-management',
                        metadata: { studentName, status: studentTopic.Estado },
                        priority: 5
                    });
                }
            }
        });
    }

    // Search grades (notas)
    if (searchFilters.grades && appData.notas) {
        appData.notas.forEach(grade => {
            // Get evaluation info
            const evaluation = appData.evaluacion?.find(e => parseInt(e.ID_evaluacion) === parseInt(grade.Evaluacion_ID_evaluacion));
            if (evaluation) {
                const evalTitle = evaluation.Titulo || '';
                const gradeValue = (grade.Calificacion || '').toString();
                const observation = grade.Observacion || '';
                if (matchesQuery(evalTitle, queryLower) || matchesQuery(gradeValue, queryLower) || matchesQuery(observation, queryLower)) {
                    suggestions.push({
                        type: 'grade',
                        text: `${evalTitle || 'Evaluación'} - ${gradeValue || 'N/A'}`,
                        searchQuery: evalTitle || '',
                        category: 'Calificaciones',
                        section: 'student-management',
                        metadata: { grade: grade.Calificacion },
                        priority: 6
                    });
                }
            }
        });
    }

    // Search attendance (asistencia)
    if (searchFilters.attendance && appData.asistencia) {
        appData.asistencia.forEach(attendance => {
            // Get student name
            const student = appData.estudiante?.find(e => parseInt(e.ID_Estudiante) === parseInt(attendance.Estudiante_ID_Estudiante));
            if (student) {
                const studentName = `${student.Nombre || ''} ${student.Apellido || ''}`.trim();
                const observation = attendance.Observaciones || '';
                const date = attendance.Fecha || '';
                if (matchesQuery(studentName, queryLower) || matchesQuery(observation, queryLower) || matchesQuery(date, queryLower)) {
                    suggestions.push({
                        type: 'attendance',
                        text: `Asistencia - ${studentName}`,
                        searchQuery: studentName,
                        category: 'Asistencia',
                        section: 'student-management',
                        metadata: { date: attendance.Fecha, present: attendance.Presente },
                        priority: 7
                    });
                }
            }
        });
    }

    // Search files (archivos)
    if (searchFilters.files && appData.archivos) {
        appData.archivos.forEach(file => {
            const fileName = file.Nombre || '';
            const fileType = file.Tipo || '';
            if (matchesQuery(fileName, queryLower) || matchesQuery(fileType, queryLower)) {
                // Get subject name
                const subject = appData.materia?.find(m => parseInt(m.ID_materia) === parseInt(file.Materia_ID_materia));
                const subjectName = subject ? subject.Nombre_materia : '';
                suggestions.push({
                    type: 'file',
                    text: fileName || 'Archivo',
                    searchQuery: fileName || '',
                    category: 'Archivos',
                    section: 'subjects-management',
                    metadata: { subjectName, fileType: file.Tipo },
                    priority: 8
                });
            }
        });
    }

    // Search reminders (recordatorio)
    if (searchFilters.reminders && appData.recordatorio) {
        appData.recordatorio.forEach(reminder => {
            const description = reminder.Descripcion || '';
            const reminderType = reminder.Tipo || '';
            const date = reminder.Fecha || '';
            if (matchesQuery(description, queryLower) || matchesQuery(reminderType, queryLower) || matchesQuery(date, queryLower)) {
                // Get subject name
                const subject = appData.materia?.find(m => parseInt(m.ID_materia) === parseInt(reminder.Materia_ID_materia));
                const subjectName = subject ? subject.Nombre_materia : '';
                suggestions.push({
                    type: 'reminder',
                    text: description || 'Recordatorio',
                    searchQuery: description || '',
                    category: 'Recordatorios',
                    section: 'calendar',
                    metadata: { subjectName, date: reminder.Fecha, type: reminder.Tipo },
                    priority: 9
                });
            }
        });
    }

    // Add common search terms
    const commonTerms = [
        { text: 'Ver todos los estudiantes', type: 'quick', category: 'Acciones rápidas', section: 'student-management' },
        { text: 'Ver todas las materias', type: 'quick', category: 'Acciones rápidas', section: 'subjects-management' },
        { text: 'Ver notificaciones', type: 'quick', category: 'Acciones rápidas', section: 'notifications' },
        { text: 'Ver reportes', type: 'quick', category: 'Acciones rápidas', section: 'reports' },
        { text: 'Ver estadísticas', type: 'quick', category: 'Acciones rápidas', section: 'reports' }
    ];

    commonTerms.forEach(term => {
        if (term.text.toLowerCase().includes(queryLower)) {
            suggestions.push({
                ...term,
                searchQuery: term.text
            });
        }
    });

    // Sort suggestions by priority (lower number = higher priority) and then alphabetically
    suggestions.sort((a, b) => {
        const priorityA = a.priority || 10;
        const priorityB = b.priority || 10;
        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }
        // If same priority, sort alphabetically
        return (a.text || '').localeCompare(b.text || '');
    });

    // Limit suggestions but prioritize subjects
    // Show up to 20 suggestions, but ensure at least 5 subjects if available
    const subjectSuggestions = suggestions.filter(s => s.type === 'subject');
    const otherSuggestions = suggestions.filter(s => s.type !== 'subject');
    
    let limitedSuggestions = [];
    // Add subjects first (up to 10)
    limitedSuggestions.push(...subjectSuggestions.slice(0, 10));
    // Then add other suggestions (up to 10 more)
    limitedSuggestions.push(...otherSuggestions.slice(0, 10));
    
    return limitedSuggestions.slice(0, 20);
}

// Get quick search options when input is empty
function getQuickSearchOptions() {
    return [
        { type: 'quick', text: 'Buscar estudiantes', category: 'Búsqueda rápida', section: 'student-management', searchQuery: '' },
        { type: 'quick', text: 'Buscar materias', category: 'Búsqueda rápida', section: 'subjects-management', searchQuery: '' },
        { type: 'quick', text: 'Buscar exámenes', category: 'Búsqueda rápida', section: 'student-management', searchQuery: '' },
        { type: 'quick', text: 'Buscar temas', category: 'Búsqueda rápida', section: 'subjects-management', searchQuery: '' },
        { type: 'quick', text: 'Buscar calificaciones', category: 'Búsqueda rápida', section: 'student-management', searchQuery: '' },
        { type: 'quick', text: 'Ver notificaciones', category: 'Búsqueda rápida', section: 'notifications', searchQuery: '' },
        { type: 'quick', text: 'Ver reportes', category: 'Búsqueda rápida', section: 'reports', searchQuery: '' },
        { type: 'quick', text: 'Ver estadísticas', category: 'Búsqueda rápida', section: 'reports', searchQuery: '' }
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
        'topic': 'fas fa-list-alt',
        'studentTopic': 'fas fa-tasks',
        'grade': 'fas fa-star',
        'attendance': 'fas fa-calendar-check',
        'file': 'fas fa-file',
        'reminder': 'fas fa-bell',
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

    // Get app data
    const appData = window.appData || window.data || {};

    // Search in students (from appData)
    if (searchFilters.students) {
        searchStudentsData(searchQuery, results, appData);
        searchStudents(searchQuery, results); // Also search DOM
    }

    // Search in subjects (from appData)
    if (searchFilters.subjects) {
        searchSubjectsData(searchQuery, results, appData);
        searchSubjects(searchQuery, results); // Also search DOM
    }

    // Search in exams (from appData)
    if (searchFilters.exams) {
        searchExamsData(searchQuery, results, appData);
        searchExams(searchQuery, results); // Also search DOM
    }

    // Search in topics (contenido)
    if (searchFilters.topics) {
        searchTopicsData(searchQuery, results, appData);
    }

    // Search in student topics (tema_estudiante)
    if (searchFilters.studentTopics) {
        searchStudentTopicsData(searchQuery, results, appData);
    }

    // Search in grades (notas)
    if (searchFilters.grades) {
        searchGradesData(searchQuery, results, appData);
    }

    // Search in attendance (asistencia)
    if (searchFilters.attendance) {
        searchAttendanceData(searchQuery, results, appData);
    }

    // Search in files (archivos)
    if (searchFilters.files) {
        searchFilesData(searchQuery, results, appData);
    }

    // Search in reminders (recordatorio)
    if (searchFilters.reminders) {
        searchRemindersData(searchQuery, results, appData);
    }

    // Search in notifications
    if (searchFilters.notifications) {
        searchNotificationsData(searchQuery, results, appData);
        searchNotifications(searchQuery, results); // Also search DOM
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

// Search students from appData
function searchStudentsData(query, results, appData) {
    if (!appData.estudiante || !Array.isArray(appData.estudiante)) return;

    appData.estudiante.forEach(student => {
        const fullName = `${student.Nombre || ''} ${student.Apellido || ''}`.trim();
        const firstName = student.Nombre || '';
        const lastName = student.Apellido || '';
        const dni = (student.DNI || '').toString();
        const email = student.Email || '';
        
        if (matchesQuery(fullName, query) || 
            matchesQuery(firstName, query) ||
            matchesQuery(lastName, query) ||
            matchesQuery(dni, query) || 
            matchesQuery(email, query)) {
            results.push({
                type: 'students',
                title: fullName || 'Estudiante',
                description: `DNI: ${student.DNI || 'N/A'} | Email: ${student.Email || 'N/A'}`,
                section: 'student-management',
                metadata: { studentId: student.ID_Estudiante }
            });
        }
    });
}

// Search subjects from appData
function searchSubjectsData(query, results, appData) {
    if (!appData.materia || !Array.isArray(appData.materia)) return;

    appData.materia.forEach(subject => {
        const subjectName = subject.Nombre_materia || '';
        const course = subject.Curso_division || '';
        
        if (matchesQuery(subjectName, query) || matchesQuery(course, query)) {
            results.push({
                type: 'subjects',
                title: subjectName || 'Materia',
                description: `Curso: ${course || 'N/A'}`,
                section: 'subjects-management',
                metadata: { subjectId: subject.ID_materia }
            });
        }
    });
}

// Search exams from appData
function searchExamsData(query, results, appData) {
    if (!appData.evaluacion || !Array.isArray(appData.evaluacion)) return;

    appData.evaluacion.forEach(exam => {
        const examTitle = (exam.Titulo || '').toLowerCase();
        const examType = (exam.Tipo || '').toLowerCase();
        const examDate = (exam.Fecha || '').toLowerCase();
        
        if (examTitle.includes(query) || examType.includes(query) || examDate.includes(query)) {
            // Get subject name
            const subject = appData.materia?.find(m => parseInt(m.ID_materia) === parseInt(exam.Materia_ID_materia));
            const subjectName = subject ? subject.Nombre_materia : '';
            
            results.push({
                type: 'exams',
                title: exam.Titulo || 'Examen',
                description: `${subjectName ? `Materia: ${subjectName} | ` : ''}Tipo: ${exam.Tipo || 'N/A'} | Fecha: ${exam.Fecha || 'N/A'}`,
                section: 'student-management',
                metadata: { examId: exam.ID_evaluacion, subjectName }
            });
        }
    });
}

// Search topics (contenido) from appData
function searchTopicsData(query, results, appData) {
    if (!appData.contenido || !Array.isArray(appData.contenido)) return;

    appData.contenido.forEach(topic => {
        const topicName = (topic.Tema || '').toLowerCase();
        const status = (topic.Estado || '').toLowerCase();
        
        if (topicName.includes(query) || status.includes(query)) {
            // Get subject name
            const subject = appData.materia?.find(m => parseInt(m.ID_materia) === parseInt(topic.Materia_ID_materia));
            const subjectName = subject ? subject.Nombre_materia : '';
            
            results.push({
                type: 'topics',
                title: topic.Tema || 'Tema',
                description: `${subjectName ? `Materia: ${subjectName} | ` : ''}Estado: ${topic.Estado || 'N/A'}`,
                section: 'subjects-management',
                metadata: { topicId: topic.ID_contenido, subjectName, status: topic.Estado }
            });
        }
    });
}

// Search student topics (tema_estudiante) from appData
function searchStudentTopicsData(query, results, appData) {
    if (!appData.tema_estudiante || !Array.isArray(appData.tema_estudiante)) return;

    appData.tema_estudiante.forEach(studentTopic => {
        // Get content/topic name
        const content = appData.contenido?.find(c => parseInt(c.ID_contenido) === parseInt(studentTopic.Contenido_ID_contenido));
        if (content) {
            const topicName = (content.Tema || '').toLowerCase();
            const status = (studentTopic.Estado || '').toLowerCase();
            
            if (topicName.includes(query) || status.includes(query)) {
                // Get student name
                const student = appData.estudiante?.find(e => parseInt(e.ID_Estudiante) === parseInt(studentTopic.Estudiante_ID_Estudiante));
                const studentName = student ? `${student.Nombre || ''} ${student.Apellido || ''}`.trim() : '';
                
                // Get subject name
                const subject = appData.materia?.find(m => parseInt(m.ID_materia) === parseInt(content.Materia_ID_materia));
                const subjectName = subject ? subject.Nombre_materia : '';
                
                results.push({
                    type: 'studentTopics',
                    title: `${content.Tema || 'Tema'} - ${studentName}`,
                    description: `${subjectName ? `Materia: ${subjectName} | ` : ''}Estado: ${studentTopic.Estado || 'N/A'}`,
                    section: 'student-management',
                    metadata: { studentName, status: studentTopic.Estado, subjectName }
                });
            }
        }
    });
}

// Search grades (notas) from appData
function searchGradesData(query, results, appData) {
    if (!appData.notas || !Array.isArray(appData.notas)) return;

    appData.notas.forEach(grade => {
        // Get evaluation info
        const evaluation = appData.evaluacion?.find(e => parseInt(e.ID_evaluacion) === parseInt(grade.Evaluacion_ID_evaluacion));
        if (evaluation) {
            const evalTitle = (evaluation.Titulo || '').toLowerCase();
            const gradeValue = (grade.Calificacion || '').toString().toLowerCase();
            const observation = (grade.Observacion || '').toLowerCase();
            
            if (evalTitle.includes(query) || gradeValue.includes(query) || observation.includes(query)) {
                // Get student name
                const student = appData.estudiante?.find(e => parseInt(e.ID_Estudiante) === parseInt(grade.Estudiante_ID_Estudiante));
                const studentName = student ? `${student.Nombre || ''} ${student.Apellido || ''}`.trim() : '';
                
                results.push({
                    type: 'grades',
                    title: `${evaluation.Titulo || 'Evaluación'} - ${studentName}`,
                    description: `Calificación: ${grade.Calificacion || 'N/A'}${grade.Observacion ? ` | ${grade.Observacion}` : ''}`,
                    section: 'student-management',
                    metadata: { grade: grade.Calificacion, studentName, observation: grade.Observacion }
                });
            }
        }
    });
}

// Search attendance (asistencia) from appData
function searchAttendanceData(query, results, appData) {
    if (!appData.asistencia || !Array.isArray(appData.asistencia)) return;

    appData.asistencia.forEach(attendance => {
        // Get student name
        const student = appData.estudiante?.find(e => parseInt(e.ID_Estudiante) === parseInt(attendance.Estudiante_ID_Estudiante));
        if (student) {
            const studentName = `${student.Nombre || ''} ${student.Apellido || ''}`.trim().toLowerCase();
            const observation = (attendance.Observaciones || '').toLowerCase();
            const date = (attendance.Fecha || '').toLowerCase();
            const present = (attendance.Presente || '').toLowerCase();
            
            if (studentName.includes(query) || observation.includes(query) || date.includes(query)) {
                // Get subject name
                const subject = appData.materia?.find(m => parseInt(m.ID_materia) === parseInt(attendance.Materia_ID_materia));
                const subjectName = subject ? subject.Nombre_materia : '';
                
                results.push({
                    type: 'attendance',
                    title: `Asistencia - ${student.Nombre || ''} ${student.Apellido || ''}`.trim(),
                    description: `${subjectName ? `Materia: ${subjectName} | ` : ''}Fecha: ${attendance.Fecha || 'N/A'} | ${attendance.Presente === 'Y' ? 'Presente' : 'Ausente'}`,
                    section: 'student-management',
                    metadata: { date: attendance.Fecha, present: attendance.Presente, subjectName }
                });
            }
        }
    });
}

// Search files (archivos) from appData
function searchFilesData(query, results, appData) {
    if (!appData.archivos || !Array.isArray(appData.archivos)) return;

    appData.archivos.forEach(file => {
        const fileName = (file.Nombre || '').toLowerCase();
        const fileType = (file.Tipo || '').toLowerCase();
        
        if (fileName.includes(query) || fileType.includes(query)) {
            // Get subject name
            const subject = appData.materia?.find(m => parseInt(m.ID_materia) === parseInt(file.Materia_ID_materia));
            const subjectName = subject ? subject.Nombre_materia : '';
            
            results.push({
                type: 'files',
                title: file.Nombre || 'Archivo',
                description: `${subjectName ? `Materia: ${subjectName} | ` : ''}Tipo: ${file.Tipo || 'N/A'}`,
                section: 'subjects-management',
                metadata: { subjectName, fileType: file.Tipo, filePath: file.Ruta }
            });
        }
    });
}

// Search reminders (recordatorio) from appData
function searchRemindersData(query, results, appData) {
    if (!appData.recordatorio || !Array.isArray(appData.recordatorio)) return;

    appData.recordatorio.forEach(reminder => {
        const description = (reminder.Descripcion || '').toLowerCase();
        const reminderType = (reminder.Tipo || '').toLowerCase();
        const date = (reminder.Fecha || '').toLowerCase();
        
        if (description.includes(query) || reminderType.includes(query) || date.includes(query)) {
            // Get subject name
            const subject = appData.materia?.find(m => parseInt(m.ID_materia) === parseInt(reminder.Materia_ID_materia));
            const subjectName = subject ? subject.Nombre_materia : '';
            
            results.push({
                type: 'reminders',
                title: reminder.Descripcion || 'Recordatorio',
                description: `${subjectName ? `Materia: ${subjectName} | ` : ''}Tipo: ${reminder.Tipo || 'N/A'} | Fecha: ${reminder.Fecha || 'N/A'}`,
                section: 'calendar',
                metadata: { subjectName, date: reminder.Fecha, type: reminder.Tipo }
            });
        }
    });
}

// Search notifications from appData
function searchNotificationsData(query, results, appData) {
    if (!appData.notifications || !Array.isArray(appData.notifications)) return;

    appData.notifications.forEach(notification => {
        const title = (notification.Titulo || '').toLowerCase();
        const message = (notification.Mensaje || '').toLowerCase();
        const type = (notification.Tipo || '').toLowerCase();
        
        if (title.includes(query) || message.includes(query) || type.includes(query)) {
            results.push({
                type: 'notifications',
                title: notification.Titulo || 'Notificación',
                description: notification.Mensaje || '',
                section: 'notifications',
                metadata: { type: notification.Tipo, date: notification.Fecha_creacion }
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

        const typeLabel = getTypeLabel(result.type);
        resultItem.innerHTML = `
            <div class="search-result-item-title">${highlightedTitle}</div>
            <div class="search-result-item-description">${highlightedDescription}</div>
            <div class="search-result-item-meta">
                <span class="search-result-item-type">${typeLabel}</span>
                <span class="search-result-item-section">${getSectionLabel(result.section)}</span>
            </div>
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

// Get type label for search results
function getTypeLabel(type) {
    const labels = {
        'students': 'Estudiante',
        'subjects': 'Materia',
        'exams': 'Examen',
        'topics': 'Tema',
        'studentTopics': 'Progreso de Tema',
        'grades': 'Calificación',
        'attendance': 'Asistencia',
        'files': 'Archivo',
        'reminders': 'Recordatorio',
        'notifications': 'Notificación',
        'reports': 'Reporte',
        'calendar': 'Calendario'
    };
    return labels[type] || type;
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
