<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Bookmark extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bookmarkable_type',
        'bookmarkable_id',
    ];

    /**
     * Relación polimórfica con el item guardado
     * Especificamos las claves manualmente porque roadmap_id y node_id no son auto-incrementales
     */
    public function bookmarkable(): MorphTo
    {
        return $this->morphTo('bookmarkable', 'bookmarkable_type', 'bookmarkable_id');
    }

    /**
     * Usuario que guardó el item
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
