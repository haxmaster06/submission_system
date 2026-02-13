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
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->string('no_pengajuan')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('division_id')->constrained()->onDelete('cascade');
            $table->foreignId('jenis_pengajuan_id'); // Assuming there's a jenis_pengajuan table or it's handled via ID mapping
            $table->foreignId('jenis_perjalanan_id')->nullable();
            $table->enum('status_urgent', ['urgent', 'normal']);
            $table->text('description');
            $table->text('notes')->nullable();
            $table->decimal('qty', 15, 2)->nullable(); // Legacy field - now nullable
            $table->foreignId('uom_id')->nullable()->constrained('uoms'); // Legacy field - now nullable
            $table->decimal('nominal', 15, 2)->nullable(); // Legacy field - now nullable
            $table->decimal('total', 15, 2);
            $table->dateTime('tanggal_pengajuan');
            $table->integer('current_approval_step')->default(1);
            $table->enum('final_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
