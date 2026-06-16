<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Modele3D extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'modele3ds';

    protected $fillable = ['url_fichier', 'scale_offset'];

    public function monture(): HasOne
    {
        return $this->hasOne(Monture::class, 'modele3d_id');
    }
}
