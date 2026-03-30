<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Submission extends Model
{
    use HasFactory;
    protected $fillable = [
        'no_pengajuan',
        'user_id',
        'division_id',
        'jenis_pengajuan_id',
        'jenis_perjalanan_id',
        'status_urgent',
        'description',
        'notes',
        'qty',
        'uom_id',
        'nominal',
        'total',
        'tanggal_pengajuan',
        'current_approval_step',
        'final_status',
        'is_completed',
        'payload',
    ];

    protected $casts = [
        'tanggal_pengajuan' => 'datetime',
        'qty' => 'decimal:2',
        'nominal' => 'decimal:2',
        'total' => 'decimal:2',
        'is_completed' => 'boolean',
        'payload' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function jenisPengajuan(): BelongsTo
    {
        return $this->belongsTo(JenisPengajuan::class);
    }

    public function jenisPerjalanan(): BelongsTo
    {
        return $this->belongsTo(JenisPerjalanan::class);
    }

    public function uom(): BelongsTo
    {
        return $this->belongsTo(Uom::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SubmissionItem::class);
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(SubmissionApproval::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(SubmissionAttachment::class);
    }

    public function realizations(): HasMany
    {
        return $this->hasMany(RealizationHeader::class);
    }

    public function scopeAccessibleBy($query, $user)
    {
        $userScopes = $user->roles->pluck('data_scope')->toArray();
        if (empty($userScopes)) $userScopes = ['personal'];

        if (in_array('corporate', $userScopes)) {
            // Corporate scope: see all non-drafts, or own drafts
            return $query->where(function($q) use ($user) {
                $q->whereIn('final_status', ['pending', 'approved', 'rejected', 'on_hold'])
                  ->orWhere('user_id', $user->id);
            });
        }

        if (in_array('division', $userScopes)) {
            // Division scope: see all non-drafts in same division, or own drafts
            return $query->where(function($q) use ($user) {
                $q->where(function($subq) use ($user) {
                    $subq->where('division_id', $user->division_id)
                         ->whereIn('final_status', ['pending', 'approved', 'rejected', 'on_hold']);
                })->orWhere('user_id', $user->id);
            });
        }

        // Personal scope: only see own submissions
        return $query->where('user_id', $user->id);
    }

    public function attachmentRequests(): HasMany
    {
        return $this->hasMany(AttachmentRequest::class);
    }
}