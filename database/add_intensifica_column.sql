-- =====================================================
-- Script para agregar columna INTENSIFICA a la tabla Estudiante
-- =====================================================

-- Agregar columna booleana INTENSIFICA a la tabla Estudiante
ALTER TABLE Estudiante 
ADD COLUMN INTENSIFICA BOOLEAN DEFAULT FALSE AFTER Estado;

-- Agregar índice para mejorar consultas
ALTER TABLE Estudiante 
ADD INDEX idx_intensifica (INTENSIFICA);

-- Actualizar registros existentes: si tienen Estado='INACTIVO' y tienen temas asignados, marcar INTENSIFICA=TRUE
UPDATE Estudiante e
SET e.INTENSIFICA = TRUE
WHERE e.Estado = 'INACTIVO' 
  AND EXISTS (
      SELECT 1 FROM Tema_estudiante te 
      WHERE te.Estudiante_ID_Estudiante = e.ID_Estudiante
  );

