<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Node_Comment extends Model
{
    protected $fillable = [
        'node_comment_id',
        'text',
        'node_id'
    ];
}
