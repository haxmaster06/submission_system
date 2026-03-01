<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportingController extends Controller
{

    public function index(Request $request)
    {
        $query = $this->buildQuery($request);
        return response()->json($query->latest()->get());
    }

    public function exportPdf(Request $request)
    {
        $submissions = $this->buildQuery($request)->latest()->get();
        $filters = $request->only(['date_from', 'date_to', 'status', 'division_id', 'jenis_pengajuan_id']);

        if (!empty($filters['division_id'])) {
            $filters['division_name'] = \App\Models\Division::find($filters['division_id'])?->name;
        }
        if (!empty($filters['jenis_pengajuan_id'])) {
            $filters['jenis_name'] = \App\Models\JenisPengajuan::find($filters['jenis_pengajuan_id'])?->name;
        }

        try {
            $pdf = Pdf::loadView('pdf.submissions_report', [
                'submissions' => $submissions,
                'filters' => $filters,
                'generated_at' => now()->format('d/m/Y H:i'),
                'generated_by' => Auth::user()->name
            ])->setPaper('a4', 'landscape');

            return $pdf->stream('Submissions-Report-' . now()->format('YmdHis') . '.pdf');
        }
        catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('PDF Export Error: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Failed to generate PDF'], 500);
        }
    }

    public function printHtml(Request $request)
    {
        $submissions = $this->buildQuery($request)->latest()->get();
        $filters = $request->only(['date_from', 'date_to', 'status', 'division_id', 'jenis_pengajuan_id']);

        if (!empty($filters['division_id'])) {
            $filters['division_name'] = \App\Models\Division::find($filters['division_id'])?->name;
        }
        if (!empty($filters['jenis_pengajuan_id'])) {
            $filters['jenis_name'] = \App\Models\JenisPengajuan::find($filters['jenis_pengajuan_id'])?->name;
        }

        return view('pdf.submissions_report', [
            'submissions' => $submissions,
            'filters' => $filters,
            'generated_at' => now()->format('d/m/Y H:i'),
            // handle case when accessed via signed url where auth()->user() might be null
            'generated_by' => $request->has('user_name') ? $request->user_name : 'System',
            'is_print' => true
        ]);
    }

    public function getPrintUrl(Request $request)
    {
        $params = $request->all();
        $params['user_name'] = Auth::user()->name;

        $url = \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'api.reports.print',
            now()->addMinutes(30),
            $params
        );

        return response()->json(['url' => $url]);
    }

    protected function buildQuery(Request $request)
    {
        $query = Submission::with(['user', 'division', 'jenisPengajuan', 'realizations.details']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('no_pengajuan', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('final_status', $request->status);
        }

        if ($request->filled('division_id')) {
            $query->where('division_id', $request->division_id);
        }

        if ($request->filled('jenis_pengajuan_id')) {
            $query->where('jenis_pengajuan_id', $request->jenis_pengajuan_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('tanggal_pengajuan', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('tanggal_pengajuan', '<=', $request->date_to);
        }

        return $query;
    }
}