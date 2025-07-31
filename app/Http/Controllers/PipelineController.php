<?php

namespace App\Http\Controllers;

use App\Models\Pipeline;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PipelineController extends Controller
{
    public function index()
    {
        $pipelines = Pipeline::with('stages')->latest()->paginate(10);

        return Inertia::render('Pipelines/Index', [
            'pipelines' => $pipelines,
        ]);
    }

    public function data()
    {
        return response()->json(Pipeline::all());
    }

    public function show(Pipeline $pipeline)
    {
        return Inertia::render('Pipelines/Show', [
            'pipeline' => $pipeline->load('stages'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $pipeline = Pipeline::create($validated);

        // Create default stages
        $pipeline->stages()->createMany([
            ['name' => 'Prospect'],
            ['name' => 'Negotiation'],
            ['name' => 'Closed'],
        ]);

        return redirect()->route('pipelines.index')->with('success', 'Pipeline created successfully');
    }

    public function update(Request $request, Pipeline $pipeline)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $pipeline->update($validated);

        return redirect()->route('pipelines.show', $pipeline)->with('success', 'Pipeline updated successfully');
    }

    public function destroy(Pipeline $pipeline)
    {
        $pipeline->delete();

        return redirect()->route('pipelines.index')->with('success', 'Pipeline deleted successfully');
    }
}