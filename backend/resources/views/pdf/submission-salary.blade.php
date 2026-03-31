@extends('pdf.layouts.master')

@section('title', 'Pengajuan Anggaran')

@section('kop_title', 'PENGAJUAN ANGGARAN')
@section('kop_ref', $submission->no_pengajuan)

@section('kop_status')
@php
$fs = strtolower($submission->final_status);
$badgeClass = match(true) {
str_contains($fs,'approved') || str_contains($fs,'disetujui') => 'badge-approved',
str_contains($fs,'rejected') || str_contains($fs,'ditolak') => 'badge-rejected',
str_contains($fs,'pending') || str_contains($fs,'menunggu') => 'badge-pending',
default => 'badge-draft'
};
@endphp
{{ strtoupper($submission->final_status) }}
@endsection

@section('kop_status_class', $badgeClass ?? 'badge-draft')

@section('content')
<!-- ══════════════════ META INFO ══════════════════ -->
<div class="meta-section">
    <table class="meta-table">
        <tr>
            <td class="meta-label">Tanggal</td>
            <td class="meta-sep">:</td>
            <td class="meta-value">{{ $submission->tanggal_pengajuan->format('d F Y') }}</td>
            <td class="meta-label">Divisi</td>
            <td class="meta-sep">:</td>
            <td class="meta-value">{{ $submission->division->name }}</td>
        </tr>
        <tr>
            <td class="meta-label">Pemohon</td>
            <td class="meta-sep">:</td>
            <td class="meta-value">{{ $submission->user->name }}</td>
            <td class="meta-label">Urgency</td>
            <td class="meta-sep">:</td>
            @php
            $urgencyClass = strtolower($submission->status_urgent) === 'high'
            ? 'meta-value urgent-high' : (strtolower($submission->status_urgent) === 'low' ? 'meta-value
            urgent-low' : 'meta-value');
            @endphp
            <td class="{{ $urgencyClass }}">{{ strtoupper($submission->status_urgent) }}</td>
        </tr>
    </table>
</div>

<!-- Divider -->
<div style="border-top:1px solid #dee2e6; margin-bottom:10px;"></div>

<!-- ══════════════════ DESKRIPSI ══════════════════ -->
<div class="desc-wrap">
    <div class="section-header">
        <span class="section-title">Judul Pengajuan</span>
    </div>
    <div class="desc-content">{{ $submission->description }}</div>
</div>

<!-- ══════════════════ RINCIAN ANGGARAN ══════════════════ -->
<div class="items-wrap">
    <div class="section-header">
        <span class="section-title">{{ $submission->payload ? 'Rincian Gaji (Matrix Karyawan)' : 'Rincian
            Anggaran' }}</span>
    </div>

    @if ($submission->payload && isset($submission->payload['employees']))
    @php
    $payload = is_string($submission->payload) ? json_decode($submission->payload, true) : $submission->payload;
    $employees = $payload['employees'] ?? [];
    $dates = count($employees) > 0 ? array_column($employees[0]['daily_records'], 'date') : [];
    @endphp
    <div class="salary-details">
        <table class="o-table" style="font-size: 8px; margin-bottom: 20px;">
            <thead>
                <tr>
                    <th style="width:120px; white-space: nowrap;">Nama Karyawan</th>
                    @foreach($dates as $date)
                    @php $dObj = \Carbon\Carbon::parse($date); @endphp
                    <th class="td-center" style="width:25px; padding: 4px; line-height: 1.1;">
                        <div style="font-weight: bold; font-size: 7.5px;">{{ $dObj->format('d/n/Y') }}</div>
                    </th>
                    @endforeach
                    <th class="td-right" style="width:70px;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($employees as $emp)
                <tr>
                    <td class="td-bold"
                        style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; padding: 4px 6px;">
                        {{ $emp['employee_name'] }}
                        <div style="font-size: 7px; color: #64748b; font-weight: normal; margin-top:2px;">
                            {{ $emp['department'] }}<br>
                            Rp {{ number_format($emp['base_salary'], 0, ',', '.') }} / Bulan
                        </div>
                    </td>
                    @foreach($emp['daily_records'] as $record)
                    <td class="td-center" style="padding: 4px;">
                        @if(isset($record['nominal']) && $record['nominal'] > 0)
                        <span style="color: #10b981; font-weight: bold; font-size: 8px;">Rp {{
                            number_format($record['nominal'], 0, ',', '.') }}</span>
                        @else
                        <span style="color: #cbd5e1;">-</span>
                        @endif
                    </td>
                    @endforeach
                    <td class="td-right td-mono td-bold" style="padding: 4px 6px; color: #2a7ba5;">
                        Rp {{ number_format($emp['total_salary'], 0, ',', '.') }}
                        <div
                            style="font-size: 6px; color: #64748b; font-weight: normal; margin-top:2px; letter-spacing: 0.2px;">
                            ({{ $emp['total_days'] }} HARI)
                        </div>
                    </td>
                </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="{{ count($dates) + 1 }}" class="td-right" style="letter-spacing:0.3px; padding: 6px;">
                        GRAND TOTAL PENGAJUAN GAJI
                    </td>
                    <td class="td-right td-mono" style="font-size:11px; padding: 6px; color: #d97706;">
                        Rp {{ number_format($payload['total_amount'] ?? $submission->total, 0, ',', '.') }}
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
    @else
    <table class="o-table">
        <thead>
            <tr>
                <th style="width:auto;">Deskripsi Item</th>
                <th class="td-right" style="width:60px;">Qty</th>
                <th class="td-center" style="width:50px;">UoM</th>
                <th class="td-right" style="width:110px;">Harga Satuan</th>
                <th class="td-right" style="width:110px;">Total</th>
            </tr>
        </thead>
        <tbody>
            @if ($submission->items && $submission->items->count() > 0)
            @foreach ($submission->items as $item)
            <tr>
                <td class="td-bold">{{ $item->description }}</td>
                <td class="td-right td-mono">{{ number_format($item->qty, 0, ',', '.') }}</td>
                <td class="td-center td-muted">{{ optional($item->uom)->code ?? optional($item->uom)->name ??
                    '-' }}</td>
                <td class="td-right td-mono">Rp {{ number_format($item->nominal, 0, ',', '.') }}</td>
                <td class="td-right td-mono td-bold">Rp {{ number_format($item->total ?? ($item->qty * $item->nominal), 0, ',', '.') }}</td>
            </tr>
            @endforeach
            @else
            {{-- Legacy fallback --}}
            <tr>
                <td class="td-bold">{{ $submission->description }}</td>
                <td class="td-right td-mono">{{ number_format($submission->qty ?? 0, 0, ',', '.') }}</td>
                <td class="td-center td-muted">{{ optional($submission->uom)->code ??
                    optional($submission->uom)->name ?? '-' }}</td>
                <td class="td-right td-mono">Rp {{ number_format($submission->nominal ?? 0, 0, ',', '.') }}</td>
                <td class="td-right td-mono td-bold">Rp {{ number_format($submission->total, 0, ',', '.') }}
                </td>
            </tr>
            @endif
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="4" class="td-right" style="letter-spacing:0.3px;">Total Estimasi</td>
                <td class="td-right td-mono" style="font-size:11px;">
                    Rp {{ number_format($submission->total, 0, ',', '.') }}
                </td>
            </tr>
        </tfoot>
    </table>
    @endif
</div>

@if($submission->notes)
<!-- ══════════════════ CATATAN ══════════════════ -->
<div class="desc-wrap" style="margin-bottom: 20px;">
    <div class="section-header">
        <span class="section-title" style="color: #d97706; border-bottom-color: #d97706;">Catatan</span>
    </div>
    <div class="desc-content"
        style="background: #fffbeb; border-color: #fef3c7; border-left: 3px solid #f59e0b; color: #451a03;">
        {{ $submission->notes }}
    </div>
</div>
@endif

<!-- ══════════════════ APPROVALS ══════════════════ -->
<div class="approval-section" style="page-break-inside:avoid;">

    <table class="approval-grid">
        <tr>
            <!-- PEMOHON -->
            <td class="approval-box">
                <div class="appr-head">
                    <div class="appr-head-text">Pemohon</div>
                </div>
                <div class="appr-sig-area">
                    <div class="appr-sig-inner">
                        @if ($submission->requestor_signature_base64)
                        <img src="{{ $submission->requestor_signature_base64 }}" alt="TTD">
                        @elseif ($submission->user->signature_path)
                        @if ($isPdf && file_exists(public_path($submission->user->signature_path)))
                        <img src="{{ public_path($submission->user->signature_path) }}" alt="TTD">
                        @elseif (!$isPdf && file_exists(public_path($submission->user->signature_path)))
                        <img src="{{ asset($submission->user->signature_path) }}" alt="TTD">
                        @else
                        <span class="sig-placeholder">Tertanda</span>
                        @endif
                        @else
                        <span class="sig-placeholder">— Draft —</span>
                        @endif
                    </div>
                </div>
                <div class="appr-footer">
                    <div class="appr-name">{{ $submission->user->name }}</div>
                    <div class="appr-date">{{ $submission->tanggal_pengajuan->format('d/m/Y') }}</div>
                </div>
            </td>

            @foreach ($submission->approvals->sortBy('step_order') as $approval)
            <td class="approval-box">
                <div class="appr-head">
                    <div class="appr-head-text">{{ $approval->role_name }}</div>
                </div>
                <div class="appr-sig-area">
                    <div class="appr-sig-inner">
                        @if ($approval->status === 'approved')
                        @if ($approval->signature_base64)
                        <img src="{{ $approval->signature_base64 }}" alt="TTD">
                        @elseif ($approval->signature_used)
                        @if ($isPdf && file_exists(public_path($approval->signature_used)))
                        <img src="{{ public_path($approval->signature_used) }}" alt="TTD">
                        @elseif (!$isPdf && file_exists(public_path($approval->signature_used)))
                        <img src="{{ asset($approval->signature_used) }}" alt="TTD">
                        @else
                        <span class="sig-placeholder">✓ Disetujui</span>
                        @endif
                        @else
                        <span class="sig-placeholder">✓ Disetujui</span>
                        @endif
                        @elseif ($approval->status === 'rejected')
                        <span class="sig-rejected">DITOLAK</span>
                        @else
                        <span class="sig-placeholder"></span>
                        @endif
                    </div>
                </div>
                <div class="appr-footer">
                    <div class="appr-name">{{ $approval->approver ? $approval->approver->name : '—' }}</div>
                    <div class="appr-date">
                        {!! $approval->approved_at ? $approval->approved_at->format('d/m/Y H:i') : '&nbsp;' !!}
                    </div>
                </div>
            </td>
            @endforeach
        </tr>
    </table>
</div>
@endsection