<?php

/**
 * Script de prueba para IA Tutor
 * Ejecutar: php test_ia_tutor.php
 */

// Simular la ejecución del comando Python
$datasetPath = 'storage/app/private/ml_dataset_roadmaps_2025-11-16_003520.csv';
$pythonScript = 'ml_example/roadmap_recommender.py';
$tag = 'vue';

echo "=== Test IA Tutor ===\n\n";

// 1. Verificar que Python está instalado
echo "1. Verificando Python...\n";
exec('python --version 2>&1', $pythonVersion);
echo "   " . implode("\n   ", $pythonVersion) . "\n\n";

// 2. Verificar que el script existe
echo "2. Verificando script Python...\n";
if (file_exists($pythonScript)) {
    echo "   Script encontrado: $pythonScript\n\n";
} else {
    echo "   Script NO encontrado: $pythonScript\n\n";
    exit(1);
}

// 3. Verificar que el dataset existe
echo "3. Verificando dataset...\n";
if (file_exists($datasetPath)) {
    echo "   Dataset encontrado: $datasetPath\n\n";
} else {
    echo "   Dataset NO encontrado: $datasetPath\n\n";
    exit(1);
}

// 4. Ejecutar el comando Python
echo "4. Ejecutando análisis ML...\n";
$command = sprintf(
    'python "%s" "%s" "%s" 2>&1',
    $pythonScript,
    $datasetPath,
    $tag
);

echo "   Comando: $command\n\n";

exec($command, $output, $returnCode);
$result = implode("\n", $output);

echo "   Return code: $returnCode\n";
echo "   Output:\n";
echo "   " . str_replace("\n", "\n   ", $result) . "\n\n";

// 5. Parsear resultado
echo "5. Parseando resultado JSON...\n";
$recommendation = json_decode($result, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo "   Error al parsear JSON: " . json_last_error_msg() . "\n\n";
    exit(1);
}

if (isset($recommendation['error'])) {
    echo "   Error en la recomendación: " . $recommendation['error'] . "\n\n";
    exit(1);
}

echo "   JSON parseado correctamente\n\n";

// 6. Mostrar resultado
echo "6. Resultado:\n";
echo "   Roadmap: " . $recommendation['name'] . "\n";
echo "   Score: " . ($recommendation['quality_score'] * 100) . "%\n";
echo "   Modelo: " . $recommendation['model_type'] . "\n";
echo "   Arquitectura: " . $recommendation['architecture'] . "\n";
echo "   Activación: " . $recommendation['activation'] . "\n";
echo "   Optimizador: " . $recommendation['optimizer'] . "\n\n";

echo "=== Test EXITOSO ===\n";
