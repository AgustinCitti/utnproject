-- =====================================================
-- EduSync - Sistema de Gestión Académica
-- Esquema de Base de Datos Relacional - MySQL/MariaDB
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

-- PASO 3: Volver a habilitar verificaciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. TABLA: Usuarios_docente (Docentes)
-- =====================================================
CREATE TABLE Usuarios_docente (
    ID_docente INT AUTO_INCREMENT PRIMARY KEY,
    Nombre_docente VARCHAR(30) NOT NULL,
    Apellido_docente VARCHAR(30) NOT NULL,
    Email_docente VARCHAR(100) UNIQUE NOT NULL,
    Contraseña VARCHAR(255) NOT NULL,
    Fecha_registro DATE DEFAULT (CURRENT_DATE),
    Estado VARCHAR(20) DEFAULT 'ACTIVO'
);

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
    Estado VARCHAR(20) DEFAULT 'ACTIVO',
    Tema_estudiante_ID_Tema_estudiante INT
);

-- =====================================================
-- 3. TABLA: Materia (Materias/Asignaturas)
-- =====================================================
CREATE TABLE Materia (
    ID_materia INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Curso VARCHAR(50) NOT NULL,
    Division VARCHAR(50) NOT NULL,
    Descripcion TEXT,
    Horario VARCHAR(100),
    Aula VARCHAR(50),
    Usuarios_docente_ID_docente INT NOT NULL,
    Fecha_creacion DATE DEFAULT (CURRENT_DATE),
    Estado VARCHAR(20) DEFAULT 'ACTIVA',
    CONSTRAINT fk_materia_docente FOREIGN KEY (Usuarios_docente_ID_docente) 
        REFERENCES Usuarios_docente(ID_docente)
);

-- =====================================================
-- 4. TABLA: Alumnos_X_Materia (Relación Muchos a Muchos)
-- =====================================================
CREATE TABLE Alumnos_X_Materia (
    ID INT,
    Materia_ID_materia INT NOT NULL,
    Estudiante_ID_Estudiante INT NOT NULL,
    Fecha_inscripcion DATE DEFAULT (CURRENT_DATE),
    Estado VARCHAR(20) DEFAULT 'INSCRITO',
    PRIMARY KEY (Materia_ID_materia, Estudiante_ID_Estudiante),
    CONSTRAINT fk_alumnos_materia_materia FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia),
    CONSTRAINT fk_alumnos_materia_estudiante FOREIGN KEY (Estudiante_ID_Estudiante) 
        REFERENCES Estudiante(ID_Estudiante)
);

-- =====================================================
-- 5. TABLA: Contenido (Contenido de Materias)
-- =====================================================
CREATE TABLE Contenido (
    ID_contenido INT AUTO_INCREMENT PRIMARY KEY,
    Tema VARCHAR(150) NOT NULL,
    Descripcion TEXT,
    Estado VARCHAR(20) DEFAULT 'PENDIENTE',
    Fecha_creacion DATE DEFAULT (CURRENT_DATE),
    Fecha_actualizacion DATE,
    Materia_ID_materia INT NOT NULL,
    CONSTRAINT fk_contenido_materia FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia)
);

-- =====================================================
-- 6. TABLA: Tema_estudiante (Temas por Estudiante)
-- =====================================================
CREATE TABLE Tema_estudiante (
    ID_Tema_estudiante INT AUTO_INCREMENT PRIMARY KEY,
    Estado VARCHAR(20) DEFAULT 'PENDIENTE',
    Fecha_actualizacion DATE DEFAULT (CURRENT_DATE),
    Observaciones TEXT,
    Contenido_ID_contenido INT NOT NULL,
    CONSTRAINT fk_tema_estudiante_contenido FOREIGN KEY (Contenido_ID_contenido) 
        REFERENCES Contenido(ID_contenido)
);

-- =====================================================
-- 7. TABLA: Asistencia (Control de Asistencia)
-- =====================================================
CREATE TABLE Asistencia (
    ID_Asistencia INT AUTO_INCREMENT PRIMARY KEY,
    Fecha DATE NOT NULL,
    Presente CHAR(1) CHECK (Presente IN ('Y', 'N', 'T')), -- Y=Presente, N=Ausente, T=Tarde
    Observaciones TEXT,
    Materia_ID_materia INT NOT NULL,
    Estudiante_ID_Estudiante INT NOT NULL,
    Fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_asistencia_materia FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia),
    CONSTRAINT fk_asistencia_estudiante FOREIGN KEY (Estudiante_ID_Estudiante) 
        REFERENCES Estudiante(ID_Estudiante)
);

