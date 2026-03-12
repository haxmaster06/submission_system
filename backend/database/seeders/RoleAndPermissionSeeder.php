<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'create submissions',
            'view submissions',
            'approve submissions',
            'reject submissions',
            'manage signatures',
            'manage users',
            'view reports',
            'proxy director signature',
            'manage master data',
            'manage employees',
            'manage realizations',
            'complete submissions',
            'delete submissions',
            'request attachments',
            'manage mobile apps',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // Create roles and assign permissions
        $staff = \App\Models\Role::findOrCreate('Staff', 'web');
        $staff->update(['data_scope' => 'personal']);
        $staff->syncPermissions(['create submissions', 'view submissions', 'manage signatures', 'request attachments']);

        $hrd = \App\Models\Role::findOrCreate('HRD', 'web');
        $hrd->update(['data_scope' => 'division']);
        $hrd->syncPermissions(['create submissions', 'view submissions', 'approve submissions', 'reject submissions', 'manage signatures', 'manage employees']);

        $ga = \App\Models\Role::findOrCreate('GA Legal', 'web');
        $ga->update(['data_scope' => 'division']);
        $ga->syncPermissions(['view submissions', 'approve submissions', 'reject submissions', 'manage employees']);

        $finance = \App\Models\Role::findOrCreate('Finance', 'web');
        $finance->update(['data_scope' => 'corporate']);
        $finance->syncPermissions(['view submissions', 'approve submissions', 'reject submissions', 'proxy director signature', 'view reports', 'request attachments']);

        $gm = \App\Models\Role::findOrCreate('GM', 'web');
        $gm->update(['data_scope' => 'corporate']);
        $gm->syncPermissions(['view submissions', 'approve submissions', 'reject submissions']);

        $director = \App\Models\Role::findOrCreate('Director', 'web');
        $director->update(['data_scope' => 'corporate']);
        $director->syncPermissions(['view submissions', 'approve submissions', 'reject submissions', 'view reports']);

        // Super Admin - Has all permissions
        $superAdmin = \App\Models\Role::findOrCreate('Super Admin', 'web');
        $superAdmin->update(['data_scope' => 'corporate']);
        $superAdmin->syncPermissions(Permission::all());
    }
}