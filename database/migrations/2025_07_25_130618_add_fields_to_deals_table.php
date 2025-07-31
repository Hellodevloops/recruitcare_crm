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
        Schema::table('deals', function (Blueprint $table) {
            $table->string('title')->nullable()->after('id');
            $table->decimal('amount', 10, 2)->nullable()->after('title');
            $table->enum('status', ['pending', 'won', 'lost'])->default('pending')->after('amount');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium')->after('status');
            $table->date('due_date')->nullable()->after('priority');
            $table->json('tags')->nullable()->after('due_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deals', function (Blueprint $table) {
            $table->dropColumn(['title', 'amount', 'status', 'priority', 'due_date', 'tags']);
        });
    }
};
