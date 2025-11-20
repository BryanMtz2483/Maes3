<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoadmapStatistics extends Model
{
    protected $table = 'roadmap_statistics';

    protected $fillable = [
        'roadmap_id',
        'completion_count',
        'dropout_count',
        'avg_hours_spent',
        'avg_nodes_completed',
        'bookmark_count',
        'usefulness_score',
    ];

    protected $casts = [
        'completion_count' => 'integer',
        'dropout_count' => 'integer',
        'avg_hours_spent' => 'decimal:2',
        'avg_nodes_completed' => 'decimal:2',
        'bookmark_count' => 'integer',
        'usefulness_score' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación: Roadmap asociado
     */
    public function roadmap(): BelongsTo
    {
        return $this->belongsTo(Roadmap::class, 'roadmap_id', 'roadmap_id');
    }
}
