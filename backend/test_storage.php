<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$uploadId = 'test-1234';
$tempDir = 'public/releases/temp_chunks/' . $uploadId;
$success = \Illuminate\Support\Facades\Storage::disk('local')->makeDirectory($tempDir);
$path = storage_path('app/public/releases/temp_chunks/' . $uploadId);
$exists = \Illuminate\Support\Facades\File::exists($path);

echo 'MakeDir Success: ' . ($success ? 'Yes' : 'No') . PHP_EOL;
echo 'Path: ' . $path . PHP_EOL;
echo 'Exists: ' . ($exists ? 'Yes' : 'No') . PHP_EOL;
