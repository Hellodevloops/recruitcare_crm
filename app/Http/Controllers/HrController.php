<?php

namespace App\Http\Controllers;

use App\Models\Hr;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HrController extends Controller
{
    public function index()
    {
        return Inertia::render('hr/Index', [
            'hrList' => Hr::with('brand')->latest()->get(),
            'brands' => Brand::orderBy('name')->get(['id', 'name', 'email', 'phone', 'address'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'brand_id' => 'required|exists:brands,id',
        ]);

        Hr::create($validated);

        return redirect()->back()->with('success', 'HR record created successfully.');
    }

    public function storeBrand(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
        ]);

        $brand = Brand::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Brand created successfully',
            'brand' => $brand
        ]);
    }
} 