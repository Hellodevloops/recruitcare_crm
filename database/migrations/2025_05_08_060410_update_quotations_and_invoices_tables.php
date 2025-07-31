<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, handle the invalid date values in the quotations table
        if (Schema::hasColumn('quotations', 'date')) {
            // Update invalid dates to a valid default value (like current date)
            DB::statement("UPDATE quotations SET date = CURDATE() WHERE date = '0000-00-00' OR date IS NULL");
        }

        // Update quotations table with all the fields from the invoice PDF
        Schema::table('quotations', function (Blueprint $table) {
            // Remove or rename columns that are being updated
            if (Schema::hasColumn('quotations', 'title')) {
                $table->dropColumn('title');
            }

            // Check if columns exist before trying to modify them
            if (Schema::hasColumn('quotations', 'date')) {
                // Use DB::statement for column renaming to avoid automatic constraints
                DB::statement('ALTER TABLE `quotations` CHANGE `date` `quotation_date` DATE NOT NULL');
            } else {
                $table->date('quotation_date')->nullable();
            }

            // Add new columns to match the invoice structure
            if (!Schema::hasColumn('quotations', 'due_date')) {
                $table->date('due_date')->nullable()->after('quotation_date');
            }

            // Add JSON fields for company/client details
            if (!Schema::hasColumn('quotations', 'billed_by')) {
                $table->json('billed_by')->nullable()->after('due_date');
            }

            if (!Schema::hasColumn('quotations', 'billed_to')) {
                $table->json('billed_to')->nullable()->after('billed_by');
            }

            // Update items field
            if (Schema::hasColumn('quotations', 'items') && !Schema::hasColumn('quotations', 'service_items')) {
                $table->renameColumn('items', 'service_items');
            } else if (!Schema::hasColumn('quotations', 'service_items')) {
                $table->json('service_items')->nullable();
            }

            // Add remaining fields from the invoice
            if (!Schema::hasColumn('quotations', 'tax_rate')) {
                $table->decimal('tax_rate', 5, 2)->default(18.00)->after('service_items');
            }

            if (!Schema::hasColumn('quotations', 'discount')) {
                $table->decimal('discount', 10, 2)->default(0.00)->after('tax_rate');
            }

            if (!Schema::hasColumn('quotations', 'bank_details')) {
                $table->json('bank_details')->nullable()->after('status');
            }

            if (!Schema::hasColumn('quotations', 'payments')) {
                $table->json('payments')->nullable()->after('bank_details');
            }

            if (!Schema::hasColumn('quotations', 'terms')) {
                $table->text('terms')->nullable()->after('payments');
            }

            // Update the status enum to match both features
            $table->string('status')->change();
        });

        // Update the invoices table to have the same structure as quotations
        Schema::table('invoices', function (Blueprint $table) {
            // Drop columns we'll recreate to avoid type issues
            if (Schema::hasColumn('invoices', 'invoice_number')) {
                $table->dropColumn('invoice_number');
            }

            // Add all fields to match quotations
            if (!Schema::hasColumn('invoices', 'client_id')) {
                $table->foreignId('client_id')->nullable()->after('id');
            }

            if (!Schema::hasColumn('invoices', 'deal_id')) {
                $table->foreignId('deal_id')->nullable()->constrained()->nullOnDelete()->after('client_id');
            }

            if (!Schema::hasColumn('invoices', 'user_id')) {
                $table->foreignId('user_id')->constrained()->after('deal_id');
            }

            // Rename date fields for consistency
            if (Schema::hasColumn('invoices', 'invoice_date')) {
                DB::statement('ALTER TABLE `invoices` CHANGE `invoice_date` `quotation_date` DATE NOT NULL');
            } else if (!Schema::hasColumn('invoices', 'quotation_date')) {
                $table->date('quotation_date')->nullable();
            }

            // Add the invoice number field back with the same properties as quotation number
            if (!Schema::hasColumn('invoices', 'invoice_number')) {
                $table->string('invoice_number')->unique()->after('user_id');
            }

            // Update amount to match the same precision
            if (Schema::hasColumn('invoices', 'total_amount') && !Schema::hasColumn('invoices', 'amount')) {
                DB::statement('ALTER TABLE `invoices` CHANGE `total_amount` `amount` DECIMAL(15,2) NOT NULL');
            } else if (!Schema::hasColumn('invoices', 'amount')) {
                $table->decimal('amount', 15, 2)->default(0);
            }

            // Ensure all other fields match
            if (!Schema::hasColumn('invoices', 'valid_until')) {
                $table->date('valid_until')->nullable()->after('amount');
            }

            // Add notes field
            if (!Schema::hasColumn('invoices', 'notes')) {
                $table->text('notes')->nullable()->after('service_items');
            }

            // Standardize status field
            if (Schema::hasColumn('invoices', 'status')) {
                $table->string('status')->change();
            } else {
                $table->string('status')->default('unpaid');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore the original structure of quotations
        Schema::table('quotations', function (Blueprint $table) {
            if (Schema::hasColumn('quotations', 'quotation_date')) {
                $table->renameColumn('quotation_date', 'date');
            }

            if (Schema::hasColumn('quotations', 'service_items')) {
                $table->renameColumn('service_items', 'items');
            }

            // Drop added columns
            $table->dropColumn([
                'due_date',
                'billed_by',
                'billed_to',
                'tax_rate',
                'discount',
                'bank_details',
                'payments',
                'terms'
            ]);

            // Add back the title column
            $table->string('title')->nullable();

            // Restore the status enum
            $table->enum('status', ['draft', 'sent', 'accepted', 'declined'])->change();
        });

        // Restore the original structure of invoices
        Schema::table('invoices', function (Blueprint $table) {
            if (Schema::hasColumn('invoices', 'quotation_date')) {
                $table->renameColumn('quotation_date', 'invoice_date');
            }

            if (Schema::hasColumn('invoices', 'amount')) {
                $table->renameColumn('amount', 'total_amount');
            }

            // Drop added columns
            $table->dropColumn([
                'client_id',
                'deal_id',
                'user_id',
                'valid_until',
                'notes'
            ]);

            // Restore original status options
            $table->enum('status', ['unpaid', 'paid', 'overdue'])->change();
        });
    }
};
