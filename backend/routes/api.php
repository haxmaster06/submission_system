<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\SignatureController;
use App\Http\Controllers\Api\LookupController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ApprovalFlowController;
use App\Http\Controllers\Api\RealizationController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->get('/audit-logs/{model}/{id}', [\App\Http\Controllers\Api\AuditTrailController::class, 'index']);

Route::middleware('auth:sanctum')->get('/approvals/director-signature-status', [ApprovalController::class, 'checkDirectorSignature']);

Route::get('/preview/submissions/{submission}/document.pdf', [SubmissionController::class, 'previewPdf'])
    ->name('api.submissions.preview')
    ->middleware('signed');

Route::get('/preview/submissions/{submission}/print', [SubmissionController::class, 'printHtml'])
    ->name('api.submissions.print')
    ->middleware('signed');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Lookups
    Route::get('/lookups', [LookupController::class, 'all']);
    Route::get('/lookups/divisions', [LookupController::class, 'divisions']);
    Route::get('/lookups/jenis-pengajuan', [LookupController::class, 'jenisPengajuan']);
    Route::get('/lookups/jenis-perjalanan', [LookupController::class, 'jenisPerjalanan']);
    Route::get('/lookups/uoms', [LookupController::class, 'uoms']);

    // Submissions
    Route::apiResource('submissions', SubmissionController::class);
    Route::post('/submissions/bulk-delete', [SubmissionController::class, 'bulkDelete']);
    Route::post('/submissions/{submission}/attachments', [SubmissionController::class, 'uploadAttachment']);
    Route::get('/submissions/{submission}/export', [SubmissionController::class, 'downloadPdf']);
    Route::get('/submissions/{submission}/preview-url', [SubmissionController::class, 'getPreviewUrl']);
    Route::get('/submissions/{submission}/print-url', [SubmissionController::class, 'getPrintUrl']);
    Route::post('/submissions/{submission}/complete', [SubmissionController::class, 'complete']);

    // Realizations
    Route::get('/submissions/{submission}/realizations', [RealizationController::class, 'index']);
    Route::apiResource('realizations', RealizationController::class)->except(['index']);

    // Approvals
    Route::get('/approvals/pending', [ApprovalController::class, 'pending']);
    Route::post('/approvals/{approval}/approve', [ApprovalController::class, 'approve']);
    Route::post('/approvals/{approval}/reject', [ApprovalController::class, 'reject']);

    // Signatures
    Route::get('/signatures', [SignatureController::class, 'show']);
    Route::post('/signatures', [SignatureController::class, 'store']);
    Route::delete('/signatures', [SignatureController::class, 'destroy']);
    // Users
    Route::apiResource('users', UserController::class);
    // Roles & Permissions
    Route::get('/roles-permissions', [\App\Http\Controllers\Api\RolePermissionController::class, 'index']);
    Route::get('/roles/{id}', [\App\Http\Controllers\Api\RolePermissionController::class, 'show']);
    Route::put('/roles/{id}/permissions', [\App\Http\Controllers\Api\RolePermissionController::class, 'update']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class, 'markAllRead']);


    // Approval Flow Management (Finance & Master Data Managers)
    Route::middleware('permission:approve submissions|manage master data')->group(function () {
        Route::get('/approval-flows', [\App\Http\Controllers\Api\ApprovalFlowController::class, 'index']);
    });

    Route::middleware('can:manage master data')->group(function () {
        // Steps
        Route::post('/approval-flows/{flow}/steps', [\App\Http\Controllers\Api\ApprovalFlowController::class, 'storeStep']);
        Route::put('/approval-flows/{flow}/steps/{step}', [\App\Http\Controllers\Api\ApprovalFlowController::class, 'updateStep']);
        Route::delete('/approval-flows/{flow}/steps/{step}', [\App\Http\Controllers\Api\ApprovalFlowController::class, 'destroyStep']);
        Route::post('/approval-flows/{flow}/steps/reorder', [\App\Http\Controllers\Api\ApprovalFlowController::class, 'reorderSteps']);
        // Conditions
        Route::post('/approval-flows/{flow}/conditions', [\App\Http\Controllers\Api\ApprovalFlowController::class, 'storeCondition']);
        Route::put('/approval-flows/{flow}/conditions/{condition}', [\App\Http\Controllers\Api\ApprovalFlowController::class, 'updateCondition']);
        Route::delete('/approval-flows/{flow}/conditions/{condition}', [\App\Http\Controllers\Api\ApprovalFlowController::class, 'destroyCondition']);
        Route::patch('/approval-flows/{flow}/conditions/{condition}/toggle', [\App\Http\Controllers\Api\ApprovalFlowController::class, 'toggleCondition']);
    });

    // Master Data (Read Access for All Authenticated Users)
    Route::get('/master/divisions', [\App\Http\Controllers\Api\MasterDataController::class, 'indexDivisions']);
    Route::get('/master/types', [\App\Http\Controllers\Api\MasterDataController::class, 'indexTypes']);
    Route::get('/master/uoms', [\App\Http\Controllers\Api\MasterDataController::class, 'indexUoms']);
    Route::get('/master/travel-types', [\App\Http\Controllers\Api\MasterDataController::class, 'indexTravelTypes']);
    Route::get('/master/urgency', [\App\Http\Controllers\Api\MasterDataController::class, 'indexUrgency']);

    // Master Data Management (Write Access Restricted)
    Route::middleware('can:manage master data')->group(function () {
        // Divisions
        Route::post('/master/divisions', [\App\Http\Controllers\Api\MasterDataController::class, 'storeDivision']);
        Route::put('/master/divisions/{division}', [\App\Http\Controllers\Api\MasterDataController::class, 'updateDivision']);
        Route::delete('/master/divisions/{division}', [\App\Http\Controllers\Api\MasterDataController::class, 'destroyDivision']);

        // Jenis Pengajuan
        Route::post('/master/types', [\App\Http\Controllers\Api\MasterDataController::class, 'storeType']);
        Route::put('/master/types/{jenisPengajuan}', [\App\Http\Controllers\Api\MasterDataController::class, 'updateType']);
        Route::delete('/master/types/{jenisPengajuan}', [\App\Http\Controllers\Api\MasterDataController::class, 'destroyType']);

        // UOMs
        Route::post('/master/uoms', [\App\Http\Controllers\Api\MasterDataController::class, 'storeUom']);
        Route::put('/master/uoms/{uom}', [\App\Http\Controllers\Api\MasterDataController::class, 'updateUom']);
        Route::delete('/master/uoms/{uom}', [\App\Http\Controllers\Api\MasterDataController::class, 'destroyUom']);

        // Jenis Perjalanan
        Route::post('/master/travel-types', [\App\Http\Controllers\Api\MasterDataController::class, 'storeTravelType']);
        Route::put('/master/travel-types/{jenisPerjalanan}', [\App\Http\Controllers\Api\MasterDataController::class, 'updateTravelType']);
        Route::delete('/master/travel-types/{jenisPerjalanan}', [\App\Http\Controllers\Api\MasterDataController::class, 'destroyTravelType']);

        // Urgency Statuses
        Route::post('/master/urgency', [\App\Http\Controllers\Api\MasterDataController::class, 'storeUrgency']);
        Route::put('/master/urgency/{urgencyStatus}', [\App\Http\Controllers\Api\MasterDataController::class, 'updateUrgency']);
        Route::delete('/master/urgency/{urgencyStatus}', [\App\Http\Controllers\Api\MasterDataController::class, 'destroyUrgency']);
        Route::post('/master/urgency/reorder', [\App\Http\Controllers\Api\MasterDataController::class, 'reorderUrgency']);
    });

    // Reporting (Finance & Master Data Managers)
    Route::middleware('permission:view reports|manage master data')->group(function () {
        Route::get('/reports/submissions', [\App\Http\Controllers\Api\ReportingController::class, 'index']);
        Route::get('/reports/submissions/export', [\App\Http\Controllers\Api\ReportingController::class, 'exportPdf']);
    });

    // Debug route
    Route::get('/test-approvals', function() {
        $financeUser = \App\Models\User::role('Finance')->first();
        $output = [
            'finance_user' => $financeUser ? ['id' => $financeUser->id, 'name' => $financeUser->name] : null,
            'total_approvals' => \App\Models\SubmissionApproval::count(),
        ];
        
        if ($financeUser) {
            $approvals = \App\Models\SubmissionApproval::where('approver_id', $financeUser->id)->get();
            $output['finance_approvals_count'] = $approvals->count();
            $output['first_approval'] = $approvals->first() ? [
                'step_order' => $approvals->first()->step_order,
                'status' => $approvals->first()->status,
                'submission_current_step' => $approvals->first()->submission->current_approval_step,
            ] : null;
        }
        
        return response()->json($output);
    });
});
