<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('deals', function (Blueprint $table) {
            // Add new columns only if they don't exist
            if (!Schema::hasColumn('deals', 'brand_id')) {
                $table->foreignId('brand_id')->constrained()->onDelete('cascade');
            }
            if (!Schema::hasColumn('deals', 'position_id')) {
                $table->foreignId('position_id')->constrained()->onDelete('cascade');
            }
        });
    }

    public function down()
    {
        Schema::table('deals', function (Blueprint $table) {
            // Drop new columns only if they exist
            if (Schema::hasColumn('deals', 'brand_id')) {
                $table->dropForeign(['brand_id']);
                $table->dropColumn('brand_id');
            }
            if (Schema::hasColumn('deals', 'position_id')) {
                $table->dropForeign(['position_id']);
                $table->dropColumn('position_id');
            }
        });
    }
}; 