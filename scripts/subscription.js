// Subscription limits and upgrade prompt handling
(function () {
    const SUBSCRIPTION_STORAGE_KEY = 'subscriptionInfo';
    const COURSE_LIMIT_FREE = 4;
    const PREMIUM_LIMIT = Number.MAX_SAFE_INTEGER;

    function getSubscriptionInfo() {
        try {
            const raw = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    parsed.plan = parsed.plan || 'FREE';
                    if (parsed.plan === 'PREMIUM') {
                        parsed.courseLimit = parsed.courseLimit && parsed.courseLimit > 0 ? parsed.courseLimit : PREMIUM_LIMIT;
                    } else {
                        parsed.courseLimit = COURSE_LIMIT_FREE;
                    }
                    parsed.courseCount = typeof parsed.courseCount === 'number' ? parsed.courseCount : 0;
                    return parsed;
                }
            }
        } catch (error) {
            console.warn('Could not parse subscription info from storage:', error);
        }
        return {
            plan: 'FREE',
            courseLimit: COURSE_LIMIT_FREE,
            courseCount: 0
        };
    }

    function setSubscriptionInfo(info) {
        try {
            if (!info || typeof info !== 'object') return;
            const payload = { ...info };
            payload.plan = payload.plan || 'FREE';
            if (payload.plan === 'PREMIUM') {
                payload.courseLimit = payload.courseLimit && payload.courseLimit > 0 ? payload.courseLimit : PREMIUM_LIMIT;
            } else {
                payload.courseLimit = COURSE_LIMIT_FREE;
            }
            payload.courseCount = typeof payload.courseCount === 'number' ? payload.courseCount : 0;
            localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(payload));
        } catch (error) {
            console.warn('Could not persist subscription info:', error);
        }
    }

    function isApprovedSubject(subject) {
        if (!subject) return false;
        const name = (subject.Nombre || '').toString().toLowerCase();
        if (!name.includes('aprobado')) return false;
        const estado = (subject.Estado || '').toString().toUpperCase();
        return estado === 'FINALIZADA';
    }

    function isIntensificationSubject(subject) {
        if (!subject) return false;
        const name = (subject.Nombre || '').toString().toLowerCase();
        return name.includes('intensifica');
    }

    function calculateCourseUsage() {
        const subjects = listCountedSubjects();
        return Array.isArray(subjects) ? subjects.length : 0;
    }

    function listCountedSubjects() {
        const data = window.appData || window.data || {};
        const subjects = Array.isArray(data.materia) ? data.materia
            : (Array.isArray(window.appData?.materia) ? window.appData.materia : []);
        if (!subjects || !subjects.length) {
            return [];
        }

        return subjects.filter(subject => {
            if (!subject) return false;
            if (isApprovedSubject(subject)) {
                return false;
            }
            // Intensificación materias sí cuentan
            return true;
        });
    }

    function createUpgradeModal() {
        if (document.getElementById('upgradeSubscriptionModal')) {
            return document.getElementById('upgradeSubscriptionModal');
        }

        const modal = document.createElement('div');
        modal.id = 'upgradeSubscriptionModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-dialog-content">
                    <div class="modal-dialog-header">
                        <h3>Desbloquea la versión Premium</h3>
                        <button class="modal-dialog-close close-modal">&times;</button>
                    </div>
                    <div class="modal-dialog-body">
                        <div class="upgrade-benefits">
                            <p style="font-size: 1rem; color: var(--text-primary);">
                                Has alcanzado el límite de materias permitido en tu plan actual.
                            </p>
                            <div style="margin-top: 16px; border-radius: 8px; padding: 16px; background: var(--card-bg-secondary); border: 1px solid var(--border-color);">
                                <h4 style="margin-bottom: 12px; color: var(--text-primary);">Plan Premium - USD 9.99/mes</h4>
                                <ul style="padding-left: 20px; color: var(--text-secondary);">
                                    <li>Materias y cursos ilimitados</li>
                                    <li>Reportes avanzados y analíticas</li>
                                    <li>Soporte prioritario</li>
                                    <li>Exportaciones ilimitadas</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="modal-dialog-footer">
                        <button type="button" class="btn-secondary close-modal">Cancelar</button>
                        <button type="button" class="btn-primary" id="upgradeSubscriptionButton">Obtener</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        if (typeof setupModalHandlers === 'function') {
            setupModalHandlers('upgradeSubscriptionModal');
        } else {
            modal.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    modal.classList.remove('active');
                    setTimeout(() => {
                        modal.remove();
                    }, 200);
                });
            });
        }

        const upgradeBtn = modal.querySelector('#upgradeSubscriptionButton');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                window.location.href = 'payment.html';
            });
        }

        return modal;
    }

    function showUpgradeModal() {
        const modal = createUpgradeModal();
        if (modal) {
            if (typeof showModal === 'function') {
                showModal('upgradeSubscriptionModal');
            } else {
                modal.classList.add('active');
            }
        }
    }

    function checkCourseLimit(additionalCourses = 0, options = {}) {
        const { showModalOnLimit = true } = options || {};
        const info = getSubscriptionInfo();
        const currentCourseCount = calculateCourseUsage();
        const projectedCount = currentCourseCount + (additionalCourses || 0);

        info.courseCount = currentCourseCount;
        setSubscriptionInfo(info);

        if (info.plan !== 'PREMIUM' && projectedCount >= info.courseLimit) {
            if (showModalOnLimit) {
                showUpgradeModal();
            }
            return false;
        }

        return true;
    }

    window.SubscriptionModule = {
        getSubscriptionInfo,
        setSubscriptionInfo,
        checkCourseLimit,
        showUpgradeModal,
        getCourseUsage: calculateCourseUsage,
        listCountedSubjects,
        COURSE_LIMIT_FREE
    };

    document.addEventListener('DOMContentLoaded', () => {
        checkCourseLimit(0, { showModalOnLimit: false });
    });
})();

