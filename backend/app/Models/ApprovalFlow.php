<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApprovalFlow extends Model
{
    protected $fillable = ['name', 'is_default', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    public function steps(): HasMany
    {
        return $this->hasMany(ApprovalFlowStep::class, 'flow_id');
    }

    public function conditions(): HasMany
    {
        return $this->hasMany(ApprovalCondition::class, 'flow_id');
    }
}
