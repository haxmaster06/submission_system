<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::first();
Auth::login($user);

// Use a simple blade render test to see where it breaks, without generating PDF
$submissions = App\Models\Submission::with(['user', 'division', 'jenisPengajuan', 'realizations'])->latest()->get();
$filters = ['date_from' => '2024-01-01', 'date_to' => '2025-12-31', 'status' => 'all'];

$html = view('pdf.submissions_report', [
  'submissions' => $submissions,
  'filters' => $filters,
  'generated_at' => now()->format('d/m/Y H:i'),
  'generated_by' => Auth::user()->name
])->render();

file_put_contents('public/test_report.html', $html);
echo "HTML saved to public/test_report.html\n";
