<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Division;

class DivisionSeeder extends Seeder
{
    public function run(): void
    {
        $divisions = [
            ['name' => 'Human Resources Department', 'code' => 'HRD'],
            ['name' => 'General Affairs & Legal', 'code' => 'GAL'],
            ['name' => 'Finance & Accounting', 'code' => 'FIN'],
            ['name' => 'General Manager', 'code' => 'GM'],
            ['name' => 'Director', 'code' => 'DIR'],
            ['name' => 'Operational', 'code' => 'OPS'],
        ];

        foreach ($divisions as $division) {
            Division::updateOrCreate(['code' => $division['code']], $division);
        }
    }
}
