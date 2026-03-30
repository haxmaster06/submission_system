@extends('pdf.layouts.master')

@section('title', 'Laporan Pengajuan')

@section('page_orientation', 'landscape')

@section('kop_company_info', '')
@section('kop_title', 'RINGKASAN LAPORAN')
@section('kop_ref', 'KODE : HBM-RPT-' . date('dmy-Hi'))

@section('extra_css')
<style>
    /* ══ TABLES ══ */
    .division-header {
        margin-top: 30px;
        margin-bottom: 8px;
        font-size: 12px;
        font-weight: bold;
        color: #2a7ba5;
        border-bottom: 2px solid #2a7ba5;
        padding-bottom: 5px;
        page-break-after: avoid;
        page-break-inside: avoid;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }

    thead {
        display: table-header-group;
    }

    tfoot {
        display: table-footer-group;
    }

    .data-table tr {
        page-break-inside: avoid;
    }

    th {
        background: #f8fafc;
        color: #475569;
        font-weight: bold;
        border: 1px solid #e2e8f0;
        padding: 8px;
        text-align: left;
        font-size: 9px;
        text-transform: uppercase;
    }

    td {
        border: 1px solid #e2e8f0;
        padding: 6px 8px;
        vertical-align: top;
        font-size: 10px;
    }

    .nominal {
        text-align: right;
        font-family: 'Courier New', monospace;
        font-weight: bold;
    }

    .status {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 8px;
    }

    .pending {
        background: #fef9c3;
        color: #854d0e;
    }

    .approved {
        background: #dcfce7;
        color: #166534;
        border: 1px solid #b8dfc4;
    }

    .rejected {
        background: #fee2e2;
        color: #991b1b;
    }
</style>
@endsection

@section('web_page_wrapper_css', 'max-width: 1100px; /* Lebar untuk landscape viewport */')



@section('before_footer')
<div class="print-meta-info">
    Dicetak pada: {{ $generated_at }} WIB oleh {{ $generated_by }}
</div>
@endsection

@section('content')

<table style="width: 50%; border: none; margin-bottom: 20px;">
    <tr>
        <td style="border: none; padding: 2px; font-weight: bold; width: 100px;">Tanggal Filter
        </td>
        <td style="border: none; padding: 2px;">:
            @if(!empty($filters['date_from']))
            {{ \Carbon\Carbon::parse($filters['date_from'])->format('d/m/Y') }}
            @else
            Awal
            @endif
            s/d
            @if(!empty($filters['date_to']))
            {{ \Carbon\Carbon::parse($filters['date_to'])->format('d/m/Y') }}
            @else
            Sekarang
            @endif
        </td>
    </tr>
    <tr>
        <td style="border: none; padding: 2px; font-weight: bold;">Status Pengajuan</td>
        <td style="border: none; padding: 2px;">: {{ strtoupper($filters['status'] === 'all' ||
            empty($filters['status']) ? 'SEMUA STATUS' : $filters['status']) }}</td>
    </tr>
    <tr>
        <td style="border: none; padding: 2px; font-weight: bold;">Filter Dokumen</td>
        <td style="border: none; padding: 2px;">:
            @if(!empty($filters['division_name']) && !empty($filters['jenis_name']))
            Divisi {{ $filters['division_name'] }} - {{ $filters['jenis_name'] }}
            @elseif(!empty($filters['division_name']))
            Hanya Divisi {{ $filters['division_name'] }}
            @elseif(!empty($filters['jenis_name']))
            Hanya Tipe {{ $filters['jenis_name'] }}
            @else
            Semua Departemen & Jenis
            @endif
        </td>
    </tr>
</table>

{{-- GROUPING BY DIVISION --}}
@php
$groupedSubmissions = $submissions->groupBy(function($item) {
return $item->division->name ?? 'Unknown Division';
})->sortKeys();
@endphp

@if($groupedSubmissions->isEmpty())
<div style="text-align: center; padding: 20px; font-weight: bold; background: #f8fafc; border: 1px solid #e2e8f0;">
    TIDAK ADA DATA PENGAJUAN PADA RENTANG DAN FILTER INI
</div>
@else
@foreach ($groupedSubmissions as $divisionName => $divSubmissions)
<div class="division-header">DIVISI: {{ strtoupper($divisionName) }}</div>

