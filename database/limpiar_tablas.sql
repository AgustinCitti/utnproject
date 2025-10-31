-- =====================================================
-- Script de Limpieza - Eliminar todas las tablas
-- Ejecutar ESTE script ANTES de ejecutar database_schema.sql
-- =====================================================

USE edusync;

-- IMPORTANTE: Deshabilitar verificaciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar todas las tablas (en cualquier orden)
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
DROP TABLE IF EXISTS Contacto_mensajes;
DROP TABLE IF EXISTS Configuracion;

-- IMPORTANTE: Volver a habilitar verificaciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Confirmación
SELECT 'Todas las tablas han sido eliminadas correctamente' AS Mensaje;


