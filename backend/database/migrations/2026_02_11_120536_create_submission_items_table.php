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
        Schema::create('submission_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('submissions')->onDelete('cascade');
            $table->text('description'); // Item description
            $table->decimal('qty', 15, 2); // Quantity
            $table->foreignId('uom_id')->constrained('uoms'); // Unit of Measure
            $table->decimal('nominal', 15, 2); // Price per unit
            $table->decimal('total', 15, 2); // qty * nominal (calculated)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submission_items');
    }
};
