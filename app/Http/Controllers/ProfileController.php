<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Node;
use App\Models\Roadmap;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Display the specified user's profile.
     */
    public function show(string $username)
    {
        // Buscar usuario por username
        $user = User::where('username', $username)->firstOrFail();

        // Obtener nodos creados por el usuario
        $nodes = Node::where('user_id', $user->id)
            ->withCount(['reactions', 'comments'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Obtener roadmaps creados por el usuario
        $roadmaps = Roadmap::where('user_id', $user->id)
            ->withCount(['reactions', 'comments', 'nodes'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Obtener roadmaps completados por el usuario
        $completedRoadmaps = $user->completedRoadmaps()->map(function ($roadmap) {
            return [
                'roadmap_id' => $roadmap->roadmap_id,
                'name' => $roadmap->name,
                'description' => $roadmap->description,
                'cover_image' => $roadmap->cover_image,
                'created_at' => $roadmap->created_at,
                'nodes_count' => $roadmap->nodes->count(),
            ];
        })->values();

        // Calcular estadísticas completas
        $stats = [
            // Nodos y roadmaps creados
            'nodes_created' => $nodes->count(),
            'roadmaps_created' => $roadmaps->count(),
            
            // Progreso del usuario
            'nodes_completed' => $user->completedNodes()->count(),
            'roadmaps_completed' => $completedRoadmaps->count(),
            
            // Score basado en nodos completados (10 puntos por nodo)
            'score' => $user->score,
            
            // Interacciones sociales
            'total_reactions' => $nodes->sum('reactions_count') + $roadmaps->sum('reactions_count'),
            'total_comments' => $nodes->sum('comments_count') + $roadmaps->sum('comments_count'),
        ];

        return Inertia::render('profile/[username]', [
            'user' => $user,
            'nodes' => $nodes,
            'roadmaps' => $roadmaps,
            'completedRoadmaps' => $completedRoadmaps,
            'stats' => $stats,
        ]);
    }
}
