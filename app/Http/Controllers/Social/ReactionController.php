<?php

namespace App\Http\Controllers\Social;

use App\Http\Controllers\Controller;
use App\Models\Reaction;
use App\Models\Node;
use App\Models\Roadmap;
use App\Models\NodeProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ReactionController extends Controller
{
    /**
     * Store a new reaction
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'entity_type' => 'required|in:node,roadmap',
            'entity_id' => 'required|string',
            'reaction_type' => 'required|in:like,dislike,love,celebrate,insightful,curious',
        ]);

        // Verificar que la entidad existe
        $this->validateEntity($validated['entity_type'], $validated['entity_id']);

        // Verificar si ya existe una reacción del mismo tipo
        $existing = Reaction::where([
            'user_id' => auth()->id(),
            'entity_type' => $validated['entity_type'],
            'entity_id' => $validated['entity_id'],
            'reaction_type' => $validated['reaction_type'],
        ])->first();

        if ($existing) {
            return response()->json([
                'message' => 'Ya has reaccionado con este tipo',
                'reaction' => $existing,
            ], 409);
        }

        $reaction = Reaction::create([
            'reaction_id' => 'r-' . Str::uuid(),
            'user_id' => auth()->id(),
            'entity_type' => $validated['entity_type'],
            'entity_id' => $validated['entity_id'],
            'reaction_type' => $validated['reaction_type'],
        ]);

        return response()->json([
            'message' => 'Reacción agregada exitosamente',
            'reaction' => $reaction->load('user'),
        ], 201);
    }

    /**
     * Remove a reaction
     */
    public function destroy(string $reaction_id)
    {
        $reaction = Reaction::where('reaction_id', $reaction_id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $reaction->delete();

        return response()->json([
            'message' => 'Reacción eliminada exitosamente',
        ]);
    }

    /**
     * Toggle a reaction (add if not exists, remove if exists)
     */
    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'entity_type' => 'required|in:node,roadmap',
            'entity_id' => 'required|string',
            'reaction_type' => 'required|in:like,dislike,love,celebrate,insightful,curious',
        ]);

        $reaction = Reaction::where([
            'user_id' => auth()->id(),
            'entity_type' => $validated['entity_type'],
            'entity_id' => $validated['entity_id'],
            'reaction_type' => $validated['reaction_type'],
        ])->first();

        if ($reaction) {
            $reaction->delete();
            
            // Si es un like en un nodo, marcarlo como no completado
            if ($validated['entity_type'] === 'node' && $validated['reaction_type'] === 'like') {
                NodeProgress::markAsIncomplete(auth()->id(), $validated['entity_id']);
            }
            
            // Si es un like en un roadmap, marcar todos sus nodos como no completados Y eliminar reacciones
            if ($validated['entity_type'] === 'roadmap' && $validated['reaction_type'] === 'like') {
                $roadmap = Roadmap::where('roadmap_id', $validated['entity_id'])->first();
                if ($roadmap) {
                    foreach ($roadmap->nodes as $node) {
                        NodeProgress::markAsIncomplete(auth()->id(), $node->node_id);
                        
                        // También eliminar reacción de like del nodo si existe
                        Reaction::where([
                            'user_id' => auth()->id(),
                            'entity_type' => 'node',
                            'entity_id' => $node->node_id,
                            'reaction_type' => 'like',
                        ])->delete();
                    }
                }
            }
            
            return response()->json([
                'message' => 'Reacción eliminada',
                'action' => 'removed',
            ]);
        }

        $newReaction = Reaction::create([
            'reaction_id' => 'r-' . Str::uuid(),
            'user_id' => auth()->id(),
            'entity_type' => $validated['entity_type'],
            'entity_id' => $validated['entity_id'],
            'reaction_type' => $validated['reaction_type'],
        ]);

        // Si es un like en un nodo, marcarlo como completado
        if ($validated['entity_type'] === 'node' && $validated['reaction_type'] === 'like') {
            NodeProgress::markAsCompleted(auth()->id(), $validated['entity_id']);
        }
        
        // Si es un like en un roadmap, marcar todos sus nodos como completados Y crear reacciones
        if ($validated['entity_type'] === 'roadmap' && $validated['reaction_type'] === 'like') {
            $roadmap = Roadmap::where('roadmap_id', $validated['entity_id'])->first();
            if ($roadmap) {
                foreach ($roadmap->nodes as $node) {
                    NodeProgress::markAsCompleted(auth()->id(), $node->node_id);
                    
                    // También crear reacción de like para el nodo si no existe
                    Reaction::firstOrCreate([
                        'user_id' => auth()->id(),
                        'entity_type' => 'node',
                        'entity_id' => $node->node_id,
                        'reaction_type' => 'like',
                    ], [
                        'reaction_id' => 'r-' . Str::uuid(),
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Reacción agregada',
            'action' => 'added',
            'reaction' => $newReaction->load('user'),
        ], 201);
    }

    /**
     * Get reactions for an entity
     */
    public function getByEntity(string $entity_type, string $entity_id)
    {
        $reactions = Reaction::with('user')
            ->where('entity_type', $entity_type)
            ->where('entity_id', $entity_id)
            ->get()
            ->groupBy('reaction_type');

        $summary = [];
        foreach ($reactions as $type => $items) {
            $summary[$type] = [
                'count' => $items->count(),
                'users' => $items->pluck('user')->take(5), // Primeros 5 usuarios
            ];
        }

        return response()->json([
            'reactions' => $reactions,
            'summary' => $summary,
            'total' => Reaction::where('entity_type', $entity_type)
                ->where('entity_id', $entity_id)
                ->count(),
        ]);
    }

    /**
     * Get user's reactions
     */
    public function getByUser(int $user_id = null)
    {
        $userId = $user_id ?? auth()->id();

        $reactions = Reaction::with(['user'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($reactions);
    }

    /**
     * Get reaction statistics
     */
    public function statistics(string $entity_type, string $entity_id)
    {
        $stats = Reaction::where('entity_type', $entity_type)
            ->where('entity_id', $entity_id)
            ->selectRaw('reaction_type, COUNT(*) as count')
            ->groupBy('reaction_type')
            ->get();

        $userReactions = Reaction::where([
            'user_id' => auth()->id(),
            'entity_type' => $entity_type,
            'entity_id' => $entity_id,
        ])->get();

        // Separar likes y dislikes
        $likesCount = $stats->where('reaction_type', 'like')->first()->count ?? 0;
        $dislikesCount = $stats->where('reaction_type', 'dislike')->first()->count ?? 0;
        
        $userLiked = $userReactions->where('reaction_type', 'like')->isNotEmpty();
        $userDisliked = $userReactions->where('reaction_type', 'dislike')->isNotEmpty();

        return response()->json([
            'statistics' => $stats,
            'user_reactions' => $userReactions,
            'user_liked' => $userLiked,
            'user_disliked' => $userDisliked,
            'likes_count' => $likesCount,
            'dislikes_count' => $dislikesCount,
            'total' => $stats->sum('count'),
        ]);
    }

    /**
     * Validate that entity exists
     */
    private function validateEntity(string $type, string $id)
    {
        if ($type === 'node') {
            Node::where('node_id', $id)->firstOrFail();
        } elseif ($type === 'roadmap') {
            Roadmap::where('roadmap_id', $id)->firstOrFail();
        }
    }
}
