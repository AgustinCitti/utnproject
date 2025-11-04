-- =============================================================
-- Estado del alumno por materia e Intensificación
-- Objetivo: permitir marcar REGULAR / INTENSIFICANDO / RECURSANTE,
--           listar rápidamente a los intensificados, indicar el tema
--           a intensificar y registrar/modificar su nota cuando rinda.
-- Base: esquema en database_proyecto_mysql.sql
-- Motor: MySQL 8+
-- =============================================================

USE edusync;

-- 1) Agregar condición en la relación alumno-materia
--    (no rompe claves: agrega un ENUM con default 'REGULAR')
ALTER TABLE Alumnos_X_Materia
  ADD COLUMN Condicion ENUM('REGULAR','INTENSIFICANDO','RECURSANTE')
    NOT NULL DEFAULT 'REGULAR'
    AFTER Estado,
  ADD INDEX idx_axm_condicion (Condicion);

-- 2) Tabla de Intensificación por tema (uno o varios por materia)
CREATE TABLE IF NOT EXISTS Intensificacion (
  ID_intensificacion BIGINT PRIMARY KEY AUTO_INCREMENT,
  Estudiante_ID_Estudiante INT NOT NULL,
  Materia_ID_materia INT NOT NULL,
  Contenido_ID_contenido INT NULL COMMENT 'Tema a intensificar (si aplica)',
  Estado ENUM('PENDIENTE','EN_CURSO','APROBADO','NO_APROBADO') DEFAULT 'PENDIENTE',
  Nota_objetivo DECIMAL(4,2) NOT NULL DEFAULT 6.00,
  Nota_obtenida DECIMAL(4,2) NULL,
  Fecha_asignacion DATE NOT NULL DEFAULT (CURRENT_DATE),
  Fecha_resolucion DATE NULL,
  Observaciones TEXT,
  UNIQUE KEY uq_intensificacion_unique (Estudiante_ID_Estudiante, Materia_ID_materia, Contenido_ID_contenido),
  INDEX idx_intensificacion_estado (Estado),
  INDEX idx_intensificacion_materia (Materia_ID_materia),
  CONSTRAINT fk_inten_est FOREIGN KEY (Estudiante_ID_Estudiante) REFERENCES Estudiante(ID_Estudiante) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_inten_mat FOREIGN KEY (Materia_ID_materia) REFERENCES Materia(ID_materia) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_inten_cont FOREIGN KEY (Contenido_ID_contenido) REFERENCES Contenido(ID_contenido) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 3) Vista rápida: todos los alumnos intensificando (condición o tabla)
CREATE OR REPLACE VIEW vista_intensificados AS
SELECT 
  axm.Materia_ID_materia,
  m.Nombre AS Materia_Nombre,
  e.ID_Estudiante,
  CONCAT(e.Nombre, ' ', e.Apellido) AS Estudiante,
  COALESCE(i.Contenido_ID_contenido, NULL) AS Contenido_ID_contenido,
  c.Tema AS Tema_a_Intensificar,
  i.Estado AS Estado_Intensificacion,
  i.Nota_objetivo,
  i.Nota_obtenida,
  i.Fecha_asignacion,
  i.Fecha_resolucion,
  axm.Condicion
FROM Alumnos_X_Materia axm
JOIN Estudiante e ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
JOIN Materia m ON m.ID_materia = axm.Materia_ID_materia
LEFT JOIN Intensificacion i 
  ON i.Estudiante_ID_Estudiante = axm.Estudiante_ID_Estudiante
 AND i.Materia_ID_materia = axm.Materia_ID_materia
LEFT JOIN Contenido c ON c.ID_contenido = i.Contenido_ID_contenido
WHERE axm.Condicion = 'INTENSIFICANDO' OR i.ID_intensificacion IS NOT NULL;

