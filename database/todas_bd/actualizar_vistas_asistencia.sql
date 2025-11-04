-- =====================================================
-- EduSync - Actualización de Vistas de Asistencia
-- Script para actualizar las vistas con los nuevos valores P/A/J
-- =====================================================

USE edusync;

-- =====================================================
-- ACTUALIZAR VISTAS CON NUEVOS VALORES DE ASISTENCIA
-- =====================================================

-- Actualizar vista de estadísticas de asistencia
DROP VIEW IF EXISTS vista_estadisticas_asistencia;
CREATE VIEW vista_estadisticas_asistencia AS
SELECT 
    e.ID_Estudiante,
    CONCAT(e.Nombre, ' ', e.Apellido) as Estudiante_Nombre,
    m.Nombre as Materia_Nombre,
    COUNT(a.ID_Asistencia) as Total_Clases,
    SUM(CASE WHEN a.Presente = 'P' THEN 1 ELSE 0 END) as Clases_Presente,
    SUM(CASE WHEN a.Presente = 'A' THEN 1 ELSE 0 END) as Clases_Ausente,
    SUM(CASE WHEN a.Presente = 'J' THEN 1 ELSE 0 END) as Clases_Justificadas,
    ROUND((SUM(CASE WHEN a.Presente = 'P' THEN 1 ELSE 0 END) / COUNT(a.ID_Asistencia)) * 100, 2) as Porcentaje_Asistencia
FROM Estudiante e
JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
LEFT JOIN Asistencia a ON e.ID_Estudiante = a.Estudiante_ID_Estudiante AND m.ID_materia = a.Materia_ID_materia
GROUP BY e.ID_Estudiante, e.Nombre, e.Apellido, m.ID_materia, m.Nombre;

-- Actualizar vista de estudiantes con problemas
DROP VIEW IF EXISTS vista_estudiantes_problemas;
CREATE VIEW vista_estudiantes_problemas AS
SELECT 
    e.ID_Estudiante,
    CONCAT(e.Nombre, ' ', e.Apellido) as Estudiante_Nombre,
    e.Email,
    e.Estado,
    COUNT(axm.Materia_ID_materia) as Total_Materias,
    AVG(n.Calificacion) as Promedio_General,
    COUNT(CASE WHEN n.Calificacion < 6 THEN 1 END) as Calificaciones_Bajas,
    COUNT(CASE WHEN a.Presente = 'A' THEN 1 END) as Ausencias_Recientes,
    CASE 
        WHEN AVG(n.Calificacion) < 6 THEN 'RENDIMIENTO_BAJO'
        WHEN COUNT(CASE WHEN a.Presente = 'A' THEN 1 END) > 5 THEN 'ASISTENCIA_BAJA'
        WHEN COUNT(CASE WHEN n.Calificacion < 6 THEN 1 END) > 3 THEN 'MULTIPLES_DESAPROBADOS'
        ELSE 'SIN_PROBLEMAS'
    END as Tipo_Problema
FROM Estudiante e
LEFT JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
LEFT JOIN Notas n ON e.ID_Estudiante = n.Estudiante_ID_Estudiante AND n.Estado = 'DEFINITIVA'
LEFT JOIN Asistencia a ON e.ID_Estudiante = a.Estudiante_ID_Estudiante
WHERE e.Estado = 'ACTIVO'
GROUP BY e.ID_Estudiante, e.Nombre, e.Apellido, e.Email, e.Estado
HAVING Promedio_General < 6 OR Calificaciones_Bajas > 3 OR Ausencias_Recientes > 5;

-- Actualizar vista de asistencia por materia
DROP VIEW IF EXISTS vista_asistencia_materia;
CREATE VIEW vista_asistencia_materia AS
SELECT 
    m.ID_materia,
    m.Nombre as Materia_Nombre,
    m.Curso_division,
    ud.Nombre_docente,
    ud.Apellido_docente,
    COUNT(DISTINCT axm.Estudiante_ID_Estudiante) as Total_Estudiantes,
    COUNT(a.ID_Asistencia) as Total_Clases_Registradas,
    SUM(CASE WHEN a.Presente = 'P' THEN 1 ELSE 0 END) as Total_Presentes,
    SUM(CASE WHEN a.Presente = 'A' THEN 1 ELSE 0 END) as Total_Ausentes,
    SUM(CASE WHEN a.Presente = 'J' THEN 1 ELSE 0 END) as Total_Justificadas,
    ROUND((SUM(CASE WHEN a.Presente = 'P' THEN 1 ELSE 0 END) / COUNT(a.ID_Asistencia)) * 100, 2) as Porcentaje_Asistencia_General,
    COUNT(DISTINCT a.Fecha) as Dias_Con_Clase
