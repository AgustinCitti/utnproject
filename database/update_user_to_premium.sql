-- =============================================================
-- Script para actualizar un usuario a PREMIUM
-- =============================================================
-- Este script actualiza el plan de un usuario a PREMIUM
-- 
-- OPCIONES DE USO:
-- 1. Actualizar por ID de usuario (reemplazar X con el ID)
-- 2. Actualizar por email (reemplazar 'email@ejemplo.com' con el email)
-- 3. Actualizar el primer usuario encontrado
-- =============================================================

USE edusync;

-- OPCIÓN 1: Actualizar por ID de usuario
-- Reemplazar 1 con el ID_docente del usuario que quieres actualizar
UPDATE Usuarios_docente 
SET Plan_usuario = 'PREMIUM'
WHERE ID_docente = 1;

-- OPCIÓN 2: Actualizar por email
-- Reemplazar 'email@ejemplo.com' con el email del usuario
-- UPDATE Usuarios_docente 
-- SET Plan_usuario = 'PREMIUM'
-- WHERE Email_docente = 'email@ejemplo.com';

-- OPCIÓN 3: Actualizar el primer usuario encontrado (útil para pruebas)
-- UPDATE Usuarios_docente 
-- SET Plan_usuario = 'PREMIUM'
-- WHERE ID_docente = (SELECT ID_docente FROM Usuarios_docente LIMIT 1);

-- Verificar el cambio
SELECT ID_docente, Nombre_docente, Apellido_docente, Email_docente, Plan_usuario 
FROM Usuarios_docente 
WHERE Plan_usuario = 'PREMIUM';