-- 4) Procedimiento: registrar/modificar nota de intensificación
--    - Actualiza Intensificacion (nota y estado)
--    - Opcionalmente crea/actualiza una nota en Notas como RECUPERATORIO
DELIMITER $$
CREATE PROCEDURE registrar_nota_intensificacion (
  IN p_estudiante_id INT,
  IN p_materia_id INT,
  IN p_contenido_id INT,
  IN p_nota DECIMAL(4,2),
  IN p_observacion TEXT
)
BEGIN
  DECLARE v_id BIGINT DEFAULT NULL;

  -- Obtener/crear registro de intensificación
  SELECT ID_intensificacion INTO v_id
  FROM Intensificacion
  WHERE Estudiante_ID_Estudiante = p_estudiante_id
    AND Materia_ID_materia = p_materia_id
    AND ((p_contenido_id IS NULL AND Contenido_ID_contenido IS NULL) OR Contenido_ID_contenido = p_contenido_id)
  LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO Intensificacion (Estudiante_ID_Estudiante, Materia_ID_materia, Contenido_ID_contenido, Estado)
    VALUES (p_estudiante_id, p_materia_id, p_contenido_id, 'EN_CURSO');
    SET v_id = LAST_INSERT_ID();
  END IF;

  -- Actualizar nota y estado según calificación
  UPDATE Intensificacion
     SET Nota_obtenida = p_nota,
         Estado = CASE WHEN p_nota >= 6 THEN 'APROBADO' ELSE 'NO_APROBADO' END,
         Fecha_resolucion = CURRENT_DATE,
         Observaciones = CONCAT(IFNULL(Observaciones, ''),
                                CASE WHEN LENGTH(IFNULL(Observaciones,''))>0 THEN ' | ' ELSE '' END,
                                'Rendida: ', DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d'), ' (', p_nota, ') ', IFNULL(p_observacion,''))
   WHERE ID_intensificacion = v_id;

  -- Asegurar condición acorde
  UPDATE Alumnos_X_Materia
     SET Condicion = CASE WHEN p_nota >= 6 THEN 'REGULAR' ELSE 'INTENSIFICANDO' END
   WHERE Estudiante_ID_Estudiante = p_estudiante_id
     AND Materia_ID_materia = p_materia_id;
END$$
DELIMITER ;

-- 5) Vista de tablero por materia: resumen de intensificados
CREATE OR REPLACE VIEW vista_resumen_intensificacion_materia AS
SELECT 
  m.ID_materia,
  m.Nombre AS Materia_Nombre,
  COUNT(DISTINCT CASE WHEN axm.Condicion = 'INTENSIFICANDO' THEN axm.Estudiante_ID_Estudiante END) AS Total_Intensificando,
  COUNT(DISTINCT CASE WHEN i.Estado = 'PENDIENTE' THEN i.ID_intensificacion END) AS Pendientes,
  COUNT(DISTINCT CASE WHEN i.Estado = 'EN_CURSO' THEN i.ID_intensificacion END) AS En_Curso,
  COUNT(DISTINCT CASE WHEN i.Estado = 'APROBADO' THEN i.ID_intensificacion END) AS Aprobados,
  COUNT(DISTINCT CASE WHEN i.Estado = 'NO_APROBADO' THEN i.ID_intensificacion END) AS No_Aprobados
FROM Materia m
LEFT JOIN Alumnos_X_Materia axm ON axm.Materia_ID_materia = m.ID_materia
LEFT JOIN Intensificacion i ON i.Materia_ID_materia = m.ID_materia
GROUP BY m.ID_materia, m.Nombre;

-- 6) Helper: asignar tema a intensificar rápidamente
DELIMITER $$
CREATE PROCEDURE asignar_intensificacion (
  IN p_estudiante_id INT,
  IN p_materia_id INT,
  IN p_contenido_id INT,
  IN p_nota_objetivo DECIMAL(4,2)
)
BEGIN
  INSERT INTO Intensificacion (Estudiante_ID_Estudiante, Materia_ID_materia, Contenido_ID_contenido, Estado, Nota_objetivo)
  VALUES (p_estudiante_id, p_materia_id, p_contenido_id, 'PENDIENTE', p_nota_objetivo)
  ON DUPLICATE KEY UPDATE 
    Estado = 'PENDIENTE',
    Nota_objetivo = VALUES(Nota_objetivo),
    Fecha_asignacion = CURRENT_DATE;

  UPDATE Alumnos_X_Materia
     SET Condicion = 'INTENSIFICANDO'
   WHERE Estudiante_ID_Estudiante = p_estudiante_id
     AND Materia_ID_materia = p_materia_id;
END$$
DELIMITER ;

-- =============================================================
-- Notas:
-- - La vista vista_intensificados lista TODOS los alumnos en intensificación
--   y muestra el tema a intensificar si fue cargado.
-- - Usar asignar_intensificacion() para marcar tema y condición rápidamente.
-- - Usar registrar_nota_intensificacion() para cargar/modificar la nota al rendir.
-- =============================================================


