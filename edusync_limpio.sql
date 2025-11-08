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

<<<<<<< Updated upstream
SOURCE database/edusync_limpio.sql;
=======
-- =====================================================
-- 3. TABLA: Materia (Materias/Asignaturas)
-- =====================================================
CREATE TABLE Materia (
    ID_materia INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Curso_division VARCHAR(50) NOT NULL,
    Descripcion TEXT,
    Horario VARCHAR(100),
    Aula VARCHAR(50),
    Usuarios_docente_ID_docente INT NOT NULL,
    Fecha_creacion DATE DEFAULT (CURRENT_DATE),
    Estado ENUM('ACTIVA', 'INACTIVA', 'FINALIZADA') DEFAULT 'ACTIVA',
    INDEX idx_docente_materia (Usuarios_docente_ID_docente),
    INDEX idx_nombre_materia (Nombre),
    INDEX idx_estado_materia (Estado),
    CONSTRAINT fk_materia_docente FOREIGN KEY (Usuarios_docente_ID_docente) 
        REFERENCES Usuarios_docente(ID_docente) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TABLA: Alumnos_X_Materia (Relación Muchos a Muchos)
-- =====================================================
CREATE TABLE Alumnos_X_Materia (
    ID INT AUTO_INCREMENT,
    Materia_ID_materia INT NOT NULL,
    Estudiante_ID_Estudiante INT NOT NULL,
    Fecha_inscripcion DATE DEFAULT (CURRENT_DATE),
    Estado ENUM('INSCRITO', 'CURSANDO', 'APROBADO', 'DESAPROBADO', 'AUSENTE') DEFAULT 'INSCRITO',
    PRIMARY KEY (Materia_ID_materia, Estudiante_ID_Estudiante),
    UNIQUE KEY unique_id (ID),
    INDEX idx_estudiante_materia (Estudiante_ID_Estudiante),
    INDEX idx_fecha_inscripcion (Fecha_inscripcion),
    CONSTRAINT fk_alumnos_materia_materia FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_alumnos_materia_estudiante FOREIGN KEY (Estudiante_ID_Estudiante) 
        REFERENCES Estudiante(ID_Estudiante) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. TABLA: Contenido (Contenido de Materias)
-- =====================================================
CREATE TABLE Contenido (
    ID_contenido INT AUTO_INCREMENT PRIMARY KEY,
    Tema VARCHAR(150) NOT NULL,
    Descripcion TEXT,
    Estado ENUM('PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO') DEFAULT 'PENDIENTE',
    Fecha_creacion DATE DEFAULT (CURRENT_DATE),
    Fecha_actualizacion DATE,
    Materia_ID_materia INT NOT NULL,
    INDEX idx_materia_contenido (Materia_ID_materia),
    INDEX idx_estado_contenido (Estado),
    INDEX idx_tema_contenido (Tema),
    CONSTRAINT fk_contenido_materia FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. TABLA: Tema_estudiante (Temas por Estudiante)
-- =====================================================
CREATE TABLE Tema_estudiante (
    ID_Tema_estudiante INT AUTO_INCREMENT PRIMARY KEY,
    Estado ENUM('PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO') DEFAULT 'PENDIENTE',
    Fecha_actualizacion DATE DEFAULT (CURRENT_DATE),
    Observaciones TEXT,
    Contenido_ID_contenido INT NOT NULL,
    Estudiante_ID_Estudiante INT NOT NULL,
    INDEX idx_contenido_tema (Contenido_ID_contenido),
    INDEX idx_estudiante_tema (Estudiante_ID_Estudiante),
    INDEX idx_estado_tema (Estado),
    CONSTRAINT fk_tema_estudiante_contenido FOREIGN KEY (Contenido_ID_contenido) 
        REFERENCES Contenido(ID_contenido) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tema_estudiante_estudiante FOREIGN KEY (Estudiante_ID_Estudiante) 
        REFERENCES Estudiante(ID_Estudiante) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. TABLA: Asistencia (Control de Asistencia)
-- =====================================================
CREATE TABLE Asistencia (
    ID_Asistencia INT AUTO_INCREMENT PRIMARY KEY,
    Fecha DATE NOT NULL,
    Presente ENUM('P', 'A', 'J') NOT NULL COMMENT 'P=Presente, A=Ausente, J=Justificado',
    Observaciones TEXT,
    Materia_ID_materia INT NOT NULL,
    Estudiante_ID_Estudiante INT NOT NULL,
    Fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fecha_asistencia (Fecha),
    INDEX idx_estudiante_asistencia (Estudiante_ID_Estudiante),
    INDEX idx_materia_asistencia (Materia_ID_materia),
    INDEX idx_presente_asistencia (Presente),
    CONSTRAINT fk_asistencia_materia FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_asistencia_estudiante FOREIGN KEY (Estudiante_ID_Estudiante) 
        REFERENCES Estudiante(ID_Estudiante) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. TABLA: Evaluacion (Evaluaciones/Exámenes)
-- =====================================================
CREATE TABLE Evaluacion (
    ID_evaluacion INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(100) NOT NULL,
    Descripcion TEXT,
    Fecha DATE NOT NULL,
    Tipo ENUM('EXAMEN', 'PARCIAL', 'TRABAJO_PRACTICO', 'PROYECTO', 'ORAL', 'PRACTICO') NOT NULL,
    Peso DECIMAL(3,2) DEFAULT 1.00,
    Materia_ID_materia INT NOT NULL,
    Fecha_creacion DATE DEFAULT (CURRENT_DATE),
    Estado ENUM('PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA') DEFAULT 'PROGRAMADA',
    INDEX idx_materia_evaluacion (Materia_ID_materia),
    INDEX idx_fecha_evaluacion (Fecha),
    INDEX idx_tipo_evaluacion (Tipo),
    INDEX idx_estado_evaluacion (Estado),
    CONSTRAINT fk_evaluacion_materia FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. TABLA: Notas (Calificaciones)
-- =====================================================
CREATE TABLE Notas (
    ID_Nota INT AUTO_INCREMENT PRIMARY KEY,
    Calificacion DECIMAL(4,2) NOT NULL,
    Observacion TEXT,
    Fecha_calificacion DATE DEFAULT (CURRENT_DATE),
    Fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Evaluacion_ID_evaluacion INT NOT NULL,
    Estudiante_ID_Estudiante INT NOT NULL,
    Estado ENUM('TENTATIVA', 'DEFINITIVA', 'RECUPERATORIO') DEFAULT 'DEFINITIVA',
    Peso DECIMAL(3,2) DEFAULT 1.00,
    INDEX idx_estudiante_notas (Estudiante_ID_Estudiante),
    INDEX idx_evaluacion_notas (Evaluacion_ID_evaluacion),
    INDEX idx_calificacion_notas (Calificacion),
    INDEX idx_fecha_calificacion (Fecha_calificacion),
    INDEX idx_estado_notas (Estado),
    INDEX idx_estudiante_evaluacion (Estudiante_ID_Estudiante, Evaluacion_ID_evaluacion),
    UNIQUE KEY unique_estudiante_evaluacion (Estudiante_ID_Estudiante, Evaluacion_ID_evaluacion),
    CONSTRAINT fk_notas_evaluacion FOREIGN KEY (Evaluacion_ID_evaluacion) 
        REFERENCES Evaluacion(ID_evaluacion) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notas_estudiante FOREIGN KEY (Estudiante_ID_Estudiante) 
        REFERENCES Estudiante(ID_Estudiante) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. TABLA: Archivos (Archivos de Materias)
-- =====================================================
CREATE TABLE Archivos (
    ID_archivos INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Ruta VARCHAR(255) NOT NULL,
    Tipo VARCHAR(50) NOT NULL,
    Tamaño INT,
    Materia_ID_materia INT NOT NULL,
    Fecha_subida DATE DEFAULT (CURRENT_DATE),
    Descripcion TEXT,
    INDEX idx_materia_archivos (Materia_ID_materia),
    INDEX idx_tipo_archivos (Tipo),
    INDEX idx_fecha_subida (Fecha_subida),
    CONSTRAINT fk_archivos_materia FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. TABLA: Recordatorio (Recordatorios)
-- =====================================================
CREATE TABLE Recordatorio (
    ID_recordatorio INT AUTO_INCREMENT PRIMARY KEY,
    Descripcion TEXT NOT NULL,
    Fecha DATE NOT NULL,
    Tipo ENUM('EXAMEN', 'ENTREGA', 'REUNION', 'CLASE', 'EVENTO') NOT NULL,
    Prioridad ENUM('ALTA', 'MEDIA', 'BAJA') DEFAULT 'MEDIA',
    Materia_ID_materia INT NOT NULL,
    Fecha_creacion DATE DEFAULT (CURRENT_DATE),
    Estado ENUM('PENDIENTE', 'COMPLETADO', 'CANCELADO') DEFAULT 'PENDIENTE',
    INDEX idx_materia_recordatorio (Materia_ID_materia),
    INDEX idx_fecha_recordatorio (Fecha),
    INDEX idx_tipo_recordatorio (Tipo),
    INDEX idx_prioridad_recordatorio (Prioridad),
    CONSTRAINT fk_recordatorio_materia FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 12. TABLA: Notificaciones (Sistema de Notificaciones)
-- =====================================================
CREATE TABLE Notificaciones (
    ID_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(200) NOT NULL,
    Mensaje TEXT NOT NULL,
    Tipo ENUM('INFO', 'WARNING', 'ERROR', 'SUCCESS') NOT NULL,
    Destinatario_tipo ENUM('DOCENTE', 'ESTUDIANTE', 'TODOS') NOT NULL,
    Destinatario_id INT,
    Fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Fecha_leida TIMESTAMP NULL,
    Estado ENUM('NO_LEIDA', 'LEIDA', 'ARCHIVADA') DEFAULT 'NO_LEIDA',
    INDEX idx_destinatario (Destinatario_tipo, Destinatario_id),
    INDEX idx_fecha_creacion (Fecha_creacion),
    INDEX idx_estado_notificacion (Estado),
    INDEX idx_tipo_notificacion (Tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 13. TABLA: Configuracion (Configuración del Sistema)
-- =====================================================
CREATE TABLE Configuracion (
    ID_configuracion INT AUTO_INCREMENT PRIMARY KEY,
    Clave VARCHAR(100) UNIQUE NOT NULL,
    Valor TEXT,
    Descripcion TEXT,
    Tipo ENUM('STRING', 'INTEGER', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
    Fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Insertar docentes de ejemplo
INSERT INTO Usuarios_docente (
    Nombre_docente, 
    Apellido_docente, 
    Email_docente, 
    Contraseña, 
    DNI, 
    Telefono, 
    Especialidad, 
    Titulo_academico, 
    Tipo_usuario,
    Configuracion
) 
VALUES 
('María', 'González', 'maria.gonzalez@utn.edu.ar', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '12345678', '+54 11 1234-5678', 'Matemática Aplicada', 'Ingeniera en Sistemas', 'PROFESOR', '{"tema": "claro", "notificaciones": true}'),
('Carlos', 'Rodríguez', 'carlos.rodriguez@utn.edu.ar', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '23456789', '+54 11 2345-6789', 'Física', 'Doctor en Física', 'PROFESOR_ADJUNTO', '{"tema": "oscuro", "notificaciones": true}'),
('Ana', 'Martínez', 'ana.martinez@utn.edu.ar', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '34567890', '+54 11 3456-7890', 'Programación', 'Ingeniera en Informática', 'COORDINADOR', '{"tema": "claro", "notificaciones": false}'),
('Roberto', 'Silva', 'roberto.silva@utn.edu.ar', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '45678901', '+54 11 4567-8901', 'Inglés Técnico', 'Profesor de Inglés', 'PROFESOR', '{"tema": "claro", "notificaciones": true}');

-- Insertar estudiantes de ejemplo
INSERT INTO Estudiante (Apellido, Nombre, Email, Fecha_nacimiento) 
VALUES 
('Pérez', 'Juan', 'juan.perez@estudiante.utn.edu.ar', '2000-05-15'),
('López', 'Ana', 'ana.lopez@estudiante.utn.edu.ar', '1999-08-22'),
('García', 'Carlos', 'carlos.garcia@estudiante.utn.edu.ar', '2001-03-10'),
('Fernández', 'María', 'maria.fernandez@estudiante.utn.edu.ar', '2000-11-05');

-- Insertar materias de ejemplo
INSERT INTO Materia (Nombre, Curso_division, Descripcion, Usuarios_docente_ID_docente) 
VALUES 
('Matemática I', '1er Año - División A', 'Álgebra y Geometría Analítica', 1),
('Física I', '1er Año - División A', 'Mecánica Clásica', 2),
('Programación I', '1er Año - División A', 'Fundamentos de Programación', 3),
('Inglés Técnico', '1er Año - División A', 'Inglés para Ingeniería', 4);

-- Insertar relación estudiantes-materias
INSERT INTO Alumnos_X_Materia (Materia_ID_materia, Estudiante_ID_Estudiante) 
VALUES 
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 1), (2, 2), (2, 3),
(3, 1), (3, 2), (3, 4),
(4, 1), (4, 3), (4, 4);

-- Insertar contenido de ejemplo
INSERT INTO Contenido (Tema, Descripcion, Materia_ID_materia) 
VALUES 
('Números Reales', 'Operaciones con números reales y propiedades', 1),
('Funciones Lineales', 'Definición y gráficas de funciones lineales', 1),
('Cinemática', 'Movimiento rectilíneo uniforme y variado', 2),
('Variables y Tipos de Datos', 'Conceptos básicos de programación', 3);

-- Insertar evaluaciones de ejemplo
INSERT INTO Evaluacion (Titulo, Descripcion, Fecha, Tipo, Materia_ID_materia) 
VALUES 
('Parcial 1 - Números Reales', 'Evaluación sobre operaciones con números reales', '2024-04-15', 'PARCIAL', 1),
('Examen Final - Funciones', 'Examen final de funciones lineales', '2024-06-20', 'EXAMEN', 1),
('Parcial 1 - Cinemática', 'Evaluación de cinemática básica', '2024-04-20', 'PARCIAL', 2),
('TP1 - Programación Básica', 'Trabajo práctico sobre variables y tipos', '2024-05-10', 'TRABAJO_PRACTICO', 3);

-- Insertar notas de ejemplo
INSERT INTO Notas (Calificacion, Evaluacion_ID_evaluacion, Estudiante_ID_Estudiante, Estado, Peso, Observacion) 
VALUES 
(8.5, 1, 1, 'DEFINITIVA', 1.00, 'Excelente rendimiento'),
(7.0, 1, 2, 'DEFINITIVA', 1.00, 'Buen trabajo'),
(9.0, 1, 3, 'DEFINITIVA', 1.00, 'Sobresaliente'),
(6.5, 1, 4, 'DEFINITIVA', 1.00, 'Aprobado'),
(8.0, 2, 1, 'DEFINITIVA', 1.00, 'Muy bien'),
(7.5, 2, 2, 'DEFINITIVA', 1.00, 'Buen resultado'),
(9.5, 2, 3, 'DEFINITIVA', 1.00, 'Excelente'),
(7.0, 2, 4, 'DEFINITIVA', 1.00, 'Aprobado'),
(7.5, 3, 1, 'DEFINITIVA', 1.00, 'Bien'),
(8.0, 3, 2, 'DEFINITIVA', 1.00, 'Muy bien'),
(8.5, 3, 3, 'DEFINITIVA', 1.00, 'Excelente'),
(9.0, 4, 1, 'DEFINITIVA', 1.00, 'Sobresaliente'),
(8.5, 4, 2, 'DEFINITIVA', 1.00, 'Muy bien'),
(9.5, 4, 4, 'DEFINITIVA', 1.00, 'Excelente trabajo');

-- Insertar asistencia de ejemplo
INSERT INTO Asistencia (Fecha, Presente, Materia_ID_materia, Estudiante_ID_Estudiante) 
VALUES 
('2024-03-15', 'P', 1, 1), ('2024-03-15', 'P', 1, 2), ('2024-03-15', 'A', 1, 3), ('2024-03-15', 'P', 1, 4),
('2024-03-18', 'P', 1, 1), ('2024-03-18', 'J', 1, 2), ('2024-03-18', 'P', 1, 3), ('2024-03-18', 'P', 1, 4),
('2024-03-20', 'P', 2, 1), ('2024-03-20', 'P', 2, 2), ('2024-03-20', 'P', 2, 3);

-- Insertar recordatorios de ejemplo
INSERT INTO Recordatorio (Descripcion, Fecha, Tipo, Prioridad, Materia_ID_materia) 
VALUES 
('Recordar traer calculadora para el examen', '2024-04-14', 'EXAMEN', 'ALTA', 1),
('Entrega del TP1 de Programación', '2024-05-10', 'ENTREGA', 'ALTA', 3),
('Reunión de coordinación de materias', '2024-04-25', 'REUNION', 'MEDIA', 1);

-- Insertar configuración del sistema
INSERT INTO Configuracion (Clave, Valor, Descripcion, Tipo) 
VALUES 
('sistema_nombre', 'EduSync', 'Nombre del sistema', 'STRING'),
('sistema_version', '1.0.0', 'Versión del sistema', 'STRING'),
('calificacion_aprobacion', '6.0', 'Calificación mínima para aprobar', 'INTEGER'),
('asistencia_minima', '75', 'Porcentaje mínimo de asistencia requerido', 'INTEGER'),
('notificaciones_activas', 'true', 'Sistema de notificaciones activo', 'BOOLEAN');

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para información completa de estudiantes
CREATE VIEW vista_estudiantes_completa AS
SELECT 
    e.ID_Estudiante,
    CONCAT(e.Nombre, ' ', e.Apellido) as Nombre_Completo,
    e.Nombre,
    e.Apellido,
    e.Email,
    e.Fecha_nacimiento,
    e.Fecha_inscripcion,
    e.Estado,
    TIMESTAMPDIFF(YEAR, e.Fecha_nacimiento, CURDATE()) as Edad,
    COUNT(DISTINCT axm.Materia_ID_materia) as Cantidad_Materias,
    COUNT(DISTINCT n.ID_Nota) as Total_Calificaciones,
    AVG(n.Calificacion) as Promedio_General,
    COUNT(CASE WHEN n.Calificacion >= 6 THEN 1 END) as Calificaciones_Aprobadas,
    COUNT(CASE WHEN n.Calificacion < 6 THEN 1 END) as Calificaciones_Desaprobadas,
    COUNT(CASE WHEN a.Presente = 'P' THEN 1 END) as Total_Presentes,
    COUNT(CASE WHEN a.Presente = 'A' THEN 1 END) as Total_Ausentes,
    COUNT(CASE WHEN a.Presente = 'J' THEN 1 END) as Total_Justificadas,
    ROUND((COUNT(CASE WHEN a.Presente = 'P' THEN 1 END) / 
           NULLIF(COUNT(a.ID_Asistencia), 0)) * 100, 2) as Porcentaje_Asistencia,
    CASE 
        WHEN AVG(n.Calificacion) >= 8 THEN 'EXCELENTE'
        WHEN AVG(n.Calificacion) >= 6 THEN 'BUENO'
        WHEN AVG(n.Calificacion) >= 4 THEN 'REGULAR'
        ELSE 'DEFICIENTE'
    END as Rendimiento_Academico,
    CASE 
        WHEN ROUND((COUNT(CASE WHEN a.Presente = 'P' THEN 1 END) / 
                   NULLIF(COUNT(a.ID_Asistencia), 0)) * 100, 2) >= 90 THEN 'EXCELENTE'
        WHEN ROUND((COUNT(CASE WHEN a.Presente = 'P' THEN 1 END) / 
                   NULLIF(COUNT(a.ID_Asistencia), 0)) * 100, 2) >= 75 THEN 'BUENO'
        WHEN ROUND((COUNT(CASE WHEN a.Presente = 'P' THEN 1 END) / 
                   NULLIF(COUNT(a.ID_Asistencia), 0)) * 100, 2) >= 60 THEN 'REGULAR'
        ELSE 'DEFICIENTE'
    END as Rendimiento_Asistencia
FROM Estudiante e
LEFT JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
LEFT JOIN Notas n ON e.ID_Estudiante = n.Estudiante_ID_Estudiante AND n.Estado = 'DEFINITIVA'
LEFT JOIN Asistencia a ON e.ID_Estudiante = a.Estudiante_ID_Estudiante
GROUP BY e.ID_Estudiante, e.Nombre, e.Apellido, e.Email, e.Fecha_nacimiento, e.Fecha_inscripcion, e.Estado;

-- Vista para información de materias con docente
CREATE VIEW vista_materias_docente AS
SELECT 
    m.ID_materia,
    m.Nombre as Materia_Nombre,
    m.Curso_division,
    m.Descripcion,
    m.Horario,
    m.Aula,
    ud.Nombre_docente,
    ud.Apellido_docente,
    ud.Email_docente,
    COUNT(axm.Estudiante_ID_Estudiante) as Cantidad_Estudiantes
FROM Materia m
JOIN Usuarios_docente ud ON m.Usuarios_docente_ID_docente = ud.ID_docente
LEFT JOIN Alumnos_X_Materia axm ON m.ID_materia = axm.Materia_ID_materia
GROUP BY m.ID_materia, m.Nombre, m.Curso_division, m.Descripcion, m.Horario, m.Aula, 
         ud.Nombre_docente, ud.Apellido_docente, ud.Email_docente;

-- Vista para calificaciones con información completa
CREATE VIEW vista_calificaciones_completa AS
SELECT 
    n.ID_Nota,
    CONCAT(e.Nombre, ' ', e.Apellido) as Estudiante_Nombre,
    ev.Titulo as Evaluacion_Titulo,
    ev.Tipo as Evaluacion_Tipo,
    ev.Fecha as Fecha_Evaluacion,
    n.Calificacion,
    n.Observacion,
    m.Nombre as Materia_Nombre,
    n.Fecha_calificacion
FROM Notas n
JOIN Estudiante e ON n.Estudiante_ID_Estudiante = e.ID_Estudiante
JOIN Evaluacion ev ON n.Evaluacion_ID_evaluacion = ev.ID_evaluacion
JOIN Materia m ON ev.Materia_ID_materia = m.ID_materia;

-- Vista para estadísticas de asistencia
CREATE VIEW vista_estadisticas_asistencia AS
SELECT 
    e.ID_Estudiante,
    CONCAT(e.Nombre, ' ', e.Apellido) as Estudiante_Nombre,
    m.Nombre as Materia_Nombre,
    COUNT(a.ID_Asistencia) as Total_Clases,
    SUM(CASE WHEN a.Presente = 'P' THEN 1 ELSE 0 END) as Clases_Presente,
    SUM(CASE WHEN a.Presente = 'A' THEN 1 ELSE 0 END) as Clases_Ausente,
    SUM(CASE WHEN a.Presente = 'J' THEN 1 ELSE 0 END) as Clases_Justificadas,
    ROUND((SUM(CASE WHEN a.Presente = 'P' THEN 1 ELSE 0 END) / COUNT(a.ID_Asistencia)) * 100, 2) as Porcentaje_Asistencia
FROM Estudiante e
JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
LEFT JOIN Asistencia a ON e.ID_Estudiante = a.Estudiante_ID_Estudiante AND m.ID_materia = a.Materia_ID_materia
GROUP BY e.ID_Estudiante, e.Nombre, e.Apellido, m.ID_materia, m.Nombre;

-- Vista para información completa de docentes
CREATE VIEW vista_docentes_completa AS
SELECT 
    ud.ID_docente,
    CONCAT(ud.Nombre_docente, ' ', ud.Apellido_docente) as Nombre_Completo,
    ud.Email_docente,
    ud.DNI,
    ud.Telefono,
    ud.Especialidad,
    ud.Titulo_academico,
    ud.Tipo_usuario,
    ud.Estado,
    ud.Fecha_registro,
    ud.Ultimo_acceso,
    COUNT(DISTINCT m.ID_materia) as Total_Materias,
    COUNT(DISTINCT axm.Estudiante_ID_Estudiante) as Total_Estudiantes,
    COUNT(DISTINCT ev.ID_evaluacion) as Total_Evaluaciones,
    COUNT(DISTINCT a.ID_Asistencia) as Total_Clases_Asistencia
FROM Usuarios_docente ud
LEFT JOIN Materia m ON ud.ID_docente = m.Usuarios_docente_ID_docente
LEFT JOIN Alumnos_X_Materia axm ON m.ID_materia = axm.Materia_ID_materia
LEFT JOIN Evaluacion ev ON m.ID_materia = ev.Materia_ID_materia
LEFT JOIN Asistencia a ON m.ID_materia = a.Materia_ID_materia
GROUP BY ud.ID_docente, ud.Nombre_docente, ud.Apellido_docente, ud.Email_docente, 
         ud.DNI, ud.Telefono, ud.Especialidad, ud.Titulo_academico, ud.Tipo_usuario, 
         ud.Estado, ud.Fecha_registro, ud.Ultimo_acceso;

-- Vista para dashboard principal del sistema
CREATE VIEW vista_dashboard_principal AS
SELECT 
    (SELECT COUNT(*) FROM Estudiante WHERE Estado = 'ACTIVO') as Total_Estudiantes_Activos,
    (SELECT COUNT(*) FROM Usuarios_docente WHERE Estado = 'ACTIVO') as Total_Docentes_Activos,
    (SELECT COUNT(*) FROM Materia WHERE Estado = 'ACTIVA') as Total_Materias_Activas,
    (SELECT COUNT(*) FROM Evaluacion WHERE Estado = 'PROGRAMADA') as Evaluaciones_Pendientes,
    (SELECT COUNT(*) FROM Notificaciones WHERE Estado = 'NO_LEIDA') as Notificaciones_Pendientes,
    (SELECT AVG(n.Calificacion) FROM Notas n WHERE n.Estado = 'DEFINITIVA') as Promedio_General_Calificaciones,
    (SELECT COUNT(*) FROM Asistencia WHERE Fecha = CURDATE()) as Asistencias_Hoy;

-- Vista para reporte de rendimiento por materia
CREATE VIEW vista_rendimiento_materia AS
SELECT 
    m.ID_materia,
    m.Nombre as Materia_Nombre,
    m.Curso_division,
    ud.Nombre_docente,
    ud.Apellido_docente,
    COUNT(DISTINCT axm.Estudiante_ID_Estudiante) as Total_Estudiantes,
    COUNT(DISTINCT ev.ID_evaluacion) as Total_Evaluaciones,
    COUNT(DISTINCT n.ID_Nota) as Total_Calificaciones,
    AVG(n.Calificacion) as Promedio_Calificaciones,
    COUNT(CASE WHEN n.Calificacion >= 6 THEN 1 END) as Estudiantes_Aprobados,
    COUNT(CASE WHEN n.Calificacion < 6 THEN 1 END) as Estudiantes_Desaprobados,
    ROUND((COUNT(CASE WHEN n.Calificacion >= 6 THEN 1 END) / COUNT(n.ID_Nota)) * 100, 2) as Porcentaje_Aprobacion
FROM Materia m
JOIN Usuarios_docente ud ON m.Usuarios_docente_ID_docente = ud.ID_docente
LEFT JOIN Alumnos_X_Materia axm ON m.ID_materia = axm.Materia_ID_materia
LEFT JOIN Evaluacion ev ON m.ID_materia = ev.Materia_ID_materia
LEFT JOIN Notas n ON ev.ID_evaluacion = n.Evaluacion_ID_evaluacion AND n.Estado = 'DEFINITIVA'
GROUP BY m.ID_materia, m.Nombre, m.Curso_division, ud.Nombre_docente, ud.Apellido_docente;

-- Vista para estudiantes con problemas académicos
CREATE VIEW vista_estudiantes_problemas AS
SELECT 
    e.ID_Estudiante,
    CONCAT(e.Nombre, ' ', e.Apellido) as Estudiante_Nombre,
    e.Email,
    e.Estado,
    COUNT(axm.Materia_ID_materia) as Total_Materias,
    AVG(n.Calificacion) as Promedio_General,
    COUNT(CASE WHEN n.Calificacion < 6 THEN 1 END) as Calificaciones_Bajas,
    COUNT(CASE WHEN a.Presente = 'A' THEN 1 END) as Ausencias_Recientes,
    CASE 
        WHEN AVG(n.Calificacion) < 6 THEN 'RENDIMIENTO_BAJO'
        WHEN COUNT(CASE WHEN a.Presente = 'A' THEN 1 END) > 5 THEN 'ASISTENCIA_BAJA'
        WHEN COUNT(CASE WHEN n.Calificacion < 6 THEN 1 END) > 3 THEN 'MULTIPLES_DESAPROBADOS'
        ELSE 'SIN_PROBLEMAS'
    END as Tipo_Problema
FROM Estudiante e
LEFT JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
LEFT JOIN Notas n ON e.ID_Estudiante = n.Estudiante_ID_Estudiante AND n.Estado = 'DEFINITIVA'
LEFT JOIN Asistencia a ON e.ID_Estudiante = a.Estudiante_ID_Estudiante
WHERE e.Estado = 'ACTIVO'
GROUP BY e.ID_Estudiante, e.Nombre, e.Apellido, e.Email, e.Estado
HAVING Promedio_General < 6 OR Calificaciones_Bajas > 3 OR Ausencias_Recientes > 5;

-- Vista para próximas evaluaciones
CREATE VIEW vista_proximas_evaluaciones AS
SELECT 
    ev.ID_evaluacion,
    ev.Titulo,
    ev.Tipo,
    ev.Fecha,
    m.Nombre as Materia_Nombre,
    m.Curso_division,
    ud.Nombre_docente,
    ud.Apellido_docente,
    COUNT(axm.Estudiante_ID_Estudiante) as Estudiantes_Inscritos,
    DATEDIFF(ev.Fecha, CURDATE()) as Dias_Restantes,
    CASE 
        WHEN DATEDIFF(ev.Fecha, CURDATE()) <= 0 THEN 'VENCIDA'
        WHEN DATEDIFF(ev.Fecha, CURDATE()) <= 3 THEN 'URGENTE'
        WHEN DATEDIFF(ev.Fecha, CURDATE()) <= 7 THEN 'PROXIMA'
        ELSE 'FUTURA'
    END as Prioridad
FROM Evaluacion ev
JOIN Materia m ON ev.Materia_ID_materia = m.ID_materia
JOIN Usuarios_docente ud ON m.Usuarios_docente_ID_docente = ud.ID_docente
LEFT JOIN Alumnos_X_Materia axm ON m.ID_materia = axm.Materia_ID_materia
WHERE ev.Estado IN ('PROGRAMADA', 'EN_CURSO')
GROUP BY ev.ID_evaluacion, ev.Titulo, ev.Tipo, ev.Fecha, m.Nombre, m.Curso_division, 
         ud.Nombre_docente, ud.Apellido_docente
ORDER BY ev.Fecha ASC;

-- Vista para estadísticas de asistencia por materia
CREATE VIEW vista_asistencia_materia AS
SELECT 
    m.ID_materia,
    m.Nombre as Materia_Nombre,
    m.Curso_division,
    ud.Nombre_docente,
    ud.Apellido_docente,
    COUNT(DISTINCT axm.Estudiante_ID_Estudiante) as Total_Estudiantes,
    COUNT(a.ID_Asistencia) as Total_Clases_Registradas,
    SUM(CASE WHEN a.Presente = 'P' THEN 1 ELSE 0 END) as Total_Presentes,
    SUM(CASE WHEN a.Presente = 'A' THEN 1 ELSE 0 END) as Total_Ausentes,
    SUM(CASE WHEN a.Presente = 'J' THEN 1 ELSE 0 END) as Total_Justificadas,
    ROUND((SUM(CASE WHEN a.Presente = 'P' THEN 1 ELSE 0 END) / COUNT(a.ID_Asistencia)) * 100, 2) as Porcentaje_Asistencia_General,
    COUNT(DISTINCT a.Fecha) as Dias_Con_Clase
FROM Materia m
JOIN Usuarios_docente ud ON m.Usuarios_docente_ID_docente = ud.ID_docente
LEFT JOIN Alumnos_X_Materia axm ON m.ID_materia = axm.Materia_ID_materia
LEFT JOIN Asistencia a ON m.ID_materia = a.Materia_ID_materia
GROUP BY m.ID_materia, m.Nombre, m.Curso_division, ud.Nombre_docente, ud.Apellido_docente;

-- =====================================================
-- MENSAJE DE INSTALACIÓN EXITOSA
-- =====================================================
SELECT 'EduSync instalado exitosamente!' as Mensaje,
       'Base de datos: edusync' as Base_Datos,
       'Tablas creadas: 13' as Tablas_Creadas,
       'Vistas creadas: 10' as Vistas_Creadas,
       'Datos de ejemplo: Incluidos' as Datos_Ejemplo;
>>>>>>> Stashed changes
