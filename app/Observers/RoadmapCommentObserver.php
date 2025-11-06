<?php

namespace App\Observers;

use App\Models\Roadmap_Comment;
use App\Models\Notification;
use App\Models\Reaction;
use App\Models\Bookmark;

class RoadmapCommentObserver
{
    /**
     * Handle the Roadmap_Comment "created" event.
     */
    public function created(Roadmap_Comment $comment): void
    {
        // Obtener el roadmap
        $roadmap = $comment->roadmap;
        if (!$roadmap) return;

        // Obtener usuarios que han dado like a este roadmap
        $usersWhoLiked = Reaction::where('entity_type', 'App\\Models\\Roadmap')
            ->where('entity_id', $roadmap->roadmap_id)
            ->where('reaction_type', 'like')
            ->pluck('user_id')
            ->unique();

        // Obtener usuarios que han guardado este roadmap
        $usersWhoBookmarked = Bookmark::where('bookmarkable_type', 'App\\Models\\Roadmap')
            ->where('bookmarkable_id', $roadmap->roadmap_id)
            ->pluck('user_id')
            ->unique();

        // Combinar ambos grupos de usuarios
        $usersToNotify = $usersWhoLiked->merge($usersWhoBookmarked)->unique();

        // Crear notificación para cada usuario
        foreach ($usersToNotify as $userId) {
            // No notificar al autor del comentario ni al autor del roadmap
            if ($userId == $comment->user_id || $userId == $roadmap->user_id) {
                continue;
            }

            // Determinar el mensaje según si guardó o le gustó el roadmap
            $hasBookmarked = $usersWhoBookmarked->contains($userId);
            $hasLiked = $usersWhoLiked->contains($userId);
            
            if ($hasBookmarked && $hasLiked) {
                $message = "Nuevo comentario en el roadmap '{$roadmap->name}' que guardaste";
            } elseif ($hasBookmarked) {
                $message = "Nuevo comentario en el roadmap '{$roadmap->name}' que guardaste";
            } else {
                $message = "Nuevo comentario en el roadmap '{$roadmap->name}' que te gustó";
            }

            Notification::create([
                'user_id' => $userId,
                'type' => 'roadmap_comment',
                'notifiable_type' => 'App\\Models\\Roadmap',
                'notifiable_id' => $roadmap->roadmap_id,
                'message' => $message,
                'data' => [
                    'roadmap_id' => $roadmap->roadmap_id,
                    'roadmap_name' => $roadmap->name,
                    'roadmap_cover' => $roadmap->cover_image,
                    'comment_id' => $comment->roadmap_comment_id,
                    'comment_text' => substr($comment->text, 0, 100),
                    'commenter_name' => $comment->user->username ?? 'Usuario',
                    'created_at' => $comment->created_at->toIso8601String(),
                ],
            ]);
        }

        // También notificar al autor del roadmap (si no es el comentarista)
        if ($roadmap->user_id && $roadmap->user_id != $comment->user_id) {
            Notification::create([
                'user_id' => $roadmap->user_id,
                'type' => 'roadmap_comment',
                'notifiable_type' => 'App\\Models\\Roadmap',
                'notifiable_id' => $roadmap->roadmap_id,
                'message' => "Nuevo comentario en tu roadmap '{$roadmap->name}'",
                'data' => [
                    'roadmap_id' => $roadmap->roadmap_id,
                    'roadmap_name' => $roadmap->name,
                    'roadmap_cover' => $roadmap->cover_image,
                    'comment_id' => $comment->roadmap_comment_id,
                    'comment_text' => substr($comment->text, 0, 100),
                    'commenter_name' => $comment->user->username ?? 'Usuario',
                    'created_at' => $comment->created_at->toIso8601String(),
                ],
            ]);
        }
    }
}
