<?php

namespace App\Observers;

use App\Models\NodeProgress;

class NodeProgressObserver
{
    /**
     * Handle the NodeProgress "created" event.
     */
    public function created(NodeProgress $nodeProgress): void
    {
        if ($nodeProgress->completed) {
            $this->updateUserScore($nodeProgress);
        }
    }

    /**
     * Handle the NodeProgress "updated" event.
     */
    public function updated(NodeProgress $nodeProgress): void
    {
        // Solo actualizar si cambió el estado de completado
        if ($nodeProgress->isDirty('completed')) {
            $this->updateUserScore($nodeProgress);
        }
    }

    /**
     * Handle the NodeProgress "deleted" event.
     */
    public function deleted(NodeProgress $nodeProgress): void
    {
        if ($nodeProgress->completed) {
            $this->updateUserScore($nodeProgress);
        }
    }

    /**
     * Actualizar el score del usuario
     */
    private function updateUserScore(NodeProgress $nodeProgress): void
    {
        $user = $nodeProgress->user;
        if ($user) {
            $user->updateScore();
        }
    }
}
