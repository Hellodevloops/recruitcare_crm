<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Models\Pipeline;
use App\Models\Candidate;
use Illuminate\Http\Request;

class DealController extends Controller
{
    public function index(Request $request)
    {
        $pipelineId = $request->query('pipeline_id');

        // Get all pipelines for the filter dropdown
        $pipelines = Pipeline::all();

        // Build the deals query with all relationships
        $query = Deal::with([
            'candidate', 
            'brand', 
            'position', 
            'hr',
            'pipeline', 
            'stage'
        ])
        ->where('user_id', auth()->id())
        ->whereHas('candidate', function($query) {
            $query->where('owner_id', auth()->id());
        })
        ->when($pipelineId, function ($query, $pipelineId) {
            return $query->where('pipeline_id', $pipelineId);
        });

        // Get all deals for list view
        $allDeals = $query->get();

        // Group deals by stage_id for kanban view
        $deals = $allDeals->groupBy('stage_id');

        // Get stages based on pipeline filter and include deal counts
        $stages = $pipelineId 
            ? Pipeline::findOrFail($pipelineId)->stages 
            : \App\Models\Stage::all();

        // Add deal count to each stage
        $stages = $stages->map(function($stage) use ($deals) {
            $stage->deal_count = isset($deals[$stage->id]) ? count($deals[$stage->id]) : 0;
            return $stage;
        });

        // Return Inertia response instead of JSON
        return inertia('Deals/Index_v2', [
            'deals' => $deals,
            'allDeals' => $allDeals, // Add this for list view
            'stages' => $stages,
            'pipelines' => $pipelines,
            'selectedPipeline' => $pipelineId,
        ]);
    }

    public function create()
    {
        $pipelines = Pipeline::all();
        
        return inertia('Deals/Create', [
            'pipelines' => $pipelines,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|exists:candidates,id',
            'brand_id' => 'required|exists:brands,id',
            'position_id' => 'required|exists:positions,id',
            'hr_id' => 'nullable|exists:hr,id',
            'pipeline_id' => 'required|exists:pipelines,id',
            'stage_id' => 'required|exists:stages,id',
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'status' => 'sometimes|string|in:pending,won,lost',
            'priority' => 'sometimes|string|in:low,medium,high',
            'due_date' => 'sometimes|nullable|date',
            'tags' => 'sometimes|array',
        ]);

        $validated['user_id'] = auth()->id();

        $deal = Deal::create($validated);
        $deal->load(['brand', 'position', 'hr', 'pipeline', 'stage', 'candidate']);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Deal created successfully',
                'deal' => $deal
            ], 201);
        }

        // Redirect back with success message for Inertia
        return redirect()->back()
            ->with('success', 'Deal created successfully')
            ->with('deal', $deal);
    }

    public function deals_store_in_candidate(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|exists:candidates,id',
            'brand_id' => 'required|exists:brands,id',
            'position_id' => 'required|exists:positions,id',
            'hr_id' => 'nullable|exists:hr,id',
            'pipeline_id' => 'required|exists:pipelines,id',
            'stage_id' => 'required|exists:stages,id',
        ]);

        // Load the position and brand to generate title and amount
        $position = \App\Models\Position::find($validated['position_id']);
        $brand = \App\Models\Brand::find($validated['brand_id']);
        $candidate = \App\Models\Candidate::find($validated['candidate_id']);

        // Generate title and amount automatically
        $validated['title'] = $position ? $position->designation : 'New Position';
        $validated['amount'] = $position && $position->budget ? $position->budget : '0.00';
        $validated['status'] = 'pending';
        $validated['priority'] = 'medium';
        $validated['user_id'] = auth()->id();

        $deal = Deal::create($validated);
        $deal->load(['brand', 'position', 'hr', 'pipeline', 'stage', 'candidate']);

        return response()->json([
            'message' => 'Deal created successfully',
            'deal' => $deal
        ], 201);
    }

    public function show(Deal $deal)
    {
        // Check if the deal belongs to the current user
        if ($deal->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this deal.');
        }

        $deal->load(['brand', 'position', 'hr', 'pipeline', 'stage']);
        return response()->json($deal);
    }

    public function edit(Deal $deal)
    {
        // Check if the deal belongs to the current user
        if ($deal->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this deal.');
        }

        $deal->load(['brand', 'position', 'hr', 'pipeline', 'stage', 'candidate']);
        
        // Get all necessary data for the edit form
        $brands = \App\Models\Brand::all();
        $pipelines = Pipeline::all();
        $stages = \App\Models\Stage::all();
        
        // Get positions and HRs for the current brand
        $positions = [];
        $hrs = [];
        if ($deal->brand_id) {
            $positions = \App\Models\Position::where('brand_id', $deal->brand_id)->get();
            $hrs = \App\Models\Hr::where('brand_id', $deal->brand_id)->get();
        }

        return inertia('Deals/Edit', [
            'deal' => $deal,
            'brands' => $brands,
            'pipelines' => $pipelines,
            'stages' => $stages,
            'positions' => $positions,
            'hrs' => $hrs,
        ]);
    }

    public function update(Request $request, Deal $deal)
    {
        // Check if the deal belongs to the current user
        if ($deal->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this deal.');
        }

        $validated = $request->validate([
            'brand_id' => 'sometimes|exists:brands,id',
            'position_id' => 'sometimes|exists:positions,id',
            'hr_id' => 'nullable|exists:hr,id',
            'stage_id' => 'sometimes|exists:stages,id',
            'pipeline_id' => 'sometimes|exists:pipelines,id',
            'title' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|string|in:pending,won,lost',
            'priority' => 'sometimes|string|in:low,medium,high',
            'due_date' => 'sometimes|nullable|date',
            'tags' => 'sometimes|array',
        ]);

        $deal->update(array_filter($validated));
        $deal->load(['brand', 'position', 'hr', 'pipeline', 'stage', 'candidate']);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Deal updated successfully',
                'deal' => $deal
            ]);
        }

        return redirect()->route('deals.index')
            ->with('success', 'Deal updated successfully')
            ->with('deal', $deal->toArray());
    }

    public function destroy(Deal $deal)
    {
        // Check if the deal belongs to the current user
        if ($deal->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this deal.');
        }

        $deal->delete();

        if (request()->expectsJson()) {
            return response()->json([
                'message' => 'Deal deleted successfully'
            ], 200);
        }

        return redirect()->back()
            ->with('success', 'Deal deleted successfully');
    }
}