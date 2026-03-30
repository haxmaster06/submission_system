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
        // Submissions table indexes
        Schema::table('submissions', function (Blueprint $table) {
            $table->index(['final_status', 'division_id'], 'idx_submissions_status_division');
            $table->index(['user_id', 'final_status'], 'idx_submissions_user_status');
            $table->index(['status_urgent'], 'idx_submissions_urgent');
            $table->index(['tanggal_pengajuan'], 'idx_submissions_tanggal');
            $table->index(['created_at'], 'idx_submissions_created');
        });

        // Submission Approvals table indexes
        Schema::table('submission_approvals', function (Blueprint $table) {
            $table->index(['approver_id', 'status'], 'idx_approvals_approver_status');
            $table->index(['submission_id', 'step_order'], 'idx_approvals_submission_step');
        });

        // Realization Headers table indexes
        Schema::table('realization_headers', function (Blueprint $table) {
            if (Schema::hasTable('realization_headers')) {
                $table->index(['submission_id'], 'idx_realizations_submission');
            }
        });

        // Attachment Requests table indexes
        Schema::table('attachment_requests', function (Blueprint $table) {
            if (Schema::hasTable('attachment_requests')) {
                $table->index(['target_user_id', 'status'], 'idx_att_req_target_status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropIndex('idx_submissions_status_division');
            $table->dropIndex('idx_submissions_user_status');
            $table->dropIndex('idx_submissions_urgent');
            $table->dropIndex('idx_submissions_tanggal');
            $table->dropIndex('idx_submissions_created');
        });

        Schema::table('submission_approvals', function (Blueprint $table) {
            $table->dropIndex('idx_approvals_approver_status');
            $table->dropIndex('idx_approvals_submission_step');
        });

        Schema::table('realization_headers', function (Blueprint $table) {
            if (Schema::hasTable('realization_headers')) {
                $table->dropIndex('idx_realizations_submission');
            }
        });

        Schema::table('attachment_requests', function (Blueprint $table) {
            if (Schema::hasTable('attachment_requests')) {
                $table->dropIndex('idx_att_req_target_status');
            }
        });
    }
};
