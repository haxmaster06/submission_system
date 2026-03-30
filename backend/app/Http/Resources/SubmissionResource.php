<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubmissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'no_pengajuan' => $this->no_pengajuan,
            'user_id' => $this->user_id,
            'division_id' => $this->division_id,
            'jenis_pengajuan_id' => $this->jenis_pengajuan_id,
            'jenis_perjalanan_id' => $this->jenis_perjalanan_id,
            'status_urgent' => $this->status_urgent,
            'description' => $this->description,
            'notes' => $this->notes,
            'qty' => (float) $this->qty,
            'uom_id' => $this->uom_id,
            'nominal' => (float) $this->nominal,
            'total' => (float) $this->total,
            'tanggal_pengajuan' => $this->tanggal_pengajuan,
            'current_approval_step' => $this->current_approval_step,
            'final_status' => $this->final_status,
            'is_completed' => (bool) $this->is_completed,
            'current_step_role' => $this->current_step_role, // Loaded via subquery
            
            // Relationships
            'user' => [
                'id' => $this->user->id ?? null,
                'name' => $this->user->name ?? null,
            ],
            'division' => [
                'id' => $this->division->id ?? null,
                'name' => $this->division->name ?? null,
                'code' => $this->division->code ?? null,
            ],
            'jenis_pengajuan' => [
                'id' => $this->jenisPengajuan->id ?? null,
                'name' => $this->jenisPengajuan->name ?? null,
            ],
            'uom' => [
                'id' => $this->uom->id ?? null,
                'name' => $this->uom->name ?? null,
            ],
            
            // Conditional Relationships (Detail view only)
            'items' => $this->whenLoaded('items'),
            'approvals' => $this->whenLoaded('approvals'),
            'attachments' => $this->whenLoaded('attachments'),
            'realizations' => $this->whenLoaded('realizations'),
            'attachment_requests' => $this->whenLoaded('attachmentRequests'),
            
            'payload' => $this->payload,
            
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
