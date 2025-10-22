# Reports Module

This folder contains the refactored reports functionality, broken down into smaller, focused components for better maintainability and organization.

## File Structure

```
scripts/reports/
├── README.md              # This documentation file
├── index.js              # Module loader and verification
├── data-processor.js     # Data processing and calculations
├── chart-manager.js      # Chart creation and management
├── report-generator.js   # Report generation and display
├── export-manager.js     # Export functionality (PDF, CSV, Print)
└── reports.js            # Main coordinator (replaces original)
```

## Component Responsibilities

### 📊 data-processor.js
- **Purpose**: Handles all data processing and calculations
- **Functions**: 
  - `getGradesDistribution()` - Processes grade data for charts
  - `getAttendanceTrends()` - Processes attendance data for trends
  - `getStudentPerformance()` - Calculates student performance metrics
  - `getSubjectComparison()` - Compares subjects performance
  - `calculateAverageGrade()` - Calculates overall average grade
  - `calculateAttendanceRate()` - Calculates attendance rate
  - `getPassingStudents()` - Calculates passing rate

### 📈 chart-manager.js
- **Purpose**: Manages all chart creation, updates, and destruction
- **Functions**:
  - `initializeCharts()` - Initializes all charts
  - `destroyAllCharts()` - Destroys existing charts
  - `createGradesChart()` - Creates grades distribution chart
  - `createAttendanceChart()` - Creates attendance trends chart
  - `createPerformanceChart()` - Creates student performance chart
  - `createSubjectChart()` - Creates subject comparison chart
  - `updateGradesChart()` - Updates grades chart with filters
  - `updateAttendanceChart()` - Updates attendance chart with filters
  - `updatePerformanceChart()` - Updates performance chart with filters

### 📋 report-generator.js
- **Purpose**: Generates detailed reports and populates UI elements
- **Functions**:
  - `generateDetailedReports()` - Generates all detailed reports
  - `generateTopStudentsReport()` - Creates top students report
  - `generateAttendanceReport()` - Creates attendance summary
  - `populateFilters()` - Populates filter dropdowns

### 📤 export-manager.js
- **Purpose**: Handles all export functionality (PDF, CSV, Print)
- **Functions**:
  - `exportReport(format)` - Main export function
  - `exportToPDF()` - Generates and downloads PDF report
  - `exportToCSV()` - Generates and downloads CSV files
  - `printReport()` - Opens print dialog
  - `showExportNotification()` - Shows export notifications
  - PDF generation helpers: `generatePDFContent()`, `generateTopStudentsPDF()`, etc.
  - CSV generation helpers: `generateStudentsCSV()`, `generateAttendanceCSV()`, etc.

### 🎯 reports.js (Main Coordinator)
- **Purpose**: Main entry point that coordinates all components
- **Functions**:
  - `initializeReports()` - Initializes the reports module
  - `loadReports()` - Loads the reports dashboard UI

## Loading Order

The components must be loaded in the following order to ensure dependencies are available:

1. **data-processor.js** - Provides data functions
2. **chart-manager.js** - Uses data functions
3. **report-generator.js** - Uses data functions
4. **export-manager.js** - Uses data functions and report generator
5. **reports.js** - Coordinates everything

## HTML Integration

To use this refactored reports module, include the scripts in your HTML in this order:

```html
<!-- Load report components in order -->
<script src="scripts/reports/data-processor.js"></script>
<script src="scripts/reports/chart-manager.js"></script>
<script src="scripts/reports/report-generator.js"></script>
<script src="scripts/reports/export-manager.js"></script>
<script src="scripts/reports.js"></script>
<script src="scripts/reports/index.js"></script>
```

## Benefits of This Structure

1. **Separation of Concerns**: Each file has a single responsibility
2. **Maintainability**: Easier to find and modify specific functionality
3. **Reusability**: Components can be reused in other parts of the application
4. **Testing**: Each component can be tested independently
5. **Performance**: Only load the components you need
6. **Collaboration**: Multiple developers can work on different components

## Migration Notes

- The original `scripts/reports.js` file has been replaced with this modular structure
- All original functionality is preserved
- The main entry point remains `initializeReports()`
- All existing function calls will continue to work

## Dependencies

- Chart.js for chart rendering
- html2canvas for PDF generation
- jsPDF for PDF creation
- Font Awesome for icons
- The main `appData` object must be available globally
