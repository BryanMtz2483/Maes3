<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Node extends Model
{
    protected $primaryKey = 'node_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'node_id',
        'title',
        'description',
        'author',
        'author_id',
        'user_id',
        'created_date',
        'topic',
        'cover_image',
    ];

    protected $casts = [
        'created_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relación: Usuario autor
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id', 'id');
    }

    // Relación: Contenidos del nodo
    public function contents(): HasMany
    {
        return $this->hasMany(Content::class, 'node_id', 'node_id');
    }

    // Relación: Comentarios del nodo
    public function comments(): HasMany
    {
        return $this->hasMany(Node_Comment::class, 'node_id', 'node_id');
    }

    // Relación: Roadmaps asociados (N:N)
    public function roadmaps(): BelongsToMany
    {
        return $this->belongsToMany(Roadmap::class, 'node_roadmap', 'node_id', 'roadmap_id')
                    ->withTimestamps();
    }

    // Relación: Reacciones (polimórfica)
    public function reactions(): MorphMany
    {
        return $this->morphMany(Reaction::class, 'entity', 'entity_type', 'entity_id', 'node_id');
    }

    // Scope: Nodos por tema
    public function scopeByTopic($query, $topic)
    {
        return $query->where('topic', $topic);
    }

    // Scope: Nodos por autor
    public function scopeByAuthor($query, $author)
    {
        return $query->where('author', $author);
    }
}
