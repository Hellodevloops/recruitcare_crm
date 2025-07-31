<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('deals', function (Blueprint $table) {
            // Drop old columns
            $table->dropColumn(['title', 'amount', 'status']);
            
            // Add new columns
            $table->foreignId('brand_id')->constrained()->onDelete('cascade');
            $table->foreignId('position_id')->constrained()->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('deals', function (Blueprint $table) {
            // Restore old columns
            $table->string('title');
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('pending');
            
            // Drop new columns
            $table->dropForeign(['brand_id']);
            $table->dropForeign(['position_id']);
            $table->dropColumn(['brand_id', 'position_id']);
        });
    }
}; 