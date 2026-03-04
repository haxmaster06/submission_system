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

    public function store(Request $request)
    {
        if (!auth()->user()->hasRole('Super Admin')) {
            abort(403, 'Unauthorized. Only Super Admin can create roles.');
        }

        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name|max:255',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create(['name' => $validated['name'], 'guard_name' => 'web']);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        AuditTrailService::log(
            'create_role',
            get_class($role),
            $role->id,
            null,
            ['name' => $role->name, 'permissions' => $validated['permissions'] ?? []]
        );

        return response()->json([
            'message' => 'Role created successfully.',
            'role' => $role->load('permissions')
        ], 201);
    }

    public function destroy($id)
    {
        if (!auth()->user()->hasRole('Super Admin')) {
            abort(403, 'Unauthorized. Only Super Admin can delete roles.');
        }

        $role = Role::findOrFail($id);

        // Protected roles
        $protectedRoles = ['Super Admin', 'Staff', 'HRD', 'GA Legal', 'Finance', 'GM', 'Director'];
        if (in_array($role->name, $protectedRoles)) {
            return response()->json(['message' => "Cannot delete protected role: {$role->name}."], 403);
        }

        // Check if role is in use
        if ($role->users()->count() > 0) {
            return response()->json(['message' => 'Cannot delete role that is assigned to users.'], 422);
        }

        $oldData = [
            'name' => $role->name,
            'permissions' => $role->permissions->pluck('name')->toArray()
        ];

        AuditTrailService::log(
            'delete_role',
            get_class($role),
            $role->id,
            $oldData,
            null
        );

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully.']);
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

        // Clear lookup cache
        \App\Models\Division::clearLookupCache();

        return response()->json([
            'message' => 'Permissions updated successfully.',
            'role' => $role->load('permissions')
        ]);
    }
}