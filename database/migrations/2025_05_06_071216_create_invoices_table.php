<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique(); // e.g., SA00030
            $table->date('invoice_date'); // e.g., Mar 01, 2024
            $table->date('due_date'); // e.g., Mar 05, 2024
            $table->json('billed_by')->nullable(); // JSON: {name, address, gstin, pan, email, phone}
            $table->json('billed_to')->nullable(); // JSON: {name, address, gstin, pan}
            $table->json('service_items'); // JSON array: [{description, hsn_sac_code, quantity, price, gst_percentage, cgst_amount, sgst_amount, total_amount, notes}]
            $table->decimal('total_amount', 10, 2); // e.g., 6195.00
            $table->string('status')->default('unpaid'); // e.g., unpaid, paid
            $table->json('bank_details')->nullable(); // JSON: {account_name, account_number, ifsc, account_type, bank}
            $table->json('payments')->nullable(); // JSON array: [{date, mode, amount, account}]
            $table->text('terms_conditions')->nullable(); // Text for terms
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
