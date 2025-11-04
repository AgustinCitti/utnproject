-- Soporte de inicio de sesión con Google (OAuth 2.0)
USE edusync;

-- Agregar columnas condicionalmente a Usuarios_docente
SET @db := DATABASE();

-- google_id
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Usuarios_docente' AND COLUMN_NAME = 'google_id'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE Usuarios_docente ADD COLUMN google_id VARCHAR(64) UNIQUE NULL AFTER Email_docente;',
  'SELECT 1;'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- oauth_provider
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Usuarios_docente' AND COLUMN_NAME = 'oauth_provider'
);
SET @sql := IF(@exists = 0,
  "ALTER TABLE Usuarios_docente ADD COLUMN oauth_provider ENUM('LOCAL','GOOGLE') NOT NULL DEFAULT 'LOCAL' AFTER google_id;",
  'SELECT 1;'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- avatar (si no existiera, ya hay Avatar en esquema extendido, pero por compatibilidad)
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Usuarios_docente' AND COLUMN_NAME = 'Avatar'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE Usuarios_docente ADD COLUMN Avatar VARCHAR(255) NULL AFTER oauth_provider;',
  'SELECT 1;'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;


