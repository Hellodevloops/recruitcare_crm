<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $query = Activity::query();
        
        // Apply filters if provided
        if ($request->has('candidate_id')) {
            $query->where('candidate_id', $request->candidate_id);
        }
        
        if ($request->has('is_completed')) {
            $query->where('is_completed', $request->boolean('is_completed'));
        }
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        // Order by completion status and scheduled date
        $query->orderBy('is_completed')
              ->orderBy('scheduled_at');
              
        $activities = $query->get();
        
        return response()->json($activities);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|exists:candidates,id',
            'type' => 'required|in:call,meeting,email,task,note',
            'description' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
            'is_completed' => 'boolean'
        ]);

        $activity = Activity::create($validated);

        return response()->json($activity, 201);
    }

    public function show(Activity $activity)
    {
        return response()->json($activity);
    }

    public function update(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'type' => 'sometimes|in:call,meeting,email,task,note',
            'description' => 'sometimes|nullable|string',
            'scheduled_at' => 'sometimes|nullable|date',
            'is_completed' => 'sometimes|boolean'
        ]);

        $activity->update($validated);

        return response()->json($activity);
    }

    public function destroy(Activity $activity)
    {
        $activity->delete();
        return response()->json(null, 204);
    }
    
    public function toggleComplete(Activity $activity)
    {
        $activity->is_completed = !$activity->is_completed;
        $activity->save();
        
        return response()->json($activity);
    }
    
    public function getStats(Request $request)
    {
        $candidateId = $request->candidate_id;
        
        $stats = [
            'total' => Activity::where('candidate_id', $candidateId)->count(),
            'completed' => Activity::where('candidate_id', $candidateId)
                          ->where('is_completed', true)
                          ->count(),
            'pending' => Activity::where('candidate_id', $candidateId)
                        ->where('is_completed', false)
                        ->count(),
            'overdue' => Activity::where('candidate_id', $candidateId)
                       ->where('is_completed', false)
                       ->whereNotNull('scheduled_at')
                       ->where('scheduled_at', '<', now())
                       ->count(),
            'upcoming' => Activity::where('candidate_id', $candidateId)
                        ->where('is_completed', false)
                        ->whereNotNull('scheduled_at')
                        ->where('scheduled_at', '>', now())
                        ->count(),
        ];
        
        return response()->json($stats);
    }
}