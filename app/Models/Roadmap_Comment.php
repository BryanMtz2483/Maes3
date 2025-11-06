<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Roadmap_Comment extends Model
{
    protected $table = 'roadmap_comments';
    protected $primaryKey = 'roadmap_comment_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'roadmap_comment_id',
        'text',
        'roadmap_id',
        'user_id'
    ];

    // Relación con usuario
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // Relación con roadmap
    public function roadmap(): BelongsTo
    {
        return $this->belongsTo(Roadmap::class, 'roadmap_id', 'roadmap_id');
    }
}
