-- =============================================================
-- Esquema de calificaciones por cuatrimestre con promedio automático
-- Proyecto: utnproject
-- Objetivo: permitir promedio automático del primer avance y nota final
--           con posibilidad de anulación manual por el docente.
-- Dependencias: tablas Estudiante, Materia, Evaluacion, Notas existentes
-- Motor: MySQL 8+
-- =============================================================

-- 1) Metadatos mínimos en evaluaciones para identificar periodo/etapa
--    Si ya existen, estos ALTERs serán ignorados con IF NOT EXISTS lógicos
--    (MySQL no soporta IF NOT EXISTS en ALTER para columnas; usar try/catch en deploy)
--    Columnas agregadas:
--      - periodo_cuatrimestre: 1 (primer), 2 (segundo)
--      - etapa_calculo: 'AVANCE' | 'FINAL' (qué promedio integra)
--      - ponderacion: peso relativo en el promedio (default 1)
-- Nota: si no desea alterar su tabla actual, puede crear una tabla puente
--       Evaluacion_meta con estas columnas. Aquí optamos por ALTER directo.

-- ALTER condicional: agrega columnas solo si no existen
SET @db := DATABASE();

-- periodo_cuatrimestre
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Evaluacion' AND COLUMN_NAME = 'periodo_cuatrimestre'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE Evaluacion ADD COLUMN periodo_cuatrimestre TINYINT NULL;',
  'SELECT 1;'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- etapa_calculo
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Evaluacion' AND COLUMN_NAME = 'etapa_calculo'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE Evaluacion ADD COLUMN etapa_calculo ENUM("AVANCE","FINAL") NULL;',
  'SELECT 1;'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- ponderacion
SET @exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'Evaluacion' AND COLUMN_NAME = 'ponderacion'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE Evaluacion ADD COLUMN ponderacion DECIMAL(6,2) NOT NULL DEFAULT 1.00;',
  'SELECT 1;'
);
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- 2) Tabla de control por estudiante/materia/cuatrimestre
--    El docente puede decidir usar el promedio automático o una nota manual
--    tanto para el avance como para la final del cuatrimestre.

CREATE TABLE IF NOT EXISTS Calificaciones_cuatrimestre (
  ID_calificacion BIGINT PRIMARY KEY AUTO_INCREMENT,
  Estudiante_ID_Estudiante BIGINT NOT NULL,
  Materia_ID_materia BIGINT NOT NULL,
  cuatrimestre TINYINT NOT NULL COMMENT '1 = Primer, 2 = Segundo',
  usar_auto_avance TINYINT(1) NOT NULL DEFAULT 1,
  nota_manual_avance DECIMAL(5,2) NULL,
  usar_auto_final TINYINT(1) NOT NULL DEFAULT 1,
  nota_manual_final DECIMAL(5,2) NULL,
  fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_calif_cm (Estudiante_ID_Estudiante, Materia_ID_materia, cuatrimestre),
  CONSTRAINT fk_calif_est FOREIGN KEY (Estudiante_ID_Estudiante) REFERENCES Estudiante(ID_Estudiante),
  CONSTRAINT fk_calif_mat FOREIGN KEY (Materia_ID_materia) REFERENCES Materia(ID_materia)
);

-- 3) Función para calcular promedio ponderado por estudiante/materia/cuatrimestre/etapa
--    Usa la tabla Notas unida a Evaluacion, considerando sólo las
--    evaluaciones marcadas para ese cuatrimestre y etapa.

DROP FUNCTION IF EXISTS fn_promedio_cuatrimestre;
DELIMITER $$
CREATE FUNCTION fn_promedio_cuatrimestre(
  p_estudiante_id BIGINT,
  p_materia_id BIGINT,
  p_cuatrimestre TINYINT,
  p_etapa ENUM('AVANCE','FINAL')
) RETURNS DECIMAL(6,2)
DETERMINISTIC
READS SQL DATA
BEGIN
  DECLARE v_total_peso DECIMAL(14,4) DEFAULT 0.0;
  DECLARE v_sumatoria DECIMAL(14,4) DEFAULT 0.0;
  DECLARE v_promedio DECIMAL(6,2);

  -- Sumatoria ponderada de calificaciones
  SELECT IFNULL(SUM(n.Calificacion * IFNULL(e.ponderacion, 1.0)), 0.0),
         IFNULL(SUM(IFNULL(e.ponderacion, 1.0)), 0.0)
    INTO v_sumatoria, v_total_peso
  FROM Notas n
  INNER JOIN Evaluacion e ON e.ID_evaluacion = n.Evaluacion_ID_evaluacion
  WHERE n.Estudiante_ID_Estudiante = p_estudiante_id
    AND e.Materia_ID_materia = p_materia_id
    AND e.periodo_cuatrimestre = p_cuatrimestre
    AND e.etapa_calculo = p_etapa;

  IF v_total_peso <= 0 THEN
    SET v_promedio = NULL; -- sin datos
  ELSE
    SET v_promedio = ROUND(v_sumatoria / v_total_peso, 2);
  END IF;

  RETURN v_promedio;
