<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JenisPengajuan extends Model
{
    use HasFactory;
    protected $table = 'jenis_pengajuan';
    protected $fillable = ['name', 'form_schema_json', 'requires_travel_type'];

    protected $casts = [
        'form_schema_json' => 'array',
        'requires_travel_type' => 'boolean',
    ];

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }
}
