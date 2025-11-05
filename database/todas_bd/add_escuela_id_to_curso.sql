-- =============================================================
-- Vincular Cursos a una Escuela
-- =============================================================

USE edusync;

-- 1) Crear tabla Escuela (si no existe) - Copiado de add_escuela_materia.sql
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

-- 2) Agregar columna Escuela_ID a Curso de forma segura
SET @db := DATABASE();
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Curso' AND COLUMN_NAME = 'Escuela_ID'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE Curso ADD COLUMN Escuela_ID INT NULL AFTER Institucion, ADD INDEX idx_curso_escuela (Escuela_ID), ADD CONSTRAINT fk_curso_escuela FOREIGN KEY (Escuela_ID) REFERENCES Escuela(ID_escuela) ON UPDATE CASCADE ON DELETE SET NULL;',
  'SELECT 1;'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
