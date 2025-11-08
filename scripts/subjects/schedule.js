/**
 * Schedule Management Module
 * 
 * Handles schedule selector functionality for subjects:
 * - Multiple schedule entries support
 * - Schedule string parsing and formatting
 * - Schedule entry addition/removal
 */

(function() {
    'use strict';
    
    // Helper function (inline to avoid import issues)
    function capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    // Schedule entries state: [{day: 'lunes', startHour: '12:00', endHour: '14:00'}, ...]
    let scheduleEntries = [];
    let scheduleEntryCounter = 0; // Counter for unique IDs

/**
 * Generate time options HTML (used for both start and end time selects)
 * @returns {string} HTML string with time options
 */
function generateTimeOptions() {
    const times = [];
    for (let hour = 7; hour <= 23; hour++) {
        times.push(`${hour.toString().padStart(2, '0')}:00`);
        times.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return times.map(time => `<option value="${time}">${time}</option>`).join('');
}

/**
 * Setup schedule selector event listeners
 */
function setupScheduleSelector() {
    // Add schedule entry button event listener
    const addScheduleEntryBtn = document.getElementById('addScheduleEntryBtn');
    if (addScheduleEntryBtn) {
        // Remove old listener if exists (by removing the flag and re-adding)
        if (addScheduleEntryBtn._hasListener) {
            // Clone to remove all listeners
            const newBtn = addScheduleEntryBtn.cloneNode(true);
            addScheduleEntryBtn.parentNode.replaceChild(newBtn, addScheduleEntryBtn);
        }
        // Get button reference (might be new after clone)
        const btn = document.getElementById('addScheduleEntryBtn');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add schedule entry button clicked');
                // Call the function directly
                if (typeof addScheduleEntry === 'function') {
                    addScheduleEntry();
                } else if (typeof window.addScheduleEntry === 'function') {
                    window.addScheduleEntry();
                } else {
                    console.error('addScheduleEntry function not available');
                }
            });
            btn._hasListener = true;
            console.log('Schedule entry button listener attached');
        } else {
            console.warn('addScheduleEntryBtn not found');
        }
    }
    
    // Don't add entries here - they will be added when modal opens (via resetSubjectForm or populateScheduleSelector)
}

/**
 * Add a new schedule entry to the selector
 * @param {Object|null} entry - Entry data {day, startHour, endHour} or null for empty entry
 */
