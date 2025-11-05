-- =============================================================
-- Script para agregar tabla Curso a EduSync
-- Permite gestionar cursos/divisiones antes de crear materias
-- =============================================================

USE edusync;

-- Crear tabla Curso
CREATE TABLE IF NOT EXISTS Curso (
    ID_curso INT AUTO_INCREMENT PRIMARY KEY,
    Curso_division VARCHAR(100) NOT NULL COMMENT 'Formato: "Nº Curso - División X"',
    Numero_curso INT NOT NULL COMMENT 'Número del curso (1-7)',
    Division VARCHAR(10) NOT NULL COMMENT 'Letra de la división (A-F)',
    Usuarios_docente_ID_docente INT NOT NULL COMMENT 'Docente que creó/gestiona el curso',
    Estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    Fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_curso_docente (Curso_division, Usuarios_docente_ID_docente),
    FOREIGN KEY (Usuarios_docente_ID_docente) REFERENCES Usuarios_docente(ID_docente) ON DELETE CASCADE,
    INDEX idx_docente (Usuarios_docente_ID_docente),
    INDEX idx_estado (Estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de cursos/divisiones gestionados por docentes';

-- Migrar datos existentes de Materia a Curso (si existen)
-- Esto crea cursos basados en los curso_division que ya existen en Materia
INSERT INTO Curso (Curso_division, Numero_curso, Division, Usuarios_docente_ID_docente, Estado)
SELECT DISTINCT
    m.Curso_division,
    CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(m.Curso_division, 'º', 1), ' ', 1) AS UNSIGNED) AS Numero_curso,
    UPPER(SUBSTRING_INDEX(SUBSTRING_INDEX(m.Curso_division, 'División ', -1), ' ', 1)) AS Division,
    m.Usuarios_docente_ID_docente,
    'ACTIVO'
FROM Materia m
WHERE m.Curso_division IS NOT NULL 
  AND m.Curso_division != ''
  AND NOT EXISTS (
      SELECT 1 FROM Curso c 
      WHERE c.Curso_division = m.Curso_division 
        AND c.Usuarios_docente_ID_docente = m.Usuarios_docente_ID_docente
  )
ON DUPLICATE KEY UPDATE Fecha_actualizacion = CURRENT_TIMESTAMP;

