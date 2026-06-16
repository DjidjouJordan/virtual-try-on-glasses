<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Favori extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['client_id', 'monture_id', 'date_ajout'];

    protected function casts(): array
    {
        return ['date_ajout' => 'datetime'];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function monture(): BelongsTo
    {
        return $this->belongsTo(Monture::class);
    }
}
