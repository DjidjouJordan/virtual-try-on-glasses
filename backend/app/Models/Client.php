<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory, HasUuids;

    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'ecart_pupillaire',
        'forme_visage'
    ];

    protected function casts(): array
    {
        return [
            'ecart_pupillaire' => 'decimal:2'
        ];
    }

    /**
     * Utilisateur propriétaire
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Favoris du client
     */
    public function favoris(): HasMany
    {
        return $this->hasMany(Favori::class, 'client_id');
    }

    /**
     * Captures d'essayage
     */
    public function snapshots(): HasMany
    {
        return $this->hasMany(
            Snapshot::class,
            'client_id'
        );
    }

    /**
     * Mesure et enregistre l'écart pupillaire
     */
    public function mesurerPD(float $ecartMm): bool
    {
        return $this->update([
            'ecart_pupillaire' => $ecartMm
        ]);
    }
}