END$$
DELIMITER ;

-- 4) Vista que expone los promedios automáticos por cada control creado

CREATE OR REPLACE VIEW vw_promedios_cuatrimestre AS
SELECT
  c.ID_calificacion,
  c.Estudiante_ID_Estudiante,
  c.Materia_ID_materia,
  c.cuatrimestre,
  fn_promedio_cuatrimestre(c.Estudiante_ID_Estudiante, c.Materia_ID_materia, c.cuatrimestre, 'AVANCE') AS promedio_auto_avance,
  fn_promedio_cuatrimestre(c.Estudiante_ID_Estudiante, c.Materia_ID_materia, c.cuatrimestre, 'FINAL')  AS promedio_auto_final
FROM Calificaciones_cuatrimestre c;

-- 5) Vista resolutiva: decide si usar automático o manual según flags

-- 5.a) Función de cierre: etiqueta TED/TEP/TEA según nota
DROP FUNCTION IF EXISTS fn_cierre_etiqueta;
DELIMITER $$
CREATE FUNCTION fn_cierre_etiqueta(p_nota DECIMAL(6,2))
RETURNS VARCHAR(3)
DETERMINISTIC
BEGIN
  IF p_nota IS NULL THEN
    RETURN NULL;
  ELSEIF p_nota BETWEEN 1 AND 3 THEN
    RETURN 'TED';
  ELSEIF p_nota BETWEEN 4 AND 6 THEN
    RETURN 'TEP';
  ELSEIF p_nota BETWEEN 7 AND 10 THEN
    RETURN 'TEA';
  ELSE
    RETURN NULL;
  END IF;
END$$
DELIMITER ;

CREATE OR REPLACE VIEW vw_calificaciones_resueltas AS
SELECT
  c.ID_calificacion,
  c.Estudiante_ID_Estudiante,
  c.Materia_ID_materia,
  c.cuatrimestre,
  CASE WHEN c.usar_auto_avance = 1 THEN p.promedio_auto_avance ELSE c.nota_manual_avance END AS nota_avance_resuelta,
  CASE WHEN c.usar_auto_final  = 1 THEN p.promedio_auto_final  ELSE c.nota_manual_final  END AS nota_final_resuelta,
  fn_cierre_etiqueta(CASE WHEN c.usar_auto_avance = 1 THEN p.promedio_auto_avance ELSE c.nota_manual_avance END) AS cierre_avance,
  fn_cierre_etiqueta(CASE WHEN c.usar_auto_final  = 1 THEN p.promedio_auto_final  ELSE c.nota_manual_final  END) AS cierre_final,
  c.usar_auto_avance,
  c.usar_auto_final,
  p.promedio_auto_avance,
  p.promedio_auto_final,
  c.nota_manual_avance,
  c.nota_manual_final,
  c.fecha_actualizacion
FROM Calificaciones_cuatrimestre c
LEFT JOIN vw_promedios_cuatrimestre p ON p.ID_calificacion = c.ID_calificacion;

-- 6) Validaciones simples con CHECK (MySQL 8.0.16+ respeta CHECK)

ALTER TABLE Calificaciones_cuatrimestre
  ADD CONSTRAINT chk_cm_cuatrimestre CHECK (cuatrimestre IN (1,2)),
  ADD CONSTRAINT chk_cm_nota_man_ava CHECK (nota_manual_avance IS NULL OR (nota_manual_avance BETWEEN 1 AND 10)),
  ADD CONSTRAINT chk_cm_nota_man_fin CHECK (nota_manual_final  IS NULL OR (nota_manual_final  BETWEEN 1 AND 10));

-- =============================================================
-- Uso típico
-- 1) En cada cursada, crear registros de control por estudiante/materia/cuatrimestre:
--    INSERT INTO Calificaciones_cuatrimestre(Estudiante_ID_Estudiante, Materia_ID_materia, cuatrimestre)
--    VALUES (?,?,1), (?,?,2);
-- 2) Cargar Notas vinculadas a Evaluaciones que tengan periodo_cuatrimestre y etapa_calculo.
-- 3) Consultar:
--    SELECT * FROM vw_calificaciones_resueltas WHERE Materia_ID_materia = ? AND cuatrimestre = 1;
-- 4) Para anular el cálculo automático y fijar una nota manual del avance:
--    UPDATE Calificaciones_cuatrimestre
--      SET usar_auto_avance = 0, nota_manual_avance = 7.5
--    WHERE Estudiante_ID_Estudiante = ? AND Materia_ID_materia = ? AND cuatrimestre = 1;
-- =============================================================


