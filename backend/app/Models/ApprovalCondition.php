<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalCondition extends Model
{
    protected $fillable = [
        'flow_id',
        'name',
        'role_name',
        'insert_after_step',
        'condition_type',
        'condition_rules',
        'is_active',
        'priority',
    ];

    protected $casts = [
        'condition_rules' => 'array',
        'is_active' => 'boolean',
    ];

    public function flow(): BelongsTo
    {
        return $this->belongsTo(ApprovalFlow::class, 'flow_id');
    }
}
