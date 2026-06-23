<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\SubmissionApproval;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        
        $user->load(['division', 'roles']);
        // Load ALL permissions (inherited from roles + direct)
        $user->setRelation('permissions', $user->getAllPermissions());

        $userData = $user->toArray();
        $userData['is_approver'] = $this->checkIsApprover($user);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $userData,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $user->load(['division', 'roles']);
        // Load ALL permissions (inherited from roles + direct)
        $user->setRelation('permissions', $user->getAllPermissions());
        
        $userData = $user->toArray();
        $userData['is_approver'] = $this->checkIsApprover($user);

        // Check if Super Admin has an active role simulation
        if ($user->hasRole('Super Admin')) {
            $simulation = \Illuminate\Support\Facades\Cache::get("simulation:user:{$user->id}");
            if ($simulation) {
                $role = \Spatie\Permission\Models\Role::where('name', $simulation['role_name'])->first();
                if ($role) {
                    $userData['roles'] = [['name' => $role->name]];
                    $userData['permissions'] = $role->permissions->map(fn($p) => ['name' => $p->name])->values()->toArray();
                    $userData['is_simulating'] = true;
                    $userData['simulated_role'] = $simulation['role_name'];
                    $userData['original_role'] = 'Super Admin';
                    $userData['is_approver'] = true; // Simulation always has approver access for testing

                    if (!empty($simulation['division_id'])) {
                        $division = \App\Models\Division::find($simulation['division_id']);
                        if ($division) {
                            $userData['division_id'] = $division->id;
                            $userData['division'] = ['id' => $division->id, 'name' => $division->name, 'code' => $division->code ?? null];
                            $userData['simulated_division'] = $userData['division'];
                        }
                    }
                }
            }
        }

        return response()->json($userData);
    }

    /**
     * Dynamically check if a user has approval access.
     * Sources: Super Admin role, approval_flow_steps roles, or direct assignment in submission_approvals.
     */
    private function checkIsApprover(User $user): bool
    {
        // Super Admin always has approval access
        if ($user->hasRole('Super Admin')) {
            return true;
        }

        // Check if user's role is in any active approval flow step
        $roleName = $user->roles->first()?->name;
        if ($roleName) {
            $inFlow = DB::table('approval_flow_steps')
                ->join('approval_flows', 'approval_flows.id', '=', 'approval_flow_steps.flow_id')
                ->where('approval_flows.is_active', true)
                ->where('approval_flow_steps.role_name', $roleName)
                ->exists();
            if ($inFlow) return true;
        }

        // Check if user has ever been directly assigned as an approver
        $directlyAssigned = SubmissionApproval::where('approver_id', $user->id)->exists();
        if ($directlyAssigned) return true;

        // Check proxy director signature permission
        if ($user->hasPermissionTo('proxy director signature')) {
            return true;
        }

        return false;
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini salah.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password berhasil diperbarui.']);
    }
}
