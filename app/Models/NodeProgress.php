<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NodeProgress extends Model
{
    use HasFactory;

    protected $table = 'node_progress';

    protected $fillable = [
        'user_id',
        'node_id',
        'completed',
        'completed_at',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    /**
     * Relación con el usuario
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con el nodo
     */
    public function node()
    {
        return $this->belongsTo(Node::class, 'node_id', 'node_id');
    }

    /**
     * Marcar un nodo como completado
     */
    public static function markAsCompleted($userId, $nodeId)
    {
        return self::updateOrCreate(
            ['user_id' => $userId, 'node_id' => $nodeId],
            ['completed' => true, 'completed_at' => now()]
        );
    }

    /**
     * Marcar un nodo como no completado
     */
    public static function markAsIncomplete($userId, $nodeId)
    {
        return self::updateOrCreate(
            ['user_id' => $userId, 'node_id' => $nodeId],
            ['completed' => false, 'completed_at' => null]
        );
    }

    /**
     * Verificar si un nodo está completado
     */
    public static function isCompleted($userId, $nodeId)
    {
        $progress = self::where('user_id', $userId)
            ->where('node_id', $nodeId)
            ->first();
        
        return $progress ? $progress->completed : false;
    }

    /**
     * Obtener todos los nodos completados de un usuario
     */
    public static function getCompletedNodes($userId)
    {
        return self::where('user_id', $userId)
            ->where('completed', true)
            ->pluck('node_id')
            ->toArray();
    }
}
