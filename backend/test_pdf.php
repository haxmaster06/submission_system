<?php
try {
    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.submissions_report', [
        'submissions' => \App\Models\Submission::limit(1)->get(),
        'filters' => [],
        'generated_at' => now(),
        'generated_by' => 'Test User'
    ])->setPaper('a4', 'landscape');
    
    $path = storage_path('test_report.pdf');
    $pdf->save($path);
    echo "PDF Generated Successfully at: " . $path . "\n";
} catch (\Throwable $e) {
    echo "Error Generating PDF: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
