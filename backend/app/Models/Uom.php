<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Uom extends Model
{
    use HasFactory, \App\Traits\ClearsLookupCache;
    protected $fillable = ['name', 'code'];

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }
}