<?php
/**
 * Script para ejecutar ALTER TABLE y agregar columna Curso_ID_curso a Estudiante
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
    
    echo "Ejecutando migración para agregar Curso_ID_curso a Estudiante...\n\n";
    
    // Verificar si la columna ya existe
    $checkColumn = "SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = '" . DB_NAME . "' 
                    AND TABLE_NAME = 'Estudiante' 
                    AND COLUMN_NAME = 'Curso_ID_curso'";
    
    $result = $conn->query($checkColumn);
    
    if ($result->num_rows > 0) {
        echo "La columna Curso_ID_curso ya existe en la tabla Estudiante.\n";
    } else {
        // Ejecutar ALTER TABLE
        $sql = "ALTER TABLE Estudiante 
                ADD COLUMN Curso_ID_curso INT NULL AFTER INTENSIFICA";
        
        if ($conn->query($sql) === TRUE) {
            echo "✓ Columna Curso_ID_curso agregada exitosamente.\n";
        } else {
            echo "✗ Error al agregar la columna: " . $conn->error . "\n";
            $conn->close();
            exit(1);
        }
    }
    
    // Verificar y agregar índice si no existe
    $checkIndex = "SELECT INDEX_NAME 
                   FROM INFORMATION_SCHEMA.STATISTICS 
                   WHERE TABLE_SCHEMA = '" . DB_NAME . "' 
                   AND TABLE_NAME = 'Estudiante' 
                   AND INDEX_NAME = 'idx_estudiante_curso'";
    
    $result = $conn->query($checkIndex);
    
    if ($result->num_rows == 0) {
        echo "Agregando índice idx_estudiante_curso...\n";
        $sqlIndex = "ALTER TABLE Estudiante
                     ADD INDEX idx_estudiante_curso (Curso_ID_curso)";
        
        if ($conn->query($sqlIndex) === TRUE) {
            echo "✓ Índice agregado exitosamente.\n";
        } else {
            echo "✗ Error al agregar el índice: " . $conn->error . "\n";
        }
    } else {
        echo "El índice idx_estudiante_curso ya existe.\n";
    }
    
    // Verificar y agregar foreign key si no existe
    $checkFK = "SELECT CONSTRAINT_NAME 
                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                WHERE TABLE_SCHEMA = '" . DB_NAME . "' 
                AND TABLE_NAME = 'Estudiante' 
                AND CONSTRAINT_NAME = 'fk_estudiante_curso'";
    
    $result = $conn->query($checkFK);
    
    if ($result->num_rows == 0) {
        echo "Agregando foreign key fk_estudiante_curso...\n";
        $sqlFK = "ALTER TABLE Estudiante
                  ADD CONSTRAINT fk_estudiante_curso 
                  FOREIGN KEY (Curso_ID_curso) 
                  REFERENCES Curso(ID_curso)
                  ON DELETE SET NULL 
                  ON UPDATE CASCADE";
        
        if ($conn->query($sqlFK) === TRUE) {
            echo "✓ Foreign key agregada exitosamente.\n";
        } else {
            echo "✗ Error al agregar la foreign key: " . $conn->error . "\n";
            echo "Nota: Esto puede ocurrir si hay datos que no cumplen la restricción.\n";
        }
    } else {
        echo "La foreign key fk_estudiante_curso ya existe.\n";
    }
    
    // Migrar datos existentes: asignar curso basado en las materias del estudiante
    echo "\nMigrando datos existentes...\n";
    $migrateSQL = "UPDATE Estudiante e
                    INNER JOIN Alumnos_X_Materia axm ON e.ID_Estudiante = axm.Estudiante_ID_Estudiante
                    INNER JOIN Materia m ON axm.Materia_ID_materia = m.ID_materia
                    INNER JOIN Curso c ON m.Curso_division = c.Curso_division 
                        AND m.Usuarios_docente_ID_docente = c.Usuarios_docente_ID_docente
                    SET e.Curso_ID_curso = c.ID_curso
                    WHERE e.Curso_ID_curso IS NULL";
    
    if ($conn->query($migrateSQL) === TRUE) {
        $affected = $conn->affected_rows;
        echo "✓ Se actualizaron $affected estudiantes con su curso correspondiente.\n";
    } else {
        echo "✗ Error al migrar datos: " . $conn->error . "\n";
    }
    
    $conn->close();
    echo "\n✓ Proceso completado exitosamente.\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>

