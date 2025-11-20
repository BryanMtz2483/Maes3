<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Roadmap extends Model
{
    protected $primaryKey = 'roadmap_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'roadmap_id',
        'name',
        'description',
        'tags',
        'roadmap_id_fk',
        'author_id',
        'user_id',
        'cover_image',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relación: Usuario autor
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id', 'id');
    }

    // Relación: Roadmap padre (auto-referencia)
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Roadmap::class, 'roadmap_id_fk', 'roadmap_id');
    }

    // Relación: Roadmaps hijos (auto-referencia)
    public function children(): HasMany
    {
        return $this->hasMany(Roadmap::class, 'roadmap_id_fk', 'roadmap_id');
    }

    // Relación: Comentarios del roadmap
    public function comments(): HasMany
    {
        return $this->hasMany(Roadmap_Comment::class, 'roadmap_id', 'roadmap_id');
    }

    // Relación: Nodos asociados (N:N)
    public function nodes(): BelongsToMany
    {
        return $this->belongsToMany(Node::class, 'node_roadmap', 'roadmap_id', 'node_id')
                    ->withTimestamps();
    }

    // Relación: Tags asociados (N:N)
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'roadmap_tag', 'roadmap_id', 'tag_id')
                    ->withTimestamps();
    }

    // Relación: Reacciones (polimórfica)
    public function reactions(): MorphMany
    {
        return $this->morphMany(Reaction::class, 'entity', 'entity_type', 'entity_id', 'roadmap_id');
    }

    // Relación: Estadísticas del roadmap
    public function statistics(): HasOne
    {
        return $this->hasOne(RoadmapStatistics::class, 'roadmap_id', 'roadmap_id');
    }

    // Scope: Roadmaps principales (sin padre)
    public function scopeRoots($query)
    {
        return $query->whereNull('roadmap_id_fk');
    }

    // Accessor: Obtener array de tags
    public function getTagsArrayAttribute()
    {
        return $this->tags ? explode(',', $this->tags) : [];
    }
}
