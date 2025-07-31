<?php

namespace App\Http\Controllers;

use App\Models\Stage;
use App\Models\Pipeline;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StageController extends Controller
{
    public function index()
    {
        $stages = Stage::with('pipeline')->latest()->paginate(10);
        $pipelines = Pipeline::all();

        return Inertia::render('Stages/Index', [
            'stages' => $stages,
            'pipelines' => $pipelines,
        ]);
    }
    public function data(Request $request)
    {
        $pipelineId = $request->query('pipeline_id');
        if ($pipelineId) {
            return response()->json(Stage::where('pipeline_id', $pipelineId)->get());
        }
        return response()->json(Stage::all());
    }

    public function getStagesData(Request $request)
    {
        $query = Stage::with('pipeline');
        
        if ($request->has('pipeline_id')) {
            $query->where('pipeline_id', $request->pipeline_id);
        }
        
        $stages = $query->select('id', 'name', 'pipeline_id', 'order')
            ->orderBy('order')
            ->orderBy('name')
            ->get();
        
        return response()->json($stages);
    }
    public function store(Request $request, Pipeline $pipeline)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $pipeline->stages()->create($validated);

        return redirect()->route('pipelines.show', $pipeline)->with('success', 'Stage added successfully');
    }
    public function reorder(Request $request, $pipelineId)
    {
        $request->validate([
            'stages' => 'required|array',
            'stages.*.id' => 'required|exists:stages,id',
            'stages.*.order' => 'required|integer',
        ]);

        foreach ($request->stages as $stageData) {
            Stage::where('id', $stageData['id'])
                ->where('pipeline_id', $pipelineId)
                ->update(['order' => $stageData['order']]);
        }

        return redirect()->back()->with('success', 'Stages reordered successfully');
    }
    public function update(Request $request, Stage $stage)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $stage->update($validated);

        return redirect()->route('pipelines.show', $stage->pipeline)->with('success', 'Stage updated successfully');
    }

    public function destroy(Stage $stage)
    {
        $pipeline = $stage->pipeline;
        $stage->delete();

        return redirect()->route('pipelines.show', $pipeline)->with('success', 'Stage deleted successfully');
    }
}