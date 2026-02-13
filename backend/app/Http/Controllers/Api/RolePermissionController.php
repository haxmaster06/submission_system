<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use App\Models\AuditTrail;
use App\Services\AuditTrailService;

class RolePermissionController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        if (!auth()->user()->hasRole('Super Admin')) {
            abort(403, 'Unauthorized. Only Super Admin can view this.');
        }

        $roles = Role::with('permissions')->get();
        $permissions = Permission::pluck('name');

        return response()->json([
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function show($id)
    {
        if (!auth()->user()->hasRole('Super Admin')) {
            abort(403, 'Unauthorized. Only Super Admin can view this.');
        }

        $role = Role::with('permissions')->findOrFail($id);
        return response()->json($role);
    }

    public function update(Request $request, $id)
    {
        if (!auth()->user()->hasRole('Super Admin')) {
            abort(403, 'Unauthorized. Only Super Admin can modify permissions.');
        }

        $role = Role::findOrFail($id);
        
        // Don't allow modifying Super Admin role
        if ($role->name === 'Super Admin') {
            return response()->json(['message' => 'Cannot modify Super Admin role.'], 403);
        }

        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $oldPermissions = $role->permissions->pluck('name')->toArray();
        
        // Sync permissions
        $role->syncPermissions($validated['permissions']);
        
        $newPermissions = $validated['permissions'];

        // Create audit log
        AuditTrailService::log(
            'update_role_permissions',
            get_class($role),
            $role->id,
            ['permissions' => $oldPermissions],
            ['permissions' => $newPermissions]
        );

        return response()->json([
            'message' => 'Permissions updated successfully.',
            'role' => $role->load('permissions')
        ]);
    }
}
