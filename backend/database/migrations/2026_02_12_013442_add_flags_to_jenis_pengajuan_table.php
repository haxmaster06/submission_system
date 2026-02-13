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
        Schema::table('jenis_pengajuan', function (Blueprint $table) {
            $table->boolean('requires_travel_type')->default(false)->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jenis_pengajuan', function (Blueprint $table) {
            $table->dropColumn('requires_travel_type');
        });
    }
};
