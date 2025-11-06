<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Content extends Model
{
    protected $primaryKey = 'content_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'content_id',
        'video',
        'image',
        'text',
        'node_id',
        'type',
        'content',
        'metadata',
        'order',
    ];

    protected $casts = [
        'metadata' => 'array',
        'video' => 'array',
        'image' => 'array',
        'text' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->content_id)) {
                $model->content_id = 'content-' . Str::uuid();
            }
        });
    }

    public function node(): BelongsTo
    {
        return $this->belongsTo(Node::class, 'node_id', 'node_id');
    }
}
