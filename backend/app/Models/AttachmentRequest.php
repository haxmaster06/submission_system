<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttachmentRequest extends Model
{
    protected $fillable = [
        'submission_id',
        'requested_by',
        'target_user_id',
        'file_description',
        'status',
        'attachment_id',
    ];

    protected $appends = ['requester_name', 'target_user_name'];

    public function getRequesterNameAttribute()
    {
        return $this->requestedBy->name ?? 'Unknown';
    }

    public function getTargetUserNameAttribute()
    {
        return $this->targetUser->name ?? 'Unknown';
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function targetUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    public function attachment(): BelongsTo
    {
        return $this->belongsTo(SubmissionAttachment::class, 'attachment_id');
    }
}
