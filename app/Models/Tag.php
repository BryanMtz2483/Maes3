<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $primaryKey = 'tag_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'tag_id',
        'name',
    ];

    // Relación: Roadmaps asociados (N:N)
    public function roadmaps(): BelongsToMany
    {
        return $this->belongsToMany(Roadmap::class, 'roadmap_tag', 'tag_id', 'roadmap_id')
                    ->withTimestamps();
    }
}
