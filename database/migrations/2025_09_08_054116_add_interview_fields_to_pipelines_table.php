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
        Schema::table('pipelines', function (Blueprint $table) {
            $table->date('interview_date')->nullable();
            $table->unsignedBigInteger('candidate_id')->nullable();
            $table->unsignedBigInteger('hr_id')->nullable();
            $table->unsignedBigInteger('brand_id')->nullable();
            $table->json('interview_rounds')->nullable(); // Array to store interview rounds
            $table->text('feedback')->nullable();
            
            $table->foreign('candidate_id')->references('id')->on('candidates')->onDelete('set null');
            $table->foreign('hr_id')->references('id')->on('hr')->onDelete('set null');
            $table->foreign('brand_id')->references('id')->on('brands')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pipelines', function (Blueprint $table) {
            $table->dropForeign(['candidate_id']);
            $table->dropForeign(['hr_id']);
            $table->dropForeign(['brand_id']);
            $table->dropColumn([
                'interview_date',
                'candidate_id',
                'hr_id',
                'brand_id',
                'interview_rounds',
                'feedback'
            ]);
        });
    }
};
