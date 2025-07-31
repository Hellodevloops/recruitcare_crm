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
            'pipeline', 
            'stage'
        ])
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|exists:candidates,id',
            'brand_id' => 'required|exists:brands,id',
            'position_id' => 'required|exists:positions,id',
            'pipeline_id' => 'required|exists:pipelines,id',
            'stage_id' => 'required|exists:stages,id',
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'status' => 'sometimes|string|in:pending,won,lost',
            'priority' => 'sometimes|string|in:low,medium,high',
            'due_date' => 'sometimes|nullable|date',
            'tags' => 'sometimes|array',
        ]);

        $deal = Deal::create($validated);
        $deal->load(['brand', 'position', 'pipeline', 'stage', 'candidate']);

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
            'pipeline_id' => 'required|exists:pipelines,id',
            'stage_id' => 'required|exists:stages,id',
        ]);

        $deal = Deal::create($validated);

        return response()->json($deal->load(['brand', 'position', 'pipeline', 'stage']), 201);
    }

    public function show(Deal $deal)
    {
        $deal->load(['brand', 'position', 'pipeline', 'stage']);
        return response()->json($deal);
    }

    public function update(Request $request, Deal $deal)
    {
        $validated = $request->validate([
            'brand_id' => 'sometimes|exists:brands,id',
            'position_id' => 'sometimes|exists:positions,id',
            'stage_id' => 'sometimes|exists:stages,id',
            'pipeline_id' => 'sometimes|exists:pipelines,id',
        ]);

        $deal->update(array_filter($validated));
        $deal->load(['brand', 'position', 'pipeline', 'stage']);

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Deal updated successfully',
                'deal' => $deal
            ]);
        }

        return redirect()->back()
            ->with('success', 'Deal updated successfully')
            ->with('deal', $deal->toArray());
    }

    public function destroy(Deal $deal)
    {
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