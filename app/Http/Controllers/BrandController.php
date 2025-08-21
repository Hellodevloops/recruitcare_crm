<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BrandController extends Controller
{
    public function getBrandsData()
    {
        $brands = Brand::where('user_id', auth()->id())->get();
        return response()->json($brands);
    }

    public function index()
    {
        $brands = Brand::where('user_id', auth()->id())->latest()->get();
        
        return Inertia::render('brands/Index', [
            'brands' => $brands->toArray()
        ]);
    }

    public function create()
    {
        return Inertia::render('brands/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:1000',
        ]);

        $validated['user_id'] = auth()->id();

        Brand::create($validated);

        return redirect()->route('brands.index')
            ->with('success', 'Brand created successfully.');
    }

    public function edit(Brand $brand)
    {
        // Check if the brand belongs to the current user
        if ($brand->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this brand.');
        }

        return Inertia::render('brands/Edit', [
            'brand' => $brand->toArray()
        ]);
    }

    public function update(Request $request, Brand $brand)
    {
        // Check if the brand belongs to the current user
        if ($brand->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this brand.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:1000',
        ]);

        $brand->update($validated);

        return redirect()->route('brands.index')
            ->with('success', 'Brand updated successfully.');
    }

    public function destroy(Brand $brand)
    {
        // Check if the brand belongs to the current user
        if ($brand->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this brand.');
        }

        $brand->delete();

        return redirect()->route('brands.index')
            ->with('success', 'Brand deleted successfully.');
    }
} 