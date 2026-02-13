<?php

namespace Database\Seeders;

use App\Models\UrgencyStatus;
use Illuminate\Database\Seeder;

class SubmissionUrgencySeeder extends Seeder
{
    public function run(): void
    {
        UrgencyStatus::firstOrCreate(['code' => 'normal'], [
            'name' => 'Normal',
            'level' => 1,
            'color' => '#0ea5e9', // sky-500
        ]);

        UrgencyStatus::firstOrCreate(['code' => 'urgent'], [
            'name' => 'Urgent',
            'level' => 2,
            'color' => '#ef4444', // red-500
        ]);
    }
}
