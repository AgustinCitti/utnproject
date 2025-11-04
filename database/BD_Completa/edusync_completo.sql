-- =============================================================
-- EduSync - Instalación Completa Consolidada
-- Este archivo incluye TODO el esquema de la base de datos
-- en un solo archivo SQL para facilitar la instalación
-- =============================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS edusync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edusync;

-- =============================================================
-- PARTE 1: ELIMINACIÓN DE TABLAS EXISTENTES (si existen)
-- =============================================================

-- Deshabilitar temporalmente las verificaciones de foreign keys
-- para poder eliminar todas las tablas sin errores
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tablas en orden inverso de dependencias
-- Primero las tablas que dependen de otras, luego las principales
DROP TABLE IF EXISTS Calificaciones_cuatrimestre;
DROP TABLE IF EXISTS Intensificacion;
DROP TABLE IF EXISTS Pago_suscripcion;
DROP TABLE IF EXISTS Suscripcion;
DROP TABLE IF EXISTS Notificaciones;
DROP TABLE IF EXISTS Contacto_mensajes;
DROP TABLE IF EXISTS contact_messages;
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
DROP TABLE IF EXISTS Plan;
DROP TABLE IF EXISTS Escuela;

-- Eliminar vistas y funciones/procedimientos que pueden tener dependencias
DROP VIEW IF EXISTS vw_calificaciones_resueltas;
DROP VIEW IF EXISTS vw_promedios_cuatrimestre;
DROP VIEW IF EXISTS vista_intensificados;
DROP VIEW IF EXISTS vista_resumen_intensificacion_materia;
DROP VIEW IF EXISTS vista_materias_con_escuela;
DROP VIEW IF EXISTS vista_suscripciones_activas;
DROP VIEW IF EXISTS vista_pago_resumen;
DROP VIEW IF EXISTS contact_message_stats;
DROP VIEW IF EXISTS recent_contact_messages;

-- Eliminar funciones y procedimientos almacenados
DROP FUNCTION IF EXISTS fn_promedio_cuatrimestre;
DROP FUNCTION IF EXISTS fn_cierre_etiqueta;
DROP PROCEDURE IF EXISTS registrar_nota_intensificacion;
DROP PROCEDURE IF EXISTS asignar_intensificacion;
DROP PROCEDURE IF EXISTS get_contact_messages_by_status;
DROP PROCEDURE IF EXISTS update_contact_message_status;
DROP PROCEDURE IF EXISTS get_contact_statistics;

-- Eliminar triggers
DROP TRIGGER IF EXISTS trg_limite_materias_insert;
DROP TRIGGER IF EXISTS trg_limite_materias_update;
DROP TRIGGER IF EXISTS trg_contact_messages_update;

-- Volver a habilitar las verificaciones de foreign keys
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
-- PARTE 2: CREACIÓN DE TABLAS PRINCIPALES
-- =============================================================

