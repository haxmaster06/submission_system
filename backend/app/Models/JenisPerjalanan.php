<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JenisPerjalanan extends Model
{
    use \App\Traits\ClearsLookupCache;
    protected $table = 'jenis_perjalanan';
    protected $fillable = ['name'];

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }
}