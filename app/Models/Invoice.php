<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'candidate_id',
        'deal_id',
        'user_id',
        'quotation_date',  // Renamed from invoice_date for consistency
        'due_date',
        'valid_until',
        'invoice_number',
        'amount',         // Renamed from total_amount
        'tax_rate',
        'discount',
        'status',
        'service_items',  // Renamed from items
        'billed_by',
        'billed_to',
        'bank_details',
        'payments',
        'notes',          // Renamed from terms_conditions
        'terms',
    ];

    protected $casts = [
        'quotation_date' => 'date',
        'due_date' => 'date',
        'valid_until' => 'date',
        'service_items' => 'array',
        'billed_by' => 'array',
        'billed_to' => 'array',
        'bank_details' => 'array',
        'payments' => 'array',
        'amount' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'discount' => 'decimal:2',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invoice) {
            // Generate a unique invoice number if not provided
            if (!$invoice->invoice_number) {
                $latestInvoice = static::latest()->first();
                $number = $latestInvoice ? intval(substr($latestInvoice->invoice_number, 2)) + 1 : 1;
                $invoice->invoice_number = 'SA' . str_pad($number, 5, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * Get the candidate that owns the invoice.
     */
    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class, 'candidate_id');
    }

    /**
     * Get the deal that owns the invoice.
     */
    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }

    /**
     * Get the user that created the invoice.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate the subtotal without tax and discount.
     */
    public function getSubtotalAttribute()
    {
        if (!$this->service_items) {
            return 0;
        }

        return collect($this->service_items)->sum(function ($item) {
            return ($item['quantity'] ?? 0) * ($item['price'] ?? 0);
        });
    }

    /**
     * Calculate the tax amount.
     */
    public function getTaxAmountAttribute()
    {
        return $this->subtotal * ($this->tax_rate / 100);
    }

    /**
     * Calculate the total amount.
     */
    public function calculateTotal()
    {
        return $this->subtotal + $this->tax_amount - $this->discount;
    }
}
