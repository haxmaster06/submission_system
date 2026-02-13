<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            DivisionSeeder::class,
            UomSeeder::class,
            JenisPengajuanSeeder::class,
            JenisPerjalananSeeder::class,
            ApprovalFlowSeeder::class, // Database-driven approval flows
            UserSeeder::class,
            SubmissionSeeder::class, // Sample submissions with items
        ]);
    }
}
