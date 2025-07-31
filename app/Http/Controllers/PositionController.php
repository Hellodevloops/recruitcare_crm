<?php

namespace App\Http\Controllers;

use App\Models\Position;
use App\Models\Brand;
use App\Models\Hr;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PositionController extends Controller
{
    public function getPositionsData(Request $request)
    {
        $query = Position::with(['brand', 'hr']);
        
        if ($request->has('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }
        
        $positions = $query->select('id', 'title', 'designation', 'brand_id', 'hr_id')
            ->orderBy('title')
            ->get();
        
        return response()->json($positions);
    }

    public function index()
    {
        $positions = Position::with(['brand', 'hr'])->latest()->get();
        
        return Inertia::render('positions/Index', [
            'positions' => $positions
        ]);
    }

    public function create()
    {
        $brands = Brand::all();
        $hrs = Hr::with('brand')->get()->groupBy('brand_id');
        
        return Inertia::render('positions/Create', [
            'brands' => $brands,
            'hrs' => $hrs
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand_id' => 'required|exists:brands,id',
            'hr_id' => 'required|exists:hr,id',
            'title' => 'required|string|max:255',
            'experience' => 'required|string|max:255',
            'store' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'budget' => 'required|numeric|min:0',
            'designation' => 'required|string|max:255',
        ]);

        Position::create($validated);

        return redirect()->route('positions.index')
            ->with('success', 'Position created successfully.');
    }

    public function edit(Position $position)
    {
        $brands = Brand::all();
        $hrs = Hr::with('brand')->get()->groupBy('brand_id');
        
        return Inertia::render('positions/Edit', [
            'position' => $position->load(['brand', 'hr']),
            'brands' => $brands,
            'hrs' => $hrs
        ]);
    }

    public function update(Request $request, Position $position)
    {
        $validated = $request->validate([
            'brand_id' => 'required|exists:brands,id',
            'hr_id' => 'required|exists:hr,id',
            'title' => 'required|string|max:255',
            'experience' => 'required|string|max:255',
            'store' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'budget' => 'required|numeric|min:0',
            'designation' => 'required|string|max:255',
        ]);

        $position->update($validated);

        return redirect()->route('positions.index')
            ->with('success', 'Position updated successfully.');
    }

    public function destroy(Position $position)
    {
        $position->delete();
        return redirect()->route('positions.index')->with('success', 'Position deleted successfully');
    }
} 