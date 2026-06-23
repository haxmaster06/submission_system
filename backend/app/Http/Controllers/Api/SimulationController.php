<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;

class SimulationController extends Controller
{
    /**
     * Get available roles and divisions for simulation dropdown.
     */
    public function availableRoles()
    {
        $user = auth()->user();
        if (!$user->hasRole('Super Admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $roles = Role::where('name', '!=', 'Super Admin')
            ->select('id', 'name', 'data_scope')
            ->orderBy('id')
            ->get();

        $divisions = \App\Models\Division::select('id', 'name', 'code')->orderBy('name')->get();

        return response()->json([
            'roles' => $roles,
            'divisions' => $divisions,
        ]);
    }

    /**
     * Activate role simulation for the current Super Admin.
     */
    public function activate(Request $request)
    {
        $user = auth()->user();
        if (!$user->hasRole('Super Admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'role_name' => 'required|string|exists:roles,name',
            'division_id' => 'nullable|integer|exists:divisions,id',
        ]);

        if ($validated['role_name'] === 'Super Admin') {
            return response()->json(['message' => 'Tidak dapat mensimulasikan role Super Admin.'], 422);
        }

        $role = Role::where('name', $validated['role_name'])->firstOrFail();
        $division = null;
        if (!empty($validated['division_id'])) {
            $division = \App\Models\Division::find($validated['division_id']);
        }

        // Store simulation in Redis cache (1 hour TTL)
        $simulationData = [
            'role_name' => $role->name,
            'role_id' => $role->id,
            'division_id' => $division?->id,
            'division_name' => $division?->name,
            'activated_at' => now()->toISOString(),
        ];

        Cache::put("simulation:user:{$user->id}", $simulationData, now()->addHours(1));

        // Return updated user data reflecting the simulation
        return response()->json([
            'message' => "Mode simulasi aktif sebagai {$role->name}" . ($division ? " ({$division->name})" : ''),
            'simulation' => $simulationData,
            'user' => $this->getSimulatedUserData($user, $role, $division),
        ]);
    }

    /**
     * Deactivate role simulation.
     */
    public function deactivate()
    {
        $user = auth()->user();
        if (!$user->hasRole('Super Admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        Cache::forget("simulation:user:{$user->id}");

        // Return original Super Admin data
        $user->load(['division', 'roles']);
        $user->setRelation('permissions', $user->getAllPermissions());

        return response()->json([
            'message' => 'Mode simulasi dinonaktifkan. Kembali ke Super Admin.',
            'user' => $user->toArray(),
        ]);
    }

    /**
     * Build simulated user data with the target role's permissions.
     */
    private function getSimulatedUserData(User $user, Role $role, $division = null)
    {
        $permissions = $role->permissions->pluck('name')->map(fn($name) => ['name' => $name])->values();

        $userData = $user->toArray();
        $userData['roles'] = [['name' => $role->name]];
        $userData['permissions'] = $permissions;
        $userData['is_simulating'] = true;
        $userData['simulated_role'] = $role->name;

        if ($division) {
            $userData['division_id'] = $division->id;
            $userData['division'] = [
                'id' => $division->id,
                'name' => $division->name,
                'code' => $division->code ?? null,
            ];
            $userData['simulated_division'] = $userData['division'];
        }

        return $userData;
    }
}