<table class="data-table">
    <thead>
        <tr>
            <th width="30" style="text-align: center;">No</th>
            <th width="110">No Pengajuan</th>
            <th width="65">Tgl Ajuan</th>
            <th>Detail / Deskripsi</th>
            <th width="80" style="text-align:center;">Status</th>
            <th width="110" style="text-align:right;">Nilai Pengajuan</th>
            <th width="110" style="text-align:right;">Nilai Realisasi</th>
            <th width="90" style="text-align:right;">Selisih (Sisa)</th>
        </tr>
    </thead>
    <tbody>
        @php
        $divTotalPengajuan = 0;
        $divTotalRealisasi = 0;
        @endphp

        @foreach ($divSubmissions as $index => $sub)
        @php
        // Calculate Realization total for this submission by summing from details
        $realizationTotal = 0;
        if($sub->realizations && count($sub->realizations) > 0) {
            foreach($sub->realizations as $r) {
                if($r->details) {
                    $realizationTotal += $r->details->sum('total');
                }
            }
        }

        $statusFilter = $filters['status'] ?? 'all';
        if ($statusFilter === 'all') {
            $divTotalPengajuan += ($sub->final_status === 'approved' ? $sub->total : 0);
        } else {
            $divTotalPengajuan += $sub->total;
        }

        $divTotalRealisasi += $realizationTotal;
        $selisih = $sub->total - $realizationTotal;
        @endphp
        <tr>
            <td style="text-align: center;">{{ $index + 1 }}</td>
            <td><strong>{{ $sub->no_pengajuan }}</strong></td>
            <td>{{ \Carbon\Carbon::parse($sub->tanggal_pengajuan)->format('d/m/Y') }}</td>
            <td>{{ $sub->description }}</td>
            <td style="text-align:center;">
                <span class="status {{ $sub->final_status }}">
                    {{ $sub->final_status }}
                </span>
            </td>
            <td class="nominal">Rp {{ number_format($sub->total, 0, ',', '.') }}</td>
            <td class="nominal" style="color: {{ $realizationTotal > 0 ? '#166534' : '#475569' }}">
                Rp {{ number_format($realizationTotal, 0, ',', '.') }}
            </td>
            <td class="nominal" style="color: {{ $selisih < 0 ? '#dc2626' : ($selisih == 0 ? '#475569' : '#ca8a04') }}">
                Rp {{ number_format($selisih, 0, ',', '.') }}
            </td>
        </tr>
        @endforeach
    </tbody>
    <tfoot>
        <tr style="background: #f1f5f9; font-weight: bold; text-align: right;">
            <td colspan="5" style="border-top: 2px solid #ccc;">SUBTOTAL DIVISI: {{
                strtoupper($divisionName) }}
            </td>
            <td class="nominal" style="border-top: 2px solid #ccc;">Rp {{
                number_format($divTotalPengajuan, 0,
                ',',
                '.') }}</td>
            <td class="nominal" style="border-top: 2px solid #ccc; color: #166534;">Rp {{
                number_format($divTotalRealisasi, 0, ',', '.') }}</td>
            <td class="nominal" style="border-top: 2px solid #ccc;">Rp {{
                number_format($divTotalPengajuan -
                $divTotalRealisasi, 0, ',', '.') }}</td>
        </tr>
    </tfoot>
</table>
@endforeach
@endif

{{-- GRAND TOTAL --}}
@if($submissions->count() > 0)
@php
    $statusFilter = $filters['status'] ?? 'all';
    $grandTotalPengajuan = $submissions->reduce(function($carry, $item) use ($statusFilter) {
        if ($statusFilter === 'all') {
            return $carry + ($item->final_status === 'approved' ? $item->total : 0);
        }
        return $carry + $item->total;
    }, 0);

    $grandTotalRealisasi = 0;
    foreach($submissions as $s) {
        if($s->realizations && count($s->realizations) > 0) {
            foreach($s->realizations as $sr) {
                if($sr->details) {
                    $grandTotalRealisasi += $sr->details->sum('total');
                }
            }
        }
    }
@endphp
<div style="margin-top: 30px; border: 2px solid #2a7ba5; padding: 10px; background: #f0f7fa;">
    <table style="width: 100%; border: none; margin: 0;">
        <tr style="font-size: 14px; font-weight: bold;">
            <td style="border: none; text-align: left; color: #2a7ba5;">GRAND TOTAL SELURUH
                DIVISI</td>
            <td style="border: none; text-align: right; width: 200px;">Pengajuan: Rp {{
                number_format($grandTotalPengajuan, 0, ',', '.') }}</td>
            <td style="border: none; text-align: right; width: 200px; color: #166534;">
                Realisasi: Rp {{
                number_format($grandTotalRealisasi, 0, ',', '.') }}</td>
        </tr>
    </table>
</div>
@endif

@endsection