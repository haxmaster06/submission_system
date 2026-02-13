<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.45;
            background: #fff;
        }

        /* ── HEADER ── */
        .o-header {
            display: table;
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }

        .o-header-left,
        .o-header-right {
            display: table-cell;
            vertical-align: top;
        }

        .o-header-right {
            text-align: right;
        }

        .o-company-name {
            font-size: 20px;
            font-weight: 700;
            color: #4a90b8;
            line-height: 1.2;
        }

        .o-company-tag {
            font-size: 10px;
            color: #888;
            margin-top: 2px;
        }

        .o-doc-title {
            font-size: 22px;
            font-weight: 700;
            color: #333;
            line-height: 1.1;
        }

        .o-doc-ref {
            font-size: 10.5px;
            color: #4a90b8;
            font-weight: 600;
            margin-top: 4px;
        }

        .o-status-pill {
            display: inline-block;
            margin-top: 6px;
            padding: 3px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.3px;
            text-transform: uppercase;
            background: #d4edda;
            color: #155724;
        }

        /* ── DIVIDER ── */
        .o-divider {
            border: none;
            border-top: 1px solid #dee2e6;
            margin: 0 0 18px;
        }

        /* ── INFO GRID ── */
        .o-info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
        }

        .o-info-table td {
            padding: 3px 0;
            vertical-align: top;
        }

        .o-info-label {
            width: 110px;
            color: #888;
            font-size: 10.5px;
        }

        .o-info-value {
            color: #333;
            font-weight: 500;
        }

        .o-info-value strong {
            font-weight: 700;
            color: #111;
        }

        /* ── SECTION HEADING ── */
        .o-section-title {
            font-size: 11px;
            font-weight: 700;
            color: #4a90b8;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            margin-bottom: 6px;
            padding-bottom: 4px;
            border-bottom: 2px solid #4a90b8;
            display: inline-block;
        }

        .o-section-wrap {
            margin-bottom: 20px;
        }

        /* ── DESCRIPTION BOX ── */
        .o-desc-box {
            padding: 10px 12px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            font-size: 11px;
            color: #555;
            line-height: 1.6;
            margin-top: 6px;
        }

        /* ── ITEMS TABLE ── */
        .o-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-top: 6px;
        }

        .o-table thead tr {
            background: #4a90b8;
        }

        .o-table thead th {
            padding: 8px 10px;
            color: #fff;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: left;
            border: none;
        }

        .o-table tbody tr {
            border-bottom: 1px solid #e9ecef;
        }

        .o-table tbody tr:last-child {
            border-bottom: none;
        }

        .o-table tbody tr:nth-child(even) {
            background: #f8f9fa;
        }

        .o-table tbody td {
            padding: 8px 10px;
            color: #444;
            vertical-align: middle;
        }

        .o-table tfoot tr {
            border-top: 2px solid #dee2e6;
        }

        .o-table tfoot td {
            padding: 9px 10px;
            font-size: 11px;
        }

        .o-total-row td {
            background: #eef4f9;
            font-weight: 700;
            font-size: 12px;
            color: #4a90b8;
            border-top: 2px solid #4a90b8 !important;
        }

        .td-right {
            text-align: right;
        }

        .td-center {
            text-align: center;
        }

        .td-mono {
            font-family: 'Courier New', Courier, monospace;
            font-size: 10.5px;
        }

        .td-bold {
            font-weight: 700;
            color: #333;
        }

        /* ── APPROVALS ── */
        .approval-grid {
            width: 100%;
        }

        .approval-box {
            float: left;
            width: 18%;
            margin-right: 2%;
            margin-top: 5%;
            text-align: center;
            page-break-inside: avoid;
            background: #fff;
        }

        .approval-box:last-child {
            margin-right: 0;
        }

        .approval-box-header {
            display: table;
            width: 100%;
            min-height: 28px;
            /* background: #eef4f9; */
            /* border-bottom: 1px solid #cde3ef; */
            padding: 5px 4px;
        }

        .approval-box-header-inner {
            display: table-cell;
            vertical-align: middle;
            text-align: center;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #313030ff;
        }

        .approval-signature {
            height: 60px;
            padding: 8px 6px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .approval-signature img {
            max-height: 44px;
            max-width: 100%;
            width: auto;
            height: auto;
            display: block;
            margin: 0 auto;
        }

        .approval-box-footer {
            border-top: 1px solid #e9ecef;
            padding: 6px 6px 7px;
            background: #fff;
        }

        /* ── FOOTER ── */
        .o-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #dee2e6;
            padding-top: 5px;
            display: table;
            width: 100%;
            font-size: 8.5px;
            color: #aaa;
        }

        .o-footer-left {
            display: table-cell;
            text-align: left;
        }

        .o-footer-right {
            display: table-cell;
            text-align: right;
        }

        @page {
            margin: 1.2cm 1.5cm 1.6cm;
            size: A4;
        }
    </style>

    @if (!$isPdf)
        <style>
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .approval-grid {
                display: flex;
                gap: 10px;
            }

            .approval-box {
                float: none;
                width: auto;
                flex: 1;
                margin-right: 0;
            }

            .approval-signature {
                display: flex;
            }
        </style>
    @endif
