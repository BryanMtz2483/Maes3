<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Node_Comment extends Model
{
    protected $table = 'node_comments';
    protected $primaryKey = 'node_comment_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'node_comment_id',
        'text',
        'node_id',
        'user_id'
    ];

    // Relación con usuario (asumiendo que existe user_id)
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // Relación con nodo
    public function node(): BelongsTo
    {
        return $this->belongsTo(Node::class, 'node_id', 'node_id');
    }
}
