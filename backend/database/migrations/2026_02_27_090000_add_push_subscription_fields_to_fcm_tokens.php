<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('fcm_tokens', function (Blueprint $table) {
            $table->text('endpoint')->after('token')->nullable();
            $table->text('p256dh')->after('endpoint')->nullable();
            $table->text('auth')->after('p256dh')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('fcm_tokens', function (Blueprint $table) {
            $table->dropColumn(['endpoint', 'p256dh', 'auth']);
        });
    }
};