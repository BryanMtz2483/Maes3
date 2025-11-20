<?php

namespace App\Http\Controllers;

use App\Models\Roadmap;
use App\Models\RoadmapStatistics;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RoadmapAnalyticsController extends Controller
{
    /**
     * Obtener estadísticas generales de roadmaps
     */
    public function index()
    {
        $stats = [
            'total_roadmaps' => Roadmap::count(),
            'total_completions' => RoadmapStatistics::sum('completion_count'),
            'total_dropouts' => RoadmapStatistics::sum('dropout_count'),
            'avg_usefulness' => RoadmapStatistics::avg('usefulness_score'),
            'total_bookmarks' => RoadmapStatistics::sum('bookmark_count'),
        ];

        return response()->json($stats);
    }

    /**
     * Obtener top roadmaps por eficiencia
     */
    public function topRoadmaps(Request $request)
    {
        $limit = $request->input('limit', 10);
        $topic = $request->input('topic');

        $query = Roadmap::with('statistics')
            ->whereHas('statistics');

        if ($topic) {
            $query->where('tags', 'like', "%{$topic}%");
        }

        $roadmaps = $query->get()
            ->map(function ($roadmap) {
                $s = $roadmap->statistics;
                
                // Calcular métricas
                $completionRate = $s->completion_count / max(1, $s->completion_count + $s->dropout_count);
                $efficiencyRate = $s->avg_nodes_completed / max(1, $s->avg_hours_spent);
                
                // Score compuesto
                $compositeScore = (
                    $completionRate * 0.4 +
                    ($s->usefulness_score / 5) * 0.3 +
                    ($efficiencyRate / 10) * 0.2 +
                    ($s->bookmark_count / 200) * 0.1
                );

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
                    'metrics' => [
                        'completion_rate' => round($completionRate, 4),
                        'efficiency_rate' => round($efficiencyRate, 4),
                        'composite_score' => round($compositeScore, 4),
                    ],
                ];
            })
            ->sortByDesc('metrics.composite_score')
            ->take($limit)
            ->values();

        return response()->json($roadmaps);
    }

    /**
     * Comparar roadmaps similares
     */
    public function compareRoadmaps(Request $request)
    {
        $roadmapIds = $request->input('roadmap_ids', []);

        if (empty($roadmapIds)) {
            return response()->json(['error' => 'No roadmap IDs provided'], 400);
        }

        $roadmaps = Roadmap::with('statistics')
            ->whereIn('roadmap_id', $roadmapIds)
            ->get()
            ->map(function ($roadmap) {
                $s = $roadmap->statistics;
                
                if (!$s) {
                    return null;
                }

                $completionRate = $s->completion_count / max(1, $s->completion_count + $s->dropout_count);
                $efficiencyRate = $s->avg_nodes_completed / max(1, $s->avg_hours_spent);

                return [
                    'roadmap_id' => $roadmap->roadmap_id,
                    'name' => $roadmap->name,
                    'completion_rate' => round($completionRate, 4),
                    'efficiency_rate' => round($efficiencyRate, 4),
                    'usefulness_score' => (float) $s->usefulness_score,
                    'bookmark_count' => $s->bookmark_count,
                    'avg_hours_spent' => (float) $s->avg_hours_spent,
                ];
            })
            ->filter();

        return response()->json($roadmaps);
    }

    /**
     * Obtener recomendaciones de roadmaps por tema
     */
    public function recommend(Request $request)
    {
        $topic = $request->input('topic');
        $limit = $request->input('limit', 5);

        if (!$topic) {
            return response()->json(['error' => 'Topic is required'], 400);
        }

        $roadmaps = Roadmap::with('statistics')
            ->where('tags', 'like', "%{$topic}%")
            ->whereHas('statistics')
            ->get()
            ->map(function ($roadmap) {
                $s = $roadmap->statistics;
                
                $completionRate = $s->completion_count / max(1, $s->completion_count + $s->dropout_count);
                $efficiencyRate = $s->avg_nodes_completed / max(1, $s->avg_hours_spent);
                
                // Algoritmo de recomendación
                $score = (
                    $completionRate * 0.35 +
                    ($s->usefulness_score / 5) * 0.35 +
                    ($efficiencyRate / 10) * 0.20 +
                    ($s->bookmark_count / 200) * 0.10
                );

                return [
                    'roadmap_id' => $roadmap->roadmap_id,
                    'name' => $roadmap->name,
                    'description' => $roadmap->description,
                    'recommendation_score' => round($score, 4),
                    'usefulness_score' => (float) $s->usefulness_score,
                    'completion_rate' => round($completionRate, 4),
                    'avg_hours_spent' => (float) $s->avg_hours_spent,
                ];
            })
            ->sortByDesc('recommendation_score')
            ->take($limit)
            ->values();

        return response()->json([
            'topic' => $topic,
            'recommendations' => $roadmaps,
        ]);
    }

    /**
     * Obtener análisis por tema
     */
    public function analyzeByTopic(Request $request)
    {
        $topic = $request->input('topic');

        if (!$topic) {
            return response()->json(['error' => 'Topic is required'], 400);
        }

        $roadmaps = Roadmap::with('statistics')
            ->where('tags', 'like', "%{$topic}%")
            ->whereHas('statistics')
            ->get();

        if ($roadmaps->isEmpty()) {
            return response()->json(['error' => 'No roadmaps found for this topic'], 404);
        }

        $stats = $roadmaps->map(function ($r) {
            return $r->statistics;
        });

        $analysis = [
            'topic' => $topic,
            'total_roadmaps' => $roadmaps->count(),
            'averages' => [
                'completion_count' => round($stats->avg('completion_count'), 2),
                'dropout_count' => round($stats->avg('dropout_count'), 2),
                'avg_hours_spent' => round($stats->avg('avg_hours_spent'), 2),
                'avg_nodes_completed' => round($stats->avg('avg_nodes_completed'), 2),
                'bookmark_count' => round($stats->avg('bookmark_count'), 2),
                'usefulness_score' => round($stats->avg('usefulness_score'), 2),
            ],
            'totals' => [
                'total_completions' => $stats->sum('completion_count'),
                'total_dropouts' => $stats->sum('dropout_count'),
                'total_bookmarks' => $stats->sum('bookmark_count'),
            ],
            'best_roadmap' => $roadmaps->sortByDesc(function ($r) {
                $s = $r->statistics;
                $completionRate = $s->completion_count / max(1, $s->completion_count + $s->dropout_count);
                return $completionRate * $s->usefulness_score;
            })->first()->only(['roadmap_id', 'name']),
        ];

        return response()->json($analysis);
    }

    /**
     * Obtener estadísticas de un roadmap específico
     */
    public function show($roadmapId)
    {
        $roadmap = Roadmap::with('statistics')->find($roadmapId);

        if (!$roadmap || !$roadmap->statistics) {
            return response()->json(['error' => 'Roadmap not found or has no statistics'], 404);
        }

        $s = $roadmap->statistics;
        
        $completionRate = $s->completion_count / max(1, $s->completion_count + $s->dropout_count);
        $efficiencyRate = $s->avg_nodes_completed / max(1, $s->avg_hours_spent);
        $engagementScore = $s->bookmark_count * $s->usefulness_score;

        return response()->json([
            'roadmap' => [
                'roadmap_id' => $roadmap->roadmap_id,
                'name' => $roadmap->name,
                'description' => $roadmap->description,
                'tags' => $roadmap->tags,
            ],
            'statistics' => [
                'completion_count' => $s->completion_count,
                'dropout_count' => $s->dropout_count,
                'avg_hours_spent' => (float) $s->avg_hours_spent,
                'avg_nodes_completed' => (float) $s->avg_nodes_completed,
                'bookmark_count' => $s->bookmark_count,
                'usefulness_score' => (float) $s->usefulness_score,
            ],
            'metrics' => [
                'completion_rate' => round($completionRate, 4),
                'dropout_rate' => round(1 - $completionRate, 4),
                'efficiency_rate' => round($efficiencyRate, 4),
                'engagement_score' => round($engagementScore, 2),
            ],
        ]);
    }

    /**
     * Obtener tendencias y insights
     */
    public function insights()
    {
        $topicStats = DB::table('roadmaps')
            ->join('roadmap_statistics', 'roadmaps.roadmap_id', '=', 'roadmap_statistics.roadmap_id')
            ->select(
                DB::raw('SUBSTRING_INDEX(tags, ",", 1) as topic'),
                DB::raw('COUNT(*) as count'),
                DB::raw('AVG(usefulness_score) as avg_usefulness'),
                DB::raw('AVG(completion_count) as avg_completions'),
                DB::raw('AVG(bookmark_count) as avg_bookmarks')
            )
            ->groupBy('topic')
            ->orderByDesc('avg_usefulness')
            ->get();

        $insights = [
            'most_popular_topics' => $topicStats->sortByDesc('count')->take(5)->values(),
            'highest_rated_topics' => $topicStats->sortByDesc('avg_usefulness')->take(5)->values(),
            'most_completed_topics' => $topicStats->sortByDesc('avg_completions')->take(5)->values(),
            'most_bookmarked_topics' => $topicStats->sortByDesc('avg_bookmarks')->take(5)->values(),
        ];

        return response()->json($insights);
    }
}
