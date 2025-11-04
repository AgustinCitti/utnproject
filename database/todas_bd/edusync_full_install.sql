-- =============================================================
-- Instalador único de EduSync (todo en uno)
-- Crea la BD base y aplica todas las extensiones requeridas.
-- Orden seguro para ejecutar end-to-end.
-- =============================================================

-- Crear/usar base
CREATE DATABASE IF NOT EXISTS edusync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edusync;

-- 1) Esquema base (tablas principales, vistas y SPs)
SOURCE ./database_proyecto_mysql.sql;

-- 2) Calificaciones por cuatrimestre, función de promedios y cierres TED/TEP/TEA
SOURCE ./grades_schema.sql;

-- 3) Estado del alumno por materia e Intensificación (tabla, vistas y SPs)
SOURCE ./student_status_intensificacion.sql;

-- 4) Suscripciones (planes, suscripciones y pagos)
SOURCE ./subscriptions_schema.sql;

-- 5) Google OAuth (columnas en Usuarios_docente)
SOURCE ./add_google_oauth.sql;

-- 6) Escuela y vínculo en Materia + vista de materias por escuela
SOURCE ./add_escuela_materia.sql;

-- 7) Regla de unicidad para diferenciar materias por escuela
ALTER TABLE Materia
  ADD UNIQUE KEY uq_materia_escuela (Escuela_ID, Nombre, Curso_division);

-- Listo. Ejecutar este archivo para instalar todo.


