<!DOCTYPE html>
<html lang="id">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pengajuan Anggaran</title>
    <style>
        /* DomPDF TIDAK mendukung: CSS Variables, @import Google Fonts, @media queries.
           Semua warna HARUS hardcoded agar PDF & Print konsisten. */

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        @page {
            margin: 0;
            size: A4;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 10px;
            color: #444;
            line-height: 1.4;
            background: #fff;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        .page-wrapper {
            position: relative;
            padding: 15mm 18mm;
        }

        /* ══ KOP SURAT ══ */
        .kop-outer {
            margin-bottom: 12px;
        }

        .kop-accent-bar {
            height: 5px;
            background-color: #2a7ba5;
            border-radius: 3px 3px 0 0;
            margin-bottom: 5px;
        }

        .kop-body {
            padding: 10px 16px;
            display: table;
            width: 100%;
            border-collapse: collapse;
            background: #fff;
        }

        .kop-left {
            display: table-cell;
            vertical-align: middle;
            width: 52%;
        }

        .kop-right {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            width: 48%;
        }

        .kop-logo-group {
            display: table;
            border-collapse: collapse;
        }

        .kop-logo-group td {
            vertical-align: middle;
        }

        .kop-logo img {
            height: 60px;
            width: auto;
            display: block;
        }

        .kop-company-info {
            padding-left: 12px;
            border-left: 2px solid #2a7ba5;
        }

        .kop-company-name {
            font-size: 13px;
            font-weight: 700;
            color: #1a1a1a;
            letter-spacing: 0.3px;
            line-height: 1.15;
        }

        .kop-company-tagline {
            font-size: 8px;
            color: #999;
            margin-top: 1px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .kop-doc-title {
            font-size: 15px;
            font-weight: 700;
            color: #2a7ba5;
            letter-spacing: 0.5px;
            line-height: 1.1;
        }

        .kop-doc-ref {
            font-size: 9px;
            color: #666;
            font-weight: 500;
            margin-top: 3px;
            letter-spacing: 0.4px;
            font-family: 'Courier New', monospace;
        }

        .kop-doc-status {
            margin-top: 5px;
        }

        .badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .badge-approved {
            background: #d4edda;
            color: #28a745;
            border: 1px solid #b8dfc4;
        }

        .badge-rejected {
            background: #fdecea;
            color: #dc3545;
            border: 1px solid #f5c6cb;
        }

        .badge-pending {
            background: #fef5ec;
            color: #e67e22;
            border: 1px solid #fad3ab;
        }

        .badge-draft {
            background: #f0f0f0;
            color: #666;
            border: 1px solid #d5d5d5;
        }

        .kop-bottom-bar {
            height: 2px;
            background-color: #2a7ba5;
            margin-top: 5px;
            border-radius: 0 0 3px 3px;
        }

        /* ══ META INFO ══ */
        .meta-section {
            margin-bottom: 10px;
        }

        .meta-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5px;
        }

        .meta-table td {
            padding: 2.5px 0;
            vertical-align: top;
        }

        .meta-label {
            width: 70px;
            color: #999;
            font-weight: 400;
        }

        .meta-sep {
            width: 8px;
            color: #bbb;
        }

        .meta-value {
            color: #1a1a1a;
            font-weight: 500;
            padding-right: 16px;
        }

        .meta-value.urgent-high {
            color: #dc3545;
            font-weight: 700;
        }

        .meta-value.urgent-low {
            color: #28a745;
            font-weight: 600;
        }

        /* ══ SECTION HEADER ══ */
        .section-header {
            margin-bottom: 4px;
        }

        .section-title {
            font-size: 9.5px;
            font-weight: 700;
            color: #2a7ba5;
            text-transform: uppercase;
            letter-spacing: 0.7px;
            padding-bottom: 3px;
            border-bottom: 2px solid #2a7ba5;
            display: inline-block;
        }

        /* ══ DESCRIPTION BOX ══ */
        .desc-wrap {
            margin-bottom: 10px;
        }

        .desc-content {
            padding: 6px 10px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-left: 3px solid #2a7ba5;
            border-radius: 0 3px 3px 0;
            font-size: 10px;
            color: #444;
            line-height: 1.5;
        }

        /* ══ ITEMS TABLE ══ */
        .items-wrap {
            margin-bottom: 14px;
        }

        .o-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5px;
        }

        .o-table thead tr {
            background: #2a7ba5;
        }

        .o-table thead th {
            padding: 5px 8px;
            color: #fff;
            font-size: 8.5px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: left;
            border: none;
        }

        .o-table thead th.td-right {
            text-align: right;
        }

        .o-table thead th.td-center {
            text-align: center;
        }

        .o-table tbody tr {
            border-bottom: 1px solid #ececec;
        }

        .o-table tbody tr:nth-child(odd) {
            background: #fff;
        }

        .o-table tbody tr:nth-child(even) {
            background: #fafafa;
        }

        .o-table tbody td {
            padding: 5px 8px;
            color: #444;
            vertical-align: middle;
        }

        .o-table tfoot tr.total-row td {
            padding: 6px 8px;
            background: #e9f3f8;
            border-top: 2px solid #2a7ba5;
            font-weight: 700;
            font-size: 10.5px;
            color: #1b5f82;
        }

        .td-right {
            text-align: right;
        }

        .td-center {
            text-align: center;
        }

        .td-mono {
            font-family: 'Courier New', monospace;
            font-size: 9px;
        }

        .td-bold {
            font-weight: 700;
            color: #1a1a1a;
        }

        .td-muted {
            color: #999;
        }

        /* ══ APPROVAL SECTION ══ */
        .approval-section {
            margin-bottom: 0;
        }

        .approval-grid {
            width: 100%;
            display: table;
            table-layout: fixed;
            border-collapse: separate;
            border-spacing: 5px 0;
        }

        .approval-box {
            display: table-cell;
            vertical-align: top;
            border: 1px solid #dee2e6;
            border-radius: 3px;
            overflow: hidden;
            background: #fff;
            page-break-inside: avoid;
        }

        .appr-head {
            background: #2a7ba5;
            padding: 3px 4px;
            text-align: center;
        }

        .appr-head-text {
            color: #fff;
            font-size: 7px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }

        .appr-sig-area {
            height: 50px;
            display: table;
            width: 100%;
            text-align: center;
            padding: 4px;
            /* background: #fdfdfd; */
            border-bottom: 1px solid #ececec;
        }

        .appr-sig-inner {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
        }

        .appr-sig-inner img {
            max-height: 38px;
            max-width: 100%;
            display: block;
            margin: 0 auto;
        }

        .sig-placeholder {
            color: #bbb;
            font-size: 7.5px;
            font-style: italic;
        }

        .sig-rejected {
            display: inline-block;
            border: 1.5px solid #dc3545;
            color: #dc3545;
            font-weight: 800;
            font-size: 8px;
            padding: 2px 5px;
            letter-spacing: 1px;
            transform: rotate(-8deg);
        }

        .appr-footer {
            padding: 3px 6px 4px;
            background: #f8f9fa;
            text-align: center;
        }

        .appr-name {
            font-size: 8px;
            font-weight: 700;
            color: #1a1a1a;
            line-height: 1.2;
        }

        .appr-date {
            font-size: 7px;
            color: #999;
            margin-top: 1px;
        }

        /* ══ FOOTER ══ */
        .page-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 0 0 0 15mm;
            margin-bottom: 20px;

        }

        .footer-contact {
            padding: 0 0 22px 0;
        }

        .footer-contact-line {
            font-size: 10px;
            color: #555;
            line-height: 1.6;
        }

        .footer-contact-line .fc-icon {
            display: inline;
            margin-right: 5px;
            vertical-align: middle;
        }

        .fc-icon img {
            height: 11px;
            width: 11px;
            vertical-align: middle;
        }

        .footer-accent-bar {
            position: fixed;
            bottom: 0;
            right: 0;
            height: 25px;
            width: 98%;
            background-color: #1b5f82;
            border-top-left-radius: 150px;
        }
    </style>

    @if (!$isPdf)
    <style>
        /* Web Preview Only — tidak masuk ke DomPDF */
        body {
            background: #e8e8e8;
            padding: 20px 0;
        }

        .page-wrapper {
            max-width: 870px;
            margin: 0 auto;
            background: #fff;
            padding: 24px 28px 36px;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
            border-radius: 4px;
            position: relative;
        }

        .page-footer {
            position: relative;
            margin-top: 24px;
        }

        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }

            body {
                background: #fff;
                padding: 0;
            }

            .page-wrapper {
                max-width: none;
                padding: 15mm 18mm;
                box-shadow: none;
                border-radius: 0;
            }

            .page-footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                margin-top: 0;
            }
        }
    </style>
    @endif
