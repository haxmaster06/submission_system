<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::whereHas('roles', function($q) { $q->where('name', 'Super Admin'); })->first();
if (!$user) { echo "No super admin found.\n"; exit; }

echo "User ID: {$user->id}\n";

// Finance Test
\Illuminate\Support\Facades\Cache::put('simulation:user:'.$user->id, ['role_name' => 'Finance']);
\Illuminate\Support\Facades\Auth::login($user);
$ctrl = new \App\Http\Controllers\Api\DashboardController();
$res = $ctrl->stats();
echo "Finance show_division_ranking: " . var_export($res->getData()->show_division_ranking ?? null, true) . "\n";
echo "Finance division_ranking: " . json_encode($res->getData()->division_ranking ?? []) . "\n";

// Director Test
\Illuminate\Support\Facades\Cache::put('simulation:user:'.$user->id, ['role_name' => 'Director']);
$res2 = $ctrl->stats();
echo "Director show_division_ranking: " . var_export($res2->getData()->show_division_ranking ?? null, true) . "\n";

// No simulation test
\Illuminate\Support\Facades\Cache::forget('simulation:user:'.$user->id);
$res3 = $ctrl->stats();
echo "No Sim show_division_ranking: " . var_export($res3->getData()->show_division_ranking ?? null, true) . "\n";

$resAdmin = $ctrl->adminStats();
echo "Admin show_division_ranking (should be present as division_ranking): " . (isset($resAdmin->getData()->division_ranking) ? "Yes" : "No") . "\n";
