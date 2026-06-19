<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    // On met exactement les mêmes noms que dans ta migration create_payments_table
    protected $fillable = [
        'order_id', 
        'campay_reference', 
        'external_reference', 
        'phone_number',
        'amount', 
        'operator',
        'status', 
        'raw_response'
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}