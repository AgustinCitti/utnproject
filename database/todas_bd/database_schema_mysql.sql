-- =====================================================
-- EduSync - Sistema de Gestión Académica
-- Esquema de Base de Datos Relacional - MySQL/MariaDB (XAMPP)
-- =====================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS edusync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edusync;

-- =====================================================
-- ELIMINAR TABLAS EXISTENTES (si existen)
-- IMPORTANTE: Ejecutar TODO este bloque completo juntos
-- (Desde SET FOREIGN_KEY_CHECKS = 0 hasta SET FOREIGN_KEY_CHECKS = 1)
-- NO ejecutar solo líneas individuales de DROP TABLE
-- =====================================================

-- PASO 1: Deshabilitar verificaciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- PASO 2: Eliminar todas las tablas (puede ser en cualquier orden)
DROP TABLE IF EXISTS Notificaciones;
DROP TABLE IF EXISTS Contacto_mensajes;
DROP TABLE IF EXISTS Recordatorio;
DROP TABLE IF EXISTS Archivos;
DROP TABLE IF EXISTS Notas;
DROP TABLE IF EXISTS Evaluacion;
DROP TABLE IF EXISTS Asistencia;
DROP TABLE IF EXISTS Tema_estudiante;
DROP TABLE IF EXISTS Contenido;
DROP TABLE IF EXISTS Alumnos_X_Materia;
DROP TABLE IF EXISTS Materia;
DROP TABLE IF EXISTS Estudiante;
DROP TABLE IF EXISTS Usuarios_docente;
DROP TABLE IF EXISTS Configuracion;

