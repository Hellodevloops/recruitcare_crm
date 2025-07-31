<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Quotation;
use App\Models\Candidate;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class QuotationController extends Controller
{
    public function index()
    {
        $quotations = Quotation::with('client')
            ->whereHas('client')
            ->latest()
            ->paginate(10);

        return Inertia::render('Quotation/Index', [
            'quotations' => $quotations,
            'clients' => Candidate::select('id', 'name', 'company_name')->where('owner_id', Auth::id())->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Quotation/Create', [
            'clients' => Candidate::select('id', 'name', 'company_name')->where('owner_id', Auth::id())->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => ['required'],
            'quotation_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:quotation_date'],
            'valid_until' => ['required', 'date', 'after_or_equal:quotation_date'],
            'status' => ['required', Rule::in(['draft', 'sent', 'accepted', 'rejected', 'expired'])],
            'service_items' => ['required', 'array'],
            'service_items.*.description' => ['required', 'string'],
            'service_items.*.hsn_sac_code' => ['nullable', 'string'],
            'service_items.*.quantity' => ['required', 'numeric', 'min:1'],
            'service_items.*.price' => ['required', 'numeric', 'min:0'],
            'service_items.*.gst_percentage' => ['nullable', 'numeric', 'min:0'],
            'tax_rate' => ['required', 'numeric', 'min:0'],
            'discount' => ['required', 'numeric', 'min:0'],
            'billed_by' => ['nullable', 'array'],
            'billed_by.name' => ['nullable', 'string'],
            'billed_by.address' => ['nullable', 'string'],
            'billed_by.gstin' => ['nullable', 'string'],
            'billed_by.pan' => ['nullable', 'string'],
            'billed_by.email' => ['nullable', 'email'],
            'billed_by.phone' => ['nullable', 'string'],
            'billed_to' => ['nullable', 'array'],
            'billed_to.name' => ['nullable', 'string'],
            'billed_to.address' => ['nullable', 'string'],
            'billed_to.gstin' => ['nullable', 'string'],
            'billed_to.pan' => ['nullable', 'string'],
            'bank_details' => ['nullable', 'array'],
            'bank_details.account_name' => ['nullable', 'string'],
            'bank_details.account_number' => ['nullable', 'string'],
            'bank_details.ifsc' => ['nullable', 'string'],
            'bank_details.account_type' => ['nullable', 'string'],
            'bank_details.bank' => ['nullable', 'string'],
            'payments' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
            'terms' => ['nullable', 'string'],
        ]);

        // Calculate the total amount
        $subtotal = collect($validated['service_items'])->sum(
            fn($item) => $item['quantity'] * $item['price']
        );
        $taxAmount = $subtotal * ($validated['tax_rate'] / 100);
        $totalAmount = $subtotal + $taxAmount - $validated['discount'];

        // Generate a unique quotation number if not provided
        if (!isset($validated['quotation_number'])) {
            $latestQuotation = Quotation::latest()->first();
            $number = $latestQuotation ? intval(substr($latestQuotation->quotation_number, 2)) + 1 : 1;
            $validated['quotation_number'] = 'QT' . str_pad($number, 5, '0', STR_PAD_LEFT);
        }

        $quotation = Quotation::create([
            'client_id' => $validated['client_id'],
            'user_id' => Auth::id(),
            'quotation_date' => $validated['quotation_date'],
            'due_date' => $validated['due_date'],
            'valid_until' => $validated['valid_until'],
            'quotation_number' => $validated['quotation_number'] ?? null,
            'status' => $validated['status'],
            'service_items' => $validated['service_items'],
            'tax_rate' => $validated['tax_rate'],
            'discount' => $validated['discount'],
            'amount' => $totalAmount,
            'billed_by' => $validated['billed_by'] ?? null,
            'billed_to' => $validated['billed_to'] ?? null,
            'bank_details' => $validated['bank_details'] ?? null,
            'payments' => $validated['payments'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'terms' => $validated['terms'] ?? null,
        ]);

        return response()->json([
            'message' => 'Quotation created successfully.',
            'quotation' => $quotation
        ], 201);
    }

    public function show($id)
    {
        $quotation = Quotation::with('client')->findOrFail($id);
        return Inertia::render('Quotation/Show', [
            'quotation' => array_merge($quotation->toArray(), [
                'client_id' => $quotation->client_id,
                'notes' => $quotation->notes ?? '', // Convert null to empty string
                'terms' => $quotation->terms ?? '', // Convert null to empty string
                'billed_by' => $quotation->billed_by ?? [],
                'billed_to' => $quotation->billed_to ?? [],
                'bank_details' => $quotation->bank_details ?? [],
                'payments' => $quotation->payments ?? [],
            ]),
            'clients' => Candidate::select('id', 'name', 'company_name')->get(),
        ]);
    }

    public function edit($id)
    {
        $quotation = Quotation::with('client')->findOrFail($id);
        return Inertia::render('Quotation/Edit', [
            'quotation' => array_merge($quotation->toArray(), [
                'client_id' => $quotation->client_id,
                'notes' => $quotation->notes ?? '', // Convert null to empty string
                'terms' => $quotation->terms ?? '', // Convert null to empty string
                'billed_by' => $quotation->billed_by ?? [],
                'billed_to' => $quotation->billed_to ?? [],
                'bank_details' => $quotation->bank_details ?? [],
                'payments' => $quotation->payments ?? [],
            ]),
            'clients' => Candidate::select('id', 'name', 'company_name')->get(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $quotation = Quotation::findOrFail($id);

        $validated = $request->validate([
            'client_id' => ['required', 'exists:candidates,id'],
            'quotation_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:quotation_date'],
            'valid_until' => ['required', 'date', 'after_or_equal:quotation_date'],
            'status' => ['required', Rule::in(['draft', 'sent', 'accepted', 'rejected', 'expired'])],
            'service_items' => ['required', 'array'],
            'service_items.*.description' => ['required', 'string'],
            'service_items.*.hsn_sac_code' => ['nullable', 'string'],
            'service_items.*.quantity' => ['required', 'numeric', 'min:1'],
            'service_items.*.price' => ['required', 'numeric', 'min:0'],
            'service_items.*.gst_percentage' => ['nullable', 'numeric', 'min:0'],
            'tax_rate' => ['required', 'numeric', 'min:0'],
            'discount' => ['required', 'numeric', 'min:0'],
            'billed_by' => ['nullable', 'array'],
            'billed_by.name' => ['nullable', 'string'],
            'billed_by.address' => ['nullable', 'string'],
            'billed_by.gstin' => ['nullable', 'string'],
            'billed_by.pan' => ['nullable', 'string'],
            'billed_by.email' => ['nullable', 'email'],
            'billed_by.phone' => ['nullable', 'string'],
            'billed_to' => ['nullable', 'array'],
            'billed_to.name' => ['nullable', 'string'],
            'billed_to.address' => ['nullable', 'string'],
            'billed_to.gstin' => ['nullable', 'string'],
            'billed_to.pan' => ['nullable', 'string'],
            'bank_details' => ['nullable', 'array'],
            'bank_details.account_name' => ['nullable', 'string'],
            'bank_details.account_number' => ['nullable', 'string'],
            'bank_details.ifsc' => ['nullable', 'string'],
            'bank_details.account_type' => ['nullable', 'string'],
            'bank_details.bank' => ['nullable', 'string'],
            'payments' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
            'terms' => ['nullable', 'string'],
        ]);

        // Calculate the total amount
        $subtotal = collect($validated['service_items'])->sum(
            fn($item) => $item['quantity'] * $item['price']
        );
        $taxAmount = $subtotal * ($validated['tax_rate'] / 100);
        $totalAmount = $subtotal + $taxAmount - $validated['discount'];

        $quotation->update([
            'client_id' => $validated['client_id'],
            'user_id' => Auth::id(),
            'quotation_date' => $validated['quotation_date'],
            'due_date' => $validated['due_date'],
            'valid_until' => $validated['valid_until'],
            'status' => $validated['status'],
            'service_items' => $validated['service_items'],
            'tax_rate' => $validated['tax_rate'],
            'discount' => $validated['discount'],
            'amount' => $totalAmount,
            'billed_by' => $validated['billed_by'] ?? null,
            'billed_to' => $validated['billed_to'] ?? null,
            'bank_details' => $validated['bank_details'] ?? null,
            'payments' => $validated['payments'] ?? null,
            'notes' => $validated['notes'],
            'terms' => $validated['terms'],
        ]);

        return response()->json([
            'message' => 'Quotation updated successfully.',
            'quotation' => $quotation,
        ], 200);
    }

    public function destroy($id)
    {
        $quotation = Quotation::findOrFail($id);
        $quotation->delete();

        return redirect()->route('quotations.index')->with('success', 'Quotation deleted successfully.');
    }

    private function calculateTotal($items, $tax_rate, $discount)
    {
        $subtotal = collect($items)->sum(fn($item) => $item['quantity'] * $item['price']);
        $tax_amount = $subtotal * ($tax_rate / 100);
        return $subtotal + $tax_amount - $discount;
    }
}
