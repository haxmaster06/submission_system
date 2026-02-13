<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionApproval extends Model
{
    protected $fillable = [
        'submission_id',
        'approver_id',
        'role_name',
        'step_order',
        'status',
        'approved_at',
        'signature_used',
        'signed_proof_path',
        'is_director_proxy',
        'notes',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
        'is_director_proxy' => 'boolean',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
