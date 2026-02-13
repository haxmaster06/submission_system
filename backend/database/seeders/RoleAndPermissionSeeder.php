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
            'manage realizations',
            'complete submissions',
            'delete submissions',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // Create roles and assign permissions
        Role::findOrCreate('Staff', 'web')->givePermissionTo(['create submissions', 'view submissions', 'manage signatures']);
        Role::findOrCreate('HRD', 'web')->givePermissionTo(['create submissions', 'view submissions', 'approve submissions', 'reject submissions', 'manage signatures']);
        Role::findOrCreate('GA Legal', 'web')->givePermissionTo(['view submissions', 'approve submissions', 'reject submissions']);
        Role::findOrCreate('Finance', 'web')->givePermissionTo(['view submissions', 'approve submissions', 'reject submissions', 'proxy director signature', 'view reports']);
        Role::findOrCreate('GM', 'web')->givePermissionTo(['view submissions', 'approve submissions', 'reject submissions']);
        Role::findOrCreate('Director', 'web')->givePermissionTo(['view submissions', 'approve submissions', 'reject submissions', 'view reports']);

        // Super Admin - Has all permissions
        Role::findOrCreate('Super Admin', 'web')->givePermissionTo(Permission::all());
    }
}
