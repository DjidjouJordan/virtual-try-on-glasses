<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Snapshot extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['client_id', 'image_url', 'date_capture', 'new_attr'];

    protected function casts(): array
    {
        return ['date_capture' => 'datetime'];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
