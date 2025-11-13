<?php
/**
 * Script para ejecutar ALTER TABLE y agregar columna Contenido_ID_contenido a Evaluacion
 */

require_once __DIR__ . '/../../config/database.php';

try {
    // Crear conexión
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Verificar conexión
    if ($conn->connect_error) {
        die("Error de conexión: " . $conn->connect_error);
    }
    
    // Configurar charset
    $conn->set_charset(DB_CHARSET);
    
    echo "Ejecutando ALTER TABLE...\n";
    
    // Verificar si la columna ya existe
    $checkColumn = "SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = '" . DB_NAME . "' 
                    AND TABLE_NAME = 'Evaluacion' 
                    AND COLUMN_NAME = 'Contenido_ID_contenido'";
    
    $result = $conn->query($checkColumn);
    
    if ($result->num_rows > 0) {
        echo "La columna Contenido_ID_contenido ya existe en la tabla Evaluacion.\n";
    } else {
        // Ejecutar ALTER TABLE
        $sql = "ALTER TABLE Evaluacion 
                ADD COLUMN Contenido_ID_contenido INT NULL AFTER Materia_ID_materia";
        
        if ($conn->query($sql) === TRUE) {
            echo "✓ Columna Contenido_ID_contenido agregada exitosamente.\n";
        } else {
            echo "✗ Error al agregar la columna: " . $conn->error . "\n";
        }
    }
    
    // Verificar y agregar índice si no existe
    $checkIndex = "SELECT INDEX_NAME 
                   FROM INFORMATION_SCHEMA.STATISTICS 
                   WHERE TABLE_SCHEMA = '" . DB_NAME . "' 
                   AND TABLE_NAME = 'Evaluacion' 
                   AND INDEX_NAME = 'idx_contenido_evaluacion'";
    
    $result = $conn->query($checkIndex);
    
    if ($result->num_rows == 0) {
        echo "Agregando índice idx_contenido_evaluacion...\n";
        $sqlIndex = "ALTER TABLE Evaluacion
                     ADD INDEX idx_contenido_evaluacion (Contenido_ID_contenido)";
        
        if ($conn->query($sqlIndex) === TRUE) {
            echo "✓ Índice agregado exitosamente.\n";
        } else {
            echo "✗ Error al agregar el índice: " . $conn->error . "\n";
        }
    } else {
        echo "El índice idx_contenido_evaluacion ya existe.\n";
    }
    
    // Verificar y agregar foreign key si no existe
    $checkFK = "SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                WHERE TABLE_SCHEMA = '" . DB_NAME . "' 
                AND TABLE_NAME = 'Evaluacion' 
                AND CONSTRAINT_NAME = 'fk_evaluacion_contenido'";
    
    $result = $conn->query($checkFK);
    
    if ($result->num_rows == 0) {
        echo "Agregando foreign key fk_evaluacion_contenido...\n";
        $sqlFK = "ALTER TABLE Evaluacion
                  ADD CONSTRAINT fk_evaluacion_contenido 
                  FOREIGN KEY (Contenido_ID_contenido) 
                  REFERENCES Contenido(ID_contenido)
                  ON DELETE SET NULL 
                  ON UPDATE CASCADE";
        
        if ($conn->query($sqlFK) === TRUE) {
            echo "✓ Foreign key agregada exitosamente.\n";
        } else {
            echo "✗ Error al agregar la foreign key: " . $conn->error . "\n";
        }
    } else {
        echo "La foreign key fk_evaluacion_contenido ya existe.\n";
    }
    
    $conn->close();
    echo "\nProceso completado.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>

