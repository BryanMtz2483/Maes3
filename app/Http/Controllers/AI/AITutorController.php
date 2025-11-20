<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use App\Models\Roadmap;
use App\Models\Reaction;
use App\Models\NodeProgress;

class AITutorController extends Controller
{
    /**
     * Generar dataset fresco eliminando los antiguos
     */
    private function generateFreshDataset()
    {
        \Log::info('Generando dataset fresco con datos actuales...');
        
        // ELIMINAR todos los datasets antiguos
        $allFiles = Storage::disk('local')->files();
        $oldDatasetFiles = array_filter($allFiles, function($file) {
            return strpos($file, 'ml_dataset_roadmaps_') !== false && 
                   pathinfo($file, PATHINFO_EXTENSION) === 'csv';
        });
        
        foreach ($oldDatasetFiles as $oldFile) {
            Storage::disk('local')->delete($oldFile);
            \Log::info('Dataset antiguo eliminado: ' . $oldFile);
        }
        
        // ELIMINAR modelos ML antiguos para forzar re-entrenamiento
        $modelsPath = base_path('ml_example/models/');
        if (is_dir($modelsPath)) {
            $modelFiles = ['roadmap_model.pkl', 'scaler.pkl'];
            foreach ($modelFiles as $modelFile) {
                $fullPath = $modelsPath . $modelFile;
                if (file_exists($fullPath)) {
                    unlink($fullPath);
                    \Log::info('Modelo ML antiguo eliminado: ' . $modelFile);
                }
            }
        }
        
        // GENERAR dataset fresco con datos actuales
        Artisan::call('ml:export-dataset');
        
        // Buscar el dataset recién generado
        $allFiles = Storage::disk('local')->files();
        $datasetFiles = array_filter($allFiles, function($file) {
            return strpos($file, 'ml_dataset_roadmaps_') !== false && 
                   pathinfo($file, PATHINFO_EXTENSION) === 'csv';
        });
        
        if (empty($datasetFiles)) {
            throw new \Exception('No se pudo generar el dataset. Verifica que existan roadmaps en la base de datos.');
        }
        
        \Log::info('Dataset fresco generado exitosamente');
        
        // Retornar ruta del dataset más reciente
        rsort($datasetFiles);
        return Storage::disk('local')->path($datasetFiles[0]);
    }
    
    /**
     * Mostrar la página principal del IA Tutor
     */
    public function index()
    {
        // Obtener tags populares para sugerencias
        $popularTags = Roadmap::select('tags')
            ->whereNotNull('tags')
            ->get()
            ->pluck('tags')
            ->flatMap(function($tags) {
                return explode(',', $tags);
            })
            ->map(function($tag) {
                return trim($tag);
            })
            ->countBy()
            ->sortDesc()
            ->take(20)
            ->keys()
            ->values();

        return Inertia::render('ai-tutor/index', [
            'popularTags' => $popularTags,
        ]);
    }

