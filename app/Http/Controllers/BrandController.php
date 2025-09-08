<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;

class BrandController extends Controller
{
    public function getBrandsData()
    {
        try {
            $brands = Brand::all();
            return response()->json($brands);
        } catch (Exception $e) {
            \Log::error('Brand Data Error: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while fetching brands data.'], 500);
        }
    }

    public function index()
    {
        try {
            $brands = Brand::latest()->get();
            
            return Inertia::render('brands/Index', [
                'brands' => $brands->toArray()
            ]);
        } catch (Exception $e) {
            \Log::error('Brand Index Error: ' . $e->getMessage());
            return Inertia::render('brands/Index', [
                'brands' => [],
                'error' => 'An error occurred while loading brands data: ' . $e->getMessage()
            ]);
        }
    }

    public function create()
    {
        return Inertia::render('brands/Create');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:1000',
            ]);

            Brand::create($validated);

            return redirect()->route('brands.index')
                ->with('success', 'Brand created successfully.');
        } catch (Exception $e) {
            \Log::error('Brand Store Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'An error occurred while creating the brand.');
        }
    }

    public function edit(Brand $brand)
    {
        return Inertia::render('brands/Edit', [
            'brand' => $brand->toArray()
        ]);
    }

    public function update(Request $request, Brand $brand)
    {
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
        $brand->delete();

        return redirect()->route('brands.index')
            ->with('success', 'Brand deleted successfully.');
    }
} 