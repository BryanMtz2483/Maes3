<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Models\Roadmap;
use App\Models\Node;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeedController extends Controller
{
    /**
     * Show main feed (recent roadmaps and nodes)
     */
    public function index(Request $request)
    {
        $page = $request->get('page', 1);
        $perPage = 15;
        $type = $request->get('type', 'all'); // all, roadmaps, nodes

        $roadmapsQuery = Roadmap::with(['user:id,username,account_name,profile_pic'])
            ->select('roadmap_id', 'name', 'description', 'cover_image', 'tags', 'author_id', 'user_id', 'created_at')
            ->withCount(['reactions', 'comments'])
            ->orderBy('created_at', 'desc');

        $nodesQuery = Node::with(['user:id,username,account_name,profile_pic'])
            ->select('node_id', 'title', 'description', 'cover_image', 'topic', 'author_id', 'user_id', 'created_at')
            ->withCount(['reactions', 'comments'])
            ->orderBy('created_at', 'desc');

        // Aplicar filtro de tipo
        if ($type === 'roadmaps') {
            $roadmaps = $roadmapsQuery->paginate($perPage, ['*'], 'page', $page);
            $nodes = collect([]);
            $total = $roadmaps->total();
            $items = $roadmaps->items();
        } elseif ($type === 'nodes') {
            $nodes = $nodesQuery->paginate($perPage, ['*'], 'page', $page);
            $roadmaps = collect([]);
            $total = $nodes->total();
            $items = $nodes->items();
        } else {
            // Obtener todos y mezclar
            $roadmaps = $roadmapsQuery->get();
            $nodes = $nodesQuery->get();
            $allItems = collect($roadmaps)->merge($nodes)
                ->sortByDesc('created_at')
                ->values();
            
            $total = $allItems->count();
            $items = $allItems->forPage($page, $perPage)->values();
        }

        // Mapear datos
        $feed = collect($items)->map(function($item) {
            if ($item->user) {
                $item->author_name = $item->user->account_name ?: $item->user->username;
                $item->author_username = $item->user->username;
                $item->author_avatar = $item->user->profile_pic;
            }
            
            // Convertir tags a array si es string
            if (isset($item->tags) && is_string($item->tags)) {
                $item->tags = collect(explode(',', $item->tags))
                    ->map(fn($tag) => ['name' => trim($tag)])
                    ->toArray();
            } elseif (isset($item->topic) && is_string($item->topic)) {
                // Para nodos, usar topic como tag
                $item->tags = [['name' => $item->topic]];
            } else {
                $item->tags = [];
            }
            
            return $item;
        });

        // Obtener temas populares
        $popularTopics = Node::select('topic')
            ->whereNotNull('topic')
            ->groupBy('topic')
            ->selectRaw('topic, COUNT(*) as count')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        // Obtener tags populares de roadmaps
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
            ->take(10);

        return Inertia::render('feed/index', [
            'feed' => $feed,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage),
            ],
            'filter' => $type,
            'totalRoadmaps' => Roadmap::count(),
            'totalNodes' => Node::count(),
            'popularTopics' => $popularTopics,
            'popularTags' => $popularTags,
        ]);
    }

    /**
     * Show trending content (most reactions in last 7 days)
     */
    public function trending()
    {
        $roadmaps = Roadmap::with(['tags', 'nodes'])
            ->withCount(['reactions' => function($query) {
                $query->where('created_at', '>=', now()->subDays(7));
            }])
            ->having('reactions_count', '>', 0)
            ->orderBy('reactions_count', 'desc')
            ->limit(10)
            ->get();

        $nodes = Node::with(['contents', 'roadmaps'])
            ->withCount(['reactions' => function($query) {
                $query->where('created_at', '>=', now()->subDays(7));
            }])
            ->having('reactions_count', '>', 0)
            ->orderBy('reactions_count', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('feed/trending', [
            'roadmaps' => $roadmaps,
            'nodes' => $nodes,
        ]);
    }

    /**
     * Show content from followed users
     */
    public function following()
    {
        // TODO: Implementar cuando exista sistema de follows
        // Por ahora retorna feed general
        return $this->index(request());
    }

    /**
     * Explore new content
     */
    public function explore(Request $request)
    {
        $query = $request->get('q');
        $topic = $request->get('topic');
        $type = $request->get('type', 'all'); // all, roadmaps, nodes
        $page = $request->get('page', 1);
        $perPage = 15;

        $roadmapsQuery = Roadmap::with(['user'])
            ->withCount([
                'reactions as reactions_count' => function($q) {
                    $q->where('reaction_type', 'like');
                },
                'reactions as dislikes_count' => function($q) {
                    $q->where('reaction_type', 'dislike');
                },
                'comments as comments_count'
            ])
            ->when($query, function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%");
            })
            ->orderBy('created_at', 'desc');

        $nodesQuery = Node::with(['user'])
            ->withCount([
                'reactions as reactions_count' => function($q) {
                    $q->where('reaction_type', 'like');
                },
                'reactions as dislikes_count' => function($q) {
                    $q->where('reaction_type', 'dislike');
                },
                'comments as comments_count'
            ])
            ->when($query, function($q) use ($query) {
                $q->where('title', 'like', "%{$query}%");
            })
            ->when($topic, function($q) use ($topic) {
                $q->where('topic', $topic);
            })
            ->orderBy('created_at', 'desc');

        // Aplicar filtro de tipo y paginación
        if ($type === 'roadmaps') {
            $roadmapsPaginated = $roadmapsQuery->paginate($perPage, ['*'], 'page', $page);
            $roadmaps = $roadmapsPaginated->map(function($roadmap) {
                return [
                    'roadmap_id' => $roadmap->roadmap_id,
                    'name' => $roadmap->name,
                    'description' => $roadmap->description,
                    'cover_image' => $roadmap->cover_image,
                    'tags' => $roadmap->tags,
                    'reactions_count' => $roadmap->reactions_count ?? 0,
                    'dislikes_count' => $roadmap->dislikes_count ?? 0,
                    'comments_count' => $roadmap->comments_count ?? 0,
                ];
            });
            $nodes = collect([]);
            $total = $roadmapsPaginated->total();
        } elseif ($type === 'nodes') {
            $nodesPaginated = $nodesQuery->paginate($perPage, ['*'], 'page', $page);
            $nodes = $nodesPaginated->map(function($node) {
                return [
                    'node_id' => $node->node_id,
                    'title' => $node->title,
                    'description' => $node->description,
                    'cover_image' => $node->cover_image,
                    'topic' => $node->topic,
                    'reactions_count' => $node->reactions_count ?? 0,
                    'dislikes_count' => $node->dislikes_count ?? 0,
                    'comments_count' => $node->comments_count ?? 0,
                ];
            });
            $roadmaps = collect([]);
            $total = $nodesPaginated->total();
        } else {
            // Obtener todos y mezclar
            $allRoadmaps = $roadmapsQuery->get()->map(function($roadmap) {
                return [
                    'roadmap_id' => $roadmap->roadmap_id,
                    'name' => $roadmap->name,
                    'description' => $roadmap->description,
                    'cover_image' => $roadmap->cover_image,
                    'tags' => $roadmap->tags,
                    'reactions_count' => $roadmap->reactions_count ?? 0,
                    'dislikes_count' => $roadmap->dislikes_count ?? 0,
                    'comments_count' => $roadmap->comments_count ?? 0,
                    'created_at' => $roadmap->created_at,
                ];
            });
            
            $allNodes = $nodesQuery->get()->map(function($node) {
                return [
                    'node_id' => $node->node_id,
                    'title' => $node->title,
                    'description' => $node->description,
                    'cover_image' => $node->cover_image,
                    'topic' => $node->topic,
                    'reactions_count' => $node->reactions_count ?? 0,
                    'dislikes_count' => $node->dislikes_count ?? 0,
                    'comments_count' => $node->comments_count ?? 0,
                    'created_at' => $node->created_at,
                ];
            });

            $allItems = $allRoadmaps->merge($allNodes)->sortByDesc('created_at')->values();
            $total = $allItems->count();
            $roadmaps = $allItems->forPage($page, $perPage)->values();
            $nodes = collect([]);
        }

        // Obtener temas populares
        $popularTopics = Node::select('topic')
            ->whereNotNull('topic')
            ->groupBy('topic')
            ->selectRaw('topic, COUNT(*) as count')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        // Obtener tags populares de roadmaps
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
            ->take(10);

        return Inertia::render('feed/explore', [
            'roadmaps' => $type === 'all' ? $roadmaps->toArray() : $roadmaps->toArray(),
            'nodes' => $nodes->toArray(),
            'query' => $query,
            'topic' => $topic,
            'filter' => $type,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage),
            ],
            'totalRoadmaps' => Roadmap::count(),
            'totalNodes' => Node::count(),
            'popularTopics' => $popularTopics,
            'popularTags' => $popularTags,
        ]);
    }
}
