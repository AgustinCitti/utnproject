/**
 * Toast Notification System
 * Sistema de notificaciones toast para mostrar mensajes al usuario
 */

class ToastNotification {
    constructor() {
        this.init();
    }

    init() {
        // Crear el contenedor de toasts si no existe
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    /**
     * Mostrar una notificación toast
     * @param {Object} options - Opciones de la notificación
     * @param {string} options.title - Título de la notificación
     * @param {string} options.message - Mensaje de la notificación
     * @param {string} options.type - Tipo de notificación (success, error, info, warning)
     * @param {number} options.duration - Duración en ms (default: 5000)
     */
    show({ title, message, type = 'info', duration = 5000 }) {
        const container = document.querySelector('.toast-container');
        
        // Crear el elemento toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Iconos según el tipo
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        toast.innerHTML = `
            <i class="${icons[type]}"></i>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;
        
        // Agregar al contenedor
        container.appendChild(toast);
        
        // Manejar el cierre
        const close = () => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => container.removeChild(toast), 300);
        };
        
        // Evento de cierre
        toast.querySelector('.toast-close').addEventListener('click', close);
        
        // Auto cerrar después de la duración especificada
        if (duration) {
            setTimeout(close, duration);
        }
    }

    /**
     * Mostrar notificación de éxito
     */
    success(message, title = 'Éxito') {
        this.show({ title, message, type: 'success' });
    }

    /**
     * Mostrar notificación de error
     */
    error(message, title = 'Error') {
        this.show({ title, message, type: 'error' });
    }

    /**
     * Mostrar notificación informativa
     */
    info(message, title = 'Información') {
        this.show({ title, message, type: 'info' });
    }

    /**
     * Mostrar notificación de advertencia
     */
    warning(message, title = 'Advertencia') {
        this.show({ title, message, type: 'warning' });
    }
}

// Crear instancia global
const toast = new ToastNotification();

// Exponer al scope global
window.toast = toast;