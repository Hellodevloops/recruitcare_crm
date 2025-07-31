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
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            // $table->string('title');
            $table->foreignId('client_id')->nullable();
            $table->foreignId('deal_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained(); // Created by
            $table->decimal('amount', 15, 2);
            $table->date('valid_until');
            $table->string('quotation_number')->unique();
            $table->enum('status', ['draft', 'sent', 'accepted', 'declined'])->default('draft');
            $table->json('items'); // Store items as JSON
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};