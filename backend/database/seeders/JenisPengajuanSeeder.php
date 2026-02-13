<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\JenisPengajuan;

class JenisPengajuanSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Anggaran Operasional'],
            ['name' => 'Pelatihan'],
            ['name' => 'Perjalanan'],
            ['name' => 'Lain-lain'],
        ];

        foreach ($types as $type) {
            JenisPengajuan::updateOrCreate(['name' => $type['name']], $type);
        }
    }
}