function addScheduleEntry(entry = null) {
    const container = document.getElementById('scheduleEntriesContainer');
    if (!container) {
        console.warn('scheduleEntriesContainer not found - schedule entry cannot be added');
        return;
    }

    console.log('Adding schedule entry, container found:', container);
    console.log('Container innerHTML before:', container.innerHTML.substring(0, 100));
    
    const entryId = scheduleEntryCounter++;
    const entryData = entry || { day: '', startHour: '', endHour: '' };
    
    scheduleEntries.push({ id: entryId, ...entryData });

    const timeOptions = generateTimeOptions();
    console.log('Time options generated:', timeOptions ? timeOptions.length : 0, 'options');
    
    const entryHTML = `
        <div class="schedule-entry" data-entry-id="${entryId}">
            <div class="schedule-entry-field">
                <label class="schedule-sub-label">Día:</label>
                <select class="schedule-day-select" data-entry-id="${entryId}">
                    <option value="">Seleccionar día</option>
                    <option value="lunes" ${entryData.day === 'lunes' ? 'selected' : ''}>Lunes</option>
                    <option value="martes" ${entryData.day === 'martes' ? 'selected' : ''}>Martes</option>
                    <option value="miércoles" ${entryData.day === 'miércoles' ? 'selected' : ''}>Miércoles</option>
                    <option value="jueves" ${entryData.day === 'jueves' ? 'selected' : ''}>Jueves</option>
                    <option value="viernes" ${entryData.day === 'viernes' ? 'selected' : ''}>Viernes</option>
                    <option value="sábado" ${entryData.day === 'sábado' ? 'selected' : ''}>Sábado</option>
                    <option value="domingo" ${entryData.day === 'domingo' ? 'selected' : ''}>Domingo</option>
                </select>
            </div>
            <div class="schedule-entry-field">
                <label class="schedule-sub-label">Hora inicio:</label>
                <select class="schedule-start-select" data-entry-id="${entryId}">
                    <option value="">Seleccionar hora inicio</option>
                    ${timeOptions}
                </select>
            </div>
            <div class="schedule-entry-field">
                <label class="schedule-sub-label">Hora fin:</label>
                <select class="schedule-end-select" data-entry-id="${entryId}">
                    <option value="">Seleccionar hora fin</option>
                    ${timeOptions}
                </select>
            </div>
            <div class="schedule-entry-remove">
                <button type="button" class="remove-schedule-entry-btn" data-entry-id="${entryId}" title="Eliminar horario">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', entryHTML);
    console.log('Schedule entry HTML inserted, entryId:', entryId);
    console.log('Container innerHTML after:', container.innerHTML.substring(0, 200));
    
    // Verify the entry was actually added
    const addedEntry = container.querySelector(`.schedule-entry[data-entry-id="${entryId}"]`);
    if (!addedEntry) {
        console.error('Schedule entry was not added to DOM!');
    } else {
        console.log('Schedule entry verified in DOM:', addedEntry);
    }
    
    // Set selected values for time selects (need to wait for DOM to update)
    setTimeout(() => {
        if (entryData.startHour) {
            const startSelect = container.querySelector(`.schedule-start-select[data-entry-id="${entryId}"]`);
            if (startSelect) startSelect.value = entryData.startHour;
        }
        if (entryData.endHour) {
            const endSelect = container.querySelector(`.schedule-end-select[data-entry-id="${entryId}"]`);
            if (endSelect) endSelect.value = entryData.endHour;
        }
    }, 0);

    // Attach event listeners (need to wait for DOM to update)
    setTimeout(() => {
        attachScheduleEntryListeners(entryId);
        updateScheduleHiddenField();
        console.log('Schedule entry listeners attached for entryId:', entryId);
    }, 0);
}

/**
 * Attach event listeners to a schedule entry
 * @param {number} entryId - Entry ID
 */
function attachScheduleEntryListeners(entryId) {
    const container = document.getElementById('scheduleEntriesContainer');
    if (!container) return;

    // Day select change
    const daySelect = container.querySelector(`.schedule-day-select[data-entry-id="${entryId}"]`);
    if (daySelect) {
        daySelect.addEventListener('change', function() {
            const entry = scheduleEntries.find(e => e.id === entryId);
            if (entry) {
                entry.day = this.value;
                updateScheduleHiddenField();
            }
        });
    }

    // Start hour select change
    const startSelect = container.querySelector(`.schedule-start-select[data-entry-id="${entryId}"]`);
    if (startSelect) {
        startSelect.addEventListener('change', function() {
            const entry = scheduleEntries.find(e => e.id === entryId);
            if (entry) {
                entry.startHour = this.value;
                updateScheduleHiddenField();
            }
        });
    }

    // End hour select change
    const endSelect = container.querySelector(`.schedule-end-select[data-entry-id="${entryId}"]`);
    if (endSelect) {
        endSelect.addEventListener('change', function() {
            const entry = scheduleEntries.find(e => e.id === entryId);
            if (entry) {
                entry.endHour = this.value;
                updateScheduleHiddenField();
            }
        });
    }

    // Remove button click
    const removeBtn = container.querySelector(`.remove-schedule-entry-btn[data-entry-id="${entryId}"]`);
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            removeScheduleEntry(entryId);
        });
    }
}

/**
 * Remove a schedule entry
 * @param {number} entryId - Entry ID to remove
 */
function removeScheduleEntry(entryId) {
    // Remove from array
    scheduleEntries = scheduleEntries.filter(e => e.id !== entryId);
    
    // Remove from DOM
    const container = document.getElementById('scheduleEntriesContainer');
    if (container) {
        const entryElement = container.querySelector(`.schedule-entry[data-entry-id="${entryId}"]`);
        if (entryElement) {
            entryElement.remove();
        }
    }
    
    updateScheduleHiddenField();
}

/**
 * Update the hidden schedule field with current entries
 */
function updateScheduleHiddenField() {
    // Build schedule string in format: "Lunes 12:00-14:00|Viernes 14:00-16:00"
    const scheduleParts = scheduleEntries
        .filter(entry => entry.day && entry.startHour && entry.endHour)
        .map(entry => {
            const dayName = capitalizeFirst(entry.day);
            return `${dayName} ${entry.startHour}-${entry.endHour}`;
        });
    
    const scheduleString = scheduleParts.join('|');
    
    // Update hidden field
    const hiddenField = document.getElementById('subjectSchedule');
    if (hiddenField) {
        hiddenField.value = scheduleString;
    }
}

/**
 * Reset schedule selector to empty state
 */
function resetScheduleSelector() {
    // Clear schedule entries
    scheduleEntries = [];
    scheduleEntryCounter = 0;
    
    // Clear container
    const container = document.getElementById('scheduleEntriesContainer');
    if (container) {
        container.innerHTML = '';
    }
    
    // Clear hidden field
    const hiddenField = document.getElementById('subjectSchedule');
    if (hiddenField) {
        hiddenField.value = '';
    }
}

/**
 * Parse schedule string into entry objects
 * Supports formats:
 * - New: "Lunes 12:00-14:00|Viernes 14:00-16:00"
 * - Old: "Lunes, Martes 12:00-14:00"
 * @param {string} scheduleString - Schedule string to parse
 * @returns {Array} Array of entry objects {day, startHour, endHour}
 */
function parseScheduleString(scheduleString) {
    if (!scheduleString) {
        return [];
    }

    // Try new format first: "Lunes 12:00-14:00|Viernes 14:00-16:00"
    if (scheduleString.includes('|')) {
        const entries = [];
        const parts = scheduleString.split('|');
        
        parts.forEach(part => {
            const trimmed = part.trim();
            if (!trimmed) return;
            
            // Match: "Lunes 12:00-14:00" or "Lunes 12:00"
            // Updated regex to handle Spanish characters (á, é, í, ó, ú, ñ)
            const match = trimmed.match(/^([a-záéíóúñ]+)\s+(\d{1,2}:\d{2})(?:\s*-\s*(\d{1,2}:\d{2}))?$/i);
            if (match) {
                const day = match[1].toLowerCase();
                const startHour = match[2];
                const endHour = match[3] || '';
                
                // Validate and normalize day name
                const dayMap = {
                    'lunes': 'lunes',
                    'martes': 'martes',
                    'miércoles': 'miércoles',
                    'miercoles': 'miércoles',
                    'jueves': 'jueves',
                    'viernes': 'viernes',
                    'sábado': 'sábado',
                    'sabado': 'sábado',
                    'domingo': 'domingo'
                };
                
                if (day && startHour && dayMap[day]) {
                    entries.push({ day: dayMap[day], startHour, endHour });
                }
            }
        });
        
        if (entries.length > 0) {
            return entries;
        }
    }

    // Fallback to old format: "Lunes, Martes 12:00-14:00"
    const lowerSchedule = scheduleString.toLowerCase();
    const days = [];
    const dayNames = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

    // Extract days
    dayNames.forEach(day => {
        if (lowerSchedule.includes(day)) {
            days.push(day);
        }
    });

    // Extract time range
    const timeRegex = /(\d{1,2}:\d{2})(?:\s*-\s*(\d{1,2}:\d{2}))?/;
    const timeMatch = scheduleString.match(timeRegex);
    
    let startHour = '';
    let endHour = '';
    
    if (timeMatch) {
        startHour = timeMatch[1];
        endHour = timeMatch[2] || '';
    }

    // If we have days and time, create entries
    if (days.length > 0 && startHour) {
        return days.map(day => ({ day, startHour, endHour }));
    }

    return [];
}

/**
 * Populate schedule selector with entries from a schedule string
 * @param {string} scheduleString - Schedule string to parse and populate
 */
function populateScheduleSelector(scheduleString) {
    const entries = parseScheduleString(scheduleString);
    
    // Clear current entries
    scheduleEntries = [];
    scheduleEntryCounter = 0;
    const container = document.getElementById('scheduleEntriesContainer');
    if (container) {
        container.innerHTML = '';
    }
    
    // Add parsed entries
    if (entries.length > 0) {
        entries.forEach(entry => {
            addScheduleEntry(entry);
        });
    } else {
        // Add one empty entry if no valid entries found
        addScheduleEntry();
    }
    
    updateScheduleHiddenField();
}

    // Export functions to global namespace for non-module usage
    if (typeof window !== 'undefined') {
        window.ScheduleModule = window.ScheduleModule || {};
        window.ScheduleModule.setupScheduleSelector = setupScheduleSelector;
        window.ScheduleModule.addScheduleEntry = addScheduleEntry;
        window.ScheduleModule.updateScheduleHiddenField = updateScheduleHiddenField;
        window.ScheduleModule.resetScheduleSelector = resetScheduleSelector;
        window.ScheduleModule.populateScheduleSelector = populateScheduleSelector;
        
        // Also make available on window for direct access
        window.setupScheduleSelector = setupScheduleSelector;
        window.addScheduleEntry = addScheduleEntry;
        window.updateScheduleHiddenField = updateScheduleHiddenField;
        window.resetScheduleSelector = resetScheduleSelector;
        window.populateScheduleSelector = populateScheduleSelector;
        
        console.log('Schedule module functions exported to window');
    }
})();
