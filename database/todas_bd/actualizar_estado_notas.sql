-- =====================================================
-- EduSync - Actualización de Estado de Notas
-- Script para agregar valores APROBADO y DEBE al ENUM de Estado
-- =====================================================

USE edusync;

-- =====================================================
-- ACTUALIZAR ENUM DE ESTADO EN TABLA NOTAS
-- =====================================================

-- Modificar el ENUM para incluir APROBADO y DEBE
-- Nota: ALTER TABLE MODIFY COLUMN puede cambiar el ENUM sin perder datos
ALTER TABLE Notas 
MODIFY COLUMN Estado ENUM('TENTATIVA', 'DEFINITIVA', 'RECUPERATORIO', 'APROBADO', 'DEBE') 
DEFAULT 'DEFINITIVA' 
COMMENT 'Estado de la calificación: APROBADO (nota >= 7), DEBE (nota < 7 o ausente)';

-- =====================================================
-- ACTUALIZAR NOTAS EXISTENTES SEGÚN SU CALIFICACIÓN
-- =====================================================

-- Actualizar notas existentes: si calificación >= 7 → APROBADO, si < 7 o 0 → DEBE
UPDATE Notas 
SET Estado = CASE 
    WHEN Calificacion >= 7 THEN 'APROBADO'
    WHEN Calificacion < 7 OR Calificacion = 0 THEN 'DEBE'
    ELSE Estado
END
WHERE Estado IN ('TENTATIVA', 'DEFINITIVA', 'RECUPERATORIO');

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que la actualización fue exitosa
SELECT 
    Estado,
    COUNT(*) as Cantidad,
    MIN(Calificacion) as Min_Nota,
    MAX(Calificacion) as Max_Nota,
    AVG(Calificacion) as Promedio
FROM Notas
GROUP BY Estado
ORDER BY Estado;

SELECT 'Actualización de Estado de Notas completada exitosamente!' as Mensaje;

