// Reports Module Index - Loads all report components in correct order
// This file ensures all report components are loaded and available

// Load order is important:
// 1. Data processor (provides data functions)
// 2. Chart manager (uses data functions)
// 3. Report generator (uses data functions)
// 4. Export manager (uses data functions and report generator)
// 5. Main reports (coordinates everything)

// Note: In a real application with ES6 modules, this would be:
// import './data-processor.js';
// import './chart-manager.js';
// import './report-generator.js';
// import './export-manager.js';
// import './reports.js';

// For now, we assume these are loaded via script tags in the HTML in this order:
// <script src="scripts/reports/data-processor.js"></script>
// <script src="scripts/reports/chart-manager.js"></script>
// <script src="scripts/reports/report-generator.js"></script>
// <script src="scripts/reports/export-manager.js"></script>
// <script src="scripts/reports.js"></script>

// This file serves as documentation for the loading order
// and can be used to verify all components are available

function verifyReportsComponents() {
    const requiredFunctions = [
        // Data processor functions
        'getGradesDistribution',
        'getAttendanceTrends', 
        'getStudentPerformance',
        'getSubjectComparison',
        'calculateAverageGrade',
        'calculateAttendanceRate',
        'getPassingStudents',
        
        // Chart manager functions
        'initializeCharts',
        'destroyAllCharts',
        'createGradesChart',
        'createAttendanceChart',
        'createPerformanceChart',
        'createSubjectChart',
        'updateGradesChart',
        'updateAttendanceChart',
        'updatePerformanceChart',
        
        // Report generator functions
        'generateDetailedReports',
        'generateTopStudentsReport',
        'generateAttendanceReport',
        'populateFilters',
        
        // Export manager functions
        'exportReport',
        'exportToPDF',
        'exportToCSV',
        'printReport',
        'showExportNotification',
        
        // Main reports functions
        'initializeReports',
        'loadReports'
    ];
    
    const missingFunctions = requiredFunctions.filter(func => typeof window[func] !== 'function');
    
    if (missingFunctions.length > 0) {
        console.warn('Missing report functions:', missingFunctions);
        return false;
    }
    
    console.log('All report components loaded successfully');
    return true;
}

// Auto-verify when this script loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(verifyReportsComponents, 100);
});

// Export verification function
window.verifyReportsComponents = verifyReportsComponents;
