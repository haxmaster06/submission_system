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
        Schema::table('submission_approvals', function (Blueprint $table) {
            $table->longText('signature_used')->nullable()->change();
            $table->longText('signed_proof_path')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submission_approvals', function (Blueprint $table) {
            $table->string('signature_used')->nullable()->change();
            $table->string('signed_proof_path')->nullable()->change();
        });
    }
};
