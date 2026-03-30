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
use App\Http\Controllers\Api\AttachmentRequestController;
use App\Http\Controllers\Api\ChunkedUploadController;
use App\Http\Controllers\Api\MasterDataController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class , 'login']);

Route::middleware('auth:sanctum')->get('/audit-logs/{model}/{id}', [\App\Http\Controllers\Api\AuditTrailController::class , 'index']);

Route::middleware('auth:sanctum')->get('/approvals/director-signature-status', [ApprovalController::class , 'checkDirectorSignature']);

Route::get('/preview/submissions/{submission}/document.pdf', [SubmissionController::class , 'previewPdf'])
    ->name('api.submissions.preview')
    ->middleware('signed');

Route::get('/preview/submissions/{submission}/print', [SubmissionController::class , 'printHtml'])
    ->name('api.submissions.print')
    ->middleware('signed');

Route::get('/preview/reports/submissions/print', [\App\Http\Controllers\Api\ReportingController::class , 'printHtml'])
    ->name('api.reports.print')
    ->middleware('signed');

// Lookups (Public for frontend caching/SSR)
Route::get('/lookups', [LookupController::class , 'all']);
Route::get('/lookups/divisions', [LookupController::class , 'divisions']);
Route::get('/lookups/jenis-pengajuan', [LookupController::class , 'jenisPengajuan']);
Route::get('/lookups/jenis-perjalanan', [LookupController::class , 'jenisPerjalanan']);
Route::get('/lookups/uoms', [LookupController::class , 'uoms']);
// Maintenance Status (public — frontend checks this)
Route::get('/maintenance-status', function () {
    return response()->json([
    'maintenance' => \App\Models\Setting::isMaintenanceMode(),
    ]);
});

