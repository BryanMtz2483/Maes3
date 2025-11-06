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
        $roadmaps = Roadmap::with(['tags', 'nodes', 'user'])
            ->withCount(['reactions', 'comments'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($roadmap) {
                if ($roadmap->user) {
                    $roadmap->author_name = $roadmap->user->account_name ?: $roadmap->user->username;
                    $roadmap->author_username = $roadmap->user->username;
                    $roadmap->author_avatar = $roadmap->user->profile_pic;
                }
                return $roadmap;
            });

        $nodes = Node::with(['contents', 'roadmaps', 'user'])
            ->withCount(['reactions', 'comments'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function($node) {
                if ($node->user) {
                    $node->author_name = $node->user->account_name ?: $node->user->username;
                    $node->author_username = $node->user->username;
                    $node->author_avatar = $node->user->profile_pic;
                }
                return $node;
            });

        // Mezclar y ordenar por fecha
        $feed = collect($roadmaps)->merge($nodes)
            ->sortByDesc('created_at')
            ->take(20)
            ->values();

        return Inertia::render('dashboard', [
            'feed' => $feed,
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

        // Obtener roadmaps con cover_image y dislikes
        $roadmaps = Roadmap::with(['user'])
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
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function($roadmap) {
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

        // Obtener nodos con cover_image y dislikes
        $nodes = Node::with(['user'])
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
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function($node) {
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

        return Inertia::render('feed/explore', [
            'roadmaps' => $roadmaps->toArray(),
            'nodes' => $nodes->toArray(),
            'query' => $query,
            'topic' => $topic,
        ]);
    }
}