    /**
     * Analizar y recomendar roadmap usando ML
     */
    public function analyze(Request $request)
    {
        $request->validate([
            'tag' => 'required|string|min:2|max:50',
        ]);

        $tag = $request->input('tag');
        $user = auth()->user();

        try {
            // Obtener roadmaps con like del usuario para recomendaciones personalizadas
            $likedRoadmapIds = Reaction::where('user_id', $user->id)
                ->where('entity_type', 'roadmap')
                ->where('reaction_type', 'like')
                ->pluck('entity_id')
                ->toArray();
            
            // Generar dataset fresco con datos actuales
            $datasetPath = $this->generateFreshDataset();

            // Ejecutar el script de Python
            $pythonScript = base_path('ml_example/roadmap_recommender.py');
            
            // Verificar que el script existe
            if (!file_exists($pythonScript)) {
                return response()->json([
                    'error' => 'Script de Python no encontrado: ' . $pythonScript,
                ], 500);
            }
            
            // Verificar que el dataset existe
            if (!file_exists($datasetPath)) {
                return response()->json([
                    'error' => 'Dataset no encontrado: ' . $datasetPath,
                ], 500);
            }
            
            // Configurar encoding UTF-8 para Windows
            // Pasar roadmaps completados para excluirlos de las recomendaciones
            $excludeRoadmaps = !empty($likedRoadmapIds) ? implode(',', $likedRoadmapIds) : '';
            
            $command = sprintf(
                'chcp 65001 > nul && python "%s" "%s" "%s" "%s" 2>&1',
                $pythonScript,
                $datasetPath,
                $tag,
                $excludeRoadmaps
            );

            exec($command, $output, $returnCode);
            $result = implode("\n", $output);
            
            // Asegurar que el resultado sea UTF-8
            if (!mb_check_encoding($result, 'UTF-8')) {
                $result = mb_convert_encoding($result, 'UTF-8', 'Windows-1252');
            }
            
            // Log para debugging
            \Log::info('Python command: ' . $command);
            \Log::info('Python output: ' . $result);
            \Log::info('Return code: ' . $returnCode);

            // Buscar el JSON en el output (puede haber texto adicional)
            $jsonStart = strpos($result, '{');
            $jsonEnd = strrpos($result, '}');
            
            if ($jsonStart !== false && $jsonEnd !== false) {
                $jsonString = substr($result, $jsonStart, $jsonEnd - $jsonStart + 1);
                $recommendation = json_decode($jsonString, true);
            } else {
                $recommendation = json_decode($result, true);
            }

            if (json_last_error() !== JSON_ERROR_NONE || isset($recommendation['error'])) {
                return response()->json([
                    'error' => $recommendation['error'] ?? 'Error al procesar la recomendación',
                    'available_tags' => $recommendation['available_tags'] ?? [],
                ], 400);
            }

            // Obtener información completa del roadmap
            $roadmap = Roadmap::where('roadmap_id', $recommendation['roadmap_id'])
                ->with('statistics')
                ->first();

            if ($roadmap) {
                $recommendation['roadmap_details'] = [
                    'description' => $roadmap->description,
                    'cover_image' => $roadmap->cover_image,
                    'created_at' => $roadmap->created_at->toDateTimeString(),
                ];
            }

            // También obtener recomendaciones personalizadas
            $personalizedRecs = null;
            if (!empty($likedRoadmapIds)) {
                try {
                    $personalizedRecs = $this->getPersonalizedRecommendationsInternal($likedRoadmapIds, $tag, $datasetPath);
                } catch (\Exception $e) {
                    \Log::warning('Error getting personalized recommendations: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'recommendation' => $recommendation,
                'personalized' => $personalizedRecs,
                'user_liked_count' => count($likedRoadmapIds),
                'analyzed_at' => now()->toDateTimeString(),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al ejecutar el análisis: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener recomendaciones personalizadas
     */
    public function personalizedRecommendations(Request $request)
    {
        $request->validate([
            'tag' => 'nullable|string|min:2|max:50',
        ]);

        $tag = $request->input('tag');
        $user = auth()->user();

        try {
            // Obtener roadmaps que el usuario dio like (completados)
            $likedRoadmapIds = Reaction::where('user_id', $user->id)
                ->where('entity_type', 'roadmap')
                ->where('reaction_type', 'like')
                ->pluck('entity_id')
                ->toArray();

            // Obtener dataset
            $allFiles = Storage::disk('local')->files();
            $datasetFiles = array_filter($allFiles, function($file) {
                return strpos($file, 'ml_dataset_roadmaps_') !== false && 
                       pathinfo($file, PATHINFO_EXTENSION) === 'csv';
            });

            if (empty($datasetFiles)) {
                Artisan::call('ml:export-dataset');
                $allFiles = Storage::disk('local')->files();
                $datasetFiles = array_filter($allFiles, function($file) {
                    return strpos($file, 'ml_dataset_roadmaps_') !== false && 
                           pathinfo($file, PATHINFO_EXTENSION) === 'csv';
                });
            }

            rsort($datasetFiles);
            $datasetPath = Storage::disk('local')->path($datasetFiles[0]);
            $pythonScript = base_path('ml_example/personalized_recommender.py');

            // Escribir IDs a archivo temporal
            $tempFile = storage_path('app/temp_user_roadmaps.json');
            file_put_contents($tempFile, json_encode($likedRoadmapIds));

            // Construir comando
            if ($tag) {
                $command = sprintf(
                    'chcp 65001 > nul && python "%s" "%s" "@%s" "%s" 2>&1',
                    $pythonScript,
                    $datasetPath,
                    $tempFile,
                    $tag
                );
            } else {
                $command = sprintf(
                    'chcp 65001 > nul && python "%s" "%s" "@%s" 2>&1',
                    $pythonScript,
                    $datasetPath,
                    $tempFile
                );
            }

            exec($command, $output, $returnCode);
            $result = implode("\n", $output);

            if (!mb_check_encoding($result, 'UTF-8')) {
                $result = mb_convert_encoding($result, 'UTF-8', 'Windows-1252');
            }

            \Log::info('Personalized command: ' . $command);
            \Log::info('Personalized output: ' . $result);

            $jsonStart = strpos($result, '{');
            $jsonEnd = strrpos($result, '}');
            
            if ($jsonStart !== false && $jsonEnd !== false) {
                $jsonString = substr($result, $jsonStart, $jsonEnd - $jsonStart + 1);
                $recommendations = json_decode($jsonString, true);
            } else {
                $recommendations = json_decode($result, true);
            }

            if (json_last_error() !== JSON_ERROR_NONE || isset($recommendations['error'])) {
                return response()->json([
                    'error' => $recommendations['error'] ?? 'Error al procesar recomendaciones',
                ], 400);
            }

            // Enriquecer con información de roadmaps
            foreach ($recommendations['similar'] ?? [] as &$rec) {
                $roadmap = Roadmap::where('roadmap_id', $rec['roadmap_id'])->first();
                if ($roadmap) {
                    $rec['description'] = $roadmap->description;
                    $rec['cover_image'] = $roadmap->cover_image;
                }
            }
            
            foreach ($recommendations['new'] ?? [] as &$rec) {
                $roadmap = Roadmap::where('roadmap_id', $rec['roadmap_id'])->first();
                if ($roadmap) {
                    $rec['description'] = $roadmap->description;
                    $rec['cover_image'] = $roadmap->cover_image;
                }
            }

            // Limpiar archivo temporal
            if (file_exists($tempFile)) {
                unlink($tempFile);
            }

            return response()->json([
                'success' => true,
                'recommendations' => $recommendations,
                'user_liked_count' => count($likedRoadmapIds),
                'analyzed_at' => now()->toDateTimeString(),
            ]);

        } catch (\Exception $e) {
            // Limpiar archivo temporal en caso de error
            $tempFile = storage_path('app/temp_user_roadmaps.json');
            if (file_exists($tempFile)) {
                unlink($tempFile);
            }
            
            return response()->json([
                'error' => 'Error al obtener recomendaciones: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Método interno para obtener recomendaciones personalizadas
     */
    private function getPersonalizedRecommendationsInternal($likedRoadmapIds, $tag, $datasetPath)
    {
        $pythonScript = base_path('ml_example/personalized_recommender.py');
        
        // Obtener nodos completados del usuario
        $completedNodeIds = NodeProgress::getCompletedNodes(auth()->id());
        
        // Preparar datos para Python
        $userData = [
            'completed_roadmaps' => $likedRoadmapIds,
            'completed_nodes' => $completedNodeIds,
            'total_roadmaps_completed' => count($likedRoadmapIds),
            'total_nodes_completed' => count($completedNodeIds)
        ];
        
        // Escribir datos a archivo temporal para evitar problemas con escapado en Windows
        $tempFile = storage_path('app/temp_user_data.json');
        file_put_contents($tempFile, json_encode($userData));

        // Construir comando usando el archivo temporal
        $command = sprintf(
            'chcp 65001 > nul && python "%s" "%s" "@%s" "%s" 2>&1',
            $pythonScript,
            $datasetPath,
            $tempFile,
            $tag
        );

        exec($command, $output, $returnCode);
        $result = implode("\n", $output);

        if (!mb_check_encoding($result, 'UTF-8')) {
            $result = mb_convert_encoding($result, 'UTF-8', 'Windows-1252');
        }

        $jsonStart = strpos($result, '{');
        $jsonEnd = strrpos($result, '}');
        
        if ($jsonStart !== false && $jsonEnd !== false) {
            $jsonString = substr($result, $jsonStart, $jsonEnd - $jsonStart + 1);
            $recommendations = json_decode($jsonString, true);
        } else {
            $recommendations = json_decode($result, true);
        }

        if (json_last_error() !== JSON_ERROR_NONE || isset($recommendations['error'])) {
            throw new \Exception($recommendations['error'] ?? 'Error al procesar recomendaciones');
        }

        // Enriquecer con información de roadmaps
        foreach ($recommendations['similar'] ?? [] as &$rec) {
            $roadmap = Roadmap::where('roadmap_id', $rec['roadmap_id'])->first();
            if ($roadmap) {
                $rec['description'] = $roadmap->description;
                $rec['cover_image'] = $roadmap->cover_image;
            }
        }
        
        foreach ($recommendations['new'] ?? [] as &$rec) {
            $roadmap = Roadmap::where('roadmap_id', $rec['roadmap_id'])->first();
            if ($roadmap) {
                $rec['description'] = $roadmap->description;
                $rec['cover_image'] = $roadmap->cover_image;
            }
        }

        // Limpiar archivo temporal
        if (file_exists($tempFile)) {
            unlink($tempFile);
        }

        return $recommendations;
    }

    /**
     * Obtener top roadmaps por tag
     */
    public function topByTag(Request $request)
    {
        $request->validate([
            'tag' => 'required|string|min:2|max:50',
            'limit' => 'integer|min:1|max:10',
        ]);

        $tag = $request->input('tag');
        $limit = $request->input('limit', 5);

        // Buscar roadmaps que contengan el tag
        $roadmaps = Roadmap::whereRaw('LOWER(tags) LIKE ?', ['%' . strtolower($tag) . '%'])
            ->with('statistics')
            ->get()
            ->map(function($roadmap) {
                $s = $roadmap->statistics;
                if (!$s) return null;

                $completionRate = $s->completion_count / max(1, $s->completion_count + $s->dropout_count);
                $efficiencyRate = $s->avg_nodes_completed / max(1, $s->avg_hours_spent);
                
                $qualityScore = (
                    $completionRate * 0.35 +
                    $s->usefulness_score / 5 * 0.30 +
                    (1 - ($s->dropout_count / max(1, $s->completion_count + $s->dropout_count))) * 0.20 +
                    $efficiencyRate / 10 * 0.15
                );

                return [
                    'roadmap_id' => $roadmap->roadmap_id,
                    'name' => $roadmap->name,
                    'tags' => $roadmap->tags,
                    'cover_image' => $roadmap->cover_image,
                    'quality_score' => round($qualityScore, 4),
                    'completion_rate' => round($completionRate, 4),
                    'usefulness_score' => $s->usefulness_score,
                ];
            })
            ->filter()
            ->sortByDesc('quality_score')
            ->take($limit)
            ->values();

        return response()->json([
            'roadmaps' => $roadmaps,
            'total' => $roadmaps->count(),
        ]);
    }
}
