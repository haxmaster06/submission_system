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
        Schema::create('realization_headers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('submissions')->onDelete('cascade');
            $table->date('realization_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('realization_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('realization_id')->constrained('realization_headers')->onDelete('cascade');
            $table->string('item_name');
            $table->decimal('qty', 12, 2);
            $table->decimal('nominal', 15, 2);
            $table->decimal('total', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('realization_details');
        Schema::dropIfExists('realization_headers');
    }
};
