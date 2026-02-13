<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ApprovalFlow;
use App\Models\ApprovalFlowStep;
use App\Models\ApprovalCondition;

class ApprovalFlowSeeder extends Seeder
{
    /**
     * Seed the normalized approval flow with conditional rules.
     *
     * Base Flow: Requester → Finance → GM → Direksi (4 steps)
     * Conditional: If division=HRD OR travel_type=Dinas → insert GA Legal after step 1
     * Result: Requester → GA Legal → Finance → GM → Direksi (5 steps)
     */
    public function run(): void
    {
        $this->command->info('Creating normalized approval flow...');

        // Clean existing data
        ApprovalCondition::query()->delete();
        ApprovalFlowStep::query()->delete();
        ApprovalFlow::query()->delete();

        // ── BASE FLOW ──
        $baseFlow = ApprovalFlow::create([
            'name' => 'Standard Approval Flow',
            'is_default' => true,
            'is_active' => true,
        ]);

        $baseFlow->steps()->createMany([
            ['role_name' => 'Requester Division', 'step_order' => 1, 'is_optional' => false],
            ['role_name' => 'Finance',            'step_order' => 2, 'is_optional' => false],
            ['role_name' => 'GM',                 'step_order' => 3, 'is_optional' => false],
            ['role_name' => 'Director',           'step_order' => 4, 'is_optional' => false],
        ]);

        $this->command->line('  ✓ Base Flow: Requester → Finance → GM → Direksi (4 steps)');

        // ── CONDITIONAL RULE: GA Legal ──
        ApprovalCondition::create([
            'flow_id' => $baseFlow->id,
            'name' => 'GA Legal Required',
            'role_name' => 'GA Legal',
            'insert_after_step' => 1, // Insert after "Requester Division"
            'condition_type' => 'any_of', // OR logic
            'condition_rules' => [
                [
                    'field' => 'division_code',
                    'operator' => '==',
                    'value' => 'HRD',
                ],
                [
                    'field' => 'travel_type',
                    'operator' => '==',
                    'value' => 'Dinas',
                ],
            ],
            'is_active' => true,
            'priority' => 1,
        ]);

        $this->command->line('  ✓ Condition: GA Legal if division=HRD OR travel_type=Dinas');

        $this->command->newLine();
        $this->command->info('✓ Approval flow seeded successfully!');
        $this->command->line('  Decision Matrix:');
        $this->command->line('  1. Non-HRD + Non Dinas → Divisi → Finance → GM → Direksi');
        $this->command->line('  2. Non-HRD + Dinas     → Divisi → GA Legal → Finance → GM → Direksi');
        $this->command->line('  3. HRD + Non Dinas     → HRD → GA Legal → Finance → GM → Direksi');
        $this->command->line('  4. HRD + Dinas         → HRD → GA Legal → Finance → GM → Direksi');
    }
}
