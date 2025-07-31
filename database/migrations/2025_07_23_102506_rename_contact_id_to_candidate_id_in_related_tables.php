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
        // Rename contact_id to candidate_id in deals table if it exists
        if (Schema::hasColumn('deals', 'contact_id')) {
            Schema::table('deals', function (Blueprint $table) {
                $table->dropForeign(['contact_id']);
                $table->renameColumn('contact_id', 'candidate_id');
            });
            
            Schema::table('deals', function (Blueprint $table) {
                $table->foreign('candidate_id')->references('id')->on('candidates')->onDelete('cascade');
            });
        }

        // Rename contact_id to candidate_id in activities table if it exists
        if (Schema::hasColumn('activities', 'contact_id')) {
            Schema::table('activities', function (Blueprint $table) {
                $table->dropForeign(['contact_id']);
                $table->renameColumn('contact_id', 'candidate_id');
            });
            
            Schema::table('activities', function (Blueprint $table) {
                $table->foreign('candidate_id')->references('id')->on('candidates')->onDelete('cascade');
            });
        }

        // Rename contact_id to candidate_id in notes table if it exists
        if (Schema::hasColumn('notes', 'contact_id')) {
            Schema::table('notes', function (Blueprint $table) {
                $table->dropForeign(['contact_id']);
                $table->renameColumn('contact_id', 'candidate_id');
            });
            
            Schema::table('notes', function (Blueprint $table) {
                $table->foreign('candidate_id')->references('id')->on('candidates')->onDelete('cascade');
            });
        }

        // Rename contact_id to candidate_id in documents table if it exists
        if (Schema::hasColumn('documents', 'contact_id')) {
            Schema::table('documents', function (Blueprint $table) {
                $table->dropForeign(['contact_id']);
                $table->renameColumn('contact_id', 'candidate_id');
            });
            
            Schema::table('documents', function (Blueprint $table) {
                $table->foreign('candidate_id')->references('id')->on('candidates')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rename candidate_id back to contact_id in deals table if it exists
        if (Schema::hasColumn('deals', 'candidate_id')) {
            Schema::table('deals', function (Blueprint $table) {
                $table->dropForeign(['candidate_id']);
                $table->renameColumn('candidate_id', 'contact_id');
            });
            
            Schema::table('deals', function (Blueprint $table) {
                $table->foreign('contact_id')->references('id')->on('candidates')->onDelete('cascade');
            });
        }

        // Rename candidate_id back to contact_id in activities table if it exists
        if (Schema::hasColumn('activities', 'candidate_id')) {
            Schema::table('activities', function (Blueprint $table) {
                $table->dropForeign(['candidate_id']);
                $table->renameColumn('candidate_id', 'contact_id');
            });
            
            Schema::table('activities', function (Blueprint $table) {
                $table->foreign('contact_id')->references('id')->on('candidates')->onDelete('cascade');
            });
        }

        // Rename candidate_id back to contact_id in notes table if it exists
        if (Schema::hasColumn('notes', 'candidate_id')) {
            Schema::table('notes', function (Blueprint $table) {
                $table->dropForeign(['candidate_id']);
                $table->renameColumn('candidate_id', 'contact_id');
            });
            
            Schema::table('notes', function (Blueprint $table) {
                $table->foreign('contact_id')->references('id')->on('candidates')->onDelete('cascade');
            });
        }

        // Rename candidate_id back to contact_id in documents table if it exists
        if (Schema::hasColumn('documents', 'candidate_id')) {
            Schema::table('documents', function (Blueprint $table) {
                $table->dropForeign(['candidate_id']);
                $table->renameColumn('candidate_id', 'contact_id');
            });
            
            Schema::table('documents', function (Blueprint $table) {
                $table->foreign('contact_id')->references('id')->on('candidates')->onDelete('cascade');
            });
        }
    }
};
