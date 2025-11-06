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

        // Obtener nodos del usuario
        $nodes = Node::where('user_id', $user->id)
            ->withCount(['reactions', 'comments'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Obtener roadmaps del usuario
        $roadmaps = Roadmap::where('user_id', $user->id)
            ->withCount(['reactions', 'comments', 'nodes'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Calcular estadísticas
        $stats = [
            'nodes_count' => $nodes->count(),
            'roadmaps_count' => $roadmaps->count(),
            'total_reactions' => $nodes->sum('reactions_count') + $roadmaps->sum('reactions_count'),
            'total_comments' => $nodes->sum('comments_count') + $roadmaps->sum('comments_count'),
        ];

        return Inertia::render('profile/[username]', [
            'user' => $user,
            'nodes' => $nodes,
            'roadmaps' => $roadmaps,
            'stats' => $stats,
        ]);
    }
}
