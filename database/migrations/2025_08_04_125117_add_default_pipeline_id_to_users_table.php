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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'default_pipeline_id')) {
                $table->unsignedBigInteger('default_pipeline_id')->nullable()->after('calcom_url');
                $table->foreign('default_pipeline_id')->references('id')->on('pipelines')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'default_pipeline_id')) {
                $table->dropForeign(['default_pipeline_id']);
                $table->dropColumn('default_pipeline_id');
            }
        });
    }
};
