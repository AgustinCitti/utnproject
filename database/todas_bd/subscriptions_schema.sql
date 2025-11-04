-- =============================================================
-- Esquema de Suscripciones (Planes, Suscripciones y Pagos)
-- Permite manejar usuarios ESTANDAR/PREMIUM con vigencia y cobros.
-- =============================================================

USE edusync;

-- 1) Planes
CREATE TABLE IF NOT EXISTS Plan (
  ID_plan INT AUTO_INCREMENT PRIMARY KEY,
  Nombre VARCHAR(40) NOT NULL UNIQUE,             -- ESTANDAR, PREMIUM, etc.
  Descripcion TEXT,
  Precio_mensual DECIMAL(10,2) NOT NULL DEFAULT 0,
  Activo TINYINT(1) NOT NULL DEFAULT 1,
  Limite_materias INT NULL,                       -- Ej.: límites por plan (opcional)
  Limite_estudiantes INT NULL,
  Fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2) Suscripciones por docente
CREATE TABLE IF NOT EXISTS Suscripcion (
  ID_suscripcion BIGINT AUTO_INCREMENT PRIMARY KEY,
  Usuario_docente_ID INT NOT NULL,
  Plan_ID INT NOT NULL,
  Fecha_inicio DATE NOT NULL,
  Fecha_fin DATE NULL,
  Estado ENUM('ACTIVA','PAUSADA','VENCIDA','CANCELADA') NOT NULL DEFAULT 'ACTIVA',
  Renovacion_automatica TINYINT(1) NOT NULL DEFAULT 1,
  Metodo_pago VARCHAR(30) NULL,                   -- MERCADOPAGO, TARJETA, MANUAL
  Referencia_externa VARCHAR(100) NULL,          -- ID externo del proveedor
  Fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_susc_docente (Usuario_docente_ID),
  INDEX idx_susc_plan (Plan_ID),
  INDEX idx_susc_estado (Estado),
  CONSTRAINT fk_susc_docente FOREIGN KEY (Usuario_docente_ID)
    REFERENCES Usuarios_docente(ID_docente) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_susc_plan FOREIGN KEY (Plan_ID)
    REFERENCES Plan(ID_plan) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 3) Pagos asociados a suscripciones
CREATE TABLE IF NOT EXISTS Pago_suscripcion (
  ID_pago BIGINT AUTO_INCREMENT PRIMARY KEY,
  Suscripcion_ID BIGINT NOT NULL,
  Monto DECIMAL(10,2) NOT NULL,
  Moneda VARCHAR(10) NOT NULL DEFAULT 'ARS',
  Fecha_pago DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Estado ENUM('PENDIENTE','APROBADO','RECHAZADO','REEMBOLSADO') NOT NULL DEFAULT 'APROBADO',
  Proveedor VARCHAR(30) NULL,                     -- MERCADOPAGO, STRIPE, etc.
  Referencia_externa VARCHAR(100) NULL,
  CONSTRAINT fk_pago_susc FOREIGN KEY (Suscripcion_ID)
    REFERENCES Suscripcion(ID_suscripcion) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_pago_estado (Estado)
);

-- 4) Agregar referencia de plan actual al docente (opcional y segura)
SET @db := DATABASE();
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Usuarios_docente' AND COLUMN_NAME = 'Plan_actual_ID'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE Usuarios_docente ADD COLUMN Plan_actual_ID INT NULL AFTER Tipo_usuario, ADD INDEX idx_docente_plan_actual (Plan_actual_ID), ADD CONSTRAINT fk_docente_plan_actual FOREIGN KEY (Plan_actual_ID) REFERENCES Plan(ID_plan) ON UPDATE CASCADE ON DELETE SET NULL;',
  'SELECT 1;'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 5) Vistas útiles
CREATE OR REPLACE VIEW vista_suscripciones_activas AS
SELECT 
  ud.ID_docente,
  CONCAT(ud.Nombre_docente, ' ', ud.Apellido_docente) AS Docente,
  p.Nombre AS Plan,
  s.Estado,
  s.Fecha_inicio,
  s.Fecha_fin,
  s.Renovacion_automatica
