<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);
$sub = \App\Models\Submission::where('final_status', 'draf')->latest('updated_at')->first();
echo json_encode([
    'id' => $sub->id ?? null,
    'created_at' => $sub->created_at ?? null,
    'updated_at' => $sub->updated_at ?? null,
    'tanggal_pengajuan' => $sub->tanggal_pengajuan ?? null,
]);
