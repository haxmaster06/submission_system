<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Division;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $roles = Role::all();
        $divisions = Division::all();

        foreach ($roles as $role) {
            $division = $divisions->where('code', $this->getDivisionCode($role->name))->first();
            
            $user = User::updateOrCreate(
                ['email' => str_replace(' ', '', strtolower($role->name)) . '@hbm.com'],
                [
                    'name' => $role->name . ' Account',
                    'password' => Hash::make('password'),
                    'division_id' => $division ? $division->id : null,
                ]
            );

            $user->assignRole($role);
        }

        // Add a generic Staff account in OPS division
        $ops = $divisions->where('code', 'OPS')->first();
        $staff = User::updateOrCreate(
            ['email' => 'staff@hbm.com'],
            [
                'name' => 'Staff Regular',
                'password' => Hash::make('password'),
                'division_id' => $ops ? $ops->id : null,
            ]
        );
        $staff->assignRole('Staff');
    }

    private function getDivisionCode($roleName)
    {
        return match ($roleName) {
            'HRD' => 'HRD',
            'GA Legal' => 'GAL',
            'Finance' => 'FIN',
            'GM' => 'GM',
            'Director' => 'DIR',
            default => 'OPS',
        };
    }
}
