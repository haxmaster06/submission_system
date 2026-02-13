<?php

namespace App\Services;

use App\Models\AuditTrail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditTrailService
{
    public static function log($action, $model, $modelId, $oldData = null, $newData = null)
    {
        try {
            AuditTrail::create([
                'user_id' => Auth::id() ?? null, // Handle seeding/system actions
                'action' => $action,
                'model' => $model,
                'model_id' => $modelId,
                'old_data' => $oldData,
                'new_data' => $newData,
                'ip_address' => Request::ip(),
            ]);
        } catch (\Exception $e) {
            // Prevent audit logging failures from stopping the main action
            \Illuminate\Support\Facades\Log::error('Audit Trail Error: ' . $e->getMessage());
        }
    }
}
