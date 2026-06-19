<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 
        'monture_id', 
        'quantity', 
        'unit_price', // Doit être présent
        'subtotal'
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function monture(): BelongsTo
    {
        return $this->belongsTo(Monture::class);
    }
}