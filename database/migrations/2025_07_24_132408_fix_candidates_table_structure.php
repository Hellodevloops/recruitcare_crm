<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // First, drop any existing columns we're going to recreate
        Schema::table('candidates', function (Blueprint $table) {
            if (Schema::hasColumn('candidates', 'position')) {
                $table->dropColumn('position');
            }
            if (Schema::hasColumn('candidates', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('candidates', 'resume')) {
                $table->dropColumn('resume');
            }
            if (Schema::hasColumn('candidates', 'documents')) {
                $table->dropColumn('documents');
            }
        });

        // Then create them with the correct structure
        Schema::table('candidates', function (Blueprint $table) {
            $table->string('position')->nullable()->after('company_name');
            $table->enum('status', ['interested', 'not_interested', 'dnd', 'followup'])
                ->default('interested')
                ->after('position');
            $table->string('resume')->nullable()->after('status');
            $table->json('documents')->nullable()->after('resume');
        });
    }

    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn(['position', 'status', 'resume', 'documents']);
        });
    }
};
