-- =============================================================
-- Script para agregar relación directa entre Estudiante y Curso
-- =============================================================
-- Este script agrega la columna Curso_ID_curso a la tabla Estudiante
-- para establecer una relación directa: un estudiante pertenece a un curso

USE edusync;

-- Verificar si la columna ya existe
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'Estudiante' 
    AND COLUMN_NAME = 'Curso_ID_curso'
);

-- Agregar la columna si no existe
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE Estudiante 
     ADD COLUMN Curso_ID_curso INT NULL 
     AFTER INTENSIFICA,
     ADD INDEX idx_estudiante_curso (Curso_ID_curso),
     ADD CONSTRAINT fk_estudiante_curso 
         FOREIGN KEY (Curso_ID_curso) 
         REFERENCES Curso(ID_curso) 
         ON DELETE SET NULL 
         ON UPDATE CASCADE',
    'SELECT "La columna Curso_ID_curso ya existe en la tabla Estudiante" AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Migrar datos existentes: asignar curso basado en las materias del estudiante
-- Si un estudiante está inscrito en materias, se le asigna el curso de la primera materia
UPDATE Estudiante e
INNER JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
INNER JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
INNER JOIN Curso c ON m.Curso_division = c.Curso_division 
    AND m.Usuarios_docente_ID_docente = c.Usuarios_docente_ID_docente
SET e.Curso_ID_curso = c.ID_curso
WHERE e.Curso_ID_curso IS NULL
LIMIT 1;

-- Nota: Si un estudiante está en múltiples cursos (a través de diferentes materias),
-- se le asignará el curso de la primera materia encontrada.
-- Para estudiantes con múltiples cursos, se recomienda revisar manualmente.

SELECT 'Migración completada. Se agregó la columna Curso_ID_curso a la tabla Estudiante.' AS resultado;

