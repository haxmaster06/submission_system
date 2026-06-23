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
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats()
    {
        $user = Auth::user();

        // Check for active simulation
        $simulation = Cache::get("simulation:user:{$user->id}");
        $simRole = $simulation ? $simulation['role_name'] : null;

        if ($simRole) {
            $isManagement = in_array($simRole, ['Super Admin', 'Director', 'Finance', 'GM']);
            $isDivisionHead = in_array($simRole, ['Manager', 'HRD', 'GA Legal']);
            $cacheKey = "dashboard_stats_v3_{$user->id}_sim_{$simRole}";
        } else {
            $isManagement = $user->hasAnyRole(['Super Admin', 'Director', 'Finance', 'GM']) || $user->hasPermissionTo('view reports');
            $isDivisionHead = $user->hasAnyRole(['Manager', 'HRD', 'GA Legal']) || ($user->hasPermissionTo('approve submissions') && !$isManagement);
            $cacheKey = "dashboard_stats_v3_{$user->id}";
        }

        $data = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($user, $isManagement, $isDivisionHead) {
            return $this->buildStats($user, $isManagement, $isDivisionHead);
        });

        return response()->json($data);
    }

    private function buildStats($user, bool $isManagement, bool $isDivisionHead): array
    {
        // Check if this user is Director or GM (real or simulated)
        $isDirectorOrGM = false;
        if ($isManagement) {
            $simulation = Cache::get("simulation:user:{$user->id}");
            if ($simulation) {
                $isDirectorOrGM = in_array($simulation['role_name'], ['Director', 'GM']);
            } else {
                $isDirectorOrGM = $user->hasAnyRole(['Director', 'GM']);
            }
        }

        // Base Query Scoping using centralized scope
        $query = Submission::accessibleBy($user);

        // 1. Core Counters — Single query with conditional aggregation (was 4 separate queries)
        $counterRow = (clone $query)->select([
            DB::raw('COUNT(*) as total'),
            DB::raw("SUM(CASE WHEN final_status = 'pending' THEN 1 ELSE 0 END) as pending"),
            DB::raw("SUM(CASE WHEN final_status = 'approved' THEN 1 ELSE 0 END) as approved"),
            DB::raw("SUM(CASE WHEN final_status = 'rejected' THEN 1 ELSE 0 END) as rejected"),
        ])->first();

        $outstanding = (clone $query)
            ->where('is_completed', false)
            ->where('final_status', 'pending')
            ->count();

        $counters = [
            'total' => (int)($counterRow->total ?? 0),
            'pending' => (int)($counterRow->pending ?? 0),
            'approved' => (int)($counterRow->approved ?? 0),
            'rejected' => (int)($counterRow->rejected ?? 0),
            'outstanding' => $outstanding,
        ];

        // 2. Pending Approvals Count
        $pendingApprovalsCount = SubmissionApproval::where('approver_id', $user->id)
            ->where('status', 'pending')
            ->whereHas('submission', function ($q) {
            $q->whereColumn('submissions.current_approval_step', 'submission_approvals.step_order');
        })
            ->count();

        // 3. Pending Attachment Requests Count
        $pendingAttachmentRequestsCount = DB::table('attachment_requests')
            ->where('target_user_id', $user->id)
            ->where('status', 'pending')
            ->count();

        // 4. Category Analysis (Pie Chart)
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

        // 4. Monthly Trends (6 Months) — Single query with GROUP BY instead of 6 separate queries
        $sixMonthsAgo = Carbon::now()->subMonths(5)->startOfMonth();

        $budgetTrends = (clone $query)
            ->where('final_status', 'approved')
            ->where('created_at', '>=', $sixMonthsAgo)
            ->select(
            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month_key"),
            DB::raw("DATE_FORMAT(created_at, '%b') as month_name"),
            DB::raw('SUM(total) as budget')
        )
            ->groupBy('month_key', 'month_name')
            ->orderBy('month_key')
            ->pluck('budget', 'month_key');

        $realizationTrends = DB::table('realization_details')
            ->join('realization_headers', 'realization_details.realization_id', '=', 'realization_headers.id')
            ->join('submissions', 'realization_headers.submission_id', '=', 'submissions.id')
            ->where('submissions.final_status', 'approved')
            ->where('realization_headers.realization_date', '>=', $sixMonthsAgo->toDateString())
            ->when(!$isManagement, function ($q) use ($user, $isDivisionHead) {
                return $isDivisionHead 
                    ? $q->where('submissions.division_id', $user->division_id) 
                    : $q->where('submissions.user_id', $user->id);
            })
            ->select(
            DB::raw("DATE_FORMAT(realization_headers.realization_date, '%Y-%m') as month_key"),
            DB::raw('SUM(realization_details.total) as realization')
        )
            ->groupBy('month_key')
            ->orderBy('month_key')
            ->pluck('realization', 'month_key');

        // Build trends array for last 6 months
        $trends = [];
        $totalBudgetSum = 0;
        $totalRealizationSum = 0;
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $key = $month->format('Y-m');
            $budgetVal = (float)($budgetTrends[$key] ?? 0);
            $realVal = (float)($realizationTrends[$key] ?? 0);
            
            $trends[] = [
                'month' => $month->format('M'),
                'budget' => $budgetVal,
                'realization' => $realVal,
            ];
            
            $totalBudgetSum += $budgetVal;
            $totalRealizationSum += $realVal;
        }

        // 5. Division Ranking (Management Only)
        $divisionRanking = [];
        if ($isManagement && !$isDirectorOrGM) {
            $divisionRanking = Division::whereNotIn('name', ['Director', 'General Manager'])
                ->withSum(['submissions' => function ($q) {
                    $q->where('final_status', 'approved');
                }], 'total')
                ->get()
                ->map(function ($div) {
                    return [
                        'name' => $div->name,
                        'total' => (float)$div->submissions_sum_total ?: 0
                    ];
                })
                ->sortByDesc('total')
                ->values()
                ->take(5);
        }

        // 6. Urgency Breakdown
        $urgencyBreakdown = (clone $query)
            ->where('is_completed', false)
            ->where(function ($q) {
            $q->where('final_status', 'pending')
                ->orWhere(function ($sq) {
                $sq->where('final_status', 'approved')
                    ->whereNotExists(function ($eq) {
                    $eq->select(DB::raw(1))
                        ->from('realization_headers')
                        ->join('realization_details', 'realization_headers.id', '=', 'realization_details.realization_id')
                        ->whereColumn('realization_headers.submission_id', 'submissions.id')
                        ->groupBy('realization_headers.submission_id')
                        ->havingRaw('SUM(realization_details.total) >= submissions.total');
                }
                );
            }
            );
        })
            ->select('status_urgent', DB::raw('count(*) as count'))
            ->groupBy('status_urgent')
            ->get()
            ->pluck('count', 'status_urgent');

        // 7. Aging Analysis
        $avgAging = Submission::accessibleBy($user)
            ->where('final_status', 'approved')
            ->whereNotNull('updated_at')
            // ...
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
            ->when(!$isManagement, function ($q) use ($user, $isDivisionHead) {
            if ($isDivisionHead)
                return $q->where('submissions.division_id', $user->division_id);
            return $q->where('submissions.user_id', $user->id);
        })
            ->latest('submission_approvals.updated_at')
            ->limit(5)
            ->get();

        // 9. Pending Tasks (Approvals + Attachment Requests)
        $pendingApprovals = SubmissionApproval::where('approver_id', $user->id)
            ->where('status', 'pending')
            ->whereHas('submission', function ($q) {
                $q->whereColumn('submissions.current_approval_step', 'submission_approvals.step_order');
            })
            ->with('submission:id,no_pengajuan,total')
            ->get()
            ->map(fn($ap) => [
                'type' => 'approval',
                'submission_id' => $ap->submission_id,
                'no_pengajuan' => $ap->submission->no_pengajuan,
                'description' => 'Menunggu persetujuan Anda',
                'amount' => (float)$ap->submission->total,
                'date' => $ap->created_at->toISOString(),
            ]);

        $pendingRequests = DB::table('attachment_requests')
            ->join('submissions', 'attachment_requests.submission_id', '=', 'submissions.id')
            ->join('users as requesters', 'attachment_requests.requested_by', '=', 'requesters.id')
            ->where('attachment_requests.target_user_id', $user->id)
            ->where('attachment_requests.status', 'pending')
            ->select(
                'attachment_requests.submission_id',
                'submissions.no_pengajuan',
                'requesters.name as requester_name',
                'attachment_requests.file_description',
                'attachment_requests.created_at'
            )
            ->get()
            ->map(fn($req) => [
                'type' => 'attachment_request',
                'submission_id' => $req->submission_id,
                'no_pengajuan' => $req->no_pengajuan,
                'description' => "Diminta oleh {$req->requester_name}: " . ($req->file_description ?: 'Lampiran tambahan'),
                'date' => Carbon::parse($req->created_at)->toISOString(),
            ]);

        $pendingTasks = $pendingApprovals->concat($pendingRequests)->sortByDesc('date')->values();

        return [
            'role_scope' => $isManagement ? 'management' : ($isDivisionHead ? 'division' : 'staff'),
            'show_division_ranking' => $isManagement && !$isDirectorOrGM,
            'counters' => $counters,
            'approvals_count' => $pendingApprovalsCount,
            'attachment_requests_count' => $pendingAttachmentRequestsCount,
            'categories' => $categorySummary,
            'trends' => $trends,
            'budget' => [
                'total_approved' => (float)$totalBudgetSum,
                'total_realized' => (float)$totalRealizationSum,
                'absorption_rate' => $totalBudgetSum > 0 ? round(($totalRealizationSum / $totalBudgetSum) * 100, 1) : 0,
            ],
            'division_ranking' => $divisionRanking,
            'high_value_pending' => $isManagement ? Submission::accessibleBy($user)
                ->where('final_status', 'pending')
                ->with('division')
                ->orderByDesc('total')
                ->limit(5)
                ->get(['id', 'no_pengajuan', 'description', 'total', 'division_id', 'created_at'])
                ->map(fn($s) => [
                    'id' => $s->id,
                    'no' => $s->no_pengajuan,
                    'title' => $s->description,
                    'nominal' => (float)$s->total,
                    'division' => $s->division?->name,
                    'date' => $s->created_at->format('Y-m-d')
                ]) : [],
            'urgency' => $urgencyBreakdown,
            'aging' => round($avgAging, 1),
            'activities' => $recentActivities,
            'pending_tasks' => $pendingTasks,
            'user_division' => $user->division->name ?? null
        ];
    }

    /**
     * Super Admin Dashboard Stats — system-wide metrics
     */
    public function adminStats()
    {
        $data = Cache::remember('admin_dashboard_stats_v3', now()->addMinutes(3), function () {
            // User Stats
            $totalUsers = \App\Models\User::count();
            $activeUsers = \App\Models\User::where('updated_at', '>=', now()->subDays(7))->count();

            // Submission Stats (all-time)
            $submissionStats = Submission::select([
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN final_status = 'pending' THEN 1 ELSE 0 END) as pending"),
                DB::raw("SUM(CASE WHEN final_status = 'approved' THEN 1 ELSE 0 END) as approved"),
                DB::raw("SUM(CASE WHEN final_status = 'rejected' THEN 1 ELSE 0 END) as rejected"),
                DB::raw("SUM(CASE WHEN final_status = 'approved' THEN total ELSE 0 END) as total_approved_budget"),
            ])->first();

            // Total Realization
            $totalRealization = DB::table('realization_details')
                ->join('realization_headers', 'realization_details.realization_id', '=', 'realization_headers.id')
                ->sum('realization_details.total');

            // Top 5 Submitters
            $topSubmitters = Submission::select('user_id', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as total_amount'))
                ->groupBy('user_id')
                ->with('user:id,name')
                ->orderByDesc('count')
                ->limit(5)
                ->get()
                ->map(fn($s) => [
            'name' => $s->user->name ?? 'Unknown',
            'count' => $s->count,
            'amount' => (float)$s->total_amount
            ]);

            // Division budget ranking
            $divisionRanking = Division::whereNotIn('name', ['Director', 'General Manager'])
                ->withSum(['submissions' => function ($q) {
                    $q->where('final_status', 'approved');
                }], 'total')
                ->get()
                ->map(fn($d) => ['name' => $d->name, 'total' => (float)($d->submissions_sum_total ?: 0)])
                ->sortByDesc('total')
                ->values();

                // Monthly trends (last 6 months)
                $sixMonthsAgo = Carbon::now()->subMonths(5)->startOfMonth();
                $monthlySubmissions = Submission::where('created_at', '>=', $sixMonthsAgo)
                    ->select(
                    DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month_key"),
                    DB::raw('COUNT(*) as count'),
                    DB::raw("SUM(CASE WHEN final_status = 'approved' THEN total ELSE 0 END) as budget")
                )
                    ->groupBy('month_key')
                    ->orderBy('month_key')
                    ->get()
                    ->keyBy('month_key');

                $monthlyRealization = DB::table('realization_details')
                    ->join('realization_headers', 'realization_details.realization_id', '=', 'realization_headers.id')
                    ->where('realization_headers.realization_date', '>=', $sixMonthsAgo->toDateString())
                    ->select(
                    DB::raw("DATE_FORMAT(realization_headers.realization_date, '%Y-%m') as month_key"),
                    DB::raw('SUM(realization_details.total) as realization')
                )
                    ->groupBy('month_key')
                    ->orderBy('month_key')
                    ->pluck('realization', 'month_key');

                $trends = [];
                for ($i = 5; $i >= 0; $i--) {
                    $month = Carbon::now()->subMonths($i);
                    $key = $month->format('Y-m');
                    $trends[] = [
                        'month' => $month->format('M'),
                        'count' => (int)($monthlySubmissions[$key]->count ?? 0),
                        'budget' => (float)($monthlySubmissions[$key]->budget ?? 0),
                        'realization' => (float)($monthlyRealization[$key] ?? 0),
                    ];
                }

                // Recent Audit Logs
                $recentLogs = \App\Models\AuditTrail::with('user:id,name')
                    ->latest()
                    ->limit(8)
                    ->get()
                    ->map(fn($l) => [
                'action' => $l->action,
                'model' => $l->model,
                'model_id' => $l->model_id,
                'user' => $l->user->name ?? 'System',
                'created_at' => $l->created_at->toISOString(),
                ]);

                // Maintenance Status
                $maintenance = \App\Models\Setting::isMaintenanceMode();

                return [
                'role_scope' => 'management',
                'users' => [
                'total' => $totalUsers,
                'active_7d' => $activeUsers,
                ],
                'submissions' => [
                'total' => (int)$submissionStats->total,
                'pending' => (int)$submissionStats->pending,
                'approved' => (int)$submissionStats->approved,
                'rejected' => (int)$submissionStats->rejected,
                ],
                'budget' => [
                'total_approved' => (float)$submissionStats->total_approved_budget,
                'total_realized' => (float)$totalRealization,
                ],
                'top_submitters' => $topSubmitters,
                'categories' => \App\Models\JenisPengajuan::withCount(['submissions' => function($q) {
                    $q->where('final_status', 'approved');
                }])->withSum(['submissions' => function($q) {
                    $q->where('final_status', 'approved');
                }], 'total')->get()->map(fn($j) => [
                    'name' => $j->name, 
                    'count' => (int)$j->submissions_count, // withSum includes withCount if available? No, need to be careful.
                    'amount' => (float)($j->submissions_sum_total ?: 0)
                ]),
                'division_ranking' => $divisionRanking,
                'trends' => $trends,
                'recent_logs' => $recentLogs,
                'maintenance' => $maintenance,
                ];
            });

        return response()->json($data);
    }
}