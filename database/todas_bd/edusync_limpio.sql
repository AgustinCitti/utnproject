-- =====================================================
-- EduSync - Sistema de Gestión Académica
-- Esquema de Base de Datos Relacional - MySQL/MariaDB (XAMPP)
-- Versión limpia sin comentarios problemáticos
-- =====================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS edusync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edusync;

-- =====================================================
-- ELIMINAR TABLAS EXISTENTES (si existen)
-- =====================================================
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

-- =====================================================
-- 1. TABLA: Usuarios_docente (Docentes)
-- =====================================================
CREATE TABLE Usuarios_docente (
    ID_docente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre_docente VARCHAR(50) NOT NULL,
    Apellido_docente VARCHAR(50) NOT NULL,
    Email_docente VARCHAR(100) UNIQUE NOT NULL,
    Contraseña VARCHAR(255) NOT NULL,
    DNI VARCHAR(20) UNIQUE,
    Telefono VARCHAR(20),
    Direccion TEXT,
    Fecha_nacimiento DATE,
    Especialidad VARCHAR(100),
    Titulo_academico VARCHAR(100),
    Fecha_registro DATE DEFAULT (CURRENT_DATE),
    Ultimo_acceso TIMESTAMP NULL,
    Estado ENUM('ACTIVO', 'INACTIVO', 'SUSPENDIDO', 'VACACIONES') DEFAULT 'ACTIVO',
    Tipo_usuario ENUM('PROFESOR', 'PROFESOR_ADJUNTO', 'JEFE_TP', 'COORDINADOR') DEFAULT 'PROFESOR',
    Plan_usuario ENUM('ESTANDAR', 'PREMIUM') DEFAULT 'ESTANDAR',
    Avatar VARCHAR(255),
    Configuracion JSON,
    INDEX idx_email_docente (Email_docente),
    INDEX idx_nombre_docente (Nombre_docente, Apellido_docente),
    INDEX idx_dni_docente (DNI),
    INDEX idx_estado_docente (Estado),
    INDEX idx_tipo_docente (Tipo_usuario),
    INDEX idx_plan_usuario (Plan_usuario),
    INDEX idx_especialidad (Especialidad)
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
    INTENSIFICA BOOLEAN DEFAULT FALSE,
    Tema_estudiante_ID_Tema_estudiante INT,
    INDEX idx_nombre_estudiante (Nombre, Apellido),
    INDEX idx_email_estudiante (Email),
    INDEX idx_estado_estudiante (Estado),
    INDEX idx_intensifica (INTENSIFICA)
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
    DECLARE v_plan_u ENUM('ESTANDAR','PREMIUM');
    DECLARE v_cnt_u INT DEFAULT 0;

    IF NEW.Usuarios_docente_ID_docente <> OLD.Usuarios_docente_ID_docente THEN
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
-- MENSAJE DE INSTALACIÓN EXITOSA
-- =====================================================
SELECT 'EduSync instalado exitosamente!' as Mensaje,
       'Base de datos: edusync' as Base_Datos,
       'Tablas creadas: 13' as Tablas_Creadas,
       'Datos de ejemplo: Incluidos' as Datos_Ejemplo;
