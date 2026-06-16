<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['user_id', 'ecart_pupillaire', 'forme_visage'];

    protected function casts(): array
    {
        return ['ecart_pupillaire' => 'float'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function favoris(): HasMany
    {
        return $this->hasMany(Favori::class);
    }

    public function snapshots(): HasMany
    {
        return $this->hasMany(Snapshot::class);
    }

    /** mesurerPD() — enregistre l'écart pupillaire mesuré */
    public function mesurerPD(float $ecartMm): void
    {
        $this->update(['ecart_pupillaire' => $ecartMm]);
    }
}
