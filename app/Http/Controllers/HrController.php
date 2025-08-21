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
            'hrList' => Hr::where('user_id', auth()->id())->with('brand')->latest()->get(),
            'brands' => Brand::where('user_id', auth()->id())->orderBy('name')->get(['id', 'name', 'email', 'phone', 'address'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'brand_id' => 'required|exists:brands,id',
        ]);

        $validated['user_id'] = auth()->id();

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

        $validated['user_id'] = auth()->id();

        $brand = Brand::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Brand created successfully',
            'brand' => $brand
        ]);
    }

    public function getHrData(Request $request)
    {
        $brandId = $request->query('brand_id');
        
        if ($brandId) {
            $hrs = Hr::where('brand_id', $brandId)
                    ->where('user_id', auth()->id())
                    ->get(['id', 'name', 'email']);
        } else {
            $hrs = Hr::where('user_id', auth()->id())
                    ->with('brand')
                    ->get(['id', 'name', 'email', 'brand_id']);
        }
        
        return response()->json($hrs);
    }
} 