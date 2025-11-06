<?php

namespace App\Observers;

use App\Models\Roadmap;
use App\Models\Notification;
use App\Models\Reaction;

class RoadmapObserver
{
    /**
     * Handle the Roadmap "updated" event.
     */
    public function updated(Roadmap $roadmap): void
    {
        // Obtener usuarios que han dado like a este roadmap
        $usersWhoLiked = Reaction::where('entity_type', 'App\\Models\\Roadmap')
            ->where('entity_id', $roadmap->roadmap_id)
            ->where('reaction_type', 'like')
            ->pluck('user_id')
            ->unique();

        // Crear notificación para cada usuario
        foreach ($usersWhoLiked as $userId) {
            // No notificar al autor del roadmap
            if ($userId == $roadmap->user_id) {
                continue;
            }

            Notification::create([
                'user_id' => $userId,
                'type' => 'roadmap_updated',
                'notifiable_type' => 'App\\Models\\Roadmap',
                'notifiable_id' => $roadmap->roadmap_id,
                'message' => "El roadmap '{$roadmap->name}' que te gustó ha sido actualizado",
                'data' => [
                    'roadmap_id' => $roadmap->roadmap_id,
                    'roadmap_name' => $roadmap->name,
                    'roadmap_cover' => $roadmap->cover_image,
                    'updated_at' => $roadmap->updated_at->toIso8601String(),
                ],
            ]);
        }
    }
}
