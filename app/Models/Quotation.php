<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Quotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'deal_id',
        'user_id',
        'quotation_date',
        'due_date',
        'valid_until',
        'quotation_number',
        'amount',
        'tax_rate',
        'discount',
        'status',
        'service_items',
        'billed_by',
        'billed_to',
        'bank_details',
        'payments',
        'notes',
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

        static::creating(function ($quotation) {
            // Generate a unique quotation number if not provided
            if (!$quotation->quotation_number) {
                $latestQuotation = static::latest()->first();
                $number = $latestQuotation ? intval(substr($latestQuotation->quotation_number, 2)) + 1 : 1;
                $quotation->quotation_number = 'QT' . str_pad($number, 5, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * Get the candidate that owns the quotation.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Candidate::class, 'client_id');
    }

    /**
     * Get the deal that owns the quotation.
     */
    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }

    /**
     * Get the user that created the quotation.
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
