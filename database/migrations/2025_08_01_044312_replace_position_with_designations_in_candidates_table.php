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
        Schema::table('candidates', function (Blueprint $table) {
            // Drop the position column
            $table->dropColumn('position');
            
            // Add designations as JSON array to store work experience
            $table->json('designations')->nullable()->after('company_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            // Drop designations column
            $table->dropColumn('designations');
            
            // Add back position column
            $table->string('position')->nullable()->after('company_name');
        });
    }
};
