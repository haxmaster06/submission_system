<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Laporan Pengajuan</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        @page {
            margin: 0;
            size: A4 landscape;
            /* Landscape for report */
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
            margin-bottom: 20px;
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
            /* border-collapse: collapse; */
            /* background: #fff; */
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
            /* border-collapse: collapse; */
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

        .kop-bottom-bar {
            height: 2px;
            background-color: #2a7ba5;
            margin-top: 1px;
            border-radius: 0 0 3px 3px;
        }

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
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
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

        .generation-info {
            position: absolute;
            bottom: 60px;
            right: 18mm;
            text-align: right;
            font-style: italic;
            color: #64748b;
            font-size: 8px;
        }
    </style>

    @if (isset($is_print) && $is_print)
    <style>
        /* Web Preview Only — tidak masuk ke DomPDF */
        body {
            background: #e8e8e8;
            padding: 20px 0;
        }

        .page-wrapper {
            max-width: 1100px;
            /* Lebar untuk landscape viewport */
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

        .footer-accent-bar {
            position: absolute;
        }

        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
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

            .footer-accent-bar {
                position: fixed;
            }
        }
    </style>
    @endif
</head>

<body>
    <div class="page-wrapper">
        <!-- KOP SURAT (Disesuaikan dari detail pengajuan) -->
        <div class="kop-outer">
            <div class="kop-accent-bar"></div>
            <table class="kop-body">
                <tr>
                    <td class="kop-left">
                        <table class="kop-logo-group">
                            <tr>
                                <td class="kop-logo">
                                    @if (isset($is_print) && $is_print)
                                    <img src="{{ asset('logo.png') }}" alt="Logo">
                                    @else
                                    <img src="{{ public_path('logo.png') }}" alt="Logo">
                                    @endif
                                </td>
                                <td class="kop-company-info"></td>
                            </tr>
                        </table>
                    </td>
                    <td class="kop-right">
                        <div class="kop-doc-title">SUMMARY REPORT</div>
                        <div class="kop-doc-ref">REF : HBM-RPT-{{ date('dmy-Hi') }}</div>
                    </td>
                </tr>
            </table>
            <div class="kop-bottom-bar"></div>
        </div>

        <table style="width: 50%; border: none; margin-bottom: 20px;">
            <tr>
                <td style="border: none; padding: 2px; font-weight: bold; width: 100px;">Tanggal Filter</td>
                <td style="border: none; padding: 2px;">: {{ $filters['date_from'] ?? 'Awal' }} s/d {{
                    $filters['date_to']
                    ?? 'Sekarang' }}</td>
            </tr>
            <tr>
                <td style="border: none; padding: 2px; font-weight: bold;">Status Pengajuan</td>
                <td style="border: none; padding: 2px;">: {{ strtoupper($filters['status'] ?? 'SEMUA') }}</td>
            </tr>
            <tr>
                <td style="border: none; padding: 2px; font-weight: bold;">Filter Dokumen</td>
                <td style="border: none; padding: 2px;">:
                    @if(!empty($filters['division_id']) || !empty($filters['jenis_pengajuan_id']))
                    Spesifik (Divisi / Jenis tertentu)
                    @else
                    Semua Departemen
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
        <div
            style="text-align: center; padding: 20px; font-weight: bold; background: #f8fafc; border: 1px solid #e2e8f0;">
            TIDAK ADA DATA PENGAJUAN PADA RENTANG DAN FILTER INI
        </div>
        @else
        @foreach ($groupedSubmissions as $divisionName => $divSubmissions)
        <div class="division-header">DIVISION: {{ strtoupper($divisionName) }}</div>

        <table>
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
                // Calculate Realization total for this submission (Approved only)
                $realizationTotal = 0;
                if($sub->realizations) {
                $realizationTotal = $sub->realizations
                ->where('final_status', 'approved')
                ->sum('total_amount');
                }

                $divTotalPengajuan += $sub->total;
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
                    <td class="nominal"
                        style="color: {{ $selisih < 0 ? '#dc2626' : ($selisih == 0 ? '#475569' : '#ca8a04') }}">
                        Rp {{ number_format($selisih, 0, ',', '.') }}
                    </td>
                </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr style="background: #f1f5f9; font-weight: bold; text-align: right;">
                    <td colspan="5" style="border-top: 2px solid #ccc;">SUBTOTAL DIVISI: {{ strtoupper($divisionName) }}
                    </td>
                    <td class="nominal" style="border-top: 2px solid #ccc;">Rp {{ number_format($divTotalPengajuan, 0,
                        ',',
                        '.') }}</td>
                    <td class="nominal" style="border-top: 2px solid #ccc; color: #166534;">Rp {{
                        number_format($divTotalRealisasi, 0, ',', '.') }}</td>
                    <td class="nominal" style="border-top: 2px solid #ccc;">Rp {{ number_format($divTotalPengajuan -
                        $divTotalRealisasi, 0, ',', '.') }}</td>
                </tr>
            </tfoot>
        </table>
        @endforeach
        @endif

        {{-- GRAND TOTAL --}}
        @if($submissions->count() > 0)
        @php
        $grandTotalPengajuan = $submissions->sum('total');
        $grandTotalRealisasi = 0;
        foreach($submissions as $s) {
        if($s->realizations) {
        $grandTotalRealisasi += $s->realizations->where('final_status', 'approved')->sum('total_amount');
        }
        }
        @endphp
        <div style="margin-top: 30px; border: 2px solid #2a7ba5; padding: 10px; background: #f0f7fa;">
            <table style="width: 100%; border: none; margin: 0;">
                <tr style="font-size: 14px; font-weight: bold;">
                    <td style="border: none; text-align: left; color: #2a7ba5;">GRAND TOTAL SELURUH DIVISI</td>
                    <td style="border: none; text-align: right; width: 200px;">Pengajuan: Rp {{
                        number_format($grandTotalPengajuan, 0, ',', '.') }}</td>
                    <td style="border: none; text-align: right; width: 200px; color: #166534;">Realisasi: Rp {{
                        number_format($grandTotalRealisasi, 0, ',', '.') }}</td>
                </tr>
            </table>
        </div>
        @endif

        <div class="generation-info">
            Dicetak pada: {{ $generated_at }} WIB oleh {{ $generated_by }}
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

        <!-- FOOTER -->
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

    </div>
</body>

</html>