-- =====================================================
-- 8. TABLA: Evaluacion (Evaluaciones/Exámenes)
-- =====================================================
CREATE TABLE Evaluacion (
    ID_evaluacion INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(100) NOT NULL,
    Descripcion TEXT,
    Fecha DATE NOT NULL,
    Tipo VARCHAR(50) NOT NULL, -- EXAMEN, PARCIAL, TRABAJO_PRACTICO, etc.
    Peso DECIMAL(3,2) DEFAULT 1.00, -- Peso de la evaluación (0.00 a 9.99)
    Materia_ID_materia INT NOT NULL,
    Contenido_ID_contenido INT NULL,
    Fecha_creacion DATE DEFAULT (CURRENT_DATE),
    Estado VARCHAR(20) DEFAULT 'PROGRAMADA',
    CONSTRAINT fk_evaluacion_materia FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia),
    CONSTRAINT fk_evaluacion_contenido FOREIGN KEY (Contenido_ID_contenido)
        REFERENCES Contenido(ID_contenido)
);

-- =====================================================
-- 9. TABLA: Notas (Calificaciones)
-- =====================================================
CREATE TABLE Notas (
    ID_Nota INT AUTO_INCREMENT PRIMARY KEY,
    Calificacion DECIMAL(4,2) CHECK (Calificacion >= 0 AND Calificacion <= 10), -- 0.00 a 10.00
    Observacion TEXT,
    Fecha_calificacion DATE DEFAULT (CURRENT_DATE),
    Evaluacion_ID_evaluacion INT NOT NULL,
    Estudiante_ID_Estudiante INT NOT NULL,
    CONSTRAINT fk_notas_evaluacion FOREIGN KEY (Evaluacion_ID_evaluacion) 
        REFERENCES Evaluacion(ID_evaluacion),
    CONSTRAINT fk_notas_estudiante FOREIGN KEY (Estudiante_ID_Estudiante) 
        REFERENCES Estudiante(ID_Estudiante)
);

-- =====================================================
-- 10. TABLA: Archivos (Archivos de Materias)
-- =====================================================
CREATE TABLE Archivos (
    ID_archivos INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Ruta VARCHAR(255) NOT NULL,
    Tipo VARCHAR(50) NOT NULL, -- PDF, DOCX, XLSX, etc.
    Tamaño INT, -- Tamaño en bytes
    Materia_ID_materia INT NOT NULL,
    Fecha_subida DATE DEFAULT (CURRENT_DATE),
    Descripcion TEXT,
    CONSTRAINT fk_archivos_materia FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia)
);

-- =====================================================
-- 11. TABLA: Recordatorio (Recordatorios)
-- =====================================================
CREATE TABLE Recordatorio (
    ID_recordatorio INT AUTO_INCREMENT PRIMARY KEY,
    Descripcion TEXT NOT NULL,
    Fecha DATE NOT NULL,
    Tipo VARCHAR(50) NOT NULL, -- EXAMEN, ENTREGA, REUNION, etc.
    Prioridad VARCHAR(20) DEFAULT 'MEDIA', -- ALTA, MEDIA, BAJA
    Materia_ID_materia INT NOT NULL,
    Fecha_creacion DATE DEFAULT (CURRENT_DATE),
    Estado VARCHAR(20) DEFAULT 'PENDIENTE',
    CONSTRAINT fk_recordatorio_materia FOREIGN KEY (Materia_ID_materia) 
        REFERENCES Materia(ID_materia)
);

