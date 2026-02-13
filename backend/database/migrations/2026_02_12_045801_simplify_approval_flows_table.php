<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Simplify approval_flows: remove jenis_pengajuan_id and jenis_perjalanan_id
     * since flow selection is now handled by the dynamic condition builder.
     */
    public function up(): void
    {
        Schema::table('approval_flows', function (Blueprint $table) {
            // Drop foreign keys first, then columns
            if (Schema::hasColumn('approval_flows', 'jenis_pengajuan_id')) {
                $table->dropForeign(['jenis_pengajuan_id']);
                $table->dropColumn('jenis_pengajuan_id');
            }
            if (Schema::hasColumn('approval_flows', 'jenis_perjalanan_id')) {
                $table->dropForeign(['jenis_perjalanan_id']);
                $table->dropColumn('jenis_perjalanan_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('approval_flows', function (Blueprint $table) {
            $table->foreignId('jenis_pengajuan_id')->nullable()->constrained('jenis_pengajuan');
            $table->foreignId('jenis_perjalanan_id')->nullable()->constrained('jenis_perjalanan');
        });
    }
};
