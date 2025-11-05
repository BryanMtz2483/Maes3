<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Roadmap_Comment extends Model
{
    protected $fillable = [
        'text',
        'roadmap_id'
    ];
}
