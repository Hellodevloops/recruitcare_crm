<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Candidate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index()
    {
        $activities = Activity::with('candidate')
            ->whereHas('candidate', function($query) {
                $query->where('owner_id', auth()->id());
            })
            ->whereNotNull('scheduled_at') // Fixed: Added whereNotNull instead of incomplete where('scheduled_at')
            ->get()
            ->map(function ($activity) {
                $scheduledAt = $activity->scheduled_at; // Removed unnecessary fallback since we filter out null values
        
                return [
                    'id' => $activity->id,
                    'title' => $activity->type . ': ' . ($activity->candidate?->name ?? 'Unknown Candidate'),
                    'start' => $scheduledAt,
                    'end' => $scheduledAt, // Fixed: Proper 30-min duration calculation
                    'type' => $activity->type,
                    'client' => $activity->candidate?->company_name ?? $activity->candidate?->name ?? 'Unknown',
                    'contactId' => $activity->candidate_id,
                    'status' => $activity->is_completed ? 'completed' : 'pending',
                    'notes' => $activity->description,
                ];
            });
    
        $candidates = Candidate::select('id', 'name', 'company_name')
            ->where('owner_id', auth()->id())
            ->get();
    
        return Inertia::render('calendar', [ // Fixed: Capitalized component name (convention)
            'initialEvents' => $activities,
            'candidates' => $candidates,
        ]);
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
        $activity->load('candidate');

        $scheduledAt = $activity->scheduled_at ?? now();

        return response()->json([
            'id' => $activity->id,
            'title' => $activity->type . ': ' . ($activity->candidate->name ?? 'Unknown Candidate'),
            'start' => $scheduledAt->toIso8601String(),
            'end' => $scheduledAt->copy()->addMinutes(30)->toIso8601String(),
            'type' => $activity->type,
            'client' => $activity->candidate->company_name ?? $activity->candidate->name ?? 'Unknown',
            'contactId' => $activity->candidate_id,
            'status' => $activity->is_completed ? 'completed' : 'pending',
            'notes' => $activity->description,
        ]);
    }

    public function update(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|exists:candidates,id',
            'type' => 'required|in:call,meeting,email,task,note',
            'description' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
            'is_completed' => 'boolean'
        ]);

        $activity->update($validated);
        $activity->load('candidate');

        $scheduledAt = $activity->scheduled_at ?? now();

        return response()->json([
            'id' => $activity->id,
            'title' => $activity->type . ': ' . ($activity->candidate->name ?? 'Unknown Candidate'),
            'start' => $scheduledAt->toIso8601String(),
            'end' => $scheduledAt->copy()->addMinutes(30)->toIso8601String(),
            'type' => $activity->type,
            'client' => $activity->candidate->company_name ?? $activity->candidate->name ?? 'Unknown',
            'contactId' => $activity->candidate_id,
            'status' => $activity->is_completed ? 'completed' : 'pending',
            'notes' => $activity->description,
        ]);
    }

    public function destroy(Activity $activity)
    {
        $activity->delete();
        return response()->json(['message' => 'Activity deleted successfully']);
    }

    public function dragUpdate(Request $request, Activity $activity)
    {
        $validated = $request->validate([
            'scheduled_at' => 'required|date'
        ]);

        $activity->update(['scheduled_at' => $validated['scheduled_at']]);
        $activity->load('candidate');

        $scheduledAt = $activity->scheduled_at ?? now();

        return response()->json([
            'id' => $activity->id,
            'title' => $activity->type . ': ' . ($activity->candidate->name ?? 'Unknown Candidate'),
            'start' => $scheduledAt->toIso8601String(),
            'end' => $scheduledAt->copy()->addMinutes(30)->toIso8601String(),
            'type' => $activity->type,
            'client' => $activity->candidate->company_name ?? $activity->candidate->name ?? 'Unknown',
            'contactId' => $activity->candidate_id,
            'status' => $activity->is_completed ? 'completed' : 'pending',
            'notes' => $activity->description,
        ]);
    }
}