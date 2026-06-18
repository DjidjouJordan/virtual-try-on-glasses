<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory;

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
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
        return $this->belongsTo(User::class);
    }

    /**
     * Favoris du client
     */
    public function favoris(): HasMany
    {
        return $this->hasMany(Favori::class);
    }

    /**
     * Captures d'essayage
     */
    public function snapshots(): HasMany
    {
        return $this->hasMany(Snapshot::class);
    }

    public function commandes(): HasMany
    {
        return $this->hasMany(Commande::class);
    }

    /** mesurerPD() — enregistre l'écart pupillaire mesuré */
    public function mesurerPD(float $ecartMm): void
    {
        $this->update([
            'ecart_pupillaire' => $ecartMm
        ]);
    }
}
