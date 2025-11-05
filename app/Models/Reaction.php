<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reaction extends Model
{
    protected $fillable = [
        'user_id',
        'entity_type',
        'entity_id',
        'reaction_type'
    ];
}