</head>

<body>
    <div class="page-wrapper">

        <!-- ══════════════════ KOP SURAT ══════════════════ -->
        <div class="kop-outer">
            <div class="kop-accent-bar"></div>
            <table class="kop-body">
                <tr>
                    <!-- LEFT: Logo + Company -->
                    <td class="kop-left">
                        <table class="kop-logo-group">
                            <tr>
                                <td class="kop-logo">
                                    @if ($isPdf)
                                    <img src="{{ public_path('logo.png') }}" alt="Logo">
                                    @else
                                    <img src="{{ asset('logo.png') }}" alt="Logo">
                                    @endif
                                </td>
                                <td class="kop-company-info">
                                    <!-- <div class="kop-company-name">CV HASIL BAROKAH MANDIRI</div>
                                    <div class="kop-company-tagline">General Supplier &amp; Contractor</div> -->
                                </td>
                            </tr>
                        </table>
                    </td>

                    <!-- RIGHT: Document Title + Ref + Status -->
                    <td class="kop-right">
                        <div class="kop-doc-title">PENGAJUAN ANGGARAN</div>
                        <div class="kop-doc-ref">{{ $submission->no_pengajuan }}</div>
                        <div class="kop-doc-status">
                            @php
                            $fs = strtolower($submission->final_status);
                            $badgeClass = match(true) {
                            str_contains($fs,'approved') || str_contains($fs,'disetujui') => 'badge-approved',
                            str_contains($fs,'rejected') || str_contains($fs,'ditolak') => 'badge-rejected',
                            str_contains($fs,'pending') || str_contains($fs,'menunggu') => 'badge-pending',
                            default => 'badge-draft'
                            };
                            @endphp
                            <span class="badge {{ $badgeClass }}">{{ strtoupper($submission->final_status) }}</span>
                        </div>
                    </td>
                </tr>
            </table>
            <div class="kop-bottom-bar"></div>
        </div>

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
                            <td colspan="{{ count($dates) + 1 }}" class="td-right"
                                style="letter-spacing:0.3px; padding: 6px;">
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
                        <td class="td-right td-mono td-bold">Rp {{ number_format($item->total, 0, ',', '.') }}</td>
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
                                @if ($isPdf)
                                <img src="{{ public_path($submission->user->signature_path) }}" alt="TTD">
                                @else
                                <img src="{{ asset($submission->user->signature_path) }}" alt="TTD">
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
                                @if ($isPdf)
                                <img src="{{ public_path($approval->signature_used) }}" alt="TTD">
                                @else
                                <img src="{{ asset($approval->signature_used) }}" alt="TTD">
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

        @php
        $iconColor = '%23e9b10a';
        $svgLoc = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24
        24%22 fill=%22'.$iconColor.'%22%3E%3Cpath d=%22M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75
        7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z%22/%3E%3C/svg%3E';
        $svgMail = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24
        24%22 fill=%22'.$iconColor.'%22%3E%3Cpath d=%22M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9
        2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z%22/%3E%3C/svg%3E';
        $svgTel = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24
        24%22 fill=%22'.$iconColor.'%22%3E%3Cpath d=%22M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2c.27-.27.67-.36
        1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0
        1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z%22/%3E%3C/svg%3E';
        $svgWeb = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24
        24%22 fill=%22'.$iconColor.'%22%3E%3Cpath d=%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12
        2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2
        2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9
        2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z%22/%3E%3C/svg%3E';
        @endphp
        <!-- ══════════════════ FOOTER ══════════════════ -->
        <div class="page-footer">
            <div class="footer-contact">
                <div class="footer-contact-line">
                    <span class="fc-icon"><img src="{{ $svgLoc }}" alt="loc"></span>
                    Desa Gondosari RT. 02 RW. 06, Kec. Gebog, Kab. Kudus,<br> Jawa Tengah, Indonesia
                </div>
                <div class="footer-contact-line">
                    <span class="fc-icon"><img src="{{ $svgMail }}" alt="mail"></span>
                    admin@hbmcorp.co.id
                </div>
                <div class="footer-contact-line">
                    <span class="fc-icon"><img src="{{ $svgTel }}" alt="tel"></span>
                    +62 291 2912748
                </div>
                <div class="footer-contact-line">
                    <span class="fc-icon"><img src="{{ $svgWeb }}" alt="web"></span>
                    www.hbmcorp.co.id
                </div>
            </div>
        </div>
        <div class="footer-accent-bar"></div>

        @if (!$isPdf)
        @endif

    </div>
</body>

</html>