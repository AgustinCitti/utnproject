/**
 * Notification System
 * Sistema unificado de notificaciones para toda la aplicación
 */

const notify = {
    /**
     * Mostrar una notificación de éxito
     * @param {string} message - Mensaje a mostrar
     * @param {string} title - Título opcional
     */
    success: function(message, title = 'Éxito') {
        // Usar toast si está disponible
        if (typeof toast !== 'undefined') {
            toast.success(message, title);
            return;
        }
        
        // Fallback a los métodos existentes específicos de cada página
        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage(message);
            return;
        }
        
        // Último fallback a alert
        alert(`${title}: ${message}`);
    },

    /**
     * Mostrar una notificación de error
     * @param {string} message - Mensaje a mostrar
     * @param {string} title - Título opcional
     */
    error: function(message, title = 'Error') {
        // Usar toast si está disponible
        if (typeof toast !== 'undefined') {
            toast.error(message, title);
            return;
        }
        
        // Fallback a los métodos existentes específicos de cada página
        if (typeof showErrorMessage === 'function') {
            showErrorMessage(message);
            return;
        }
        
        // Último fallback a alert
        alert(`${title}: ${message}`);
    },

    /**
     * Mostrar una notificación informativa
     * @param {string} message - Mensaje a mostrar
     * @param {string} title - Título opcional
     */
    info: function(message, title = 'Información') {
        // Usar toast si está disponible
        if (typeof toast !== 'undefined') {
            toast.info(message, title);
            return;
        }
        
        // Fallback a los métodos existentes específicos de cada página
        if (typeof showMessage === 'function') {
            showMessage(message);
            return;
        }
        
        // Último fallback a alert
        alert(`${title}: ${message}`);
    },

    /**
     * Mostrar una notificación de advertencia
     * @param {string} message - Mensaje a mostrar
     * @param {string} title - Título opcional
     */
    warning: function(message, title = 'Advertencia') {
        // Usar toast si está disponible
        if (typeof toast !== 'undefined') {
            toast.warning(message, title);
            return;
        }
        
        // Fallback a los métodos existentes específicos de cada página
        if (typeof showWarningMessage === 'function') {
            showWarningMessage(message);
            return;
        }
        
        // Último fallback a alert
        alert(`${title}: ${message}`);
    }
};

// Exponer al scope global
window.notify = notify;