<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Monture extends Model  implements HasMedia
{
    use HasFactory, HasUuids, InteractsWithMedia;

    protected $table = 'montures';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['id', 'nom', 'marque', 'prix', 'description', 'categorie', 'couleur', 'is_active', 'modele3d_id'];

    protected $casts = ['prix' => 'decimal:2', 'is_active' => 'boolean'];

    public function modele3d(): BelongsTo
    {
        return $this->belongsTo(Modele3D::class, 'modele3d_id');
    }

    public function registerMediaCollections(): void {
        $this->addMediaCollection('image')
            ->singleFile();

        $this->addMediaCollection('gallery');
    }

    public function registerMediaConversions(Media $media = null): void{
        $this->addMediaConversion('thumb')
            ->width(300)
            ->height(300)
            ->sharpen(10)
            ->performOnCollections('image', 'gallery');

        $this->addMediaConversion('preview')
            ->width(800)
            ->height(600)
            ->sharpen(90)
            ->performOnCollections('image', 'gallery');

        $this->addMediaConversion('webp')
            ->format('webp')
            ->quality(85)
            ->performOnCollections('image', 'gallery');
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
        return $this->modele3d;
    }

    public function getImageThumbAttribute() : ?string{
        return $this->getFirstMediaUrl('image', 'thumb');
    }

    public function getImagePreviewAttribute() : ?string{
        return $this->getFirstMediaUrl('image', 'preview');
    }

    public function getModele3dUrlAAttribute() : ?string{
        return $this->modele3d?->getFirstMediaUrl('fichier3d');
    }
}