Route::middleware(['auth:sanctum', 'maintenance'])->group(function () {
    Route::get('/me', [AuthController::class , 'me']);
    Route::put('/me/password', [AuthController::class , 'updatePassword']);
    Route::post('/logout', [AuthController::class , 'logout']);

    // Firebase Cloud Messaging Token Management
    Route::post('/fcm/register', [\App\Http\Controllers\Api\FcmTokenController::class , 'register']);
    Route::post('/fcm/unregister', [\App\Http\Controllers\Api\FcmTokenController::class , 'unregister']);
    Route::post('/fcm/check', [\App\Http\Controllers\Api\FcmTokenController::class , 'check']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class , 'stats']);

    // Mobile Apps
    Route::get('/mobile-apps/download/{id}', [\App\Http\Controllers\Api\MobileAppReleaseController::class, 'download']);
    Route::get('/mobile-apps', [\App\Http\Controllers\Api\MobileAppReleaseController::class, 'index']);
    
    // Quick-Add UoM (accessible by all authenticated users)
    Route::post('/uoms/quick-add', [MasterDataController::class, 'quickAddUom']);

    // Submissions
    Route::apiResource('submissions', SubmissionController::class);
    Route::post('/submissions/bulk-delete', [SubmissionController::class , 'bulkDelete']);
    Route::post('/submissions/{submission}/publish', [SubmissionController::class , 'publish']);
    Route::post('/submissions/{submission}/attachments', [SubmissionController::class , 'uploadAttachment']);
    Route::get('/submissions/{submission}/export', [SubmissionController::class , 'downloadPdf']);
    Route::get('/submissions/{submission}/preview-url', [SubmissionController::class , 'getPreviewUrl']);
    Route::get('/submissions/{submission}/print-url', [SubmissionController::class , 'getPrintUrl']);
    Route::post('/submissions/{submission}/complete', [SubmissionController::class , 'complete']);

    // Realizations
    Route::get('/submissions/{submission}/realizations', [RealizationController::class , 'index']);
    Route::apiResource('realizations', RealizationController::class)->except(['index']);

    // Approvals
    Route::get('approvals/history', [ApprovalController::class , 'history']);
    Route::get('/approvals/pending', [ApprovalController::class , 'pending']);
    Route::post('/approvals/{approval}/approve', [ApprovalController::class , 'approve']);
    Route::post('/approvals/{approval}/reject', [ApprovalController::class , 'reject']);
    Route::post('/approvals/{approval}/hold', [ApprovalController::class , 'hold']);

    // Attachment Requests
    Route::get('/attachment-requests/my', [AttachmentRequestController::class, 'myRequests']);
    Route::post('/attachment-requests', [AttachmentRequestController::class, 'store']);
    Route::post('/attachment-requests/{attachmentRequest}/fulfill', [AttachmentRequestController::class, 'fulfill']);

    // Signatures
    Route::get('/signatures', [SignatureController::class , 'show']);
    Route::post('/signatures', [SignatureController::class , 'store']);
    Route::delete('/signatures', [SignatureController::class , 'destroy']);
    // Users
    Route::get('/users/selectable', [UserController::class, 'selectable']);
    Route::apiResource('users', UserController::class);
    // Roles & Permissions
    Route::get('/roles-permissions', [\App\Http\Controllers\Api\RolePermissionController::class , 'index']);
    Route::get('/roles/{id}', [\App\Http\Controllers\Api\RolePermissionController::class , 'show']);
    Route::put('/roles/{id}/permissions', [\App\Http\Controllers\Api\RolePermissionController::class , 'update']);

    // Notifications
    Route::get('/notifications', [\App\Http\Controllers\Api\NotificationController::class , 'index']);
    Route::put('/notifications/{id}/read', [\App\Http\Controllers\Api\NotificationController::class , 'markAsRead']);
    Route::put('/notifications/read-all', [\App\Http\Controllers\Api\NotificationController::class , 'markAllRead']);
    Route::delete('/notifications/batch', [\App\Http\Controllers\Api\NotificationController::class , 'batchDelete']);
    Route::delete('/notifications/{id}', [\App\Http\Controllers\Api\NotificationController::class , 'destroy']);

    // Approval Flow Management (Finance & Master Data Managers)
    Route::middleware('permission:approve submissions|manage master data|manage approval flows')->group(function () {
            Route::get('/approval-flows', [\App\Http\Controllers\Api\ApprovalFlowController::class , 'index']);
        }
        );

        Route::middleware('permission:manage master data|manage approval flows')->group(function () {
            // Steps
            Route::post('/approval-flows/{flow}/steps', [\App\Http\Controllers\Api\ApprovalFlowController::class , 'storeStep']);
            Route::put('/approval-flows/{flow}/steps/{step}', [\App\Http\Controllers\Api\ApprovalFlowController::class , 'updateStep']);
            Route::delete('/approval-flows/{flow}/steps/{step}', [\App\Http\Controllers\Api\ApprovalFlowController::class , 'destroyStep']);
            Route::post('/approval-flows/{flow}/steps/reorder', [\App\Http\Controllers\Api\ApprovalFlowController::class , 'reorderSteps']);
            // Conditions
            Route::post('/approval-flows/{flow}/conditions', [\App\Http\Controllers\Api\ApprovalFlowController::class , 'storeCondition']);
            Route::put('/approval-flows/{flow}/conditions/{condition}', [\App\Http\Controllers\Api\ApprovalFlowController::class , 'updateCondition']);
            Route::delete('/approval-flows/{flow}/conditions/{condition}', [\App\Http\Controllers\Api\ApprovalFlowController::class , 'destroyCondition']);
            Route::patch('/approval-flows/{flow}/conditions/{condition}/toggle', [\App\Http\Controllers\Api\ApprovalFlowController::class , 'toggleCondition']);
        }
        );

        // Master Data (Read Access for All Authenticated Users)
        Route::get('/master/divisions', [\App\Http\Controllers\Api\MasterDataController::class , 'indexDivisions']);
        Route::get('/master/types', [\App\Http\Controllers\Api\MasterDataController::class , 'indexTypes']);
        Route::get('/master/uoms', [\App\Http\Controllers\Api\MasterDataController::class , 'indexUoms']);
        Route::get('/master/travel-types', [\App\Http\Controllers\Api\MasterDataController::class , 'indexTravelTypes']);
        Route::get('/master/urgency', [\App\Http\Controllers\Api\MasterDataController::class , 'indexUrgency']);

        // Master Data Management (Write Access Restricted)
        Route::middleware('can:manage master data')->group(function () {
            // Divisions
            Route::post('/master/divisions', [\App\Http\Controllers\Api\MasterDataController::class , 'storeDivision']);
            Route::put('/master/divisions/{division}', [\App\Http\Controllers\Api\MasterDataController::class , 'updateDivision']);
            Route::delete('/master/divisions/{division}', [\App\Http\Controllers\Api\MasterDataController::class , 'destroyDivision']);

            // Jenis Pengajuan
            Route::post('/master/types', [\App\Http\Controllers\Api\MasterDataController::class , 'storeType']);
            Route::put('/master/types/{jenisPengajuan}', [\App\Http\Controllers\Api\MasterDataController::class , 'updateType']);
            Route::delete('/master/types/{jenisPengajuan}', [\App\Http\Controllers\Api\MasterDataController::class , 'destroyType']);

            // UOMs
            Route::post('/master/uoms', [\App\Http\Controllers\Api\MasterDataController::class , 'storeUom']);
            Route::put('/master/uoms/{uom}', [\App\Http\Controllers\Api\MasterDataController::class , 'updateUom']);
            Route::delete('/master/uoms/{uom}', [\App\Http\Controllers\Api\MasterDataController::class , 'destroyUom']);

            // Jenis Perjalanan
            Route::post('/master/travel-types', [\App\Http\Controllers\Api\MasterDataController::class , 'storeTravelType']);
            Route::put('/master/travel-types/{jenisPerjalanan}', [\App\Http\Controllers\Api\MasterDataController::class , 'updateTravelType']);
            Route::delete('/master/travel-types/{jenisPerjalanan}', [\App\Http\Controllers\Api\MasterDataController::class , 'destroyTravelType']);

            // Urgency Statuses
            Route::post('/master/urgency', [\App\Http\Controllers\Api\MasterDataController::class , 'storeUrgency']);
            Route::put('/master/urgency/{urgencyStatus}', [\App\Http\Controllers\Api\MasterDataController::class , 'updateUrgency']);
            Route::delete('/master/urgency/{urgencyStatus}', [\App\Http\Controllers\Api\MasterDataController::class , 'destroyUrgency']);
            Route::post('/master/urgency/reorder', [\App\Http\Controllers\Api\MasterDataController::class , 'reorderUrgency']);
        }
        );

        // Employees (Requires specific permission)
        Route::middleware('can:manage employees')->group(function () {
            Route::apiResource('/master/employees', \App\Http\Controllers\Api\EmployeeController::class);
        }
        );

        // Reporting (Finance & Master Data Managers)
        Route::middleware('permission:view reports|manage master data')->group(function () {
            Route::get('/reports/submissions', [\App\Http\Controllers\Api\ReportingController::class , 'index']);
            Route::get('/reports/submissions/export', [\App\Http\Controllers\Api\ReportingController::class , 'exportPdf']);
            Route::get('/reports/submissions/print-url', [\App\Http\Controllers\Api\ReportingController::class , 'getPrintUrl']);
        }
        );

        // Admin Dashboard Stats (Accessible by Finance/Reporting users and Super Admin)
        Route::middleware('permission:view reports|role:Super Admin')->get('/admin/dashboard-stats', [DashboardController::class , 'adminStats']);

        // Super Admin Only
        Route::middleware('role:Super Admin')->group(function () {
            
            // Manage Mobile Apps
            Route::post('/mobile-apps', [\App\Http\Controllers\Api\MobileAppReleaseController::class, 'store']);
            Route::post('/mobile-apps/chunked', [\App\Http\Controllers\Api\MobileAppReleaseController::class, 'storeFromChunked']);
            Route::put('/mobile-apps/{id}', [\App\Http\Controllers\Api\MobileAppReleaseController::class, 'update']);
            Route::delete('/mobile-apps/{id}', [\App\Http\Controllers\Api\MobileAppReleaseController::class, 'destroy']);
            
            // Chunked Upload Utility
            Route::post('/chunked-upload/init', [ChunkedUploadController::class, 'init']);
            Route::post('/chunked-upload/{uploadId}/chunk', [ChunkedUploadController::class, 'uploadChunk']);
            Route::post('/chunked-upload/{uploadId}/complete', [ChunkedUploadController::class, 'complete']);
            
            Route::get('/admin/audit-logs', [\App\Http\Controllers\Api\AuditTrailController::class , 'all']);
            Route::get('/admin/users-with-signatures', function () {
                    return response()->json(
                    \App\Models\User::whereNotNull('signature_path')
                    ->where('signature_path', '!=', '')
                    ->select('id', 'name', 'signature_path')
                    ->with('roles:id,name')
                    ->get()
                    );
                }
                );
                Route::post('/admin/maintenance', function (\Illuminate\Http\Request $request) {
                    $request->validate(['enabled' => 'required|boolean']);
                    \App\Models\Setting::set('maintenance_mode', $request->enabled ? 'true' : 'false');
                    return response()->json([
                    'maintenance' => \App\Models\Setting::isMaintenanceMode(),
                    'message' => $request->enabled ? 'Mode maintenance diaktifkan.' : 'Mode maintenance dinonaktifkan.'
                    ]);
                }
                );
            }
            );
            // Debug route
            Route::get('/test-approvals', function () {
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
        }
        );
    });