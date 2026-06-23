<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RealizationDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'realization_id',
        'item_name',
        'qty',
        'nominal',
        'total',
    ];

    protected $casts = [
        'qty' => 'decimal:5',
        'nominal' => 'decimal:5',
        'total' => 'decimal:5',
    ];

    public function header(): BelongsTo
    {
        return $this->belongsTo(RealizationHeader::class, 'realization_id');
    }
}
