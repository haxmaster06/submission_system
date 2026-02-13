<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UrgencyStatus extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'level', 'color'];

    public function submissions()
    {
        return $this->hasMany(Submission::class, 'status_urgent', 'code');
    }
}
