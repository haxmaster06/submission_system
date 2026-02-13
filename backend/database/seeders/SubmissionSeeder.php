<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Submission;
use App\Models\SubmissionItem;
use App\Models\User;
use App\Models\Division;
use App\Models\JenisPengajuan;
use App\Models\JenisPerjalanan;
use App\Models\Uom;
use App\Services\SubmissionService;
use App\Services\ApprovalService;
use Carbon\Carbon;

class SubmissionSeeder extends Seeder
{
    protected $submissionService;
    protected $approvalService;

    public function __construct(SubmissionService $submissionService, ApprovalService $approvalService)
    {
        $this->submissionService = $submissionService;
        $this->approvalService = $approvalService;
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::whereHas('roles', function($q) {
            $q->whereNotIn('name', ['Super Admin']);
        })->get();

        $divisions = Division::all();
        $jenisPengajuan = JenisPengajuan::all();
        $jenisPerjalanan = JenisPerjalanan::all();
        $uoms = Uom::all();

        if ($users->isEmpty() || $divisions->isEmpty() || $jenisPengajuan->isEmpty() || $uoms->isEmpty()) {
            $this->command->error('Please run UserSeeder, DivisionSeeder, JenisPengajuanSeeder, and UomSeeder first!');
            return;
        }

        // Sample submission titles and item descriptions
        $submissionTitles = [
            'Pengadaan Peralatan Kantor Q1 2024',
            'Pembelian Supplies ATK Bulan Maret',
            'Perjalanan Dinas Training Jakarta',
            'Pengadaan Komputer untuk Staff Baru',
            'Pembelian Furniture Ruang Meeting',
            'Pengadaan Printer dan Scanner',
            'Perjalanan Dinas Client Meeting Surabaya',
            'Pembelian Software Lisensi Tahunan',
            'Pengadaan AC untuk Ruang Server',
            'Pembelian Konsumsi Rapat Bulanan',
            'Perjalanan Dinas Audit Cabang Bandung',
            'Pengadaan Peralatan Cleaning Service',
            'Pembelian Tinta dan Kertas',
            'Pengadaan Meja dan Kursi Kantor',
            'Perjalanan Dinas Workshop Bali',
            'Pembelian Alat Tulis untuk Divisi',
            'Pengadaan Laptop untuk Manager',
            'Pembelian Projector Meeting Room',
            'Perjalanan Dinas Kunjungan Vendor',
            'Pengadaan Whiteboard dan Spidol',
            'Pembelian Token Listrik Kantor',
            'Pengadaan UPS dan Stabilizer',
            'Perjalanan Dinas Seminar Nasional',
            'Pembelian Peralatan P3K Kantor',
            'Pengadaan CCTV Keamanan',
            'Pembelian Dispenser dan Galon',
            'Perjalanan Dinas Meeting Vendor Jakarta',
            'Pengadaan Kabel dan Aksesoris IT',
            'Pembelian Buku dan Majalah Kantor',
            'Pengadaan Server dan Storage',
            'Perjalanan Dinas Training SAP',
            'Pembelian Souvenir Corporate',
            'Pengadaan Genset Cadangan',
        ];

        $itemTemplates = [
            // Office Supplies
            ['Kertas A4 70gsm', [5, 10, 20], 'Rim', [45000, 50000, 55000]],
            ['Tinta Printer Black', [10, 15, 20], 'Botol', [120000, 150000, 180000]],
            ['Tinta Printer Color', [5, 10, 15], 'Botol', [150000, 180000, 200000]],
            ['Spidol Permanent', [20, 30, 50], 'Pcs', [5000, 7000, 10000]],
            ['Stabilo Highlighter', [10, 20, 30], 'Pcs', [8000, 10000, 12000]],
            ['Folder Plastik', [50, 100, 150], 'Pcs', [3000, 5000, 7000]],
            ['Stapler Besar', [5, 10, 15], 'Pcs', [35000, 45000, 55000]],
            ['Gunting Kantor', [10, 15, 20], 'Pcs', [15000, 20000, 25000]],
            ['Double Tape', [20, 30, 40], 'Roll', [10000, 12000, 15000]],
            ['Lakban Coklat', [10, 20, 30], 'Roll', [8000, 10000, 12000]],
            
            // IT Equipment
            ['Laptop HP Core i5', [1, 2, 3], 'Unit', [7000000, 8000000, 9000000]],
            ['Laptop Dell Core i7', [1, 2], 'Unit', [12000000, 14000000, 15000000]],
            ['Monitor LED 24 inch', [2, 3, 5], 'Unit', [1500000, 1800000, 2000000]],
            ['Keyboard Wireless', [5, 10, 15], 'Unit', [150000, 200000, 250000]],
            ['Mouse Wireless', [5, 10, 15], 'Unit', [100000, 150000, 200000]],
            ['Printer Canon Pixma', [1, 2, 3], 'Unit', [1800000, 2000000, 2500000]],
            ['Scanner Epson', [1, 2], 'Unit', [2500000, 3000000, 3500000]],
            ['UPS 1000VA', [2, 3, 5], 'Unit', [800000, 1000000, 1200000]],
            ['Kabel LAN Cat6', [50, 100, 200], 'Meter', [5000, 7000, 10000]],
            ['Flashdisk 32GB', [10, 20, 30], 'Pcs', [80000, 100000, 120000]],
            
            // Furniture
            ['Meja Kantor Kayu', [2, 3, 5], 'Unit', [1200000, 1500000, 1800000]],
            ['Kursi Kantor Putar', [3, 5, 10], 'Unit', [800000, 1000000, 1200000]],
            ['Lemari Arsip Besi', [1, 2, 3], 'Unit', [2000000, 2500000, 3000000]],
            ['Rak Buku Kayu', [2, 3, 4], 'Unit', [1000000, 1200000, 1500000]],
            ['Whiteboard 120x180', [1, 2, 3], 'Unit', [500000, 700000, 900000]],
            
            // Travel/Transport
            ['Tiket Pesawat Jakarta PP', [1, 2, 3], 'Pcs', [1200000, 1500000, 2000000]],
            ['Hotel Bintang 3 per malam', [2, 3, 5], 'Malam', [500000, 700000, 900000]],
            ['Uang Saku Perjalanan Dinas', [1, 2, 3], 'Orang', [300000, 500000, 700000]],
            ['Sewa Mobil per hari', [1, 2, 3], 'Hari', [400000, 500000, 600000]],
            
            // Consumables
            ['Air Galon', [10, 20, 30], 'Galon', [15000, 18000, 20000]],
            ['Tisu Toilet', [20, 30, 50], 'Pack', [25000, 30000, 35000]],
            ['Sabun Cuci Tangan', [5, 10, 15], 'Botol', [20000, 25000, 30000]],
            ['Kopi Instan Sachet', [50, 100, 200], 'Sachet', [3000, 4000, 5000]],
            ['Gula Pasir', [5, 10, 15], 'Kg', [15000, 18000, 20000]],
        ];

        $this->command->info('Creating 35 submissions with multiple items...');
        $bar = $this->command->getOutput()->createProgressBar(35);

        for ($i = 0; $i < 35; $i++) {
            $user = $users->random();
            $division = $user->division_id ? Division::find($user->division_id) : $divisions->random();
            $jenis = $jenisPengajuan->random();
            $isUrgent = rand(1, 10) > 7; // 30% urgent
            
            // Create submission data
            $submissionData = [
                'user_id' => $user->id,
                'division_id' => $division->id,
                'jenis_pengajuan_id' => $jenis->id,
                'jenis_perjalanan_id' => ($jenis->name === 'Perjalanan') ? $jenisPerjalanan->random()->id : null,
                'status_urgent' => $isUrgent ? 'urgent' : 'normal',
                'description' => $submissionTitles[$i % count($submissionTitles)],
                'notes' => rand(1, 10) > 5 ? 'Mohon diproses segera. Terima kasih.' : null,
                'tanggal_pengajuan' => Carbon::now()->subDays(rand(0, 60)),
                'total' => 0, // Will be updated after items are created
            ];

            $submissionData['no_pengajuan'] = $this->submissionService->generateNoPengajuan($division->code);

            // Create submission
            $submission = Submission::create($submissionData);

            // Generate 1-5 items per submission
            $itemCount = rand(1, 5);
            $grandTotal = 0;

            for ($j = 0; $j < $itemCount; $j++) {
                $template = $itemTemplates[array_rand($itemTemplates)];
                $qty = $template[1][array_rand($template[1])];
                $uom = Uom::where('code', $template[2])->orWhere('name', $template[2])->first() ?? $uoms->random();
                $nominal = $template[3][array_rand($template[3])];
                $total = $qty * $nominal;
                $grandTotal += $total;

                SubmissionItem::create([
                    'submission_id' => $submission->id,
                    'description' => $template[0],
                    'qty' => $qty,
                    'uom_id' => $uom->id,
                    'nominal' => $nominal,
                    'total' => $total,
                ]);
            }

            // Update submission total
            $submission->update(['total' => $grandTotal]);

            // Initialize approval flow
            $this->approvalService->initializeApprovals($submission);

            $bar->advance();
        }

        $bar->finish();
        $this->command->newLine();
        $this->command->info('✓ Created 35 submissions with multiple items successfully!');
    }
}
