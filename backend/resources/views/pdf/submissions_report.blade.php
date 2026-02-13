<!DOCTYPE html>
<html>

<head>
    <title>Laporan Pengajuan</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 11px;
            color: #333;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #444;
            padding-bottom: 10px;
        }

        .header h1 {
            margin: 0;
            font-size: 18px;
            color: #0284c7;
        }

        .info {
            margin-bottom: 15px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th {
            background: #f8fafc;
            color: #475569;
            font-weight: bold;
            border: 1px solid #e2e8f0;
            padding: 8px;
            text-align: left;
        }

        td {
            border: 1px solid #e2e8f0;
            padding: 8px;
            vertical-align: top;
        }

        .status {
            padding: 3px 6px;
            border-radius: 4px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9px;
        }

        .pending {
            background: #fef9c3;
            color: #854d0e;
        }

        .approved {
            background: #dcfce7;
            color: #166534;
        }

        .rejected {
            background: #fee2e2;
            color: #991b1b;
        }

        .footer {
            margin-top: 20px;
            text-align: right;
            font-style: italic;
            color: #64748b;
        }

        .nominal {
            text-align: right;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>LAPORAN PENGAJUAN BUDGET</h1>
        <p>HBM Budgeting System</p>
    </div>

    <div class="info">
        <table style="width: 50%; border: none;">
            <tr>
                <td style="border: none; padding: 2px;">Periode:</td>
                <td style="border: none; padding: 2px;">{{ $filters['date_from'] ?? 'Awal' }} s/d
                    {{ $filters['date_to'] ?? 'Sekarang' }}</td>
            </tr>
            <tr>
                <td style="border: none; padding: 2px;">Status:</td>
                <td style="border: none; padding: 2px;">{{ strtoupper($filters['status'] ?? 'SEMUA') }}</td>
            </tr>
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th width="30">No</th>
                <th width="120">No Pengajuan</th>
                <th width="80">Tanggal</th>
                <th>Deskripsi</th>
                <th width="100">Divisi</th>
                <th width="100">Total</th>
                <th width="80">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($submissions as $index => $sub)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td><strong>{{ $sub->no_pengajuan }}</strong></td>
                    <td>{{ \Carbon\Carbon::parse($sub->tanggal_pengajuan)->format('d/m/Y') }}</td>
                    <td>{{ $sub->description }}</td>
                    <td>{{ $sub->division->name }}</td>
                    <td class="nominal">Rp {{ number_format($sub->total, 0, ',', '.') }}</td>
                    <td>
                        <span class="status {{ $sub->final_status }}">
                            {{ $sub->final_status }}
                        </span>
                    </td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="background: #f1f5f9; font-weight: bold;">
                <td colspan="5" style="text-align: right;">TOTAL</td>
                <td class="nominal">Rp {{ number_format($submissions->sum('total'), 0, ',', '.') }}</td>
                <td></td>
            </tr>
        </tfoot>
    </table>

    <div class="footer">
        Dicetak pada: {{ $generated_at }} oleh {{ $generated_by }}
    </div>
</body>

</html>
