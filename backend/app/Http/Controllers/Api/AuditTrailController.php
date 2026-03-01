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
        $modelMap = [
            'submissions' => 'Submission',
            'users' => 'User',
            'divisions' => 'Division',
        ];

        $modelName = $modelMap[$model] ?? $model;

        $logs = AuditTrail::where('model', $modelName)
            ->where('model_id', $id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($logs);
    }

    /**
     * Browse all audit logs (Super Admin only)
     */
    public function all(Request $request)
    {
        $query = AuditTrail::with('user');

        // Filter by action
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        // Filter by model
        if ($request->filled('model')) {
            $query->where('model', $request->model);
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search by user name or model_id
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('model_id', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                    $uq->where('name', 'like', "%{$search}%");
                }
                );
            });
        }

        // Get distinct values for filter dropdowns
        $actions = AuditTrail::select('action')->distinct()->orderBy('action')->pluck('action');
        $models = AuditTrail::select('model')->distinct()->orderBy('model')->pluck('model');

        $logs = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json([
            'logs' => $logs,
            'filters' => [
                'actions' => $actions,
                'models' => $models,
            ]
        ]);
    }
}