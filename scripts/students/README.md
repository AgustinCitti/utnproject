# Student Management Module Structure

This directory contains the refactored student management functionality, broken down into smaller, focused modules for better maintainability and organization.

## Module Overview

### Core Modules

1. **`state.js`** - State Management
   - Manages global state for student operations
   - Tracks editing student ID, selected subjects, topics, and intensification themes
   - Provides getter/setter functions for all state variables
   - Functions are globally accessible for backward compatibility

2. **`course-selector.js`** - Course Selection
   - Handles course dropdown population
   - Automatically selects all subjects when a course is chosen
   - Integrates with subject and topic selectors

3. **`subject-selector.js`** - Subject Selection
   - Manages subject dropdown and selection
   - Renders selected subjects as chips with remove buttons
   - Handles pre-selection for students created from subject details

4. **`topic-selector.js`** - Topic Selection
   - Manages topic dropdown based on selected subjects
   - Groups topics by subject for better organization
   - Renders selected topics as chips with remove buttons

5. **`intensificacion.js`** - Intensification Themes
   - Handles intensification theme selection for INTENSIFICA students
   - Provides UI for creating new themes on-the-fly
   - Manages theme assignment modal
   - Supports theme creation from both form and modal contexts

6. **`crud.js`** - CRUD Operations
   - Create, Read, Update, Delete operations for students
   - Handles student enrollment (subject assignments)
   - Manages theme assignment and tema_estudiante record creation
   - Integrates all student data operations

7. **`form.js`** - Form Management
   - Handles form clearing and resetting
   - Manages form state initialization
   - Resets event listener flags

8. **`modals.js`** - Modal Management
   - Handles "no subjects" warning modal
   - Overrides showModal to add validation
   - Sets up modal initialization and handlers

9. **`index.js`** - Module Coordination
   - Initializes StudentState namespace
   - Sets up modal override
   - Coordinates module initialization

## Loading Order

Modules must be loaded in this specific order to ensure dependencies are available:

```html
<script src="../scripts/students/state.js"></script>
<script src="../scripts/students/course-selector.js"></script>
<script src="../scripts/students/subject-selector.js"></script>
<script src="../scripts/students/topic-selector.js"></script>
<script src="../scripts/students/intensificacion.js"></script>
<script src="../scripts/students/crud.js"></script>
<script src="../scripts/students/form.js"></script>
<script src="../scripts/students/modals.js"></script>
<script src="../scripts/students/index.js"></script>
<script src="../scripts/students.js"></script>
```

## Global Functions

All modules expose functions globally for backward compatibility. Key functions include:

### State Management
- `getEditingStudentId()`, `setEditingStudentId(id)`
- `getSelectedSubjects()`, `setSelectedSubjects(subjects)`, `addSelectedSubject(subject)`, `removeSelectedSubject(index)`, `clearSelectedSubjects()`
- `getSelectedTopics()`, `setSelectedTopics(topics)`, `addSelectedTopic(topic)`, `removeSelectedTopic(index)`, `clearSelectedTopics()`
- `getSelectedIntensificacionThemes()`, `setSelectedIntensificacionThemes(themes)`, `addSelectedIntensificacionTheme(themeId)`, `removeSelectedIntensificacionTheme(themeId)`, `clearSelectedIntensificacionThemes()`

### CRUD Operations
- `saveStudent()` - Save or update student
- `window.editStudent(id)` - Edit student by ID
- `window.deleteStudent(id)` - Delete student by ID
- `saveThemesAssignment(studentId, themeIds)` - Assign themes to student
- `createTemaEstudianteForSubjects(studentId, subjectIds)` - Create tema_estudiante records

### UI Functions
- `populateStudentCourseSelect()` - Populate course dropdown
- `populateStudentSubjectsSelect()` - Populate subject dropdown
- `populateStudentTopicsSelect()` - Populate topic dropdown
- `renderSelectedSubjects()` - Render selected subjects as chips
- `renderSelectedTopics()` - Render selected topics as chips
- `loadIntensificacionThemes()` - Load intensification themes UI
- `clearStudentForm()` - Clear and reset student form

### Intensification
- `window.toggleIntensificacionThemes()` - Toggle intensification themes container
- `window.toggleIntensificacionTheme(contenidoId, isChecked)` - Toggle individual theme
- `window.createIntensificacionTheme(materiaId)` - Create new theme from form
- `window.createIntensificacionThemeFromModal(materiaId, studentId)` - Create theme from modal
- `window.assignThemesToIntensificador(studentId)` - Open theme assignment modal

### Utility Functions
- `window.removeSubject(index)` - Remove subject from selection
- `window.removeTopic(index)` - Remove topic from selection
- `window.preSelectMateriaForNewStudent(materiaId)` - Pre-select subject when creating student from subject details

## State Management

The `StudentState` namespace provides organized access to all state management functions:

```javascript
// Get state
const editingId = window.StudentState.getEditingStudentId();
const subjects = window.StudentState.getSelectedSubjects();

// Set state
window.StudentState.setEditingStudentId(123);
window.StudentState.addSelectedSubject({ id: 1, name: 'Math', curso: '1A' });

// Clear state
window.StudentState.clearAll();
```

## Benefits of This Structure

1. **Modularity**: Each module has a specific, focused responsibility
2. **Maintainability**: Easier to find and modify specific functionality
3. **Testability**: Smaller modules are easier to test in isolation
4. **Scalability**: Easy to add new features without affecting existing code
5. **Debugging**: Easier to isolate and fix issues in specific modules
6. **Team Development**: Multiple developers can work on different modules simultaneously
7. **Code Reusability**: Functions can be reused across different contexts

## Migration Notes

The original `students.js` file has been refactored into these modules. The main `students.js` file now serves as a backward-compatible wrapper that ensures all expected functions remain available globally.

All existing code that calls student management functions will continue to work without modification, as all functions are exposed globally for backward compatibility.

