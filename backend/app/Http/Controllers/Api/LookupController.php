<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\JenisPengajuan;
use App\Models\JenisPerjalanan;
use App\Models\Uom;
use App\Services\ExchangeRateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;

class LookupController extends Controller
{
    public function exchangeRate(Request $request, ExchangeRateService $exchangeRateService)
    {
        $rate = $exchangeRateService->getUsdToIdrRate();
        return response()->json([
            'rate' => $rate,
            'currency' => 'USD'
        ]);
    }
    public function divisions()
    {
        $data = Cache::remember('lookups_divisions', 3600, fn() => Division::all());
        return response()->json($data);
    }

    public function jenisPengajuan()
    {
        $data = Cache::remember('lookups_jenis_pengajuan', 3600, fn() => JenisPengajuan::all());
        return response()->json($data);
    }

    public function jenisPerjalanan()
    {
        $data = Cache::remember('lookups_jenis_perjalanan', 3600, fn() => JenisPerjalanan::all());
        return response()->json($data);
    }

    public function uoms()
    {
        $data = Cache::remember('lookups_uoms', 3600, fn() => Uom::all());
        return response()->json($data);
    }

    public function all()
    {
        $data = Cache::remember('lookups_all', 3600, function () {
            return [
            'divisions' => Division::all(),
            'jenis_pengajuan' => JenisPengajuan::all(),
            'jenis_perjalanan' => JenisPerjalanan::all(),
            'uoms' => Uom::all(),
            'urgency_statuses' => \App\Models\UrgencyStatus::orderBy('level')->get(),
            'roles' => Role::all(),
            ];
        });

        return response()->json($data);
    }
}