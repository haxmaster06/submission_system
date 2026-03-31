<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubmissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware/policy
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'division_id' => 'required|exists:divisions,id',
            'jenis_pengajuan_id' => 'required|exists:jenis_pengajuan,id',
            'jenis_perjalanan_id' => 'nullable|exists:jenis_perjalanan,id',
            'status_urgent' => 'required|in:normal,urgent',
            'description' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'qty' => 'required_without_all:payload,items|numeric|min:0',
            'uom_id' => 'required_without_all:payload,items|exists:uoms,id',
            'nominal' => 'required_without_all:payload,items|numeric|min:0',
            'tanggal_pengajuan' => 'required|date',
            'items' => 'required_without:payload|array',
            'items.*.description' => 'required|string|max:255',
            'items.*.qty' => 'required|numeric|min:0',
            'items.*.uom_id' => 'required|exists:uoms,id',
            'items.*.nominal' => 'required|numeric|min:0',
            'payload' => 'nullable|array',
            'total' => 'nullable|numeric|min:0',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|mimes:pdf,jpg,jpeg,png,docx,xlsx,zip|max:5120', // max 5MB
        ];
    }
}
