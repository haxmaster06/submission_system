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
        // Update submissions table
        Schema::table('submissions', function (Blueprint $table) {
            $table->decimal('qty', 15, 5)->nullable()->change();
            $table->decimal('nominal', 15, 5)->nullable()->change();
            $table->decimal('total', 15, 5)->change();
        });

        // Update submission_items table
        Schema::table('submission_items', function (Blueprint $table) {
            $table->decimal('qty', 15, 5)->change();
            $table->decimal('nominal', 15, 5)->change();
            $table->decimal('total', 15, 5)->change();
        });

        // Update realization_details table
        Schema::table('realization_details', function (Blueprint $table) {
            $table->decimal('qty', 15, 5)->change();
            $table->decimal('nominal', 15, 5)->change();
            $table->decimal('total', 15, 5)->change();
        });

        // Update employees table
        Schema::table('employees', function (Blueprint $table) {
            $table->decimal('base_salary', 15, 5)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->decimal('qty', 15, 2)->nullable()->change();
            $table->decimal('nominal', 15, 2)->nullable()->change();
            $table->decimal('total', 15, 2)->change();
        });

        Schema::table('submission_items', function (Blueprint $table) {
            $table->decimal('qty', 15, 2)->change();
            $table->decimal('nominal', 15, 2)->change();
            $table->decimal('total', 15, 2)->change();
        });

        Schema::table('realization_details', function (Blueprint $table) {
            $table->decimal('qty', 12, 2)->change();
            $table->decimal('nominal', 15, 2)->change();
            $table->decimal('total', 15, 2)->change();
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->decimal('base_salary', 15, 2)->change();
        });
    }
};