-- PASO 3: Volver a habilitar verificaciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. TABLA: Usuarios_docente (Docentes)
-- =====================================================
CREATE TABLE Usuarios_docente (
    ID_docente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre_docente VARCHAR(50) NOT NULL,
    Apellido_docente VARCHAR(50) NOT NULL,
    Email_docente VARCHAR(100) UNIQUE NOT NULL,
    Contraseña VARCHAR(255) NOT NULL,
    DNI VARCHAR(20) UNIQUE COMMENT 'Documento Nacional de Identidad',
    Telefono VARCHAR(20),
    Direccion TEXT,
    Fecha_nacimiento DATE,
    Especialidad VARCHAR(100) COMMENT 'Especialidad o área de conocimiento',
    Titulo_academico VARCHAR(100) COMMENT 'Título universitario o de posgrado',
    Fecha_registro DATE DEFAULT (CURRENT_DATE),
    Ultimo_acceso TIMESTAMP NULL COMMENT 'Última vez que accedió al sistema',
    Estado ENUM('ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'VACACIONES') DEFAULT 'ACTIVO',
    Tipo_usuario ENUM('PROFESOR', 'PROFESOR_ADJUNTO', 'JEFE_TP', 'COORDINADOR') DEFAULT 'PROFESOR',
    Plan_usuario ENUM('ESTANDAR', 'PREMIUM') DEFAULT 'ESTANDAR' COMMENT 'Plan de suscripción del docente',
    Avatar VARCHAR(255) COMMENT 'Ruta de la imagen de perfil',
    Configuracion JSON COMMENT 'Configuraciones personales del usuario',
    -- Índices para optimización
    INDEX idx_email_docente (Email_docente),
    INDEX idx_nombre_docente (Nombre_docente, Apellido_docente),
    INDEX idx_dni_docente (DNI),
    INDEX idx_estado_docente (Estado),
    INDEX idx_tipo_docente (Tipo_usuario),
    INDEX idx_plan_usuario (Plan_usuario),
    INDEX idx_especialidad (Especialidad),
    -- Restricciones (comentadas para compatibilidad con versiones anteriores de MySQL)
    -- CONSTRAINT chk_email_formato CHECK (Email_docente REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
    -- CONSTRAINT chk_dni_formato CHECK (DNI REGEXP '^[0-9]{7,8}$'),
    -- CONSTRAINT chk_telefono_formato CHECK (Telefono REGEXP '^[0-9+\\-\\s\\(\\)]{10,20}$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. TABLA: Estudiante (Estudiantes)
-- =====================================================
CREATE TABLE Estudiante (
    ID_Estudiante INT AUTO_INCREMENT PRIMARY KEY,
    Apellido VARCHAR(30) NOT NULL,
    Nombre VARCHAR(30) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    Fecha_nacimiento DATE,
    Fecha_inscripcion DATE DEFAULT (CURRENT_DATE),
    Estado ENUM('ACTIVO', 'INACTIVO', 'EGRESADO', 'SUSPENDIDO') DEFAULT 'ACTIVO',
    Tema_estudiante_ID_Tema_estudiante INT,
    INDEX idx_nombre_estudiante (Nombre, Apellido),
    INDEX idx_email_estudiante (Email),
    INDEX idx_estado_estudiante (Estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    Presente ENUM('Y', 'N', 'T') NOT NULL COMMENT 'Y=Presente, N=Ausente, T=Tarde',
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
    Peso DECIMAL(3,2) DEFAULT 1.00 COMMENT 'Peso de la evaluación (0.00 a 9.99)',
    Materia_ID_materia INT NOT NULL,
    Contenido_ID_contenido INT NULL,
    Fecha_creacion DATE DEFAULT (CURRENT_DATE),
    Estado ENUM('PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA') DEFAULT 'PROGRAMADA',
    INDEX idx_materia_evaluacion (Materia_ID_materia),
    INDEX idx_contenido_evaluacion (Contenido_ID_contenido),
    INDEX idx_fecha_evaluacion (Fecha),
    INDEX idx_tipo_evaluacion (Tipo),
    INDEX idx_estado_evaluacion (Estado),
    CONSTRAINT fk_evaluacion_materia FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_evaluacion_contenido FOREIGN KEY (Contenido_ID_contenido)
        REFERENCES Contenido(ID_contenido) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. TABLA: Notas (Calificaciones)
-- =====================================================
CREATE TABLE Notas (
    ID_Nota INT AUTO_INCREMENT PRIMARY KEY,
    Calificacion DECIMAL(4,2) NOT NULL CHECK (Calificacion >= 0 AND Calificacion <= 10) COMMENT '0.00 a 10.00',
    Observacion TEXT,
    Fecha_calificacion DATE DEFAULT (CURRENT_DATE),
    Fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de registro de la nota',
    Evaluacion_ID_evaluacion INT NOT NULL,
    Estudiante_ID_Estudiante INT NOT NULL,
    Estado ENUM('TENTATIVA', 'DEFINITIVA', 'RECUPERATORIO') DEFAULT 'DEFINITIVA' COMMENT 'Estado de la calificación',
    Peso DECIMAL(3,2) DEFAULT 1.00 COMMENT 'Peso de esta nota en el promedio (0.00 a 9.99)',
    -- Índices para optimización de consultas
    INDEX idx_estudiante_notas (Estudiante_ID_Estudiante),
    INDEX idx_evaluacion_notas (Evaluacion_ID_evaluacion),
    INDEX idx_calificacion_notas (Calificacion),
    INDEX idx_fecha_calificacion (Fecha_calificacion),
    INDEX idx_estado_notas (Estado),
    -- Índice compuesto para consultas frecuentes
    INDEX idx_estudiante_evaluacion (Estudiante_ID_Estudiante, Evaluacion_ID_evaluacion),
    -- Restricción única para evitar notas duplicadas del mismo estudiante en la misma evaluación
    UNIQUE KEY unique_estudiante_evaluacion (Estudiante_ID_Estudiante, Evaluacion_ID_evaluacion),
    -- Foreign Keys con restricciones
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
    Tipo VARCHAR(50) NOT NULL COMMENT 'PDF, DOCX, XLSX, etc.',
    Tamaño INT COMMENT 'Tamaño en bytes',
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
-- 13. TABLA: Contacto_mensajes (Mensajes de contacto y comentarios)
-- =====================================================
CREATE TABLE Contacto_mensajes (
    ID_contacto INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL,
    Apellido VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Telefono VARCHAR(20),
    Asunto ENUM('GENERAL', 'TECNICO', 'FACTURACION', 'SUGERENCIA', 'OTRO') NOT NULL DEFAULT 'GENERAL',
    Mensaje TEXT NOT NULL,
    Origen ENUM('WEB', 'APP', 'EMAIL', 'OTRO') DEFAULT 'WEB',
    Estado ENUM('NUEVO', 'LEIDO', 'RESPONDIDO', 'CERRADO') DEFAULT 'NUEVO',
    Fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    Respondido_por INT NULL,
    Nota_admin TEXT,
    Fecha_respuesta TIMESTAMP NULL,
    INDEX idx_email_contacto (Email),
    INDEX idx_estado_contacto (Estado),
    INDEX idx_fecha_contacto (Fecha_creacion),
    INDEX idx_asunto_contacto (Asunto),
    CONSTRAINT fk_contacto_respondido_por FOREIGN KEY (Respondido_por)
        REFERENCES Usuarios_docente(ID_docente) ON DELETE SET NULL ON UPDATE CASCADE
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
('2024-03-15', 'Y', 1, 1), ('2024-03-15', 'Y', 1, 2), ('2024-03-15', 'N', 1, 3), ('2024-03-15', 'Y', 1, 4),
('2024-03-18', 'Y', 1, 1), ('2024-03-18', 'T', 1, 2), ('2024-03-18', 'Y', 1, 3), ('2024-03-18', 'Y', 1, 4),
('2024-03-20', 'Y', 2, 1), ('2024-03-20', 'Y', 2, 2), ('2024-03-20', 'Y', 2, 3);

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
    e.Nombre,
    e.Apellido,
    e.Email,
    e.Fecha_nacimiento,
    e.Fecha_inscripcion,
    e.Estado,
    COUNT(axm.Materia_ID_materia) as Cantidad_Materias
FROM Estudiante e
LEFT JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
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
    SUM(CASE WHEN a.Presente = 'Y' THEN 1 ELSE 0 END) as Clases_Presente,
    SUM(CASE WHEN a.Presente = 'N' THEN 1 ELSE 0 END) as Clases_Ausente,
    SUM(CASE WHEN a.Presente = 'T' THEN 1 ELSE 0 END) as Clases_Tarde,
    ROUND((SUM(CASE WHEN a.Presente = 'Y' THEN 1 ELSE 0 END) / COUNT(a.ID_Asistencia)) * 100, 2) as Porcentaje_Asistencia
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

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- =====================================================

DELIMITER //

-- Procedimiento para calcular promedio de un estudiante en una materia
CREATE PROCEDURE calcular_promedio_estudiante(
    IN p_estudiante_id INT,
    IN p_materia_id INT,
    OUT p_promedio DECIMAL(4,2),
    OUT p_promedio_ponderado DECIMAL(4,2)
)
BEGIN
    DECLARE v_total_peso DECIMAL(5,2) DEFAULT 0;
    DECLARE v_suma_ponderada DECIMAL(6,2) DEFAULT 0;
    
    -- Calcular promedio simple
    SELECT COALESCE(AVG(n.Calificacion), 0)
    INTO p_promedio
    FROM Notas n
    JOIN Evaluacion ev ON n.Evaluacion_ID_evaluacion = ev.ID_evaluacion
    WHERE n.Estudiante_ID_Estudiante = p_estudiante_id
    AND ev.Materia_ID_materia = p_materia_id
    AND n.Estado = 'DEFINITIVA';
    
    -- Calcular promedio ponderado
    SELECT 
        COALESCE(SUM(n.Calificacion * n.Peso), 0),
        COALESCE(SUM(n.Peso), 0)
    INTO v_suma_ponderada, v_total_peso
    FROM Notas n
    JOIN Evaluacion ev ON n.Evaluacion_ID_evaluacion = ev.ID_evaluacion
    WHERE n.Estudiante_ID_Estudiante = p_estudiante_id
    AND ev.Materia_ID_materia = p_materia_id
    AND n.Estado = 'DEFINITIVA';
    
    IF v_total_peso > 0 THEN
        SET p_promedio_ponderado = v_suma_ponderada / v_total_peso;
    ELSE
        SET p_promedio_ponderado = 0;
    END IF;
END //

-- Procedimiento para obtener estadísticas de una materia
CREATE PROCEDURE estadisticas_materia(
    IN p_materia_id INT
)
BEGIN
    SELECT 
        m.Nombre as Materia_Nombre,
        COUNT(DISTINCT axm.Estudiante_ID_Estudiante) as Total_Estudiantes,
        COUNT(DISTINCT ev.ID_evaluacion) as Total_Evaluaciones,
        COUNT(DISTINCT a.ID_Asistencia) as Total_Clases_Asistencia,
        AVG(n.Calificacion) as Promedio_General
    FROM Materia m
    LEFT JOIN Alumnos_X_Materia axm ON m.ID_materia = axm.Materia_ID_materia
    LEFT JOIN Evaluacion ev ON m.ID_materia = ev.Materia_ID_materia
    LEFT JOIN Asistencia a ON m.ID_materia = a.Materia_ID_materia
    LEFT JOIN Notas n ON ev.ID_evaluacion = n.Evaluacion_ID_evaluacion
    WHERE m.ID_materia = p_materia_id
    GROUP BY m.ID_materia, m.Nombre;
END //

-- Procedimiento para marcar asistencia masiva
CREATE PROCEDURE marcar_asistencia_masiva(
    IN p_materia_id INT,
    IN p_fecha DATE,
    IN p_estudiantes_presentes TEXT
)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_estudiante_id INT;
    DECLARE v_presente CHAR(1);
    DECLARE cur CURSOR FOR 
        SELECT Estudiante_ID_Estudiante FROM Alumnos_X_Materia 
        WHERE Materia_ID_materia = p_materia_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Marcar todos como ausentes primero
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_estudiante_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Verificar si el estudiante está en la lista de presentes
        IF FIND_IN_SET(v_estudiante_id, p_estudiantes_presentes) > 0 THEN
            SET v_presente = 'Y';
        ELSE
            SET v_presente = 'N';
        END IF;
        
        INSERT INTO Asistencia (Fecha, Presente, Materia_ID_materia, Estudiante_ID_Estudiante)
        VALUES (p_fecha, v_presente, p_materia_id, v_estudiante_id)
        ON DUPLICATE KEY UPDATE Presente = v_presente;
    END LOOP;
    CLOSE cur;
END //

-- Procedimiento para generar reporte de calificaciones
CREATE PROCEDURE reporte_calificaciones_materia(
    IN p_materia_id INT
)
BEGIN
    SELECT 
        CONCAT(e.Nombre, ' ', e.Apellido) as Estudiante,
        ev.Titulo as Evaluacion,
        ev.Tipo as Tipo_Evaluacion,
        ev.Fecha as Fecha_Evaluacion,
        n.Calificacion,
        n.Estado as Estado_Nota,
        n.Peso,
        n.Observacion,
        CASE 
            WHEN n.Calificacion >= 6 THEN 'APROBADO'
            ELSE 'DESAPROBADO'
        END as Estado_Aprobacion
    FROM Estudiante e
    JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
    JOIN Evaluacion ev ON axm.Materia_ID_materia = ev.Materia_ID_materia
    LEFT JOIN Notas n ON ev.ID_evaluacion = n.Evaluacion_ID_evaluacion AND e.ID_Estudiante = n.Estudiante_ID_Estudiante
    WHERE axm.Materia_ID_materia = p_materia_id
    ORDER BY e.Apellido, e.Nombre, ev.Fecha;
END //

-- Procedimiento para registrar nota de recuperatorio
CREATE PROCEDURE registrar_recuperatorio(
    IN p_estudiante_id INT,
    IN p_evaluacion_id INT,
    IN p_calificacion DECIMAL(4,2),
    IN p_observacion TEXT
)
BEGIN
    DECLARE v_existe_nota INT DEFAULT 0;
    
    -- Verificar si ya existe una nota para este estudiante en esta evaluación
    SELECT COUNT(*) INTO v_existe_nota
    FROM Notas 
    WHERE Estudiante_ID_Estudiante = p_estudiante_id 
    AND Evaluacion_ID_evaluacion = p_evaluacion_id;
    
    IF v_existe_nota > 0 THEN
        -- Actualizar la nota existente como recuperatorio
        UPDATE Notas 
        SET Calificacion = p_calificacion,
            Estado = 'RECUPERATORIO',
            Observacion = CONCAT(IFNULL(Observacion, ''), ' | Recuperatorio: ', p_observacion),
            Fecha_calificacion = CURRENT_DATE
        WHERE Estudiante_ID_Estudiante = p_estudiante_id 
        AND Evaluacion_ID_evaluacion = p_evaluacion_id;
    ELSE
        -- Insertar nueva nota como recuperatorio
        INSERT INTO Notas (Calificacion, Evaluacion_ID_evaluacion, Estudiante_ID_Estudiante, Estado, Observacion)
        VALUES (p_calificacion, p_evaluacion_id, p_estudiante_id, 'RECUPERATORIO', p_observacion);
    END IF;
END //

-- Procedimiento para obtener boletín de calificaciones de un estudiante
CREATE PROCEDURE boletin_estudiante(
    IN p_estudiante_id INT
)
BEGIN
    SELECT 
        m.Nombre as Materia,
        m.Curso_division,
        ev.Titulo as Evaluacion,
        ev.Tipo as Tipo_Evaluacion,
        ev.Fecha as Fecha_Evaluacion,
        n.Calificacion,
        n.Estado as Estado_Nota,
        n.Peso,
        n.Observacion,
        ud.Nombre_docente,
        ud.Apellido_docente
    FROM Estudiante e
    JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
    JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
    JOIN Usuarios_docente ud ON m.Usuarios_docente_ID_docente = ud.ID_docente
    LEFT JOIN Evaluacion ev ON m.ID_materia = ev.Materia_ID_materia
    LEFT JOIN Notas n ON ev.ID_evaluacion = n.Evaluacion_ID_evaluacion AND e.ID_Estudiante = n.Estudiante_ID_Estudiante
    WHERE e.ID_Estudiante = p_estudiante_id
    ORDER BY m.Nombre, ev.Fecha;
END //

-- Procedimiento para autenticar docente
CREATE PROCEDURE autenticar_docente(
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255),
    OUT p_docente_id INT,
    OUT p_nombre_completo VARCHAR(101),
    OUT p_tipo_usuario VARCHAR(20),
    OUT p_estado VARCHAR(20)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    -- Verificar credenciales
    SELECT COUNT(*)
    INTO v_count
    FROM Usuarios_docente 
    WHERE Email_docente = p_email 
    AND Contraseña = p_password
    AND Estado = 'ACTIVO';
    
    IF v_count > 0 THEN
        -- Obtener información del docente
        SELECT 
            ID_docente,
            CONCAT(Nombre_docente, ' ', Apellido_docente),
            Tipo_usuario,
            Estado
        INTO p_docente_id, p_nombre_completo, p_tipo_usuario, p_estado
        FROM Usuarios_docente 
        WHERE Email_docente = p_email;
        
        -- Actualizar último acceso
        UPDATE Usuarios_docente 
        SET Ultimo_acceso = CURRENT_TIMESTAMP 
        WHERE ID_docente = p_docente_id;
    ELSE
        SET p_docente_id = 0;
        SET p_nombre_completo = '';
        SET p_tipo_usuario = '';
        SET p_estado = '';
    END IF;
END //

-- Procedimiento para obtener perfil completo de docente
CREATE PROCEDURE perfil_docente(
    IN p_docente_id INT
)
BEGIN
    SELECT 
        ID_docente,
        Nombre_docente,
        Apellido_docente,
        Email_docente,
        DNI,
        Telefono,
        Direccion,
        Fecha_nacimiento,
        Especialidad,
        Titulo_academico,
        Fecha_registro,
        Ultimo_acceso,
        Estado,
        Tipo_usuario,
        Avatar,
        Configuracion,
        -- Estadísticas del docente
        (SELECT COUNT(*) FROM Materia WHERE Usuarios_docente_ID_docente = p_docente_id) as Total_Materias,
        (SELECT COUNT(DISTINCT axm.Estudiante_ID_Estudiante) 
         FROM Materia m 
         JOIN Alumnos_X_Materia axm ON m.ID_materia = axm.Materia_ID_materia 
         WHERE m.Usuarios_docente_ID_docente = p_docente_id) as Total_Estudiantes
    FROM Usuarios_docente 
    WHERE ID_docente = p_docente_id;
END //

-- Procedimiento para actualizar configuración de docente
CREATE PROCEDURE actualizar_configuracion_docente(
    IN p_docente_id INT,
    IN p_configuracion JSON
)
BEGIN
    UPDATE Usuarios_docente 
    SET Configuracion = p_configuracion
    WHERE ID_docente = p_docente_id;
END //

-- Procedimiento para buscar docentes por especialidad
CREATE PROCEDURE buscar_docentes_especialidad(
    IN p_especialidad VARCHAR(100)
)
BEGIN
    SELECT 
        ID_docente,
        CONCAT(Nombre_docente, ' ', Apellido_docente) as Nombre_Completo,
        Email_docente,
        Especialidad,
        Titulo_academico,
        Tipo_usuario,
        Estado,
        (SELECT COUNT(*) FROM Materia WHERE Usuarios_docente_ID_docente = ID_docente) as Cantidad_Materias
    FROM Usuarios_docente 
    WHERE Especialidad LIKE CONCAT('%', p_especialidad, '%')
    AND Estado = 'ACTIVO'
    ORDER BY Apellido_docente, Nombre_docente;
END //

DELIMITER ;

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

DELIMITER //

-- Función para calcular porcentaje de asistencia
CREATE FUNCTION calcular_porcentaje_asistencia(
    p_estudiante_id INT,
    p_materia_id INT
) RETURNS DECIMAL(5,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_total_clases INT DEFAULT 0;
    DECLARE v_clases_presente INT DEFAULT 0;
    DECLARE v_porcentaje DECIMAL(5,2) DEFAULT 0;
    
    SELECT COUNT(*), SUM(CASE WHEN Presente = 'Y' THEN 1 ELSE 0 END)
    INTO v_total_clases, v_clases_presente
    FROM Asistencia
    WHERE Estudiante_ID_Estudiante = p_estudiante_id
    AND Materia_ID_materia = p_materia_id;
    
    IF v_total_clases > 0 THEN
        SET v_porcentaje = (v_clases_presente / v_total_clases) * 100;
    END IF;
    
    RETURN v_porcentaje;
END //

-- Función para obtener estado de aprobación
CREATE FUNCTION estado_aprobacion(
    p_estudiante_id INT,
    p_materia_id INT
) RETURNS VARCHAR(20)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_promedio DECIMAL(4,2) DEFAULT 0;
    DECLARE v_asistencia DECIMAL(5,2) DEFAULT 0;
    DECLARE v_estado VARCHAR(20) DEFAULT 'CURSANDO';
    
    -- Calcular promedio
    SELECT COALESCE(AVG(n.Calificacion), 0)
    INTO v_promedio
    FROM Notas n
    JOIN Evaluacion ev ON n.Evaluacion_ID_evaluacion = ev.ID_evaluacion
    WHERE n.Estudiante_ID_Estudiante = p_estudiante_id
    AND ev.Materia_ID_materia = p_materia_id;
    
    -- Calcular asistencia
    SET v_asistencia = calcular_porcentaje_asistencia(p_estudiante_id, p_materia_id);
    
    -- Determinar estado
    IF v_promedio >= 6 AND v_asistencia >= 75 THEN
        SET v_estado = 'APROBADO';
    ELSEIF v_promedio < 6 THEN
        SET v_estado = 'DESAPROBADO';
    ELSEIF v_asistencia < 75 THEN
        SET v_estado = 'LIBRE';
    END IF;
    
    RETURN v_estado;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS ÚTILES
-- =====================================================

-- Trigger para actualizar fecha de actualización en contenido
DELIMITER //
CREATE TRIGGER trg_contenido_actualizacion
    BEFORE UPDATE ON Contenido
    FOR EACH ROW
BEGIN
    SET NEW.Fecha_actualizacion = CURRENT_DATE;
END //
DELIMITER ;

-- Trigger para actualizar fecha de actualización en tema_estudiante
DELIMITER //
CREATE TRIGGER trg_tema_estudiante_actualizacion
    BEFORE UPDATE ON Tema_estudiante
    FOR EACH ROW
BEGIN
    SET NEW.Fecha_actualizacion = CURRENT_DATE;
END //
DELIMITER ;

-- Limitar a 5 materias para docentes con Plan ESTANDAR
DELIMITER //
CREATE TRIGGER trg_limite_materias_insert
    BEFORE INSERT ON Materia
    FOR EACH ROW
BEGIN
    DECLARE v_plan ENUM('ESTANDAR','PREMIUM');
    DECLARE v_cnt INT DEFAULT 0;

    SELECT Plan_usuario INTO v_plan
    FROM Usuarios_docente
    WHERE ID_docente = NEW.Usuarios_docente_ID_docente;

    IF v_plan = 'ESTANDAR' THEN
        SELECT COUNT(*) INTO v_cnt
        FROM Materia
        WHERE Usuarios_docente_ID_docente = NEW.Usuarios_docente_ID_docente;

        IF v_cnt >= 5 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El plan ESTANDAR permite hasta 5 materias por docente.';
        END IF;
    END IF;
END //

CREATE TRIGGER trg_limite_materias_update
    BEFORE UPDATE ON Materia
    FOR EACH ROW
BEGIN
    IF NEW.Usuarios_docente_ID_docente <> OLD.Usuarios_docente_ID_docente THEN
        DECLARE v_plan_u ENUM('ESTANDAR','PREMIUM');
        DECLARE v_cnt_u INT DEFAULT 0;

        SELECT Plan_usuario INTO v_plan_u
        FROM Usuarios_docente
        WHERE ID_docente = NEW.Usuarios_docente_ID_docente;

        IF v_plan_u = 'ESTANDAR' THEN
            SELECT COUNT(*) INTO v_cnt_u
            FROM Materia
            WHERE Usuarios_docente_ID_docente = NEW.Usuarios_docente_ID_docente;

            IF v_cnt_u >= 5 THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El plan ESTANDAR permite hasta 5 materias por docente.';
            END IF;
        END IF;
    END IF;
END //
DELIMITER ;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

/*
Este esquema de base de datos está optimizado para MySQL/MariaDB y es compatible con XAMPP.

CARACTERÍSTICAS PRINCIPALES:
- Compatible con MySQL 5.7+ y MariaDB 10.2+
- Optimizado para XAMPP (Windows, Linux, macOS)
- Soporte completo para UTF-8 (utf8mb4)
- Uso de InnoDB para mejor rendimiento y transacciones
- Índices optimizados para consultas frecuentes
- Triggers, procedimientos y funciones almacenadas
- Vistas para consultas complejas
- Datos de ejemplo incluidos

CONFIGURACIÓN RECOMENDADA PARA XAMPP:
1. Iniciar Apache y MySQL en XAMPP
2. Abrir phpMyAdmin (http://localhost/phpmyadmin)
3. Crear nueva base de datos o importar este archivo
4. Configurar charset utf8mb4_unicode_ci
5. Ajustar configuración de MySQL si es necesario

NOTAS TÉCNICAS:
- Usa AUTO_INCREMENT para IDs auto-incrementales
- ENUM para valores predefinidos (mejor rendimiento que VARCHAR)
- Índices en campos frecuentemente consultados
- Foreign keys con CASCADE para integridad referencial
- Triggers para actualizaciones automáticas
- Procedimientos almacenados para operaciones complejas
- Funciones para cálculos reutilizables

OPTIMIZACIONES INCLUIDAS:
- Índices en campos de búsqueda frecuente
- Vistas materializadas para consultas complejas
- Procedimientos para operaciones masivas
- Funciones para cálculos automáticos
- Triggers para mantener consistencia de datos
*/
