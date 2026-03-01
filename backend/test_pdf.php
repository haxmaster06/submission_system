<?php
$user = App\Models\User::first();
Auth::login($user);

$request = Illuminate\Http\Request::create('/api/reports/submissions/export', 'GET');
$controller = new App\Http\Controllers\Api\ReportingController();
$response = $controller->exportPdf($request);

file_put_contents('public/test_report.pdf', $response->getContent());
echo "PDF Saved to public/test_report.pdf\n";
