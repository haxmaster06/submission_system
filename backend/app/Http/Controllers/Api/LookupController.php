<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\JenisPengajuan;
use App\Models\JenisPerjalanan;
use App\Models\Uom;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class LookupController extends Controller
{
    public function divisions()
    {
        return response()->json(Division::all());
    }

    public function jenisPengajuan()
    {
        return response()->json(JenisPengajuan::all());
    }

    public function jenisPerjalanan()
    {
        return response()->json(JenisPerjalanan::all());
    }

    public function uoms()
    {
        return response()->json(Uom::all());
    }

    public function all()
    {
        return response()->json([
            'divisions' => Division::all(),
            'jenis_pengajuan' => JenisPengajuan::all(),
            'jenis_perjalanan' => JenisPerjalanan::all(),
            'uoms' => Uom::all(),
            'urgency_statuses' => \App\Models\UrgencyStatus::orderBy('level')->get(),
            'roles' => Role::all(),
        ]);
    }
}
