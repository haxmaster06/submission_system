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
        'currency',
        'kurs',
        'nominal_valas',
    ];

    protected $casts = [
        'qty' => 'decimal:5',
        'nominal' => 'decimal:5',
        'total' => 'decimal:5',
        'kurs' => 'decimal:5',
        'nominal_valas' => 'decimal:5',
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
