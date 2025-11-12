-- =====================================================
-- Script para asociar evaluaciones a temas de contenido
-- =====================================================

-- Agregar columna para vincular cada evaluación con un tema específico
ALTER TABLE Evaluacion 
ADD COLUMN Contenido_ID_contenido INT NULL AFTER Materia_ID_materia;

-- Crear índice para optimizar búsquedas por tema
ALTER TABLE Evaluacion
ADD INDEX idx_contenido_evaluacion (Contenido_ID_contenido);

-- Agregar restricción de clave foránea con manejo seguro ante eliminación de temas
ALTER TABLE Evaluacion
ADD CONSTRAINT fk_evaluacion_contenido 
    FOREIGN KEY (Contenido_ID_contenido) 
    REFERENCES Contenido(ID_contenido)
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

