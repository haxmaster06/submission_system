<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Uom;

class UomSeeder extends Seeder
{
    public function run(): void
    {
        $uoms = [
            ['name' => 'Pieces', 'code' => 'pcs'],
            ['name' => 'Pack', 'code' => 'pack'],
            ['name' => 'Participants', 'code' => 'person'],
            ['name' => 'Days', 'code' => 'day'],
            ['name' => 'Units', 'code' => 'unit'],
            ['name' => 'Kilogram', 'code' => 'kg'],
        ];

        foreach ($uoms as $uom) {
            Uom::updateOrCreate(['code' => $uom['code']], $uom);
        }
    }
}
