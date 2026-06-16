<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Modele3D extends Model implements HasMedia
{
    use HasFactory, HasUuids, InteractsWithMedia;

    protected $table = 'modele3ds';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['id', 'scale_offset'];

    protected $casts = [
        'scale_offset' => 'string'
    ];

    public function registerMediaCollections(): void {
        $this->addMediaCollection('fichier3d')
            ->singleFile()
            ->useDisk('public');
    }

    public function monture(): HasOne
    {
        return $this->hasOne(Monture::class);
    }
}
