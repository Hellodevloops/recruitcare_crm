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
        // Ensure brands table exists
        if (!Schema::hasTable('brands')) {
            Schema::create('brands', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->timestamps();
            });
        }

        // Ensure hr table exists
        if (!Schema::hasTable('hr')) {
            Schema::create('hr', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->foreignId('brand_id')->constrained('brands')->onDelete('cascade');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('positions')) {
            Schema::create('positions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('brand_id')->constrained('brands')->onDelete('cascade');
                $table->foreignId('hr_id')->constrained('hr')->onDelete('cascade');
                $table->string('title');
                $table->string('experience');
                $table->string('store');
                $table->string('city');
                $table->decimal('budget', 10, 2);
                $table->string('designation');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('positions');
    }
};
