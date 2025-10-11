-- =====================================================
-- EduSync - Validaciones a Nivel de Aplicación
-- Este archivo contiene las validaciones que se deben implementar
-- en el código de la aplicación ya que las restricciones CHECK
-- con REGEXP pueden causar problemas en algunas versiones de MySQL
-- =====================================================

-- =====================================================
-- VALIDACIONES PARA USUARIOS_DOCENTE
-- =====================================================

-- 1. Validación de formato de email
-- Implementar en PHP/JavaScript:
/*
function validarEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) && 
           preg_match('/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/', $email);
}
*/

-- 2. Validación de formato de DNI
-- Implementar en PHP/JavaScript:
/*
function validarDNI($dni) {
    return preg_match('/^[0-9]{7,8}$/', $dni);
}
*/

-- 3. Validación de formato de teléfono
-- Implementar en PHP/JavaScript:
/*
function validarTelefono($telefono) {
    return preg_match('/^[0-9+\-\s\(\)]{10,20}$/', $telefono);
}
*/

-- =====================================================
-- VALIDACIONES PARA ESTUDIANTE
-- =====================================================

-- 4. Validación de formato de email de estudiante
-- Implementar en PHP/JavaScript:
/*
function validarEmailEstudiante($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) && 
           preg_match('/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/', $email);
}
*/

-- =====================================================
-- VALIDACIONES PARA CALIFICACIONES
-- =====================================================

-- 5. Validación de rango de calificaciones
-- Implementar en PHP/JavaScript:
/*
function validarCalificacion($calificacion) {
    return is_numeric($calificacion) && 
           $calificacion >= 0 && 
           $calificacion <= 10;
}
*/

-- =====================================================
-- TRIGGERS PARA VALIDACIONES EN BASE DE DATOS
-- =====================================================

-- Trigger para validar email antes de insertar/actualizar docente
DELIMITER //
CREATE TRIGGER trg_validar_email_docente_insert
    BEFORE INSERT ON Usuarios_docente
    FOR EACH ROW
BEGIN
    IF NEW.Email_docente NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Formato de email inválido';
    END IF;
END //

CREATE TRIGGER trg_validar_email_docente_update
    BEFORE UPDATE ON Usuarios_docente
    FOR EACH ROW
BEGIN
    IF NEW.Email_docente NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Formato de email inválido';
    END IF;
END //

-- Trigger para validar DNI antes de insertar/actualizar docente
CREATE TRIGGER trg_validar_dni_docente_insert
    BEFORE INSERT ON Usuarios_docente
    FOR EACH ROW
BEGIN
    IF NEW.DNI IS NOT NULL AND NEW.DNI NOT REGEXP '^[0-9]{7,8}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Formato de DNI inválido (debe ser 7-8 dígitos)';
    END IF;
END //

CREATE TRIGGER trg_validar_dni_docente_update
    BEFORE UPDATE ON Usuarios_docente
    FOR EACH ROW
BEGIN
    IF NEW.DNI IS NOT NULL AND NEW.DNI NOT REGEXP '^[0-9]{7,8}$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Formato de DNI inválido (debe ser 7-8 dígitos)';
    END IF;
END //

-- Trigger para validar calificaciones
CREATE TRIGGER trg_validar_calificacion_insert
    BEFORE INSERT ON Notas
    FOR EACH ROW
BEGIN
    IF NEW.Calificacion < 0 OR NEW.Calificacion > 10 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La calificación debe estar entre 0 y 10';
    END IF;
END //

CREATE TRIGGER trg_validar_calificacion_update
    BEFORE UPDATE ON Notas
    FOR EACH ROW
BEGIN
    IF NEW.Calificacion < 0 OR NEW.Calificacion > 10 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La calificación debe estar entre 0 y 10';
    END IF;
END //

DELIMITER ;

-- =====================================================
-- PROCEDIMIENTOS PARA VALIDACIONES
-- =====================================================

