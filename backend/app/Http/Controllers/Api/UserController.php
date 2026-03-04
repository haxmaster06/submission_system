<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class UserController extends Controller
{
    use AuthorizesRequests;
    public function index()
    {
        if (!auth()->user()->hasRole('Super Admin') && !auth()->user()->can('manage users')) {
            abort(403, 'Unauthorized');
        }
        return response()->json(User::with(['division', 'roles'])->get());
    }

    public function selectable()
    {
        return response()->json(User::select('id', 'name', 'division_id')->with('division:id,name')->get());
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasRole('Super Admin') && !auth()->user()->can('manage users')) {
            abort(403, 'Unauthorized');
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', Password::defaults()],
            'division_id' => 'nullable|exists:divisions,id',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'division_id' => $validated['division_id'],
        ]);

        $user->assignRole($validated['roles']);

        return response()->json($user->load(['division', 'roles']), 201);
    }

    public function show(User $user)
    {
        if (!auth()->user()->hasRole('Super Admin') && !auth()->user()->can('manage users')) {
            abort(403, 'Unauthorized');
        }
        return response()->json($user->load(['division', 'roles']));
    }

    public function update(Request $request, User $user)
    {
        if (!auth()->user()->hasRole('Super Admin') && !auth()->user()->can('manage users')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', Password::defaults()],
            'division_id' => 'nullable|exists:divisions,id',
            'roles' => 'required|array',
            'roles.*' => 'exists:roles,name',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'division_id' => $validated['division_id'],
        ]);

        if ($validated['password']) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        $user->syncRoles($validated['roles']);

        return response()->json($user->load(['division', 'roles']));
    }

    public function destroy(User $user)
    {
        if (!auth()->user()->hasRole('Super Admin') && !auth()->user()->can('manage users')) {
            abort(403, 'Unauthorized');
        }
        
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully.']);
    }
}
