<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Roadmap;
use App\Models\RoadmapStatistics;
use Illuminate\Support\Facades\Storage;

class ExportRoadmapDatasetML extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ml:export-dataset {--format=csv : Export format (csv or parquet)} {--output= : Output filename}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export roadmap statistics dataset for Machine Learning training';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $format = $this->option('format');
        $outputFile = $this->option('output');

        $this->info('Exportando dataset de roadmaps para Machine Learning...');
        $this->newLine();

        // Obtener todos los roadmaps con sus estadísticas
        $roadmaps = Roadmap::with('statistics')
            ->whereHas('statistics')
            ->get();

        if ($roadmaps->isEmpty()) {
            $this->error('No se encontraron roadmaps con estadísticas.');
            $this->info('Ejecuta primero: php artisan db:seed --class=RoadmapSeeder');
            return 1;
        }

        $this->info("Encontrados {$roadmaps->count()} roadmaps con estadísticas");

        // Preparar datos
        $data = $roadmaps->map(function ($roadmap) {
            $s = $roadmap->statistics;
            
            // Calcular métricas derivadas
            $completionRate = $s->completion_count / max(1, $s->completion_count + $s->dropout_count);
            $efficiencyRate = $s->avg_nodes_completed / max(1, $s->avg_hours_spent);
            $engagementScore = $s->bookmark_count * $s->usefulness_score;
            $dropoutRate = $s->dropout_count / max(1, $s->completion_count + $s->dropout_count);

            return [
                'roadmap_id' => $roadmap->roadmap_id,
                'name' => $roadmap->name,
                'tags' => $roadmap->tags,
                'completion_count' => $s->completion_count,
                'dropout_count' => $s->dropout_count,
                'avg_hours_spent' => (float) $s->avg_hours_spent,
                'avg_nodes_completed' => (float) $s->avg_nodes_completed,
                'bookmark_count' => $s->bookmark_count,
                'usefulness_score' => (float) $s->usefulness_score,
                // Métricas derivadas
                'completion_rate' => round($completionRate, 4),
                'dropout_rate' => round($dropoutRate, 4),
                'efficiency_rate' => round($efficiencyRate, 4),
                'engagement_score' => round($engagementScore, 2),
                'created_at' => $roadmap->created_at->toDateTimeString(),
            ];
        });

        // Exportar según formato
        if ($format === 'csv') {
            $this->exportToCsv($data, $outputFile);
        } elseif ($format === 'parquet') {
            $this->exportToParquet($data, $outputFile);
        } else {
            $this->error("Formato no válido: {$format}");
            $this->info("Usa --format=csv o --format=parquet");
            return 1;
        }

        return 0;
    }

    /**
     * Export data to CSV format
     */
    private function exportToCsv($data, $outputFile = null)
    {
        $filename = $outputFile ?: 'ml_dataset_roadmaps_' . date('Y-m-d_His') . '.csv';
        
        $this->info('Exportando a CSV...');

        // Crear CSV
        $csv = '';
        
        // Header
        if ($data->isNotEmpty()) {
            $headers = array_keys($data->first());
            $csv .= implode(',', $headers) . "\n";
        }

        // Rows
        foreach ($data as $row) {
            $values = array_map(function($value) {
                // Escapar comillas y envolver en comillas si contiene comas
                if (is_string($value) && (strpos($value, ',') !== false || strpos($value, '"') !== false)) {
                    return '"' . str_replace('"', '""', $value) . '"';
                }
                return $value;
            }, array_values($row));
            
            $csv .= implode(',', $values) . "\n";
        }

        // Guardar archivo en storage/app/private/ (el disco 'local' ya apunta a private)
        Storage::disk('local')->put($filename, $csv);
        $path = Storage::disk('local')->path($filename);

        $this->newLine();
        $this->info("Dataset exportado exitosamente!");
        $this->info("Ubicación: {$path}");
        $this->info("Total de registros: " . $data->count());
        $this->info("Tamaño: " . $this->formatBytes(strlen($csv)));
        $this->newLine();
        
        $this->info("Para usar en Python:");
        $this->line("   import pandas as pd");
        $this->line("   df = pd.read_csv('{$path}')");
        $this->line("   print(df.head())");
    }

    /**
     * Export data to Parquet format (requires Python)
     */
    private function exportToParquet($data, $outputFile = null)
    {
        $csvFilename = 'temp_ml_dataset_' . date('Y-m-d_His') . '.csv';
        $parquetFilename = $outputFile ?: 'ml_dataset_roadmaps_' . date('Y-m-d_His') . '.parquet';
        
        $this->info('Exportando a Parquet...');
        
        // Primero exportar a CSV temporal
        $csv = '';
        if ($data->isNotEmpty()) {
            $headers = array_keys($data->first());
            $csv .= implode(',', $headers) . "\n";
        }

        foreach ($data as $row) {
            $values = array_map(function($value) {
                if (is_string($value) && (strpos($value, ',') !== false || strpos($value, '"') !== false)) {
                    return '"' . str_replace('"', '""', $value) . '"';
                }
                return $value;
            }, array_values($row));
            
            $csv .= implode(',', $values) . "\n";
        }

        Storage::put($csvFilename, $csv);
        $csvPath = Storage::path($csvFilename);
        $parquetPath = Storage::path($parquetFilename);

        // Crear script Python para convertir a Parquet
        $pythonScript = <<<PYTHON
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

# Leer CSV
df = pd.read_csv('{$csvPath}')

# Guardar como Parquet
df.to_parquet('{$parquetPath}', engine='pyarrow', compression='snappy')

print(f"✓ Archivo Parquet creado: {$parquetPath}")
print(f"✓ Registros: {len(df)}")
PYTHON;

        $scriptPath = Storage::path('convert_to_parquet.py');
        file_put_contents($scriptPath, $pythonScript);

        $this->newLine();
        $this->info("Script de conversión creado: {$scriptPath}");
        $this->info("Ejecuta el siguiente comando para generar el archivo Parquet:");
        $this->line("   python {$scriptPath}");
        $this->newLine();
        $this->info("Requisitos de Python:");
        $this->line("   pip install pandas pyarrow");
        $this->newLine();
        
        // Intentar ejecutar Python si está disponible
        $this->info("Intentando convertir automáticamente...");
        $output = [];
        $returnCode = 0;
        exec("python \"{$scriptPath}\" 2>&1", $output, $returnCode);
        
        if ($returnCode === 0) {
            $this->info("Conversión exitosa!");
            $this->info("Archivo Parquet: {$parquetPath}");
            
            // Limpiar CSV temporal
            Storage::delete($csvFilename);
            $this->info("Archivo temporal eliminado");
        } else {
            $this->warn("No se pudo ejecutar Python automáticamente");
            $this->info("Ejecuta manualmente: python {$scriptPath}");
        }
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
