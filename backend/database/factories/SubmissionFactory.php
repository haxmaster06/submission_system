<?php

namespace Database\Factories;

use App\Models\Submission;
use App\Models\User;
use App\Models\Division;
use App\Models\JenisPengajuan;
use App\Models\Uom;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Submission>
 */
class SubmissionFactory extends Factory
{
    protected $model = Submission::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'no_pengajuan' => 'AJU-' . $this->faker->unique()->numberBetween(1000, 9999),
            'user_id' => User::factory(),
            'division_id' => Division::factory(),
            'jenis_pengajuan_id' => JenisPengajuan::factory(),
            'status_urgent' => 'normal',
            'description' => $this->faker->sentence(),
            'qty' => 1,
            'uom_id' => Uom::factory(),
            'nominal' => 1000,
            'total' => 1000,
            'tanggal_pengajuan' => now(),
            'final_status' => 'pending',
        ];
    }
}
