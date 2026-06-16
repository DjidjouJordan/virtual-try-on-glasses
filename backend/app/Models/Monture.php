<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Monture extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['modele', 'prix', 'description', 'image_url', 'modele3d_id'];

    protected function casts(): array
    {
        return ['prix' => 'decimal:2'];
    }

    public function modele3D(): BelongsTo
    {
        return $this->belongsTo(Modele3D::class, 'modele3d_id');
    }

    public function favoris(): HasMany
    {
        return $this->hasMany(Favori::class);
    }

    /** calculerFit() — score de compatibilité basé sur l'écart pupillaire du client */
    public function calculerFit(?float $ecartPupillaire): float
    {
        if ($ecartPupillaire === null) return 0.0;
        // Plage idéale : 60–72 mm. Score décroît en dehors.
        $ideal = 66.0;
        $diff = abs($ecartPupillaire - $ideal);
        return max(0.0, round(100.0 - ($diff * 3.0), 1));
    }

    /** get3DAsset() — retourne le modèle 3D associé */
    public function get3DAsset(): ?Modele3D
    {
        return $this->modele3D;
    }
}
