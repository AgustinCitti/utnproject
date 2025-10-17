# Scripts Module Structure

This folder contains the refactored JavaScript modules for the EduSync application. The original monolithic `script.js` file has been broken down into logical, maintainable modules.

## Module Structure

### Core Modules
- **`main.js`** - Global variables, app initialization, and data management
- **`translations.js`** - Translation system and language management
- **`utils.js`** - Utility functions, modal management, and view toggles

### Feature Modules
- **`auth.js`** - Authentication system, login/register functionality
- **`navigation.js`** - Navigation system and section management
- **`dashboard.js`** - Dashboard functionality and calendar system
- **`students.js`** - Student management (CRUD operations)
- **`grades.js`** - Grade management and tracking
- **`attendance.js`** - Attendance tracking and management
- **`exams.js`** - Exam creation and management
- **`repository.js`** - File repository and upload functionality
- **`notifications.js`** - Notification system and management
- **`reports.js`** - Reports generation and analytics

## HTML File Updates

Each HTML file now references only the modules it needs:

### Landing Page (`index.html`)
```html
<script src="scripts/translations.js"></script>
<script src="scripts/utils.js"></script>
<script src="scripts/auth.js"></script>
<script src="scripts/main.js"></script>
```

### Authentication Pages (`auth.html`, `login.html`, `register.html`)
```html
<script src="scripts/translations.js"></script>
<script src="scripts/utils.js"></script>
<script src="scripts/auth.js"></script>
<script src="scripts/main.js"></script>
```

### Main Application (`home.html`)
```html
<script src="scripts/translations.js"></script>
<script src="scripts/utils.js"></script>
<script src="scripts/navigation.js"></script>
<script src="scripts/auth.js"></script>
<script src="scripts/dashboard.js"></script>
<script src="scripts/students.js"></script>
<script src="scripts/grades.js"></script>
<script src="scripts/attendance.js"></script>
<script src="scripts/exams.js"></script>
<script src="scripts/repository.js"></script>
<script src="scripts/notifications.js"></script>
<script src="scripts/reports.js"></script>
<script src="scripts/main.js"></script>
```

## Benefits of This Structure

1. **Modularity**: Each module has a specific responsibility
2. **Maintainability**: Easier to find and modify specific functionality
3. **Performance**: Only load the modules needed for each page
4. **Scalability**: Easy to add new features without affecting existing code
5. **Debugging**: Easier to isolate and fix issues in specific modules
6. **Team Development**: Multiple developers can work on different modules simultaneously

## Usage

The modules are loaded in dependency order, with `main.js` being loaded last to ensure all dependencies are available. Each module can be called independently without affecting other modules.

## Backup

The original `script.js` file has been backed up as `script_backup.js` in the root directory.