FROM Suscripcion s
JOIN Usuarios_docente ud ON ud.ID_docente = s.Usuario_docente_ID
JOIN Plan p ON p.ID_plan = s.Plan_ID
WHERE s.Estado = 'ACTIVA' AND (s.Fecha_fin IS NULL OR s.Fecha_fin >= CURRENT_DATE);

CREATE OR REPLACE VIEW vista_pago_resumen AS
SELECT 
  s.Usuario_docente_ID AS Docente_ID,
  SUM(CASE WHEN ps.Estado = 'APROBADO' THEN ps.Monto ELSE 0 END) AS Total_aprobado,
  SUM(CASE WHEN ps.Estado = 'PENDIENTE' THEN ps.Monto ELSE 0 END) AS Total_pendiente,
  COUNT(*) AS Cantidad_pagos
FROM Suscripcion s
LEFT JOIN Pago_suscripcion ps ON ps.Suscripcion_ID = s.ID_suscripcion
GROUP BY s.Usuario_docente_ID;

-- 6) Datos base de ejemplo (planes)
INSERT INTO Plan (Nombre, Descripcion, Precio_mensual, Activo, Limite_materias, Limite_estudiantes)
VALUES
('ESTANDAR', 'Funciones básicas del sistema', 0.00, 1, 4, 150),
('PREMIUM', 'Funciones avanzadas y sin límites prácticos', 1999.00, 1, NULL, NULL)
ON DUPLICATE KEY UPDATE Descripcion = VALUES(Descripcion), Precio_mensual = VALUES(Precio_mensual), Activo = VALUES(Activo), Limite_materias = VALUES(Limite_materias), Limite_estudiantes = VALUES(Limite_estudiantes);

-- 7) Triggers de cumplimiento de límite de materias por plan
DELIMITER $$
CREATE TRIGGER trg_materia_limite_before_insert
BEFORE INSERT ON Materia
FOR EACH ROW
BEGIN
  DECLARE v_plan_id INT DEFAULT NULL;
  DECLARE v_limite INT DEFAULT NULL;
  DECLARE v_count INT DEFAULT 0;

  SELECT Plan_actual_ID INTO v_plan_id
  FROM Usuarios_docente
  WHERE ID_docente = NEW.Usuarios_docente_ID_docente
  LIMIT 1;

  IF v_plan_id IS NOT NULL THEN
    SELECT Limite_materias INTO v_limite FROM Plan WHERE ID_plan = v_plan_id;
  END IF;

  IF v_limite IS NOT NULL THEN
    SELECT COUNT(*) INTO v_count
    FROM Materia
    WHERE Usuarios_docente_ID_docente = NEW.Usuarios_docente_ID_docente;

    IF v_count >= v_limite THEN
      SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Límite de materias alcanzado para el plan actual';
    END IF;
  END IF;
END $$

CREATE TRIGGER trg_materia_limite_before_update
BEFORE UPDATE ON Materia
FOR EACH ROW
BEGIN
  DECLARE v_plan_id INT DEFAULT NULL;
  DECLARE v_limite INT DEFAULT NULL;
  DECLARE v_count INT DEFAULT 0;

  IF NEW.Usuarios_docente_ID_docente <> OLD.Usuarios_docente_ID_docente THEN
    SELECT Plan_actual_ID INTO v_plan_id
    FROM Usuarios_docente
    WHERE ID_docente = NEW.Usuarios_docente_ID_docente
    LIMIT 1;

    IF v_plan_id IS NOT NULL THEN
      SELECT Limite_materias INTO v_limite FROM Plan WHERE ID_plan = v_plan_id;
    END IF;

    IF v_limite IS NOT NULL THEN
      SELECT COUNT(*) INTO v_count
      FROM Materia
      WHERE Usuarios_docente_ID_docente = NEW.Usuarios_docente_ID_docente;

      IF v_count >= v_limite THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Límite de materias alcanzado para el plan actual (transferencia)';
      END IF;
    END IF;
  END IF;
END $$
DELIMITER ;


