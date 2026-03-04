<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Make no_pengajuan nullable
        Schema::table('submissions', function (Blueprint $table) {
            $table->string('no_pengajuan')->nullable()->change();
        });

        // 2. Add 'draf' to final_status enum
        // Note: For MySQL enums, we often need to use raw DB statement for safety or doctrine/dbal
        DB::statement("ALTER TABLE submissions MODIFY COLUMN final_status ENUM('draf', 'pending', 'approved', 'rejected') DEFAULT 'draf'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->string('no_pengajuan')->nullable(false)->change();
        });

        DB::statement("ALTER TABLE submissions MODIFY COLUMN final_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
    }
};
