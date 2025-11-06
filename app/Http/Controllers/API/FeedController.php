<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Node;
use App\Models\Roadmap;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    /**
     * Obtener feed principal
     * GET /api/v1/feed?page=1&limit=10
     */
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10);
        $page = $request->input('page', 1);

        // Obtener roadmaps y nodos mezclados
        $roadmaps = Roadmap::with(['user'])
            ->withCount(['reactions', 'comments'])
            ->latest()
            ->take($limit / 2)
            ->get()
            ->map(function ($roadmap) {
                return [
                    'id' => $roadmap->roadmap_id,
                    'type' => 'roadmap',
                    'title' => $roadmap->name,
                    'description' => $roadmap->description,
                    'cover_image' => $roadmap->cover_image,
                    'author' => [
                        'id' => $roadmap->user->id ?? null,
                        'username' => $roadmap->user->username ?? $roadmap->author,
                        'avatar' => $roadmap->user->avatar ?? null,
                    ],
                    'stats' => [
                        'likes' => $roadmap->reactions_count,
                        'comments' => $roadmap->comments_count,
                    ],
                    'created_at' => $roadmap->created_at,
                ];
            });

        $nodes = Node::with(['user'])
            ->withCount(['reactions', 'comments'])
            ->latest()
            ->take($limit / 2)
            ->get()
            ->map(function ($node) {
                return [
                    'id' => $node->node_id,
                    'type' => 'node',
                    'title' => $node->title,
                    'description' => $node->description ?? '',
                    'cover_image' => $node->cover_image,
                    'topic' => $node->topic,
                    'author' => [
                        'id' => $node->user->id ?? null,
                        'username' => $node->user->username ?? $node->author,
                        'avatar' => $node->user->avatar ?? null,
                    ],
                    'stats' => [
                        'likes' => $node->reactions_count,
                        'comments' => $node->comments_count,
                    ],
                    'created_at' => $node->created_at,
                ];
            });

        // Mezclar y ordenar
        $feed = $roadmaps->concat($nodes)->sortByDesc('created_at')->values();

        return response()->json([
            'success' => true,
            'data' => $feed,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $feed->count(),
            ]
        ]);
    }

    /**
     * Obtener feed por tema
     * GET /api/v1/feed/topic/{topic}
     */
    public function byTopic($topic, Request $request)
    {
        $limit = $request->input('limit', 10);

        $nodes = Node::where('topic', 'LIKE', "%{$topic}%")
            ->with(['user'])
            ->withCount(['reactions', 'comments'])
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($node) {
                return [
                    'id' => $node->node_id,
                    'type' => 'node',
                    'title' => $node->title,
                    'description' => $node->description ?? '',
                    'cover_image' => $node->cover_image,
                    'topic' => $node->topic,
                    'author' => [
                        'username' => $node->user->username ?? $node->author,
                        'avatar' => $node->user->avatar ?? null,
                    ],
                    'stats' => [
                        'likes' => $node->reactions_count,
                        'comments' => $node->comments_count,
                    ],
                    'created_at' => $node->created_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $nodes,
        ]);
    }

    /**
     * Buscar en el feed
     * GET /api/v1/feed/search?q=react
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Query debe tener al menos 2 caracteres',
            ], 400);
        }

        $roadmaps = Roadmap::where('name', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->with(['user'])
            ->withCount(['reactions', 'comments'])
            ->limit(10)
            ->get()
            ->map(function ($roadmap) {
                return [
                    'id' => $roadmap->roadmap_id,
                    'type' => 'roadmap',
                    'title' => $roadmap->name,
                    'description' => $roadmap->description,
                    'cover_image' => $roadmap->cover_image,
                    'author' => [
                        'username' => $roadmap->user->username ?? $roadmap->author,
                    ],
                    'stats' => [
                        'likes' => $roadmap->reactions_count,
                        'comments' => $roadmap->comments_count,
                    ],
                ];
            });

        $nodes = Node::where('title', 'LIKE', "%{$query}%")
            ->orWhere('topic', 'LIKE', "%{$query}%")
            ->with(['user'])
            ->withCount(['reactions', 'comments'])
            ->limit(10)
            ->get()
            ->map(function ($node) {
                return [
                    'id' => $node->node_id,
                    'type' => 'node',
                    'title' => $node->title,
                    'description' => $node->description ?? '',
                    'cover_image' => $node->cover_image,
                    'topic' => $node->topic,
                    'author' => [
                        'username' => $node->user->username ?? $node->author,
                    ],
                    'stats' => [
                        'likes' => $node->reactions_count,
                        'comments' => $node->comments_count,
                    ],
                ];
            });

        $results = $roadmaps->concat($nodes)->values();

        return response()->json([
            'success' => true,
            'data' => $results,
            'total' => $results->count(),
        ]);
    }

    /**
     * Obtener trending (más populares)
     * GET /api/v1/feed/trending
     */
    public function trending(Request $request)
    {
        $limit = $request->input('limit', 10);

        $roadmaps = Roadmap::withCount(['reactions', 'comments'])
            ->with(['user'])
            ->orderByDesc('reactions_count')
            ->limit($limit / 2)
            ->get()
            ->map(function ($roadmap) {
                return [
                    'id' => $roadmap->roadmap_id,
                    'type' => 'roadmap',
                    'title' => $roadmap->name,
                    'cover_image' => $roadmap->cover_image,
                    'author' => [
                        'username' => $roadmap->user->username ?? $roadmap->author,
                    ],
                    'stats' => [
                        'likes' => $roadmap->reactions_count,
                        'comments' => $roadmap->comments_count,
                    ],
                ];
            });

        $nodes = Node::withCount(['reactions', 'comments'])
            ->with(['user'])
            ->orderByDesc('reactions_count')
            ->limit($limit / 2)
            ->get()
            ->map(function ($node) {
                return [
                    'id' => $node->node_id,
                    'type' => 'node',
                    'title' => $node->title,
                    'cover_image' => $node->cover_image,
                    'topic' => $node->topic,
                    'author' => [
                        'username' => $node->user->username ?? $node->author,
                    ],
                    'stats' => [
                        'likes' => $node->reactions_count,
                        'comments' => $node->comments_count,
                    ],
                ];
            });

        $trending = $roadmaps->concat($nodes)->sortByDesc('stats.likes')->values();

        return response()->json([
            'success' => true,
            'data' => $trending,
        ]);
    }
}
