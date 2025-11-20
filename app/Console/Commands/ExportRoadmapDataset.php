<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Roadmap;
use Illuminate\Support\Facades\Storage;

class ExportRoadmapDataset extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'roadmap:export-dataset {--format=csv : Format to export (csv or json)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export roadmap statistics dataset for machine learning';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $format = $this->option('format');
        
        $this->info('Fetching roadmap data...');
        
        $roadmaps = Roadmap::with('statistics')->get();
        
        if ($roadmaps->isEmpty()) {
            $this->error('No roadmaps found. Please run the seeder first: php artisan db:seed --class=RoadmapSeeder');
            return 1;
        }

        $this->info("Found {$roadmaps->count()} roadmaps with statistics.");

        if ($format === 'csv') {
            $this->exportToCsv($roadmaps);
        } elseif ($format === 'json') {
            $this->exportToJson($roadmaps);
        } else {
            $this->error('Invalid format. Use --format=csv or --format=json');
            return 1;
        }

        return 0;
    }

    /**
     * Export data to CSV format
     */
    private function exportToCsv($roadmaps)
    {
        $csv = "roadmap_id,name,tags,completion_count,dropout_count,avg_hours_spent,avg_nodes_completed,bookmark_count,usefulness_score,completion_rate,efficiency_rate\n";

        foreach ($roadmaps as $roadmap) {
            $s = $roadmap->statistics;
            
            if (!$s) {
                continue;
            }

            // Calcular métricas derivadas
            $completionRate = $s->completion_count / max(1, $s->completion_count + $s->dropout_count);
            $efficiencyRate = $s->avg_nodes_completed / max(1, $s->avg_hours_spent);

            $csv .= sprintf(
                '"%s","%s","%s",%d,%d,%.2f,%.2f,%d,%.2f,%.4f,%.4f' . "\n",
                $roadmap->roadmap_id,
                str_replace('"', '""', $roadmap->name),
                str_replace('"', '""', $roadmap->tags ?? ''),
                $s->completion_count,
                $s->dropout_count,
                $s->avg_hours_spent,
                $s->avg_nodes_completed,
                $s->bookmark_count,
                $s->usefulness_score,
                $completionRate,
                $efficiencyRate
            );
        }

        $filename = 'roadmaps_ml_dataset_' . date('Y-m-d_His') . '.csv';
        Storage::put($filename, $csv);

        $path = Storage::path($filename);
        $this->info("Dataset exported to: {$path}");
        $this->info("  Total records: " . ($roadmaps->count()));
    }

    /**
     * Export data to JSON format
     */
    private function exportToJson($roadmaps)
    {
        $data = $roadmaps->map(function ($roadmap) {
            $s = $roadmap->statistics;
            
            if (!$s) {
                return null;
            }

            // Calcular métricas derivadas
            $completionRate = $s->completion_count / max(1, $s->completion_count + $s->dropout_count);
            $efficiencyRate = $s->avg_nodes_completed / max(1, $s->avg_hours_spent);

            return [
                'roadmap_id' => $roadmap->roadmap_id,
                'name' => $roadmap->name,
                'tags' => $roadmap->tags,
                'statistics' => [
                    'completion_count' => $s->completion_count,
                    'dropout_count' => $s->dropout_count,
                    'avg_hours_spent' => (float) $s->avg_hours_spent,
                    'avg_nodes_completed' => (float) $s->avg_nodes_completed,
                    'bookmark_count' => $s->bookmark_count,
                    'usefulness_score' => (float) $s->usefulness_score,
                ],
                'derived_metrics' => [
                    'completion_rate' => round($completionRate, 4),
                    'efficiency_rate' => round($efficiencyRate, 4),
                    'engagement_score' => $s->bookmark_count * (float) $s->usefulness_score,
                ],
            ];
        })->filter();

        $filename = 'roadmaps_ml_dataset_' . date('Y-m-d_His') . '.json';
        Storage::put($filename, $data->toJson(JSON_PRETTY_PRINT));

        $path = Storage::path($filename);
        $this->info("Dataset exported to: {$path}");
        $this->info("  Total records: " . $data->count());
    }
}
