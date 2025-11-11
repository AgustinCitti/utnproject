-- =============================================================
-- Script para agregar 'ADMIN' como tipo de usuario
-- =============================================================
-- Este script modifica la columna Tipo_usuario en la tabla Usuarios_docente
-- para incluir 'ADMIN' como una opción válida en el ENUM
-- =============================================================

USE edusync;

-- Modificar la columna Tipo_usuario para incluir 'ADMIN'
-- Nota: En MySQL, para agregar un valor a un ENUM, debemos redefinir
-- todo el ENUM incluyendo todos los valores existentes más el nuevo
ALTER TABLE Usuarios_docente 
MODIFY COLUMN Tipo_usuario ENUM(
    'PROFESOR', 
    'PROFESOR_ADJUNTO', 
    'JEFE_TP', 
    'COORDINADOR', 
    'ADMIN'
) DEFAULT 'PROFESOR' COMMENT 'Tipo de usuario del sistema';

-- Verificar que el cambio se aplicó correctamente
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'edusync'
  AND TABLE_NAME = 'Usuarios_docente'
  AND COLUMN_NAME = 'Tipo_usuario';

-- Mensaje de confirmación
SELECT 
    'ADMIN agregado exitosamente como tipo de usuario' AS Mensaje,
    'Tipo_usuario ahora incluye: PROFESOR, PROFESOR_ADJUNTO, JEFE_TP, COORDINADOR, ADMIN' AS Valores_Disponibles;


