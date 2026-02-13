<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubmissionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'description',
        'qty',
        'uom_id',
        'nominal',
        'total',
    ];

    protected $casts = [
        'qty' => 'decimal:2',
        'nominal' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    /**
     * Relationships
     */
    public function submission()
    {
        return $this->belongsTo(Submission::class);
    }

    public function uom()
    {
        return $this->belongsTo(Uom::class);
    }

    /**
     * Boot method to auto-calculate total
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($item) {
            $item->total = $item->qty * $item->nominal;
        });
    }
}
