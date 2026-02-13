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
    ];

    protected $appends = ['current_step_role'];

    public function getCurrentStepRoleAttribute()
    {
        if ($this->final_status !== 'pending') {
            return null;
        }

        $currentApproval = $this->approvals()
            ->where('step_order', $this->current_approval_step)
            ->first();

        return $currentApproval ? $currentApproval->role_name : null;
    }

    protected $casts = [
        'tanggal_pengajuan' => 'datetime',
        'qty' => 'decimal:2',
        'nominal' => 'decimal:2',
        'total' => 'decimal:2',
        'is_completed' => 'boolean',
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
}
