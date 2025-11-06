<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Reaction extends Model
{
    protected $primaryKey = 'reaction_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'reaction_id',
        'user_id',
        'entity_type',
        'entity_id',
        'reaction_type',
    ];

    // Relación: Usuario que reaccionó
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relación polimórfica: Entidad (Node o Roadmap)
    public function entity(): MorphTo
    {
        return $this->morphTo('entity', 'entity_type', 'entity_id');
    }
}
