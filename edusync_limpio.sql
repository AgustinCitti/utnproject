-- Instalador mínimo: esquema limpio principal

-- =============================================================
-- Esquema de calificaciones por cuatrimestre con promedio automático
-- Proyecto: utnproject
-- Objetivo: permitir promedio automático del primer avance y nota final
--           con posibilidad de anulación manual por el docente.
-- Dependencias: tablas Estudiante, Materia, Evaluacion, Notas existentes
-- Motor: MySQL 8+
-- =============================================================

USE edusync;

-- 1) Metadatos en Evaluacion (ver grades_schema.sql para versión completa)
--    Alternativa: usar tabla puente Evaluacion_meta si no desea alterar Evaluacion
--    -- ALTER TABLE Evaluacion
--    --   ADD COLUMN periodo_cuatrimestre TINYINT NULL,
--    --   ADD COLUMN etapa_calculo ENUM('AVANCE','FINAL') NULL,
--    --   ADD COLUMN ponderacion DECIMAL(6,2) NOT NULL DEFAULT 1.00;

-- 2) Tabla de control por estudiante/materia/cuatrimestre
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

-- 3) Agregar condición en la relación alumno-materia
ALTER TABLE Alumnos_X_Materia
  ADD COLUMN Condicion ENUM('REGULAR','INTENSIFICANDO','RECURSANTE')
    NOT NULL DEFAULT 'REGULAR'
    AFTER Estado,
  ADD INDEX idx_axm_condicion (Condicion);

SOURCE database/edusync_limpio.sql;
