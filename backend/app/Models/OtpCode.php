<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class OtpCode extends Model
{
    use HasUuids;

    protected $fillable = [
        'email',
        'code',
        'purpose',
        'expires_at',
        'verified_at',
        'attempts',
        'blocked_until'
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'verified_at' => 'datetime',
            'blocked_until' => 'datetime'
        ];
    }

    public function isExpired(): bool
    {
        return now()->greaterThan($this->expires_at);
    }

    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    public function isBlocked(): bool
    {
        return $this->blocked_until &&
            now()->lessThan($this->blocked_until);
    }
}