</head>

<body>

    {{-- ══ HEADER (KOP DOKUMEN) ══ --}}

    <table style="width:100%; border-collapse:collapse; margin-bottom:0;">
        <tr>
            {{-- LEFT: Logo + Company --}}
            <td style="vertical-align:middle; width:55%;">
                <table style="border-collapse:collapse;">
                    <tr>
                        <td style="vertical-align:middle; padding-right:14px;">
                            @if ($isPdf)
                                <img src="{{ public_path('logo.png') }}" alt="Logo" style="width:150px; height:100px;">
                            @else
                                <img src="{{ asset('logo.png') }}" alt="Logo" style="width:150px; height:100px;">
                            @endif
                        </td>
                        <td style="vertical-align:middle;">
                            {{-- <div
                                style="font-size:20px; font-weight:800; color:#1a1a1a; line-height:1.2; letter-spacing:0.3px; white-space: nowrap;">
                                CV HASIL BAROKAH MANDIRI</div> --}}
                            {{-- <div style="font-size:9.5px; color:#666; margin-top:3px; letter-spacing:0.3px;">General
                                Supplier &amp; Contractor</div> --}}
                        </td>
                    </tr>
                </table>
            </td>

            {{-- RIGHT: Document Title + Ref + Status --}}
            <td style="text-align:right; vertical-align:middle; width:45%;">
                <div style="font-size:14px; font-weight:800; color:#2a7ba5; line-height:1.15; letter-spacing:0.2px;">
                    PENGAJUAN ANGGARAN</div>
                <div style="font-size:10px; color:#555; font-weight:600; margin-top:5px; letter-spacing:0.5px;">
                    {{ $submission->no_pengajuan }}</div>
                <div style="margin-top:7px;">
                    <span
                        style="display:inline-block; padding:3px 14px; border-radius:3px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; background:#2a7ba5; color:#fff;">
                        {{ strtoupper($submission->final_status) }}
                    </span>
                </div>
            </td>
        </tr>
    </table>

    {{-- Bottom border --}}
    <div style="margin-top:5px; border-top:2px solid #2a7ba5;"></div>
    <div style="height:16px;"></div>

    {{-- ══ META INFO ══ --}}
    <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:11px;">
        <tr>
            <td style="width:110px; padding:3px 0; color:#888; font-size:10.5px; vertical-align:top;">Tanggal</td>
            <td style="padding:3px 12px 3px 0; color:#333; font-weight:500; vertical-align:top;">:
                {{ $submission->tanggal_pengajuan->format('d F Y') }}</td>
            <td style="width:110px; padding:3px 0; color:#888; font-size:10.5px; vertical-align:top;">Divisi</td>
            <td style="padding:3px 0; color:#333; font-weight:500; vertical-align:top;">:
                {{ $submission->division->name }}</td>
        </tr>
        <tr>
            <td style="padding:3px 0; color:#888; font-size:10.5px; vertical-align:top;">Pemohon</td>
            <td style="padding:3px 12px 3px 0; color:#333; font-weight:500; vertical-align:top;">:
                {{ $submission->user->name }}</td>
            <td style="padding:3px 0; color:#888; font-size:10.5px; vertical-align:top;">Urgency</td>
            <td style="padding:3px 0; color:#333; font-weight:500; vertical-align:top;">:
                {{ strtoupper($submission->status_urgent) }}</td>
        </tr>
    </table>

    {{-- ══ DESCRIPTION ══ --}}
    <div style="margin-bottom:22px;">
        <div
            style="font-size:11px; font-weight:700; color:#2a7ba5; text-transform:uppercase; letter-spacing:0.6px; padding-bottom:4px; border-bottom:2px solid #2a7ba5; display:inline-block; margin-bottom:8px;">
            Judul Pengajuan
        </div>
        <div
            style="padding:10px 12px; border-bottom:1px solid #dee2e6; font-size:11px; color:#555; line-height:1.6;">
            {{ $submission->description }}
        </div>
    </div>

    {{-- ══ ITEMS TABLE ══ --}}
    <div style="margin-bottom:28px;">
        <div
            style="font-size:11px; font-weight:700; color:#2a7ba5; text-transform:uppercase; letter-spacing:0.6px; padding-bottom:4px; border-bottom:2px solid #2a7ba5; display:inline-block; margin-bottom:8px;">
            Rincian Anggaran
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:11px;">
            <thead>
                <tr style="background:#2a7ba5;">
                    <th
                        style="padding:8px 10px; color:#fff; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; text-align:left; border:none;">
                        Deskripsi Item</th>
                    <th
                        style="padding:8px 10px; color:#fff; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; text-align:right; width:70px; border:none;">
                        Qty</th>
                    <th
                        style="padding:8px 10px; color:#fff; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; text-align:center; width:70px; border:none;">
                        UoM</th>
                    <th
                        style="padding:8px 10px; color:#fff; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; text-align:right; width:120px; border:none;">
                        Harga Satuan</th>
                    <th
                        style="padding:8px 10px; color:#fff; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; text-align:right; width:120px; border:none;">
                        Total</th>
                </tr>
            </thead>
            <tbody>
                @if ($submission->items && $submission->items->count() > 0)
                    @foreach ($submission->items as $item)
                        <tr
                            style="{{ $loop->even ? 'background:#f8f9fa;' : 'background:#fff;' }} border-bottom:1px solid #e9ecef;">
                            <td style="padding:8px 10px; color:#444; border-bottom:1px solid #e9ecef;">
                                {{ $item->description }}</td>
                            <td
                                style="padding:8px 10px; text-align:right; font-family:'Courier New',monospace; font-size:10.5px; color:#444; border-bottom:1px solid #e9ecef;">
                                {{ number_format($item->qty, 0, ',', '.') }}</td>
                            <td
                                style="padding:8px 10px; text-align:center; color:#666; border-bottom:1px solid #e9ecef;">
                                {{ optional($item->uom)->code ?? (optional($item->uom)->name ?? '-') }}</td>
                            <td
                                style="padding:8px 10px; text-align:right; font-family:'Courier New',monospace; font-size:10.5px; color:#444; border-bottom:1px solid #e9ecef;">
                                Rp {{ number_format($item->nominal, 0, ',', '.') }}</td>
                            <td
                                style="padding:8px 10px; text-align:right; font-family:'Courier New',monospace; font-size:10.5px; font-weight:700; color:#333; border-bottom:1px solid #e9ecef;">
                                Rp {{ number_format($item->total, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                @else
                    {{-- Legacy Support --}}
                    <tr>
                        <td style="padding:8px 10px; color:#444; border-bottom:1px solid #e9ecef;">
                            {{ $submission->description }}</td>
                        <td
                            style="padding:8px 10px; text-align:right; font-family:'Courier New',monospace; font-size:10.5px; color:#444; border-bottom:1px solid #e9ecef;">
                            {{ number_format($submission->qty ?? 0, 0, ',', '.') }}</td>
                        <td style="padding:8px 10px; text-align:center; color:#666; border-bottom:1px solid #e9ecef;">
                            {{ optional($submission->uom)->code ?? (optional($submission->uom)->name ?? '-') }}</td>
                        <td
                            style="padding:8px 10px; text-align:right; font-family:'Courier New',monospace; font-size:10.5px; color:#444; border-bottom:1px solid #e9ecef;">
                            Rp {{ number_format($submission->nominal ?? 0, 0, ',', '.') }}</td>
                        <td
                            style="padding:8px 10px; text-align:right; font-family:'Courier New',monospace; font-size:10.5px; font-weight:700; color:#333; border-bottom:1px solid #e9ecef;">
                            Rp {{ number_format($submission->total, 0, ',', '.') }}</td>
                    </tr>
                @endif
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="4"
                        style="padding:9px 10px; background:#eef4f9; font-weight:700; font-size:11px; color:#2a7ba5; text-align:right; border-top:2px solid #2a7ba5; letter-spacing:0.3px;">
                        Total Estimasi</td>
                    <td
                        style="padding:9px 10px; background:#eef4f9; font-weight:700; font-size:13px; color:#2a7ba5; text-align:right; font-family:'Courier New',monospace; border-top:2px solid #2a7ba5;">
                        Rp {{ number_format($submission->total, 0, ',', '.') }}</td>
                </tr>
            </tfoot>
        </table>
    </div>

    {{-- ══ APPROVALS ══ --}}
    <div style="page-break-inside:avoid;">
        {{-- <div style="font-size:11px; font-weight:700; color:#4a90b8; text-transform:uppercase; letter-spacing:0.6px; padding-bottom:4px; border-bottom:2px solid #4a90b8; display:inline-block; margin-bottom:10px;">
            Persetujuan
        </div> --}}

        <div class="approval-grid">
            {{-- Requestor Box --}}
            <div class="approval-box">
                <div class="approval-box-header">
                    <div class="approval-box-header-inner">PEMOHON</div>
                </div>

                <div class="approval-signature">
                    @if ($submission->requestor_signature_base64)
                        <img src="{{ $submission->requestor_signature_base64 }}" alt="Signed">
                    @elseif ($submission->user->signature_path)
                         @if ($isPdf)
                            <img src="{{ public_path('logo.png') }}" alt="Signed">
                        @else
                            <img src="{{ asset($submission->user->signature_path) }}" alt="Signed">
                        @endif
                    @else
                        <div style="color:#bbb; font-size:9px; font-style:italic;">(Draft)</div>
                    @endif
                </div>

                <div class="approval-box-footer">
                    <div style="font-size:9.5px; font-weight:700; color:#333;">
                        {{ $submission->user->name }}
                    </div>
                    <div style="font-size:8px; color:#aaa; margin-top:2px;">
                        {{ $submission->tanggal_pengajuan->format('d/m/Y') }}
                    </div>
                </div>
            </div>

            @foreach ($submission->approvals->sortBy('step_order') as $approval)
                <div class="approval-box">

                    <div class="approval-box-header">
                        <div class="approval-box-header-inner">{{ $approval->role_name }}</div>
                    </div>

                    <div class="approval-signature">
                        @if ($approval->status === 'approved')
                            @if ($approval->signature_base64)
                                <img src="{{ $approval->signature_base64 }}" alt="Signed">
                            @elseif ($approval->signature_used)
                                @if ($isPdf)
                                    <img src="{{ public_path('logo.png') }}" alt="Signed">
                                @else
                                    <img src="{{ asset($approval->signature_used) }}" alt="Signed">
                                @endif
                            @endif
                        @elseif ($approval->status === 'rejected')
                            <div
                                style="display:inline-block; border:2px solid #dc3545; color:#dc3545; font-weight:800; font-size:10px; padding:4px 8px; letter-spacing:1.5px; transform:rotate(-8deg);">
                                DITOLAK</div>
                        @else
                            <div style="color:#bbb; font-size:9px; font-style:italic;">(Pending)</div>
                        @endif
                    </div>

                    <div class="approval-box-footer">
                        <div style="font-size:9.5px; font-weight:700; color:#333;">
                            {{ $approval->approver ? $approval->approver->name : '-' }}
                        </div>
                        <div style="font-size:8px; color:#aaa; margin-top:2px;">
                            {{ $approval->approved_at ? $approval->approved_at->format('d/m/Y H:i') : '&nbsp;' }}
                        </div>
                    </div>

                </div>
            @endforeach
            <div style="clear:both;"></div>
        </div>
    </div>

    {{-- ══ FOOTER ══ --}}
    <div
        style="position:fixed; bottom:0; left:0; right:0; border-top:1px solid #dee2e6; padding-top:5px; display:table; width:100%; font-size:8.5px; color:#aaa;">
        {{-- <div style="display:table-cell; text-align:left;">Dicetak otomatis oleh Sistem pada {{ now()->format('d/m/Y H:i') }}</div> --}}
        <div style="display:table-cell; text-align:right;">
            @if ($isPdf)
                Halaman
                <script type="text/php">echo $PAGE_NUM;</script>
            @endif
        </div>
    </div>

    @if (!$isPdf)
        <script>
            window.onload = function() {
                window.print();
            }
        </script>
    @endif

</body>

</html>