-- =====================================================
-- 12. TABLA: Notificaciones (Sistema de Notificaciones)
-- =====================================================
CREATE TABLE Notificaciones (
    ID_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    Titulo VARCHAR(200) NOT NULL,
    Mensaje TEXT NOT NULL,
    Tipo VARCHAR(50) NOT NULL, -- INFO, WARNING, ERROR, SUCCESS
    Destinatario_tipo VARCHAR(20) NOT NULL, -- DOCENTE, ESTUDIANTE, TODOS
    Destinatario_id INT,
    Fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Fecha_leida TIMESTAMP,
    Estado VARCHAR(20) DEFAULT 'NO_LEIDA'
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_estudiante_nombre ON Estudiante(Nombre, Apellido);
CREATE INDEX idx_materia_docente ON Materia(Usuarios_docente_ID_docente);
CREATE INDEX idx_asistencia_fecha ON Asistencia(Fecha);
CREATE INDEX idx_asistencia_estudiante ON Asistencia(Estudiante_ID_Estudiante);
CREATE INDEX idx_notas_estudiante ON Notas(Estudiante_ID_Estudiante);
CREATE INDEX idx_evaluacion_fecha ON Evaluacion(Fecha);
CREATE INDEX idx_recordatorio_fecha ON Recordatorio(Fecha);

-- =====================================================
-- NOTA: MySQL usa AUTO_INCREMENT en lugar de secuencias
-- Las tablas ya están configuradas con AUTO_INCREMENT
-- =====================================================

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Insertar docentes de ejemplo
INSERT INTO Usuarios_docente (Nombre_docente, Apellido_docente, Email_docente, Contraseña) 
VALUES ('María', 'González', 'maria.gonzalez@utn.edu.ar', 'password123');

INSERT INTO Usuarios_docente (Nombre_docente, Apellido_docente, Email_docente, Contraseña) 
VALUES ('Carlos', 'Rodríguez', 'carlos.rodriguez@utn.edu.ar', 'password123');

-- Insertar estudiantes de ejemplo
INSERT INTO Estudiante (Apellido, Nombre, Email, Fecha_nacimiento) 
VALUES ('Pérez', 'Juan', 'juan.perez@estudiante.utn.edu.ar', '2000-05-15');

INSERT INTO Estudiante (Apellido, Nombre, Email, Fecha_nacimiento) 
VALUES ('López', 'Ana', 'ana.lopez@estudiante.utn.edu.ar', '1999-08-22');

-- Insertar materias de ejemplo
INSERT INTO Materia (Nombre, Curso, Division, Descripcion, Usuarios_docente_ID_docente) 
VALUES ('Matemática I', '1er Año', 'División A', 'Álgebra y Geometría Analítica', 1);

INSERT INTO Materia (Nombre, Curso, Division, Descripcion, Usuarios_docente_ID_docente) 
VALUES ('Física I', '1er Año', 'División A', 'Mecánica Clásica', 2);

-- Insertar relación estudiantes-materias
INSERT INTO Alumnos_X_Materia (Materia_ID_materia, Estudiante_ID_Estudiante) 
VALUES (1, 1);

INSERT INTO Alumnos_X_Materia (Materia_ID_materia, Estudiante_ID_Estudiante) 
VALUES (1, 2);

INSERT INTO Alumnos_X_Materia (Materia_ID_materia, Estudiante_ID_Estudiante) 
VALUES (2, 1);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para información completa de estudiantes
CREATE OR REPLACE VIEW vista_estudiantes_completa AS
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
CREATE OR REPLACE VIEW vista_materias_docente AS
SELECT 
    m.ID_materia,
    m.Nombre as Materia_Nombre,
    m.Curso,
    m.Division,
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
GROUP BY m.ID_materia, m.Nombre, m.Curso, m.Division, m.Descripcion, m.Horario, m.Aula, 
         ud.Nombre_docente, ud.Apellido_docente, ud.Email_docente;

-- Vista para calificaciones con información completa
CREATE OR REPLACE VIEW vista_calificaciones_completa AS
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

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- =====================================================

-- Procedimiento para calcular promedio de un estudiante en una materia
DELIMITER //
CREATE PROCEDURE calcular_promedio_estudiante(
    IN p_estudiante_id INT,
    IN p_materia_id INT,
    OUT p_promedio DECIMAL(4,2)
)
BEGIN
    SELECT AVG(n.Calificacion)
    INTO p_promedio
    FROM Notas n
    JOIN Evaluacion ev ON n.Evaluacion_ID_evaluacion = ev.ID_evaluacion
    WHERE n.Estudiante_ID_Estudiante = p_estudiante_id
    AND ev.Materia_ID_materia = p_materia_id;
    
    IF p_promedio IS NULL THEN
        SET p_promedio = 0;
    END IF;
END //
DELIMITER ;

-- Procedimiento para marcar asistencia masiva
-- NOTA: Este procedimiento requiere implementación más compleja en MySQL
-- Se deja como referencia, puede necesitarse usar cursores o tablas temporales
-- DELIMITER //
-- CREATE PROCEDURE marcar_asistencia_masiva(...)
-- BEGIN
--     -- Implementación pendiente
-- END //
-- DELIMITER ;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

/*
Este esquema de base de datos está diseñado para el sistema EduSync de gestión académica.

CARACTERÍSTICAS PRINCIPALES:
- Soporte completo para gestión de estudiantes, docentes y materias
- Sistema de calificaciones con cálculos automáticos
- Control de asistencia detallado
- Gestión de contenido y archivos
- Sistema de notificaciones y recordatorios
- Optimizado para consultas frecuentes con índices apropiados
- Auto-incremento de IDs usando AUTO_INCREMENT
- Vistas para consultas complejas comunes
- Procedimientos almacenados para operaciones frecuentes

NOTAS TÉCNICAS:
- Diseñado para MySQL/MariaDB (compatible con XAMPP)
- Usa AUTO_INCREMENT para IDs automáticos
- Tipos de datos: VARCHAR, TEXT, DECIMAL, INT, DATE, TIMESTAMP
- Compatible con MySQL 5.7+ y MariaDB 10.2+
- Charset: utf8mb4 para soporte completo de Unicode
*/
