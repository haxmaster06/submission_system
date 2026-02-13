<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('approval_conditions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flow_id')->constrained('approval_flows')->onDelete('cascade');
            $table->string('name'); // e.g. "GA Legal Required"
            $table->string('role_name'); // Role to insert, e.g. "GA Legal"
            $table->integer('insert_after_step'); // Insert after this base step_order
            $table->enum('condition_type', ['any_of', 'all_of'])->default('any_of'); // OR vs AND
            $table->json('condition_rules'); // JSON rules array
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0); // Evaluation order
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_conditions');
    }
};
