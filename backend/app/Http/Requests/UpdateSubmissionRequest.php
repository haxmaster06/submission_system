<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSubmissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'division_id' => 'sometimes|required|exists:divisions,id',
            'jenis_pengajuan_id' => 'sometimes|required|exists:jenis_pengajuan,id',
            'jenis_perjalanan_id' => 'nullable|exists:jenis_perjalanan,id',
            'status_urgent' => 'sometimes|required|in:normal,urgent',
            'description' => 'sometimes|required|string|max:255',
            'notes' => 'nullable|string',
            'qty' => 'sometimes|required|numeric|min:0',
            'uom_id' => 'sometimes|required|exists:uoms,id',
            'nominal' => 'sometimes|required|numeric|min:0',
            'tanggal_pengajuan' => 'sometimes|required|date',
            'items' => 'sometimes|required|array|min:1',
            'items.*.id' => 'sometimes|exists:submission_items,id',
            'items.*.description' => 'required|string|max:255',
            'items.*.qty' => 'required|numeric|min:0',
            'items.*.uom_id' => 'required|exists:uoms,id',
            'items.*.nominal' => 'required|numeric|min:0',
        ];
    }
}
