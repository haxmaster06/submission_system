<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\SubmissionApproval;
use App\Models\RealizationHeader;
use App\Models\Division;
use App\Models\JenisPengajuan;
use App\Models\UrgencyStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats()
    {
        $user = Auth::user();
        $isManagement = $user->hasAnyRole(['Super Admin', 'Director', 'Finance', 'GM']);
        $isDivisionHead = $user->hasRole('Manager') || $user->hasPermissionTo('approve submissions') && !$isManagement;

        // Base Query Scoping
        $query = Submission::query();
        if (!$isManagement) {
            if ($isDivisionHead) {
                $query->where('division_id', $user->division_id);
            } else {
                $query->where('user_id', $user->id);
            }
        }

        // 1. Core Counters
        $counters = [
            'total' => (clone $query)->count(),
            'pending' => (clone $query)->where('final_status', 'pending')->count(),
            'approved' => (clone $query)->where('final_status', 'approved')->count(),
            'rejected' => (clone $query)->where('final_status', 'rejected')->count(),
            'outstanding' => (clone $query)
                ->where('final_status', 'approved')
                ->where('is_completed', false)
                ->whereNotExists(function($eq) {
                    $eq->select(DB::raw(1))
                       ->from('realization_headers')
                       ->join('realization_details', 'realization_headers.id', '=', 'realization_details.realization_id')
                       ->whereColumn('realization_headers.submission_id', 'submissions.id')
                       ->groupBy('realization_headers.submission_id')
                       ->havingRaw('SUM(realization_details.total) >= submissions.total');
                })
                ->count(),
        ];

        // 2. Pending Approvals Count (for the current user as an approver)
        $pendingApprovalsCount = SubmissionApproval::where('approver_id', $user->id)
            ->where('status', 'pending')
            ->whereHas('submission', function($q) {
                $q->whereColumn('submissions.current_approval_step', 'submission_approvals.step_order');
            })
            ->count();

        // 3. Category Analysis (Pie Chart)
        $categorySummary = (clone $query)
            ->select('jenis_pengajuan_id', DB::raw('count(*) as count'), DB::raw('sum(total) as total_amount'))
            ->groupBy('jenis_pengajuan_id')
            ->with('jenisPengajuan:id,name')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->jenisPengajuan->name ?? 'Unknown',
                    'count' => $item->count,
                    'amount' => (float)$item->total_amount
                ];
            });

        // 4. Monthly Trends (6 Months)
        $trends = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthName = $month->format('M');
            $monthStart = $month->startOfMonth()->toDateTimeString();
            $monthEnd = $month->endOfMonth()->toDateTimeString();

            $monthlyBudget = (clone $query)
                ->where('final_status', 'approved')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('total');

            // Trend Realization
            $monthlyRealization = DB::table('realization_details')
                ->join('realization_headers', 'realization_details.realization_id', '=', 'realization_headers.id')
                ->join('submissions', 'realization_headers.submission_id', '=', 'submissions.id')
                ->where('submissions.final_status', 'approved')
                ->whereBetween('realization_headers.realization_date', [$month->startOfMonth()->toDateString(), $month->endOfMonth()->toDateString()])
                ->when(!$isManagement, function($q) use ($user, $isDivisionHead) {
                    if ($isDivisionHead) {
                        return $q->where('submissions.division_id', $user->division_id);
                    }
                    return $q->where('submissions.user_id', $user->id);
                })
                ->sum('realization_details.total');

            $trends[] = [
                'month' => $monthName,
                'budget' => (float)$monthlyBudget,
                'realization' => (float)$monthlyRealization
            ];
        }

        // 5. Division Ranking (Management Only)
        $divisionRanking = [];
        if ($isManagement) {
            $divisionRanking = Division::withSum(['submissions' => function($q) {
                $q->where('final_status', 'approved');
            }], 'total')
            ->get()
            ->map(function($div) {
                return [
                    'name' => $div->name,
                    'total' => (float)$div->submissions_sum_total ?: 0
                ];
            })
            ->sortByDesc('total')
            ->values()
            ->take(5);
        }

        // 6. Urgency Breakdown - Only for "Active" and "Not Completed" submissions
        $urgencyBreakdown = (clone $query)
            ->where('is_completed', false)
            ->where(function($q) {
                $q->where('final_status', 'pending')
                  ->orWhere(function($sq) {
                      $sq->where('final_status', 'approved')
                         ->whereNotExists(function($eq) {
                             $eq->select(DB::raw(1))
                                ->from('realization_headers')
                                ->join('realization_details', 'realization_headers.id', '=', 'realization_details.realization_id')
                                ->whereColumn('realization_headers.submission_id', 'submissions.id')
                                ->groupBy('realization_headers.submission_id')
                                ->havingRaw('SUM(realization_details.total) >= submissions.total');
                         });
                  });
            })
            ->select('status_urgent', DB::raw('count(*) as count'))
            ->groupBy('status_urgent')
            ->get()
            ->pluck('count', 'status_urgent');

        // 7. Aging Analysis (Avg Approval Days)
        $avgAging = Submission::where('final_status', 'approved')
            ->when(!$isManagement, function($q) use ($user, $isDivisionHead) {
                if ($isDivisionHead) return $q->where('division_id', $user->division_id);
                return $q->where('user_id', $user->id);
            })
            ->whereNotNull('updated_at')
            ->select(DB::raw('AVG(DATEDIFF(updated_at, created_at)) as avg_days'))
            ->first()
            ->avg_days ?: 0;

        // 8. Recent Activity
        $recentActivities = DB::table('submission_approvals')
            ->join('submissions', 'submission_approvals.submission_id', '=', 'submissions.id')
            ->join('users', 'submission_approvals.approver_id', '=', 'users.id')
            ->select(
                'submissions.no_pengajuan',
                'users.name as actor_name',
                'submission_approvals.status',
                'submission_approvals.updated_at'
            )
            ->where('submission_approvals.status', '!=', 'pending')
            ->when(!$isManagement, function($q) use ($user, $isDivisionHead) {
                if ($isDivisionHead) return $q->where('submissions.division_id', $user->division_id);
                return $q->where('submissions.user_id', $user->id);
            })
            ->latest('submission_approvals.updated_at')
            ->limit(5)
            ->get();

        return response()->json([
            'role_scope' => $isManagement ? 'management' : ($isDivisionHead ? 'division' : 'staff'),
            'counters' => $counters,
            'approvals_count' => $pendingApprovalsCount,
            'categories' => $categorySummary,
            'trends' => $trends,
            'division_ranking' => $divisionRanking,
            'urgency' => $urgencyBreakdown,
            'aging' => round($avgAging, 1),
            'activities' => $recentActivities,
            'user_division' => $user->division->name ?? null
        ]);
    }
}
