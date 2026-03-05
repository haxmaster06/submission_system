<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Add "draf" and "on_hold" to the final_status enum in submissions
        DB::statement("ALTER TABLE submissions MODIFY COLUMN final_status ENUM('pending', 'approved', 'rejected', 'draf', 'on_hold') DEFAULT 'pending'");

        // Add "on_hold" and "revised" to the status enum in submission_approvals
        DB::statement("ALTER TABLE submission_approvals MODIFY COLUMN status ENUM('pending', 'approved', 'rejected', 'on_hold', 'revised') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("ALTER TABLE submissions MODIFY COLUMN final_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
        DB::statement("ALTER TABLE submission_approvals MODIFY COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
    }
};
