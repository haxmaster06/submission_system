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
        Schema::table('submission_items', function (Blueprint $table) {
            $table->string('currency', 3)->default('IDR')->after('uom_id');
            $table->decimal('kurs', 15, 5)->default(1.00000)->after('currency');
            $table->decimal('nominal_valas', 15, 5)->default(0.00000)->after('kurs');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submission_items', function (Blueprint $table) {
            $table->dropColumn(['currency', 'kurs', 'nominal_valas']);
        });
    }
};
