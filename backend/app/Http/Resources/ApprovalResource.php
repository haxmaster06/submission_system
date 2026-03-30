<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApprovalResource extends JsonResource
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
            'submission_id' => $this->submission_id,
            'approver_id' => $this->approver_id,
            'role_name' => $this->role_name,
            'step_order' => $this->step_order,
            'status' => $this->status,
            'notes' => $this->notes,
            'approved_at' => $this->approved_at,
            
            // Nested Relation: Submission
            'submission' => new SubmissionResource($this->whenLoaded('submission')),
            
            // Approver relation
            'approver' => [
                'id' => $this->approver->id ?? null,
                'name' => $this->approver->name ?? null,
            ],
            
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
