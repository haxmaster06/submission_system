<!DOCTYPE html>
<html lang="id">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@yield('title', 'Dokumen')</title>
    <style>
        /* DomPDF TIDAK mendukung: CSS Variables, @import Google Fonts, @media queries.
           Semua warna HARUS hardcoded agar PDF & Print konsisten. */

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        @page {
            margin: 15mm 18mm 25mm 18mm;
            size: A4 @yield('page_orientation', '');
            @yield('page_margins')
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
            width: 100%;
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

        .kop-body table {
            margin-bottom: 1px !important;
        }

        .kop-body td {
            border: none !important;
        }

        .kop-left {
            display: table-cell;
            vertical-align: middle;
            width: 52%;
            border: none !important;
        }

        .kop-right {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            width: 48%;
            border: none !important;
        }

        .kop-logo-group {
            display: table;
            border-collapse: collapse;
        }

        .kop-logo-group td {
            vertical-align: middle;
            border: none !important;
        }

        .kop-logo img {
            height: 60px;
            width: auto;
            display: block;
        }

        .kop-company-info {
            padding-left: 12px;
            /* border-left: 2px solid #2a7ba5; */
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
            bottom: -20mm;
            left: 0;
            right: 0;
            padding: 0;
        }

        .footer-contact {
            padding: 0 0 22px 0;
        }

        .footer-contact-line {
            font-size: 10px;
            color: #555;
            line-height: 1.6;
        }

        .footer-contact-line.inline-footer {
            display: block;
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
            position: absolute;
            bottom: 0;
            right: 0;
            height: 25px;
            width: 98%;
            background-color: #1b5f82;
            border-top-left-radius: 150px;
        }

        .print-meta-info {
            position: fixed;
            bottom: 20px;
            right: 18mm;
            text-align: right;
            font-style: italic;
            color: #64748b;
            font-size: 8px;
            z-index: 10;
        }
    </style>

    @yield('extra_css')

    @if ((isset($is_print) && $is_print) || (isset($isPdf) && !$isPdf))
    <style>
        /* Web Preview Only — tidak masuk ke DomPDF */
        body {
            background: #e8e8e8;
            padding: 20px 0;
        }

        .page-wrapper {
            margin: 0 auto;
            background: #fff;
            padding: 15mm 18mm;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
            border-radius: 4px;
            position: relative;
            max-width: 850px;
            @yield('web_page_wrapper_css')
        }

        .page-footer {
            position: relative;
            margin-top: 24px;
            bottom: auto;
        }

        .footer-accent-bar {
            position: absolute;
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

            /* Allow Chrome to handle physical paper margins (usually ~10mm) */
            @page {
                margin: 10mm;
                size: A4 @yield('page_orientation', '');
            }

            .web-paper {
                width: 100%;
                max-width: none !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                display: block;
                position: static;
            }

            .kop-outer {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                background: #fff;
                z-index: 100;
            }

            .print-fixed-footer {
                position: fixed !important;
                bottom: 0 !important;
                left: 0 !important;
                right: 0 !important;
                background: #fff;
                z-index: 100;
                page-break-inside: avoid;
            }

            .page-footer {
                position: static !important;
                margin-top: 5px !important;
                padding: 0 !important;
                bottom: auto !important;
            }

            .print-meta-info {
                position: static !important;
                text-align: right;
                margin-bottom: 5px;
            }

            .footer-accent-bar {
                position: static !important;
                bottom: auto !important;
                margin-top: 5px !important;
            }

            .print-spacer-table {
                width: 100%;
                border-collapse: collapse;
            }

            .header-space {
                height: 125px;
                /* Adjust to kop surat height */
            }

            .footer-space {
                height: 90px;
                /* Adjust to footer height */
            }

            .page-wrapper {
                max-width: none !important;
                padding: 0 !important;
                box-shadow: none !important;
                border-radius: 0 !important;
            }
        }
    </style>
    @endif

    @yield('print_style_override')

</head>

<body>
    @if ((isset($is_print) && $is_print) || (isset($isPdf) && !$isPdf))
    <div class="web-paper">
        @endif

        <!-- ══════════════════ KOP SURAT ══════════════════ -->
        <div class="kop-outer print-fixed-header">
            <div class="kop-accent-bar"></div>
            <table class="kop-body">
                <tr>
                    <!-- LEFT: Logo + Company -->
                    <td class="kop-left">
                        <table class="kop-logo-group">
                            <tr>
                                <td class="kop-logo">
                                    @if (isset($isPdf) && $isPdf)
                                    <img src="{{ public_path('logo.png') }}" alt="Logo">
                                    @else
                                    <img src="{{ asset('logo.png') }}" alt="Logo">
                                    @endif
                                </td>
                                <td class="kop-company-info">
                                    @yield('kop_company_info')
                                </td>
                            </tr>
                        </table>
                    </td>

                    <!-- RIGHT: Document Title + Ref + Status -->
                    <td class="kop-right">
                        <div class="kop-doc-title">@yield('kop_title', 'DOKUMEN')</div>
                        <div class="kop-doc-ref">@yield('kop_ref', 'REF-000')</div>

                        @hasSection('kop_status')
                        <div class="kop-doc-status">
                            <span class="badge @yield('kop_status_class')">@yield('kop_status')</span>
                        </div>
                        @endif
                    </td>
                </tr>
            </table>
            <div class="kop-bottom-bar"></div>
        </div>

        @if ((isset($is_print) && $is_print) || (isset($isPdf) && !$isPdf))
        <table class="print-spacer-table">
            <thead>
                <tr>
                    <td>
                        <div class="header-space"></div>
                    </td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div class="page-wrapper">
                            @yield('content')
                        </div>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td>
                        <div class="footer-space"></div>
                    </td>
                </tr>
            </tfoot>
        </table>
        @else
        <div class="page-wrapper">
            @yield('content')
        </div>
        @endif

        <!-- ══════════════════ FIXED FOOTERS ══════════════════ -->
        <div class="print-fixed-footer">
            @yield('before_footer')

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
            1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1
            1-1h3.5c.55 0
            1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z%22/%3E%3C/svg%3E';
            $svgWeb = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24
            24%22 fill=%22'.$iconColor.'%22%3E%3Cpath d=%22M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2
            12
            2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2
            2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9
            2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z%22/%3E%3C/svg%3E';
            @endphp

            <div class="page-footer">
                <div class="footer-contact">
                    @hasSection('footer_contact_lines')
                    @yield('footer_contact_lines')
                    @else
                    @include('pdf.layouts._default_contact_lines', compact('svgLoc', 'svgMail', 'svgTel', 'svgWeb'))
                    @endif
                </div>
            </div>
            <div class="footer-accent-bar"></div>
        </div>

        @if ((isset($is_print) && $is_print) || (isset($isPdf) && !$isPdf))
    </div>
    @endif
</body>

</html>