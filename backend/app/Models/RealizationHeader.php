<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RealizationHeader extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'realization_date',
        'notes',
    ];

    protected $casts = [
        'realization_date' => 'date',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(RealizationDetail::class, 'realization_id');
    }
}
