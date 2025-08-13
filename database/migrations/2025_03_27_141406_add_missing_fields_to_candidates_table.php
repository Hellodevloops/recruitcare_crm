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
            if (!Schema::hasColumn('candidates', 'current_designation')) {
                $table->string('current_designation')->nullable()->after('company_name');
            }
            if (!Schema::hasColumn('candidates', 'experience')) {
                $table->string('experience')->nullable()->after('current_designation');
            }
            if (!Schema::hasColumn('candidates', 'notice_period')) {
                $table->string('notice_period')->nullable()->after('experience');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn(['current_designation', 'experience', 'notice_period']);
        });
    }
}; 