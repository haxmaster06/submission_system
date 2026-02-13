<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\JenisPengajuan;
use App\Models\JenisPerjalanan;
use App\Models\Uom;
use Illuminate\Http\Request;

class MasterDataController extends Controller
{
    // Divisions
    public function indexDivisions()
    {
        return response()->json(Division::all());
    }

    public function storeDivision(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:divisions,code',
        ]);
        $division = Division::create($validated);
        return response()->json($division, 201);
    }

    public function updateDivision(Request $request, Division $division)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:divisions,code,' . $division->id,
        ]);
        $division->update($validated);
        return response()->json($division);
    }

    public function destroyDivision(Division $division)
    {
        if ($division->submissions()->exists() || $division->users()->exists()) {
            return response()->json(['message' => 'Cannot delete division with active submissions or users.'], 422);
        }
        $division->delete();
        return response()->json(null, 204);
    }

    // Jenis Pengajuan
    public function indexTypes()
    {
        return response()->json(JenisPengajuan::all());
    }

    public function storeType(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'requires_travel_type' => 'boolean',
            'form_schema_json' => 'nullable|array',
        ]);
        $type = JenisPengajuan::create($validated);
        return response()->json($type, 201);
    }

    public function updateType(Request $request, JenisPengajuan $jenisPengajuan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'requires_travel_type' => 'boolean',
            'form_schema_json' => 'nullable|array',
        ]);
        $jenisPengajuan->update($validated);
        return response()->json($jenisPengajuan);
    }

    public function destroyType(JenisPengajuan $jenisPengajuan)
    {
        if ($jenisPengajuan->submissions()->exists()) {
            return response()->json(['message' => 'Cannot delete type with active submissions.'], 422);
        }
        $jenisPengajuan->delete();
        return response()->json(null, 204);
    }

    // Urgency Statuses
    public function indexUrgency()
    {
        return response()->json(\App\Models\UrgencyStatus::orderBy('level')->get());
    }

    public function storeUrgency(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:urgency_statuses,code',
            'level' => 'integer',
            'color' => 'nullable|string|max:20',
        ]);
        $urgency = \App\Models\UrgencyStatus::create($validated);
        return response()->json($urgency, 201);
    }

    public function updateUrgency(Request $request, \App\Models\UrgencyStatus $urgencyStatus)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:urgency_statuses,code,' . $urgencyStatus->id,
            'level' => 'integer',
            'color' => 'nullable|string|max:20',
        ]);
        $urgencyStatus->update($validated);
        return response()->json($urgencyStatus);
    }

    public function destroyUrgency(\App\Models\UrgencyStatus $urgencyStatus)
    {
        if ($urgencyStatus->submissions()->exists()) {
            return response()->json(['message' => 'Cannot delete urgency status with active submissions.'], 422);
        }
        $urgencyStatus->delete();
        return response()->json(null, 204);
    }

    public function reorderUrgency(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:urgency_statuses,id',
        ]);

        foreach ($request->ids as $index => $id) {
            \App\Models\UrgencyStatus::where('id', $id)->update(['level' => $index + 1]);
        }

        return response()->json(['message' => 'Order updated successfully']);
    }

    // UOMs
    public function indexUoms()
    {
        return response()->json(Uom::all());
    }

    public function storeUom(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:uoms,code',
        ]);
        $uom = Uom::create($validated);
        return response()->json($uom, 201);
    }

    public function updateUom(Request $request, Uom $uom)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:uoms,code,' . $uom->id,
        ]);
        $uom->update($validated);
        return response()->json($uom);
    }

    public function destroyUom(Uom $uom)
    {
        if ($uom->submissions()->exists()) {
            return response()->json(['message' => 'Cannot delete UOM with active submissions.'], 422);
        }
        $uom->delete();
        return response()->json(null, 204);
    }

    // Jenis Perjalanan
    public function indexTravelTypes()
    {
        return response()->json(JenisPerjalanan::all());
    }

    public function storeTravelType(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);
        $travelType = JenisPerjalanan::create($validated);
        return response()->json($travelType, 201);
    }

    public function updateTravelType(Request $request, JenisPerjalanan $jenisPerjalanan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);
        $jenisPerjalanan->update($validated);
        return response()->json($jenisPerjalanan);
    }

    public function destroyTravelType(JenisPerjalanan $jenisPerjalanan)
    {
        if ($jenisPerjalanan->submissions()->exists()) {
            return response()->json(['message' => 'Cannot delete travel type with active submissions.'], 422);
        }
        $jenisPerjalanan->delete();
        return response()->json(null, 204);
    }
}
