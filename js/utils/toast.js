export class Toast {
    static success(message, duration = 3000) {
        this.show(message, 'success', duration);
    }

    static error(message, duration = 3000) {
        this.show(message, 'error', duration);
    }

    static info(message, duration = 3000) {
        this.show(message, 'info', duration);
    }

    static show(message, type, duration) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconClass = 'ri-information-line';
        if (type === 'success') iconClass = 'ri-checkbox-circle-fill';
        if (type === 'error') iconClass = 'ri-error-warning-fill';

        toast.innerHTML = `
            <i class="${iconClass} toast-icon"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, duration);
    }
}
