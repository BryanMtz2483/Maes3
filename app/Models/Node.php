<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Node extends Model
{
    protected $fillable = [
        'title',
        'author',
        'created_date',
        'topic'
    ];
}
