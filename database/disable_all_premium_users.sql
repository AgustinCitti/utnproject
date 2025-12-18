-- =============================================================
-- Script para DESACTIVAR TODOS los usuarios PREMIUM
-- =============================================================
-- Este script actualiza TODOS los usuarios con plan PREMIUM a ESTANDAR
-- 
-- ADVERTENCIA: Este script afecta a TODOS los usuarios premium.
-- Ejecuta con precaución y haz un backup antes de ejecutar.
-- =============================================================

USE edusync;

-- Ver usuarios premium antes de desactivar (para referencia)
SELECT 
    ID_docente, 
    Nombre_docente, 
    Apellido_docente, 
    Email_docente, 
    Plan_usuario 
FROM Usuarios_docente 
WHERE Plan_usuario = 'PREMIUM';

-- Desactivar TODOS los usuarios premium (cambiar a ESTANDAR)
UPDATE Usuarios_docente 
SET Plan_usuario = 'ESTANDAR'
WHERE Plan_usuario = 'PREMIUM';

-- Verificar que no queden usuarios premium
SELECT 
    COUNT(*) AS usuarios_premium_restantes
FROM Usuarios_docente 
WHERE Plan_usuario = 'PREMIUM';

-- Mostrar usuarios que fueron desactivados (ahora son ESTANDAR)
SELECT 
    ID_docente, 
    Nombre_docente, 
    Apellido_docente, 
    Email_docente, 
    Plan_usuario 
FROM Usuarios_docente 
WHERE Plan_usuario = 'ESTANDAR'
ORDER BY ID_docente;