-- Procedimiento para validar datos de docente antes de insertar
DELIMITER //
CREATE PROCEDURE validar_docente(
    IN p_email VARCHAR(100),
    IN p_dni VARCHAR(20),
    IN p_telefono VARCHAR(20),
    OUT p_valido BOOLEAN,
    OUT p_mensaje VARCHAR(255)
)
BEGIN
    DECLARE v_valido BOOLEAN DEFAULT TRUE;
    DECLARE v_mensaje VARCHAR(255) DEFAULT '';
    
    -- Validar email
    IF p_email NOT REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$' THEN
        SET v_valido = FALSE;
        SET v_mensaje = 'Formato de email inválido';
    END IF;
    
    -- Validar DNI si se proporciona
    IF v_valido AND p_dni IS NOT NULL AND p_dni NOT REGEXP '^[0-9]{7,8}$' THEN
        SET v_valido = FALSE;
        SET v_mensaje = 'Formato de DNI inválido (debe ser 7-8 dígitos)';
    END IF;
    
    -- Validar teléfono si se proporciona
    IF v_valido AND p_telefono IS NOT NULL AND p_telefono NOT REGEXP '^[0-9+\\-\\s\\(\\)]{10,20}$' THEN
        SET v_valido = FALSE;
        SET v_mensaje = 'Formato de teléfono inválido';
    END IF;
    
    SET p_valido = v_valido;
    SET p_mensaje = v_mensaje;
END //

-- Procedimiento para validar calificación
CREATE PROCEDURE validar_calificacion(
    IN p_calificacion DECIMAL(4,2),
    OUT p_valido BOOLEAN,
    OUT p_mensaje VARCHAR(255)
)
BEGIN
    DECLARE v_valido BOOLEAN DEFAULT TRUE;
    DECLARE v_mensaje VARCHAR(255) DEFAULT '';
    
    IF p_calificacion < 0 OR p_calificacion > 10 THEN
        SET v_valido = FALSE;
        SET v_mensaje = 'La calificación debe estar entre 0 y 10';
    END IF;
    
    SET p_valido = v_valido;
    SET p_mensaje = v_mensaje;
END //

DELIMITER ;

-- =====================================================
-- COMENTARIOS SOBRE IMPLEMENTACIÓN
-- =====================================================

/*
NOTAS IMPORTANTES:

1. VALIDACIONES EN APLICACIÓN:
   - Implementar las funciones de validación en PHP/JavaScript
   - Validar datos antes de enviarlos a la base de datos
   - Mostrar mensajes de error amigables al usuario

2. TRIGGERS DE BASE DE DATOS:
   - Los triggers proporcionan una capa adicional de validación
   - Se ejecutan automáticamente en INSERT/UPDATE
   - Lanzan errores SQLSTATE si los datos son inválidos

3. PROCEDIMIENTOS DE VALIDACIÓN:
   - Útiles para validar datos antes de operaciones complejas
   - Retornan boolean y mensaje de error
   - Se pueden llamar desde la aplicación

4. COMPATIBILIDAD:
   - Los triggers funcionan en MySQL 5.7+ y MariaDB 10.2+
   - Las restricciones CHECK con REGEXP pueden fallar en versiones anteriores
   - Este enfoque híbrido asegura máxima compatibilidad

5. RENDIMIENTO:
   - Las validaciones en aplicación son más rápidas
   - Los triggers proporcionan seguridad adicional
   - Combinar ambos enfoques es la mejor práctica

EJEMPLO DE USO EN PHP:

// Validar docente antes de insertar
$stmt = $pdo->prepare("CALL validar_docente(?, ?, ?, @valido, @mensaje)");
$stmt->execute([$email, $dni, $telefono]);

$result = $pdo->query("SELECT @valido as valido, @mensaje as mensaje")->fetch();
if (!$result['valido']) {
    echo "Error: " . $result['mensaje'];
} else {
    // Proceder con la inserción
}
*/
