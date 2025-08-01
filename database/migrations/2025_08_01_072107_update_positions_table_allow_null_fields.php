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
        Schema::table('positions', function (Blueprint $table) {
            // Drop foreign key constraints first
            $table->dropForeign(['brand_id']);
            $table->dropForeign(['hr_id']);
            
            // Modify columns to allow NULL values
            $table->foreignId('brand_id')->nullable()->change();
            $table->foreignId('hr_id')->nullable()->change();
            $table->string('experience')->nullable()->change();
            $table->string('store')->nullable()->change();
            $table->string('city')->nullable()->change();
            $table->decimal('budget', 10, 2)->nullable()->change();
            $table->string('designation')->nullable()->change();
            
            // Re-add foreign key constraints with nullable
            $table->foreign('brand_id')->references('id')->on('brands')->onDelete('set null');
            $table->foreign('hr_id')->references('id')->on('hr')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            // Drop foreign key constraints
            $table->dropForeign(['brand_id']);
            $table->dropForeign(['hr_id']);
            
            // Revert columns to NOT NULL
            $table->foreignId('brand_id')->nullable(false)->change();
            $table->foreignId('hr_id')->nullable(false)->change();
            $table->string('experience')->nullable(false)->change();
            $table->string('store')->nullable(false)->change();
            $table->string('city')->nullable(false)->change();
            $table->decimal('budget', 10, 2)->nullable(false)->change();
            $table->string('designation')->nullable(false)->change();
            
            // Re-add foreign key constraints without nullable
            $table->foreign('brand_id')->references('id')->on('brands')->onDelete('cascade');
            $table->foreign('hr_id')->references('id')->on('hr')->onDelete('cascade');
        });
    }
};
