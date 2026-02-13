<?php

namespace Database\Factories;

use App\Models\JenisPengajuan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\JenisPengajuan>
 */
class JenisPengajuanFactory extends Factory
{
    protected $model = JenisPengajuan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement(['ATK', 'Perjalanan', 'Lembur', 'Lain-lain']),
            'form_schema_json' => null,
        ];
    }
}
