<?php

namespace App\Observers;

use App\Models\Node_Comment;
use App\Models\Notification;
use App\Models\Reaction;
use App\Models\Bookmark;

class NodeCommentObserver
{
    /**
     * Handle the Node_Comment "created" event.
     */
    public function created(Node_Comment $comment): void
    {
        // Obtener el nodo
        $node = $comment->node;
        if (!$node) return;

        // Obtener usuarios que han dado like a este nodo
        $usersWhoLiked = Reaction::where('entity_type', 'App\\Models\\Node')
            ->where('entity_id', $node->node_id)
            ->where('reaction_type', 'like')
            ->pluck('user_id')
            ->unique();

        // Obtener usuarios que han guardado este nodo
        $usersWhoBookmarked = Bookmark::where('bookmarkable_type', 'App\\Models\\Node')
            ->where('bookmarkable_id', $node->node_id)
            ->pluck('user_id')
            ->unique();

        // Combinar ambos grupos de usuarios
        $usersToNotify = $usersWhoLiked->merge($usersWhoBookmarked)->unique();

        // Crear notificación para cada usuario
        foreach ($usersToNotify as $userId) {
            // No notificar al autor del comentario ni al autor del nodo
            if ($userId == $comment->user_id || $userId == $node->user_id) {
                continue;
            }

            // Determinar el mensaje según si guardó o le gustó el nodo
            $hasBookmarked = $usersWhoBookmarked->contains($userId);
            $hasLiked = $usersWhoLiked->contains($userId);
            
            if ($hasBookmarked && $hasLiked) {
                $message = "Nuevo comentario en el nodo '{$node->title}' que guardaste";
            } elseif ($hasBookmarked) {
                $message = "Nuevo comentario en el nodo '{$node->title}' que guardaste";
            } else {
                $message = "Nuevo comentario en el nodo '{$node->title}' que te gustó";
            }

            Notification::create([
                'user_id' => $userId,
                'type' => 'node_comment',
                'notifiable_type' => 'App\\Models\\Node',
                'notifiable_id' => $node->node_id,
                'message' => $message,
                'data' => [
                    'node_id' => $node->node_id,
                    'node_title' => $node->title,
                    'node_cover' => $node->cover_image,
                    'comment_id' => $comment->node_comment_id,
                    'comment_text' => substr($comment->text, 0, 100),
                    'commenter_name' => $comment->user->username ?? 'Usuario',
                    'created_at' => $comment->created_at->toIso8601String(),
                ],
            ]);
        }

        // También notificar al autor del nodo (si no es el comentarista)
        if ($node->user_id && $node->user_id != $comment->user_id) {
            Notification::create([
                'user_id' => $node->user_id,
                'type' => 'node_comment',
                'notifiable_type' => 'App\\Models\\Node',
                'notifiable_id' => $node->node_id,
                'message' => "Nuevo comentario en tu nodo '{$node->title}'",
                'data' => [
                    'node_id' => $node->node_id,
                    'node_title' => $node->title,
                    'node_cover' => $node->cover_image,
                    'comment_id' => $comment->node_comment_id,
                    'comment_text' => substr($comment->text, 0, 100),
                    'commenter_name' => $comment->user->username ?? 'Usuario',
                    'created_at' => $comment->created_at->toIso8601String(),
                ],
            ]);
        }
    }
}
