<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Commande extends Model
{
    use HasUuids;

    protected $fillable = [
        'client_id',
        'montant',
        'methode_paiement',
        'telephone',
        'statut',
        'reference_mtn',
        'articles',
        'payee_le',
    ];

    protected $casts = [
        'articles'  => 'array',
        'montant'   => 'float',
        'payee_le'  => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
