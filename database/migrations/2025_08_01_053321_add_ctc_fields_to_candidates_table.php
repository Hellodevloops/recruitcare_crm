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
            // Add CTC fields after status
            $table->decimal('current_ctc', 10, 2)->nullable()->after('status');
            $table->decimal('expected_ctc', 10, 2)->nullable()->after('current_ctc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            // Drop CTC fields
            $table->dropColumn(['current_ctc', 'expected_ctc']);
        });
    }
};
