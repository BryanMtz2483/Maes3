<?php

namespace App\Observers;

use App\Models\Node;
use App\Models\Notification;
use App\Models\Reaction;

class NodeObserver
{
    /**
     * Handle the Node "updated" event.
     */
    public function updated(Node $node): void
    {
        // Obtener usuarios que han dado like a este nodo
        $usersWhoLiked = Reaction::where('entity_type', 'App\\Models\\Node')
            ->where('entity_id', $node->node_id)
            ->where('reaction_type', 'like')
            ->pluck('user_id')
            ->unique();

        // Crear notificación para cada usuario
        foreach ($usersWhoLiked as $userId) {
            // No notificar al autor del nodo
            if ($userId == $node->user_id) {
                continue;
            }

            Notification::create([
                'user_id' => $userId,
                'type' => 'node_updated',
                'notifiable_type' => 'App\\Models\\Node',
                'notifiable_id' => $node->node_id,
                'message' => "El nodo '{$node->title}' que te gustó ha sido actualizado",
                'data' => [
                    'node_id' => $node->node_id,
                    'node_title' => $node->title,
                    'node_cover' => $node->cover_image,
                    'updated_at' => $node->updated_at->toIso8601String(),
                ],
            ]);
        }
    }
}
