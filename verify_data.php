<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Roadmap;
use App\Models\RoadmapStatistics;
use App\Models\User;
use App\Models\Node;

echo "=== VERIFICACIÓN DE DATOS ===\n\n";

echo "Conteo de registros:\n";
echo "  - Roadmaps: " . Roadmap::count() . "\n";
echo "  - Estadísticas: " . RoadmapStatistics::count() . "\n";
echo "  - Usuarios: " . User::count() . "\n";
echo "  - Nodos: " . Node::count() . "\n\n";

echo "Ejemplo de roadmap con estadísticas:\n";
$roadmap = Roadmap::with('statistics')->first();
if ($roadmap && $roadmap->statistics) {
    echo "  Nombre: {$roadmap->name}\n";
    echo "  Tags: {$roadmap->tags}\n";
    echo "  Completados: {$roadmap->statistics->completion_count}\n";
    echo "  Abandonos: {$roadmap->statistics->dropout_count}\n";
    echo "  Horas promedio: {$roadmap->statistics->avg_hours_spent}\n";
    echo "  Nodos completados: {$roadmap->statistics->avg_nodes_completed}\n";
    echo "  Bookmarks: {$roadmap->statistics->bookmark_count}\n";
    echo "  Utilidad: {$roadmap->statistics->usefulness_score}\n\n";
}

echo "Top 5 roadmaps por completion rate:\n";
$topRoadmaps = Roadmap::with('statistics')
    ->whereHas('statistics')
    ->get()
    ->map(function ($r) {
        $s = $r->statistics;
        $completionRate = $s->completion_count / max(1, $s->completion_count + $s->dropout_count);
        return [
            'name' => $r->name,
            'completion_rate' => $completionRate,
            'usefulness' => $s->usefulness_score,
        ];
    })
    ->sortByDesc('completion_rate')
    ->take(5);

foreach ($topRoadmaps as $index => $roadmap) {
    $num = $index + 1;
    echo "  {$num}. {$roadmap['name']}\n";
    echo "     Completion Rate: " . round($roadmap['completion_rate'] * 100, 2) . "%\n";
    echo "     Utilidad: {$roadmap['usefulness']}/5\n";
}

echo "\nDatos verificados correctamente!\n";
