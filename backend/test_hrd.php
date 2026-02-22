<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$user = \App\Models\User::where('email', 'hrd@example.com')->first();
echo "Roles:\n";
print_r($user->roles->pluck('name')->toArray());
echo "Permissions:\n";
print_r($user->getAllPermissions()->pluck('name')->toArray());
