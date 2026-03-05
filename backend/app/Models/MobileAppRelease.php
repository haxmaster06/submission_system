<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MobileAppRelease extends Model
{
    protected $fillable = [
        'platform',
        'version',
        'filename',
        'file_path',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
