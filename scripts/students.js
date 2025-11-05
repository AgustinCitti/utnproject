/**
 * Student Management Module - Main Entry Point (Legacy Wrapper)
 * 
 * This file serves as a backward-compatible wrapper that loads all student management
 * sub-modules. The actual functionality has been refactored into smaller, focused modules
 * in the scripts/students/ directory.
 * 
 * Module Structure:
 * - state.js: State management for student operations
 * - course-selector.js: Course selection dropdown and handling
 * - subject-selector.js: Subject selection and rendering
 * - topic-selector.js: Topic selection and rendering
 * - intensificacion.js: Intensification themes management
 * - crud.js: Create, Read, Update, Delete operations
 * - form.js: Form clearing and resetting
 * - modals.js: Modal management and initialization
 * - index.js: Module coordination and initialization
 */

// Load all student management modules in dependency order
// Note: These are loaded via script tags in HTML, this file ensures compatibility

// The modules are automatically loaded when included in HTML:
// <script src="../scripts/students/state.js"></script>
// <script src="../scripts/students/course-selector.js"></script>
// <script src="../scripts/students/subject-selector.js"></script>
// <script src="../scripts/students/topic-selector.js"></script>
// <script src="../scripts/students/intensificacion.js"></script>
// <script src="../scripts/students/crud.js"></script>
// <script src="../scripts/students/form.js"></script>
// <script src="../scripts/students/modals.js"></script>
// <script src="../scripts/students/index.js"></script>

// This file maintains backward compatibility by ensuring all expected
// functions are available globally. The actual implementations are in the modules above.
