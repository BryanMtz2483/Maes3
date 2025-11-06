<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Node;
use App\Models\Roadmap;
use App\Models\Reaction;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MobileController extends Controller
{
    /**
     * Obtener datos iniciales para la app mobile
     * GET /api/v1/mobile/init
     */
    public function init(Request $request)
    {
        $user = $request->user();

        // Feed inicial
        $feed = $this->getFeedData(10);

        // Temas populares
        $topics = Node::select('topic')
            ->groupBy('topic')
            ->limit(10)
            ->get()
            ->pluck('topic');

        // Estadísticas del usuario
        $userStats = [
            'roadmaps_created' => $user->roadmaps()->count(),
            'nodes_created' => $user->nodes()->count(),
            'score' => $user->score ?? 0,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'stats' => $userStats,
                ],
                'feed' => $feed,
                'topics' => $topics,
            ]
        ]);
    }

    /**
     * Toggle like/dislike (optimizado para mobile)
     * POST /api/v1/mobile/toggle-reaction
     */
    public function toggleReaction(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'entity_type' => 'required|in:node,roadmap',
            'entity_id' => 'required|string',
            'type' => 'required|in:like,dislike',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $entityType = $request->input('entity_type');
        $entityId = $request->input('entity_id');
        $type = $request->input('type');

        // Buscar reacción existente
        $reaction = Reaction::where('user_id', $user->id)
            ->where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->first();

        $action = 'added';

        if ($reaction) {
            if ($reaction->type === $type) {
                // Eliminar si es la misma
                $reaction->delete();
                $action = 'removed';
            } else {
                // Cambiar tipo
                $reaction->type = $type;
                $reaction->save();
                $action = 'changed';
            }
        } else {
            // Crear nueva
            Reaction::create([
                'user_id' => $user->id,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
                'type' => $type,
            ]);
        }

        // Contar reacciones actualizadas
        $likesCount = Reaction::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->where('type', 'like')
            ->count();

        $dislikesCount = Reaction::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->where('type', 'dislike')
            ->count();

        return response()->json([
            'success' => true,
            'action' => $action,
            'data' => [
                'likes_count' => $likesCount,
                'dislikes_count' => $dislikesCount,
                'user_reaction' => $action === 'removed' ? null : $type,
            ]
        ]);
    }

    /**
     * Agregar comentario (optimizado para mobile)
     * POST /api/v1/mobile/add-comment
     */
    public function addComment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'entity_type' => 'required|in:node,roadmap',
            'entity_id' => 'required|string',
            'content' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        $comment = Comment::create([
            'user_id' => $user->id,
            'entity_type' => $request->input('entity_type'),
            'entity_id' => $request->input('entity_id'),
            'content' => $request->input('content'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comentario agregado',
            'data' => [
                'id' => $comment->id,
                'content' => $comment->content,
                'author' => [
                    'username' => $user->username,
                    'avatar' => $user->avatar,
                ],
                'created_at' => $comment->created_at,
            ]
        ]);
    }

    /**
     * Obtener detalles de un item (node o roadmap)
     * GET /api/v1/mobile/item/{type}/{id}
     */
    public function getItem($type, $id)
    {
        if (!in_array($type, ['node', 'roadmap'])) {
            return response()->json([
                'success' => false,
                'message' => 'Tipo inválido',
            ], 400);
        }

        if ($type === 'node') {
            $item = Node::where('node_id', $id)
                ->with(['user'])
                ->withCount(['reactions', 'comments'])
                ->first();
        } else {
            $item = Roadmap::where('roadmap_id', $id)
                ->with(['user', 'nodes'])
                ->withCount(['reactions', 'comments'])
                ->first();
        }

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Item no encontrado',
            ], 404);
        }

        // Obtener comentarios
        $comments = Comment::where('entity_type', $type)
            ->where('entity_id', $id)
            ->with(['user'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'author' => [
                        'username' => $comment->user->username ?? 'Usuario',
                        'avatar' => $comment->user->avatar ?? null,
                    ],
                    'created_at' => $comment->created_at,
                ];
            });

        // Verificar reacción del usuario
        $userReaction = null;
        if (auth()->check()) {
            $reaction = Reaction::where('user_id', auth()->id())
                ->where('entity_type', $type)
                ->where('entity_id', $id)
                ->first();
            $userReaction = $reaction ? $reaction->type : null;
        }

        $data = [
            'id' => $type === 'node' ? $item->node_id : $item->roadmap_id,
            'type' => $type,
            'title' => $type === 'node' ? $item->title : $item->name,
            'description' => $item->description ?? '',
            'cover_image' => $item->cover_image,
            'author' => [
                'id' => $item->user->id ?? null,
                'username' => $item->user->username ?? $item->author,
                'avatar' => $item->user->avatar ?? null,
            ],
            'stats' => [
                'likes' => $item->reactions_count,
                'comments' => $item->comments_count,
            ],
            'user_reaction' => $userReaction,
            'comments' => $comments,
            'created_at' => $item->created_at,
        ];

        // Si es roadmap, agregar nodos
        if ($type === 'roadmap') {
            $data['nodes'] = $item->nodes->map(function ($node) {
                return [
                    'id' => $node->node_id,
                    'title' => $node->title,
                    'topic' => $node->topic,
                ];
            });
        } else {
            $data['topic'] = $item->topic;
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Obtener notificaciones del usuario
     * GET /api/v1/mobile/notifications
     */
    public function notifications(Request $request)
    {
        $user = $request->user();
        
        // Simulación - en producción, obtener de tabla de notificaciones
        $notifications = [
            [
                'id' => 1,
                'type' => 'like',
                'title' => 'Nueva reacción',
                'message' => 'A Juan le gustó tu roadmap',
                'read' => false,
                'created_at' => now()->subHours(2),
            ],
            [
                'id' => 2,
                'type' => 'comment',
                'title' => 'Nuevo comentario',
                'message' => 'María comentó en tu nodo',
                'read' => false,
                'created_at' => now()->subHours(5),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unread_count' => 2,
        ]);
    }

    /**
     * Marcar notificación como leída
     * POST /api/v1/mobile/notifications/{id}/read
     */
    public function markNotificationRead($id)
    {
        // Simulación
        return response()->json([
            'success' => true,
            'message' => 'Notificación marcada como leída',
        ]);
    }

    /**
     * Obtener configuración de la app
     * GET /api/v1/mobile/config
     */
    public function config()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'app_version' => '1.0.0',
                'min_version' => '1.0.0',
                'features' => [
                    'tutor_mode' => true,
                    'dark_mode' => true,
                    'offline_mode' => false,
                ],
                'api_version' => 'v1',
            ]
        ]);
    }

    /**
     * Buscar contenido (nodos y roadmaps)
     * GET /api/v1/mobile/search?q=query
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'La búsqueda debe tener al menos 2 caracteres',
            ], 400);
        }

        $nodes = Node::where('title', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->orWhere('topic', 'like', "%{$query}%")
            ->with(['user'])
            ->withCount(['reactions', 'comments'])
            ->limit(10)
            ->get()
            ->map(function ($node) {
                return [
                    'id' => $node->node_id,
                    'type' => 'node',
                    'title' => $node->title,
                    'description' => $node->description,
                    'cover_image' => $node->cover_image,
                    'topic' => $node->topic,
                    'author' => [
                        'username' => $node->user->username ?? 'Usuario',
                        'avatar' => $node->user->avatar,
                    ],
                    'stats' => [
                        'likes' => $node->reactions_count,
                        'comments' => $node->comments_count,
                    ],
                ];
            });

        $roadmaps = Roadmap::where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->orWhere('tags', 'like', "%{$query}%")
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
                    'tags' => $roadmap->tags,
                    'author' => [
                        'username' => $roadmap->user->username ?? 'Usuario',
                        'avatar' => $roadmap->user->avatar,
                    ],
                    'stats' => [
                        'likes' => $roadmap->reactions_count,
                        'comments' => $roadmap->comments_count,
                    ],
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'nodes' => $nodes,
                'roadmaps' => $roadmaps,
                'total' => $nodes->count() + $roadmaps->count(),
            ],
        ]);
    }

    /**
     * Obtener perfil de usuario
     * GET /api/v1/mobile/profile/{username}
     */
    public function getProfile($username)
    {
        $user = \App\Models\User::where('username', $username)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado',
            ], 404);
        }

        $nodes = Node::where('user_id', $user->id)
            ->withCount(['reactions', 'comments'])
            ->latest()
            ->get()
            ->map(function ($node) {
                return [
                    'id' => $node->node_id,
                    'title' => $node->title,
                    'description' => $node->description,
                    'cover_image' => $node->cover_image,
                    'topic' => $node->topic,
                    'stats' => [
                        'likes' => $node->reactions_count,
                        'comments' => $node->comments_count,
                    ],
                ];
            });

        $roadmaps = Roadmap::where('user_id', $user->id)
            ->withCount(['reactions', 'comments', 'nodes'])
            ->latest()
            ->get()
            ->map(function ($roadmap) {
                return [
                    'id' => $roadmap->roadmap_id,
                    'name' => $roadmap->name,
                    'description' => $roadmap->description,
                    'cover_image' => $roadmap->cover_image,
                    'nodes_count' => $roadmap->nodes_count,
                    'stats' => [
                        'likes' => $roadmap->reactions_count,
                        'comments' => $roadmap->comments_count,
                    ],
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'account_name' => $user->account_name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'bio' => $user->bio,
                    'score' => $user->score ?? 0,
                ],
                'stats' => [
                    'nodes_count' => $nodes->count(),
                    'roadmaps_count' => $roadmaps->count(),
                    'total_likes' => $nodes->sum('stats.likes') + $roadmaps->sum('stats.likes'),
                ],
                'nodes' => $nodes,
                'roadmaps' => $roadmaps,
            ],
        ]);
    }

    /**
     * Obtener contenido trending (más popular)
     * GET /api/v1/mobile/trending
     */
    public function trending(Request $request)
    {
        $period = $request->input('period', 'week'); // week, month, all
        
        $dateFilter = match($period) {
            'week' => now()->subWeek(),
            'month' => now()->subMonth(),
            default => now()->subYears(10),
        };

        $nodes = Node::with(['user'])
            ->withCount(['reactions' => function($query) use ($dateFilter) {
                $query->where('created_at', '>=', $dateFilter);
            }])
            ->having('reactions_count', '>', 0)
            ->orderBy('reactions_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($node) {
                return [
                    'id' => $node->node_id,
                    'type' => 'node',
                    'title' => $node->title,
                    'description' => $node->description,
                    'cover_image' => $node->cover_image,
                    'topic' => $node->topic,
                    'author' => [
                        'username' => $node->user->username ?? 'Usuario',
                        'avatar' => $node->user->avatar,
                    ],
                    'stats' => [
                        'likes' => $node->reactions_count,
                    ],
                ];
            });

        $roadmaps = Roadmap::with(['user'])
            ->withCount(['reactions' => function($query) use ($dateFilter) {
                $query->where('created_at', '>=', $dateFilter);
            }])
            ->having('reactions_count', '>', 0)
            ->orderBy('reactions_count', 'desc')
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
                        'username' => $roadmap->user->username ?? 'Usuario',
                        'avatar' => $roadmap->user->avatar,
                    ],
                    'stats' => [
                        'likes' => $roadmap->reactions_count,
                    ],
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $nodes->concat($roadmaps)->sortByDesc('stats.likes')->values(),
        ]);
    }

    /**
     * Obtener nodos por tema/categoría
     * GET /api/v1/mobile/topics/{topic}
     */
    public function getByTopic($topic)
    {
        $nodes = Node::where('topic', 'like', "%{$topic}%")
            ->with(['user'])
            ->withCount(['reactions', 'comments'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($node) {
                return [
                    'id' => $node->node_id,
                    'title' => $node->title,
                    'description' => $node->description,
                    'cover_image' => $node->cover_image,
                    'topic' => $node->topic,
                    'author' => [
                        'username' => $node->user->username ?? 'Usuario',
                        'avatar' => $node->user->avatar,
                    ],
                    'stats' => [
                        'likes' => $node->reactions_count,
                        'comments' => $node->comments_count,
                    ],
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'topic' => $topic,
                'nodes' => $nodes,
                'count' => $nodes->count(),
            ],
        ]);
    }

    /**
     * Obtener todos los temas disponibles
     * GET /api/v1/mobile/topics
     */
    public function getTopics()
    {
        $topics = Node::select('topic')
            ->selectRaw('COUNT(*) as count')
            ->whereNotNull('topic')
            ->groupBy('topic')
            ->orderBy('count', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->topic,
                    'count' => $item->count,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $topics,
        ]);
    }

    /**
     * Actualizar perfil de usuario
     * PUT /api/v1/mobile/profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'account_name' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:500',
            'avatar' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->update($request->only(['account_name', 'bio', 'avatar']));

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado',
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'account_name' => $user->account_name,
                'bio' => $user->bio,
                'avatar' => $user->avatar,
            ],
        ]);
    }

    /**
     * Obtener mis creaciones (nodos y roadmaps del usuario autenticado)
     * GET /api/v1/mobile/my-content
     */
    public function myContent(Request $request)
    {
        $user = $request->user();
        $type = $request->input('type', 'all'); // all, nodes, roadmaps

        $data = [];

        if ($type === 'all' || $type === 'nodes') {
            $nodes = Node::where('user_id', $user->id)
                ->withCount(['reactions', 'comments'])
                ->latest()
                ->get()
                ->map(function ($node) {
                    return [
                        'id' => $node->node_id,
                        'type' => 'node',
                        'title' => $node->title,
                        'description' => $node->description,
                        'cover_image' => $node->cover_image,
                        'topic' => $node->topic,
                        'stats' => [
                            'likes' => $node->reactions_count,
                            'comments' => $node->comments_count,
                        ],
                        'created_at' => $node->created_at,
                    ];
                });
            $data['nodes'] = $nodes;
        }

        if ($type === 'all' || $type === 'roadmaps') {
            $roadmaps = Roadmap::where('user_id', $user->id)
                ->withCount(['reactions', 'comments', 'nodes'])
                ->latest()
                ->get()
                ->map(function ($roadmap) {
                    return [
                        'id' => $roadmap->roadmap_id,
                        'type' => 'roadmap',
                        'title' => $roadmap->name,
                        'description' => $roadmap->description,
                        'cover_image' => $roadmap->cover_image,
                        'nodes_count' => $roadmap->nodes_count,
                        'stats' => [
                            'likes' => $roadmap->reactions_count,
                            'comments' => $roadmap->comments_count,
                        ],
                        'created_at' => $roadmap->created_at,
                    ];
                });
            $data['roadmaps'] = $roadmaps;
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Obtener feed paginado
     * GET /api/v1/mobile/feed?page=1&limit=10
     */
    public function feed(Request $request)
    {
        $page = $request->input('page', 1);
        $limit = $request->input('limit', 10);
        $offset = ($page - 1) * $limit;

        $feed = $this->getFeedData($limit, $offset);

        return response()->json([
            'success' => true,
            'data' => $feed,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'has_more' => $feed->count() >= $limit,
            ],
        ]);
    }

    /**
     * Obtener estadísticas del usuario
     * GET /api/v1/mobile/stats
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        $nodesCount = Node::where('user_id', $user->id)->count();
        $roadmapsCount = Roadmap::where('user_id', $user->id)->count();
        
        $totalLikes = Reaction::where('type', 'like')
            ->where(function($query) use ($user) {
                $query->whereIn('entity_id', Node::where('user_id', $user->id)->pluck('node_id'))
                      ->orWhereIn('entity_id', Roadmap::where('user_id', $user->id)->pluck('roadmap_id'));
            })
            ->count();

        $totalComments = Comment::where(function($query) use ($user) {
                $query->whereIn('entity_id', Node::where('user_id', $user->id)->pluck('node_id'))
                      ->orWhereIn('entity_id', Roadmap::where('user_id', $user->id)->pluck('roadmap_id'));
            })
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'nodes_created' => $nodesCount,
                'roadmaps_created' => $roadmapsCount,
                'total_likes' => $totalLikes,
                'total_comments' => $totalComments,
                'score' => $user->score ?? 0,
                'member_since' => $user->created_at->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Helper: Obtener datos del feed
     */
    private function getFeedData($limit = 10, $offset = 0)
    {
        $roadmaps = Roadmap::with(['user'])
            ->withCount(['reactions', 'comments'])
            ->latest()
            ->skip($offset)
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
            ->skip($offset)
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

        return $roadmaps->concat($nodes)->sortByDesc('created_at')->values();
    }
}
