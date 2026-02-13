<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\JenisPerjalanan;

class JenisPerjalananSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Dinas'],
            ['name' => 'Non Dinas'],
        ];

        foreach ($types as $type) {
            JenisPerjalanan::updateOrCreate(['name' => $type['name']], $type);
        }
    }
}
