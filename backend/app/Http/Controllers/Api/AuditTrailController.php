<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditTrail;
use Illuminate\Http\Request;

class AuditTrailController extends Controller
{
    /**
     * Get audit logs for a specific model context
     */
    public function index(Request $request, $model, $id)
    {
        // Convert model string to class name if needed, or just store as string
        // In this system, we store 'Submission' or 'App\Models\Submission'
        
        // Normalize model name (e.g. 'submissions' -> 'Submission')
        $modelMap = [
            'submissions' => 'Submission',
            'users' => 'User',
            'divisions' => 'Division',
        ];

        $modelName = $modelMap[$model] ?? $model;

        $logs = AuditTrail::where('model', $modelName)
            ->where('model_id', $id)
            ->with('user') // Eager load user
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($logs);
    }
}
