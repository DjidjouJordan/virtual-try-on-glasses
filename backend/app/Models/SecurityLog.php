<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SecurityLog extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'action',
        'ip',
        'user_agent',
        'meta'
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array'
        ];
    }
}