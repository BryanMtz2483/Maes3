<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Roadmap;

echo "=== VERIFICACIÓN DE IMÁGENES ===\n\n";

$roadmaps = Roadmap::all();

$withImages = $roadmaps->filter(fn($r) => !empty($r->cover_image))->count();
$withoutImages = $roadmaps->filter(fn($r) => empty($r->cover_image))->count();

echo "Estadísticas de imágenes:\n";
echo "  - Total roadmaps: " . $roadmaps->count() . "\n";
echo "  - Con imagen: {$withImages}\n";
echo "  - Sin imagen: {$withoutImages}\n\n";

echo "Ejemplos de roadmaps con imágenes:\n";
$samples = $roadmaps->filter(fn($r) => !empty($r->cover_image))->take(5);

foreach ($samples as $index => $roadmap) {
    $num = $index + 1;
    echo "  {$num}. {$roadmap->name}\n";
    echo "     Imagen: {$roadmap->cover_image}\n";
}

echo "\nVerificación completada!\n";