-- 1. TABLA: Usuarios_docente (Docentes)
CREATE TABLE Usuarios_docente (
    ID_docente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre_docente VARCHAR(50) NOT NULL,
    Apellido_docente VARCHAR(50) NOT NULL,
    Email_docente VARCHAR(100) UNIQUE NOT NULL,
    google_id VARCHAR(64) UNIQUE NULL COMMENT 'ID de Google OAuth',
    oauth_provider ENUM('LOCAL','GOOGLE') NOT NULL DEFAULT 'LOCAL' COMMENT 'Proveedor de autenticación',
    Avatar VARCHAR(255) NULL COMMENT 'Ruta de la imagen de perfil',
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
    Plan_actual_ID INT NULL COMMENT 'Referencia al plan activo',
    Configuracion JSON COMMENT 'Configuraciones personales del usuario',
    INDEX idx_email_docente (Email_docente),
    INDEX idx_google_id (google_id),
    INDEX idx_nombre_docente (Nombre_docente, Apellido_docente),
    INDEX idx_dni_docente (DNI),
    INDEX idx_estado_docente (Estado),
    INDEX idx_tipo_docente (Tipo_usuario),
    INDEX idx_plan_usuario (Plan_usuario),
    INDEX idx_especialidad (Especialidad),
    INDEX idx_docente_plan_actual (Plan_actual_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABLA: Estudiante (Estudiantes)
CREATE TABLE Estudiante (
    ID_Estudiante INT AUTO_INCREMENT PRIMARY KEY,
    Apellido VARCHAR(30) NOT NULL,
    Nombre VARCHAR(30) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    Fecha_nacimiento DATE,
    Fecha_inscripcion DATE DEFAULT (CURRENT_DATE),
    Estado ENUM('ACTIVO', 'INACTIVO', 'EGRESADO', 'SUSPENDIDO') DEFAULT 'ACTIVO',
    INTENSIFICA BOOLEAN DEFAULT FALSE COMMENT 'Indica si el estudiante está en intensificación',
    Tema_estudiante_ID_Tema_estudiante INT,
    INDEX idx_nombre_estudiante (Nombre, Apellido),
    INDEX idx_email_estudiante (Email),
    INDEX idx_estado_estudiante (Estado),
    INDEX idx_intensifica (INTENSIFICA)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABLA: Escuela (Escuelas/Establecimientos)
CREATE TABLE Escuela (
    ID_escuela INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(120) NOT NULL,
    CUE VARCHAR(20) NULL UNIQUE COMMENT 'Código Único de Establecimiento (opcional)',
    Direccion VARCHAR(200) NULL,
    Localidad VARCHAR(80) NULL,
    Provincia VARCHAR(80) NULL,
    Telefono VARCHAR(30) NULL,
    Email VARCHAR(120) NULL,
    Estado ENUM('ACTIVA','INACTIVA') NOT NULL DEFAULT 'ACTIVA',
    Fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_escuela_nombre (Nombre),
    INDEX idx_escuela_estado (Estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABLA: Materia (Materias/Asignaturas)
CREATE TABLE Materia (
    ID_materia INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Curso_division VARCHAR(50) NOT NULL,
    Descripcion TEXT,
    Horario VARCHAR(100),
    Aula VARCHAR(50),
    Escuela_ID INT NULL COMMENT 'Referencia a la escuela',
    Usuarios_docente_ID_docente INT NOT NULL,
    Fecha_creacion DATE DEFAULT (CURRENT_DATE),
    Estado ENUM('ACTIVA', 'INACTIVA', 'FINALIZADA') DEFAULT 'ACTIVA',
    INDEX idx_docente_materia (Usuarios_docente_ID_docente),
    INDEX idx_nombre_materia (Nombre),
    INDEX idx_estado_materia (Estado),
    INDEX idx_materia_escuela (Escuela_ID),
    CONSTRAINT fk_materia_docente FOREIGN KEY (Usuarios_docente_ID_docente) 
        REFERENCES Usuarios_docente(ID_docente) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_materia_escuela FOREIGN KEY (Escuela_ID) 
        REFERENCES Escuela(ID_escuela) ON UPDATE CASCADE ON DELETE SET NULL,
    UNIQUE KEY uq_materia_escuela (Escuela_ID, Nombre, Curso_division)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABLA: Alumnos_X_Materia (Relación Muchos a Muchos)
CREATE TABLE Alumnos_X_Materia (
    ID INT AUTO_INCREMENT,
    Materia_ID_materia INT NOT NULL,
    Estudiante_ID_Estudiante INT NOT NULL,
    Fecha_inscripcion DATE DEFAULT (CURRENT_DATE),
    Estado ENUM('INSCRITO', 'CURSANDO', 'APROBADO', 'DESAPROBADO', 'AUSENTE') DEFAULT 'INSCRITO',
    Condicion ENUM('REGULAR','INTENSIFICANDO','RECURSANTE') NOT NULL DEFAULT 'REGULAR',
    PRIMARY KEY (Materia_ID_materia, Estudiante_ID_Estudiante),
    UNIQUE KEY unique_id (ID),
    INDEX idx_estudiante_materia (Estudiante_ID_Estudiante),
    INDEX idx_fecha_inscripcion (Fecha_inscripcion),
    INDEX idx_axm_condicion (Condicion),
    CONSTRAINT fk_alumnos_materia_materia FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_alumnos_materia_estudiante FOREIGN KEY (Estudiante_ID_Estudiante) 
        REFERENCES Estudiante(ID_Estudiante) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABLA: Contenido (Contenido de Materias)
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

-- 7. TABLA: Tema_estudiante (Temas por Estudiante)
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

-- 8. TABLA: Asistencia (Control de Asistencia)
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

-- 9. TABLA: Evaluacion (Evaluaciones/Exámenes)
CREATE TABLE Evaluacion (
    ID_evaluacion INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(100) NOT NULL,
    Descripcion TEXT,
    Fecha DATE NOT NULL,
    Tipo ENUM('EXAMEN', 'PARCIAL', 'TRABAJO_PRACTICO', 'PROYECTO', 'ORAL', 'PRACTICO') NOT NULL,
    Peso DECIMAL(3,2) DEFAULT 1.00 COMMENT 'Peso de la evaluación (0.00 a 9.99)',
    periodo_cuatrimestre TINYINT NULL COMMENT '1 = Primer, 2 = Segundo',
    etapa_calculo ENUM('AVANCE','FINAL') NULL COMMENT 'Qué promedio integra',
    ponderacion DECIMAL(6,2) NOT NULL DEFAULT 1.00 COMMENT 'Peso relativo en el promedio',
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

-- 10. TABLA: Notas (Calificaciones)
CREATE TABLE Notas (
    ID_Nota INT AUTO_INCREMENT PRIMARY KEY,
    Calificacion DECIMAL(4,2) NOT NULL,
    Observacion TEXT,
    Fecha_calificacion DATE DEFAULT (CURRENT_DATE),
    Fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de registro de la nota',
    Evaluacion_ID_evaluacion INT NOT NULL,
    Estudiante_ID_Estudiante INT NOT NULL,
    Estado ENUM('TENTATIVA', 'DEFINITIVA', 'RECUPERATORIO') DEFAULT 'DEFINITIVA' COMMENT 'Estado de la calificación',
    Peso DECIMAL(3,2) DEFAULT 1.00 COMMENT 'Peso de esta nota en el promedio (0.00 a 9.99)',
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

-- 11. TABLA: Archivos (Archivos de Materias)
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

-- 12. TABLA: Recordatorio (Recordatorios)
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

-- 13. TABLA: Notificaciones (Sistema de Notificaciones)
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

-- 14. TABLA: Contacto_mensajes (Mensajes de contacto y comentarios)
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

-- 15. TABLA: contact_messages (Mensajes de contacto en inglés - alternativa)
CREATE TABLE contact_messages (
    ID_message INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    subject ENUM('general', 'technical', 'billing', 'feature', 'other') NOT NULL,
    message TEXT NOT NULL,
    newsletter_opt BOOLEAN DEFAULT FALSE,
    status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    admin_notes TEXT,
    replied_at TIMESTAMP NULL,
    replied_by INT NULL,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_subject (subject),
    INDEX idx_status_created (status, created_at),
    CONSTRAINT fk_contact_replied_by FOREIGN KEY (replied_by) 
        REFERENCES Usuarios_docente(ID_docente) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. TABLA: Configuracion (Configuración del Sistema)
CREATE TABLE Configuracion (
    ID_configuracion INT AUTO_INCREMENT PRIMARY KEY,
    Clave VARCHAR(100) UNIQUE NOT NULL,
    Valor TEXT,
    Descripcion TEXT,
    Tipo ENUM('STRING', 'INTEGER', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
    Fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- PARTE 2: SISTEMA DE SUSCRIPCIONES
-- =============================================================

-- 17. TABLA: Plan (Planes de suscripción)
CREATE TABLE Plan (
    ID_plan INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(40) NOT NULL UNIQUE,
    Descripcion TEXT,
    Precio_mensual DECIMAL(10,2) NOT NULL DEFAULT 0,
    Activo TINYINT(1) NOT NULL DEFAULT 1,
    Limite_materias INT NULL,
    Limite_estudiantes INT NULL,
    Fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. TABLA: Suscripcion (Suscripciones por docente)
CREATE TABLE Suscripcion (
    ID_suscripcion BIGINT AUTO_INCREMENT PRIMARY KEY,
    Usuario_docente_ID INT NOT NULL,
    Plan_ID INT NOT NULL,
    Fecha_inicio DATE NOT NULL,
    Fecha_fin DATE NULL,
    Estado ENUM('ACTIVA','PAUSADA','VENCIDA','CANCELADA') NOT NULL DEFAULT 'ACTIVA',
    Renovacion_automatica TINYINT(1) NOT NULL DEFAULT 1,
    Metodo_pago VARCHAR(30) NULL,
    Referencia_externa VARCHAR(100) NULL,
    Fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_susc_docente (Usuario_docente_ID),
    INDEX idx_susc_plan (Plan_ID),
    INDEX idx_susc_estado (Estado),
    CONSTRAINT fk_susc_docente FOREIGN KEY (Usuario_docente_ID)
        REFERENCES Usuarios_docente(ID_docente) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_susc_plan FOREIGN KEY (Plan_ID)
        REFERENCES Plan(ID_plan) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. TABLA: Pago_suscripcion (Pagos asociados a suscripciones)
CREATE TABLE Pago_suscripcion (
    ID_pago BIGINT AUTO_INCREMENT PRIMARY KEY,
    Suscripcion_ID BIGINT NOT NULL,
    Monto DECIMAL(10,2) NOT NULL,
    Moneda VARCHAR(10) NOT NULL DEFAULT 'ARS',
    Fecha_pago DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Estado ENUM('PENDIENTE','APROBADO','RECHAZADO','REEMBOLSADO') NOT NULL DEFAULT 'APROBADO',
    Proveedor VARCHAR(30) NULL,
    Referencia_externa VARCHAR(100) NULL,
    INDEX idx_pago_estado (Estado),
    CONSTRAINT fk_pago_susc FOREIGN KEY (Suscripcion_ID)
        REFERENCES Suscripcion(ID_suscripcion) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar referencia de plan actual al docente
ALTER TABLE Usuarios_docente 
    ADD CONSTRAINT fk_docente_plan_actual FOREIGN KEY (Plan_actual_ID) 
    REFERENCES Plan(ID_plan) ON UPDATE CASCADE ON DELETE SET NULL;

-- =============================================================
-- PARTE 3: INTENSIFICACIÓN Y CALIFICACIONES
-- =============================================================

-- 20. TABLA: Intensificacion (Intensificación por tema)
CREATE TABLE Intensificacion (
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
    CONSTRAINT fk_inten_est FOREIGN KEY (Estudiante_ID_Estudiante) 
        REFERENCES Estudiante(ID_Estudiante) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_inten_mat FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_inten_cont FOREIGN KEY (Contenido_ID_contenido) 
        REFERENCES Contenido(ID_contenido) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. TABLA: Calificaciones_cuatrimestre (Control de calificaciones por cuatrimestre)
CREATE TABLE Calificaciones_cuatrimestre (
    ID_calificacion BIGINT PRIMARY KEY AUTO_INCREMENT,
    Estudiante_ID_Estudiante INT NOT NULL,
    Materia_ID_materia INT NOT NULL,
    cuatrimestre TINYINT NOT NULL COMMENT '1 = Primer, 2 = Segundo',
    usar_auto_avance TINYINT(1) NOT NULL DEFAULT 1,
    nota_manual_avance DECIMAL(5,2) NULL,
    usar_auto_final TINYINT(1) NOT NULL DEFAULT 1,
    nota_manual_final DECIMAL(5,2) NULL,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_calif_cm (Estudiante_ID_Estudiante, Materia_ID_materia, cuatrimestre),
    CONSTRAINT fk_calif_est FOREIGN KEY (Estudiante_ID_Estudiante) 
        REFERENCES Estudiante(ID_Estudiante) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_calif_mat FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar restricciones CHECK después de crear la tabla (más compatible)
ALTER TABLE Calificaciones_cuatrimestre
    ADD CONSTRAINT chk_cm_cuatrimestre CHECK (cuatrimestre IN (1,2)),
    ADD CONSTRAINT chk_cm_nota_man_ava CHECK (nota_manual_avance IS NULL OR (nota_manual_avance BETWEEN 1 AND 10)),
    ADD CONSTRAINT chk_cm_nota_man_fin CHECK (nota_manual_final IS NULL OR (nota_manual_final BETWEEN 1 AND 10));

-- =============================================================
-- PARTE 4: FUNCIONES Y PROCEDIMIENTOS ALMACENADOS
-- =============================================================

DELIMITER $$

-- Función para calcular promedio ponderado por estudiante/materia/cuatrimestre/etapa
DROP FUNCTION IF EXISTS fn_promedio_cuatrimestre$$
CREATE FUNCTION fn_promedio_cuatrimestre(
    p_estudiante_id INT,
    p_materia_id INT,
    p_cuatrimestre TINYINT,
    p_etapa ENUM('AVANCE','FINAL')
) RETURNS DECIMAL(6,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_total_peso DECIMAL(14,4) DEFAULT 0.0;
    DECLARE v_sumatoria DECIMAL(14,4) DEFAULT 0.0;
    DECLARE v_promedio DECIMAL(6,2);

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
        SET v_promedio = NULL;
    ELSE
        SET v_promedio = ROUND(v_sumatoria / v_total_peso, 2);
    END IF;

    RETURN v_promedio;
END$$

-- Función de cierre: etiqueta TED/TEP/TEA según nota
DROP FUNCTION IF EXISTS fn_cierre_etiqueta$$
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

-- Procedimiento: registrar/modificar nota de intensificación
DROP PROCEDURE IF EXISTS registrar_nota_intensificacion$$
CREATE PROCEDURE registrar_nota_intensificacion (
    IN p_estudiante_id INT,
    IN p_materia_id INT,
    IN p_contenido_id INT,
    IN p_nota DECIMAL(4,2),
    IN p_observacion TEXT
)
BEGIN
    DECLARE v_id BIGINT DEFAULT NULL;

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

    UPDATE Intensificacion
        SET Nota_obtenida = p_nota,
            Estado = CASE WHEN p_nota >= 6 THEN 'APROBADO' ELSE 'NO_APROBADO' END,
            Fecha_resolucion = CURRENT_DATE,
            Observaciones = CONCAT(IFNULL(Observaciones, ''),
                                CASE WHEN LENGTH(IFNULL(Observaciones,''))>0 THEN ' | ' ELSE '' END,
                                'Rendida: ', DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d'), ' (', p_nota, ') ', IFNULL(p_observacion,''))
    WHERE ID_intensificacion = v_id;

    UPDATE Alumnos_X_Materia
        SET Condicion = CASE WHEN p_nota >= 6 THEN 'REGULAR' ELSE 'INTENSIFICANDO' END
    WHERE Estudiante_ID_Estudiante = p_estudiante_id
        AND Materia_ID_materia = p_materia_id;
END$$

-- Procedimiento: asignar tema a intensificar rápidamente
DROP PROCEDURE IF EXISTS asignar_intensificacion$$
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

-- Procedimiento: obtener contact messages por status
DROP PROCEDURE IF EXISTS get_contact_messages_by_status$$
CREATE PROCEDURE get_contact_messages_by_status(
    IN p_status VARCHAR(20)
)
BEGIN
    SELECT 
        ID_message,
        CONCAT(first_name, ' ', last_name) as full_name,
        email,
        phone,
        subject,
        message,
        newsletter_opt,
        status,
        created_at,
        updated_at,
        admin_notes,
        replied_at,
        replied_by
    FROM contact_messages
    WHERE status = p_status
    ORDER BY created_at DESC;
END$$

-- Procedimiento: actualizar status de contact message
DROP PROCEDURE IF EXISTS update_contact_message_status$$
CREATE PROCEDURE update_contact_message_status(
    IN p_message_id INT,
    IN p_status VARCHAR(20),
    IN p_admin_notes TEXT,
    IN p_replied_by INT
)
BEGIN
    UPDATE contact_messages 
    SET 
        status = p_status,
        admin_notes = p_admin_notes,
        replied_by = p_replied_by,
        replied_at = CASE 
            WHEN p_status = 'replied' THEN CURRENT_TIMESTAMP 
            ELSE replied_at 
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE ID_message = p_message_id;
END$$

-- Procedimiento: obtener estadísticas de contact messages
DROP PROCEDURE IF EXISTS get_contact_statistics$$
CREATE PROCEDURE get_contact_statistics()
BEGIN
    SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_messages,
        COUNT(CASE WHEN status = 'read' THEN 1 END) as read_messages,
        COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied_messages,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_messages,
        COUNT(CASE WHEN newsletter_opt = TRUE THEN 1 END) as newsletter_subscribers,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as messages_last_week,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as messages_last_month,
        AVG(CASE 
            WHEN status = 'replied' AND replied_at IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, created_at, replied_at) 
        END) as avg_response_time_hours
    FROM contact_messages;
END$$

DELIMITER ;

-- =============================================================
-- PARTE 5: VISTAS
-- =============================================================

-- Vista de promedios automáticos por cuatrimestre
CREATE OR REPLACE VIEW vw_promedios_cuatrimestre AS
SELECT
    c.ID_calificacion,
    c.Estudiante_ID_Estudiante,
    c.Materia_ID_materia,
    c.cuatrimestre,
    fn_promedio_cuatrimestre(c.Estudiante_ID_Estudiante, c.Materia_ID_materia, c.cuatrimestre, 'AVANCE') AS promedio_auto_avance,
    fn_promedio_cuatrimestre(c.Estudiante_ID_Estudiante, c.Materia_ID_materia, c.cuatrimestre, 'FINAL')  AS promedio_auto_final
FROM Calificaciones_cuatrimestre c;

-- Vista resolutiva: decide si usar automático o manual según flags
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

-- Vista de alumnos intensificando
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

-- Vista de resumen de intensificación por materia
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

-- Vista de materias con escuela
CREATE OR REPLACE VIEW vista_materias_con_escuela AS
SELECT 
    m.ID_materia,
    m.Nombre AS Materia,
    m.Curso_division AS CursoDivision,
    e.Nombre AS Escuela,
    e.CUE,
    e.Localidad,
    e.Provincia,
    m.Estado
FROM Materia m
LEFT JOIN Escuela e ON e.ID_escuela = m.Escuela_ID;

-- Vista de suscripciones activas
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

-- Vista de resumen de pagos
CREATE OR REPLACE VIEW vista_pago_resumen AS
SELECT 
    s.Usuario_docente_ID AS Docente_ID,
    SUM(CASE WHEN ps.Estado = 'APROBADO' THEN ps.Monto ELSE 0 END) AS Total_aprobado,
    SUM(CASE WHEN ps.Estado = 'PENDIENTE' THEN ps.Monto ELSE 0 END) AS Total_pendiente,
    COUNT(*) AS Cantidad_pagos
FROM Suscripcion s
LEFT JOIN Pago_suscripcion ps ON ps.Suscripcion_ID = s.ID_suscripcion
GROUP BY s.Usuario_docente_ID;

-- Vista de contact message statistics
CREATE OR REPLACE VIEW contact_message_stats AS
SELECT 
    COUNT(*) as total_messages,
    COUNT(CASE WHEN status = 'new' THEN 1 END) as new_messages,
    COUNT(CASE WHEN status = 'read' THEN 1 END) as read_messages,
    COUNT(CASE WHEN status = 'replied' THEN 1 END) as replied_messages,
    COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_messages,
    COUNT(CASE WHEN newsletter_opt = TRUE THEN 1 END) as newsletter_subscribers,
    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as messages_last_week,
    COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as messages_last_month
FROM contact_messages;

-- Vista de recent contact messages
CREATE OR REPLACE VIEW recent_contact_messages AS
SELECT 
    ID_message,
    CONCAT(first_name, ' ', last_name) as full_name,
    email,
    phone,
    subject,
    LEFT(message, 100) as message_preview,
    newsletter_opt,
    status,
    created_at,
    updated_at,
    admin_notes,
    replied_at,
    replied_by
FROM contact_messages
ORDER BY created_at DESC;

-- =============================================================
-- PARTE 6: TRIGGERS
-- =============================================================

DELIMITER $$

-- Trigger para límite de materias según plan (INSERT)
DROP TRIGGER IF EXISTS trg_limite_materias_insert$$
CREATE TRIGGER trg_limite_materias_insert
    BEFORE INSERT ON Materia
    FOR EACH ROW
BEGIN
    DECLARE v_plan ENUM('ESTANDAR','PREMIUM');
    DECLARE v_cnt INT DEFAULT 0;
    DECLARE v_plan_id INT DEFAULT NULL;
    DECLARE v_limite INT DEFAULT NULL;

    SELECT Plan_actual_ID INTO v_plan_id
    FROM Usuarios_docente
    WHERE ID_docente = NEW.Usuarios_docente_ID_docente;

    IF v_plan_id IS NOT NULL THEN
        SELECT Limite_materias INTO v_limite FROM Plan WHERE ID_plan = v_plan_id;
        
        IF v_limite IS NOT NULL THEN
            SELECT COUNT(*) INTO v_cnt
            FROM Materia
            WHERE Usuarios_docente_ID_docente = NEW.Usuarios_docente_ID_docente;

            IF v_cnt >= v_limite THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Límite de materias alcanzado para el plan actual';
            END IF;
        END IF;
    ELSE
        -- Si no tiene plan, usar el enum Plan_usuario
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
    END IF;
END$$

-- Trigger para límite de materias según plan (UPDATE)
DROP TRIGGER IF EXISTS trg_limite_materias_update$$
CREATE TRIGGER trg_limite_materias_update
    BEFORE UPDATE ON Materia
    FOR EACH ROW
BEGIN
    DECLARE v_plan_u ENUM('ESTANDAR','PREMIUM');
    DECLARE v_cnt_u INT DEFAULT 0;
    DECLARE v_plan_id INT DEFAULT NULL;
    DECLARE v_limite INT DEFAULT NULL;

    IF NEW.Usuarios_docente_ID_docente <> OLD.Usuarios_docente_ID_docente THEN
        SELECT Plan_actual_ID INTO v_plan_id
        FROM Usuarios_docente
        WHERE ID_docente = NEW.Usuarios_docente_ID_docente;

        IF v_plan_id IS NOT NULL THEN
            SELECT Limite_materias INTO v_limite FROM Plan WHERE ID_plan = v_plan_id;
            
            IF v_limite IS NOT NULL THEN
                SELECT COUNT(*) INTO v_cnt_u
                FROM Materia
                WHERE Usuarios_docente_ID_docente = NEW.Usuarios_docente_ID_docente;

                IF v_cnt_u >= v_limite THEN
                    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Límite de materias alcanzado para el plan actual (transferencia)';
                END IF;
            END IF;
        ELSE
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
    END IF;
END$$

-- Trigger para actualizar updated_at en contact_messages
DROP TRIGGER IF EXISTS trg_contact_messages_update$$
CREATE TRIGGER trg_contact_messages_update
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

DELIMITER ;

-- =============================================================
-- PARTE 7: DATOS INICIALES
-- =============================================================

-- Insertar planes base
INSERT INTO Plan (Nombre, Descripcion, Precio_mensual, Activo, Limite_materias, Limite_estudiantes)
VALUES
('ESTANDAR', 'Funciones básicas del sistema', 0.00, 1, 4, 150),
('PREMIUM', 'Funciones avanzadas y sin límites prácticos', 1999.00, 1, NULL, NULL)
ON DUPLICATE KEY UPDATE Descripcion = VALUES(Descripcion), Precio_mensual = VALUES(Precio_mensual), Activo = VALUES(Activo), Limite_materias = VALUES(Limite_materias), Limite_estudiantes = VALUES(Limite_estudiantes);

-- Insertar configuración del sistema
INSERT INTO Configuracion (Clave, Valor, Descripcion, Tipo) 
VALUES 
('sistema_nombre', 'EduSync', 'Nombre del sistema', 'STRING'),
('sistema_version', '1.0.0', 'Versión del sistema', 'STRING'),
('calificacion_aprobacion', '6.0', 'Calificación mínima para aprobar', 'INTEGER'),
('asistencia_minima', '75', 'Porcentaje mínimo de asistencia requerido', 'INTEGER'),
('notificaciones_activas', 'true', 'Sistema de notificaciones activo', 'BOOLEAN')
ON DUPLICATE KEY UPDATE Valor = VALUES(Valor);

-- =============================================================
-- MENSAJE FINAL
-- =============================================================

SELECT 'EduSync instalado exitosamente!' as Mensaje,
       'Base de datos: edusync' as Base_Datos,
       'Tablas creadas: 21' as Tablas_Creadas,
       'Vistas creadas: 8' as Vistas_Creadas,
       'Funciones creadas: 2' as Funciones_Creadas,
       'Procedimientos creados: 5' as Procedimientos_Creados,
       'Triggers creados: 3' as Triggers_Creados;

