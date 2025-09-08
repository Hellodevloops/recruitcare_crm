<?php

namespace App\Http\Controllers;

use App\Models\Hr;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Exception;

class HrController extends Controller
{
    public function index()
    {
        try {
            $userId = auth()->id();
            if (!$userId) {
                return redirect()->route('login');
            }

            $hrList = Hr::where('user_id', $userId)->with('brand')->latest()->get();
            $brands = Brand::orderBy('name')->get(['id', 'name', 'email', 'phone', 'address']);

            return Inertia::render('hr/Index', [
                'hrList' => $hrList,
                'brands' => $brands
            ]);
        } catch (Exception $e) {
            \Log::error('HR Index Error: ' . $e->getMessage());
            return Inertia::render('hr/Index', [
                'hrList' => [],
                'brands' => [],
                'error' => 'An error occurred while loading HR data.'
            ]);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'brand_id' => 'required|exists:brands,id',
            ]);

            $validated['user_id'] = auth()->id();

            Hr::create($validated);

            return redirect()->back()->with('success', 'HR record created successfully.');
        } catch (Exception $e) {
            \Log::error('HR Store Error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'An error occurred while creating the HR record.');
        }
    }

    public function storeBrand(Request $request)
    {
        try {
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
        } catch (Exception $e) {
            \Log::error('Brand Store Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the brand.'
            ], 500);
        }
    }

    public function getHrData(Request $request)
    {
        try {
            $userId = auth()->id();
            if (!$userId) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            $brandId = $request->query('brand_id');
            
            if ($brandId) {
                $hrs = Hr::where('brand_id', $brandId)
                        ->where('user_id', $userId)
                        ->get(['id', 'name', 'email']);
            } else {
                $hrs = Hr::where('user_id', $userId)
                        ->with('brand')
                        ->get(['id', 'name', 'email', 'brand_id']);
            }
            
            return response()->json($hrs);
        } catch (Exception $e) {
            \Log::error('HR Data Error: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while fetching HR data.'], 500);
        }
    }
} 