FROM Materia m
JOIN Usuarios_docente ud ON m.Usuarios_docente_ID_docente = ud.ID_docente
LEFT JOIN Alumnos_X_Materia axm ON m.ID_materia = axm.Materia_ID_materia
LEFT JOIN Asistencia a ON m.ID_materia = a.Materia_ID_materia
GROUP BY m.ID_materia, m.Nombre, m.Curso_division, ud.Nombre_docente, ud.Apellido_docente;

-- =====================================================
-- PROCEDIMIENTOS PARA MARCAR ASISTENCIA
-- =====================================================

-- Procedimiento para marcar asistencia masiva con nuevos valores
DELIMITER //
CREATE PROCEDURE marcar_asistencia_masiva_nueva(
    IN p_materia_id INT,
    IN p_fecha DATE,
    IN p_estudiantes_presentes TEXT,
    IN p_estudiantes_justificados TEXT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_estudiante_id INT;
    DECLARE v_presente CHAR(1);
    DECLARE cur CURSOR FOR 
        SELECT Estudiante_ID_Estudiante FROM Alumnos_X_Materia 
        WHERE Materia_ID_materia = p_materia_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Marcar todos como ausentes primero
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_estudiante_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Determinar el estado de asistencia
        IF FIND_IN_SET(v_estudiante_id, p_estudiantes_presentes) > 0 THEN
            SET v_presente = 'P';
        ELSEIF FIND_IN_SET(v_estudiante_id, p_estudiantes_justificados) > 0 THEN
            SET v_presente = 'J';
        ELSE
            SET v_presente = 'A';
        END IF;
        
        INSERT INTO Asistencia (Fecha, Presente, Materia_ID_materia, Estudiante_ID_Estudiante)
        VALUES (p_fecha, v_presente, p_materia_id, v_estudiante_id)
        ON DUPLICATE KEY UPDATE Presente = v_presente;
    END LOOP;
    CLOSE cur;
END //

-- Procedimiento para obtener resumen de asistencia por estudiante
CREATE PROCEDURE resumen_asistencia_estudiante(
    IN p_estudiante_id INT,
    IN p_materia_id INT
)
BEGIN
    SELECT 
        e.Nombre,
        e.Apellido,
        m.Nombre as Materia,
        COUNT(a.ID_Asistencia) as Total_Clases,
        SUM(CASE WHEN a.Presente = 'P' THEN 1 ELSE 0 END) as Presentes,
        SUM(CASE WHEN a.Presente = 'A' THEN 1 ELSE 0 END) as Ausentes,
        SUM(CASE WHEN a.Presente = 'J' THEN 1 ELSE 0 END) as Justificadas,
        ROUND((SUM(CASE WHEN a.Presente = 'P' THEN 1 ELSE 0 END) / COUNT(a.ID_Asistencia)) * 100, 2) as Porcentaje_Asistencia
    FROM Estudiante e
    JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
    JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
    LEFT JOIN Asistencia a ON e.ID_Estudiante = a.Estudiante_ID_Estudiante AND m.ID_materia = a.Materia_ID_materia
    WHERE e.ID_Estudiante = p_estudiante_id AND m.ID_materia = p_materia_id
    GROUP BY e.ID_Estudiante, e.Nombre, e.Apellido, m.ID_materia, m.Nombre;
END //

DELIMITER ;

-- =====================================================
-- CONSULTAS DE EJEMPLO CON NUEVOS VALORES
-- =====================================================

-- Ejemplo 1: Ver asistencia de hoy
-- SELECT * FROM vista_estadisticas_asistencia WHERE Total_Clases > 0;

-- Ejemplo 2: Estudiantes con problemas de asistencia
-- SELECT * FROM vista_estudiantes_problemas WHERE Tipo_Problema = 'ASISTENCIA_BAJA';

-- Ejemplo 3: Marcar asistencia masiva
-- CALL marcar_asistencia_masiva_nueva(1, '2024-03-25', '1,2,4', '3');

-- Ejemplo 4: Resumen de asistencia de un estudiante
-- CALL resumen_asistencia_estudiante(1, 1);

-- =====================================================
-- MENSAJE DE ACTUALIZACIÓN EXITOSA
-- =====================================================
SELECT 'Vistas de asistencia actualizadas exitosamente!' as Mensaje,
       'Valores: P=Presente, A=Ausente, J=Justificado' as Valores_Asistencia,
       'Procedimientos actualizados' as Procedimientos;
