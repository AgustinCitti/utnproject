-- =============================================================
-- Agregar gestión de Escuelas y vincular Materias a una Escuela
-- Permite diferenciar cursos repetidos por establecimiento
-- =============================================================

USE edusync;

-- 1) Crear tabla Escuela (si no existe)
CREATE TABLE IF NOT EXISTS Escuela (
  ID_escuela INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(120) NOT NULL,
  CUE VARCHAR(20) NULL UNIQUE COMMENT 'Código Único de Establecimiento (opcional)',
  Direccion VARCHAR(200) NULL,
  Localidad VARCHAR(80) NULL,
  Provincia VARCHAR(80) NULL,
  Telefono VARCHAR(30) NULL,
  Email VARCHAR(120) NULL,
  Estado ENUM('ACTIVA','INACTIVA') NOT NULL DEFAULT 'ACTIVA',
  Fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_escuela_nombre (Nombre),
  INDEX idx_escuela_estado (Estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2) Agregar columna Escuela_ID a Materia de forma segura
SET @db := DATABASE();
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Materia' AND COLUMN_NAME = 'Escuela_ID'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE Materia ADD COLUMN Escuela_ID INT NULL AFTER Aula, ADD INDEX idx_materia_escuela (Escuela_ID), ADD CONSTRAINT fk_materia_escuela FOREIGN KEY (Escuela_ID) REFERENCES Escuela(ID_escuela) ON UPDATE CASCADE ON DELETE SET NULL;',
  'SELECT 1;'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 3) Vista útil para listar materias con escuela y curso/división
CREATE OR REPLACE VIEW vista_materias_con_escuela AS
SELECT 
  m.ID_materia,
  m.Nombre AS Materia,
  m.Curso_division AS CursoDivision,
  e.Nombre AS Escuela,
  e.CUE,
  e.Localidad,
  e.Provincia,
  m.Estado
FROM Materia m
LEFT JOIN Escuela e ON e.ID_escuela = m.Escuela_ID;


