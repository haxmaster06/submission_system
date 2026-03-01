<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::first();
Auth::login($user);

// Pass empty collection
$submissions = collect([]); 
$filters = ['date_from' => '2024-01-01', 'date_to' => '2025-12-31', 'status' => 'all'];

try {
    $html = view('pdf.submissions_report', [
      'submissions' => $submissions,
      'filters' => $filters,
      'generated_at' => now()->format('d/m/Y H:i'),
      'generated_by' => Auth::user()->name
    ])->render();
    echo "Rendered successfully with empty collection.\n";
} catch (\Throwable $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
