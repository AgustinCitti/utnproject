# Subjects Module - Refactored Structure

This directory contains the refactored, modular structure for the subjects management functionality.

## Module Structure

### `/utils/` - Utility Modules
- **state.js** - Global state management (current subject ID, submission flags, etc.)
- **helpers.js** - Helper functions (getTeacherById, getStatusText, etc.)
- **filters.js** - Filtering functionality for subjects
- **course-dropdown.js** - Course dropdown population and management

### Core Modules
- **schedule.js** - Schedule selector functionality (multiple schedule entries)
- **subject-crud.js** - Subject Create, Read, Update, Delete operations
- **subject-views.js** - Subject rendering (grid and list views)

## Usage

Currently, these modules are designed to be imported using ES6 modules. However, since the application loads scripts traditionally, you have two options:

### Option 1: Load as ES6 Modules (Recommended for modern browsers)
Update your HTML to load the main file as a module:
```html
<script type="module" src="../scripts/subjects.js"></script>
```

### Option 2: Use Traditional Script Loading
The main `subjects.js` file includes all necessary functions and maintains backward compatibility. All modules are imported and functions are made globally available.

## Functions Available Globally

All functions from the modules are exported to the global scope for backward compatibility:
- `initializeSubjects()` - Initialize the subjects module
- `loadSubjects()` - Load and render subjects
- `saveSubject()` - Save/create subject
- `editSubject(id)` - Edit subject
- `deleteSubject(id)` - Delete subject
- `getTeacherById(id)` - Get teacher by ID
- `getSubjectById(id)` - Get subject by ID
- And many more helper functions...

## Remaining Functions

The following functions from the original file still need to be modularized:
- Content/Themes management (saveContentFromModal, editContent, deleteContent, etc.)
- Evaluations management (loadSubjectEvaluaciones, saveEvaluacion, etc.)
- CSV import/export (showImportTemasModal, exportSubjectsAsCSV, etc.)
- Student assignment (assignStudentsToSubject, assignStudentsToContent, etc.)
- Subject details view (showSubjectThemesPanel, loadSubjectDetailsView, etc.)

These will be moved to separate modules in future iterations.

