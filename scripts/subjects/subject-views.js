/**
 * Subject Views Module
 * 
 * Handles rendering of subjects in different views:
 * - Grid view (card layout)
 * - List view (table layout)
 * - View toggle functionality
 */

import { 
    getTeacherById, 
    getStudentCountBySubject, 
    getEvaluationCountBySubject, 
    getContentCountBySubject,
    getStatusText 
} from './utils/helpers.js';
import { getFilteredSubjects } from './utils/filters.js';

/**
 * Load and render subjects in both grid and list views
 */
export function loadSubjects() {
    const subjectsContainer = document.getElementById('subjectsContainer');
    const subjectsList = document.getElementById('subjectsList');
    
    if (!subjectsContainer || !subjectsList) return;

    // Get filtered subjects
    const filteredSubjects = getFilteredSubjects();

    // Grid view
    subjectsContainer.innerHTML = filteredSubjects.map(subject => {
        const teacher = getTeacherById(subject.Usuarios_docente_ID_docente);
        const studentCount = getStudentCountBySubject(subject.ID_materia);
        const evaluationCount = getEvaluationCountBySubject(subject.ID_materia);
        const contentCount = getContentCountBySubject(subject.ID_materia);

        return `
            <div class="card clickable-card" onclick="showSubjectThemesPanel(${subject.ID_materia})" style="cursor: pointer;">
                <div class="card-header">
                    <h3 class="card-title">${subject.Nombre}</h3>
                    <div class="card-actions" onclick="event.stopPropagation();">
                        <button class="btn-icon btn-edit" onclick="editSubject(${subject.ID_materia})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-create" onclick="createThemeForSubject(${subject.ID_materia})" title="Crear Tema">
                            <i class="fas fa-book-open"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteSubject(${subject.ID_materia})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <p><strong>Curso:</strong> ${subject.Curso_division}</p>
                    <p><strong>Profesor:</strong> ${teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'N/A'}</p>
                    <p><strong>Horario:</strong> ${subject.Horario || 'No especificado'}</p>
                    <p><strong>Aula:</strong> ${subject.Aula || 'No especificada'}</p>
                    <p><strong>Estado:</strong> <span class="status-${subject.Estado.toLowerCase()}">${getStatusText(subject.Estado)}</span></p>
                    <div class="card-stats">
                        <div class="stat-item">
                            <i class="fas fa-users"></i>
                            <span>${studentCount} estudiantes</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-file-alt"></i>
                            <span>${evaluationCount} evaluaciones</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-list"></i>
                            <span>${contentCount} temas</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // List view - Table format
    subjectsList.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th data-translate="subject_name">Materia</th>
                        <th data-translate="course_division">Curso</th>
                        <th data-translate="teacher">Profesor</th>
                        <th data-translate="schedule">Horario</th>
                        <th data-translate="classroom">Aula</th>
                        <th data-translate="status">Estado</th>
                        <th data-translate="students">Estudiantes</th>
                        <th data-translate="actions">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredSubjects.map(subject => {
                        const teacher = getTeacherById(subject.Usuarios_docente_ID_docente);
                        const studentCount = getStudentCountBySubject(subject.ID_materia);
                        
                        return `
                            <tr onclick="showSubjectThemesPanel(${subject.ID_materia})" class="clickable-row">
                                <td>
                                    <strong>${subject.Nombre}</strong>
                                    <br>
                                    <small style="color: #667eea; font-weight: 600;">
                                        <i class="fas fa-graduation-cap" style="margin-right: 4px;"></i>
                                        ${subject.Curso_division}
                                    </small>
                                </td>
                                <td>
                                    <span style="display: inline-block; padding: 4px 10px; background: #e3f2fd; color: #1976d2; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">
                                        ${subject.Curso_division}
                                    </span>
                                </td>
                                <td>${teacher ? `${teacher.Nombre_docente} ${teacher.Apellido_docente}` : 'N/A'}</td>
                                <td>${subject.Horario || 'No especificado'}</td>
                                <td>${subject.Aula || 'No especificada'}</td>
                                <td><span class="table-status ${subject.Estado.toLowerCase()}">${getStatusText(subject.Estado)}</span></td>
                                <td>
                                    <span style="display: inline-flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-users" style="color: #667eea;"></i>
                                        <strong>${studentCount}</strong>
                                    </span>
                                </td>
                                <td>
                                    <div class="table-actions" onclick="event.stopPropagation();">
                                        <button class="btn-icon btn-edit" onclick="editSubject(${subject.ID_materia})" title="Editar">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon btn-create" onclick="createThemeForSubject(${subject.ID_materia})" title="Crear Tema">
                                            <i class="fas fa-book-open"></i>
                                        </button>
                                        <button class="btn-icon btn-delete" onclick="deleteSubject(${subject.ID_materia})" title="Eliminar">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

/**
 * Setup view toggle functionality (grid/list)
 * @param {string} gridBtnId - Grid view button ID
 * @param {string} listBtnId - List view button ID
 * @param {string} gridContainerId - Grid container ID
 * @param {string} listContainerId - List container ID
 */
export function setupViewToggle(gridBtnId, listBtnId, gridContainerId, listContainerId) {
    const gridBtn = document.getElementById(gridBtnId);
    const listBtn = document.getElementById(listBtnId);
    const gridContainer = document.getElementById(gridContainerId);
    const listContainer = document.getElementById(listContainerId);
    
    if (!gridBtn || !listBtn || !gridContainer || !listContainer) return;
    
    gridBtn.addEventListener('click', () => {
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
        gridContainer.style.display = 'grid';
        listContainer.style.display = 'none';
    });
    
    listBtn.addEventListener('click', () => {
        listBtn.classList.add('active');
        gridBtn.classList.remove('active');
        gridContainer.style.display = 'none';
        listContainer.style.display = 'block';
    });
}

