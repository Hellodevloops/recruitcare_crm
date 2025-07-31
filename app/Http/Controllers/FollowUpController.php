<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Candidate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class FollowUpController extends Controller
{
    /**
     * Display a listing of follow-ups.
     */
    public function index(Request $request)
    {
        // Validate incoming request filters
        $filters = $request->validate([
            'type' => 'nullable|string|in:call,meeting,email,task,note,all',
            'date_range' => 'nullable|string|in:today,this_week,upcoming,all',
            'status' => 'nullable|string|in:pending,completed,all',
            'specific_date' => 'nullable|date',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:5|max:100',
        ]);

        // Set defaults if not provided
        $filters['type'] = $filters['type'] ?? 'all';
        $filters['date_range'] = $filters['date_range'] ?? 'upcoming';
        $filters['status'] = $filters['status'] ?? 'pending';
        $filters['specific_date'] = $filters['specific_date'] ?? null;
        $filters['per_page'] = $filters['per_page'] ?? 10;

        // Build the query with eager loading
        $query = Activity::with(['candidate'])
            ->whereNotNull('scheduled_at')
            ->whereHas('candidate', function ($query) {
                $query->where('owner_id', auth()->id());
            })
            ->orderBy('scheduled_at');

        // Apply type filter
        if ($filters['type'] !== 'all') {
            $query->where('type', $filters['type']);
        }

        // Apply status filter
        if ($filters['status'] !== 'all') {
            $query->where('is_completed', $filters['status'] === 'completed');
        }

        // Apply specific date filter
        if ($filters['specific_date']) {
            $query->whereDate('scheduled_at', Carbon::parse($filters['specific_date']));
        } else {
            // Apply date range filter only if specific_date is not set
            switch ($filters['date_range']) {
                case 'today':
                    $query->whereDate('scheduled_at', Carbon::today());
                    break;
                case 'this_week':
                    $query->whereBetween('scheduled_at', [
                        Carbon::now()->startOfWeek(),
                        Carbon::now()->endOfWeek()
                    ]);
                    break;
                case 'upcoming':
                    $query->where('scheduled_at', '>=', Carbon::now());
                    break;
                    // 'all' doesn't need any additional filter
            }
        }

        // Execute query with pagination
        $followUps = $query->paginate($filters['per_page'])->withQueryString();

        // Get statistics for dashboard
        $stats = $this->getFollowUpStatistics();

        // Return Inertia view with data
        return Inertia::render('followups/index', [
            'followUps' => $followUps,
            'filters' => $filters,
            'stats' => $stats
        ]);
    }

    /**
     * Get statistics for the dashboard.
     *
     * @return array
     */
    private function getFollowUpStatistics()
    {
        return [
            'today' => Activity::whereDate('scheduled_at', Carbon::today())
                ->where('is_completed', false)
                ->whereHas('candidate', function ($query) {
                    $query->where('owner_id', auth()->id());
                })
                ->count(),

            'thisWeek' => Activity::whereBetween('scheduled_at', [
                Carbon::now()->startOfWeek(),
                Carbon::now()->endOfWeek()
            ])
                ->where('is_completed', false)
                ->whereHas('candidate', function ($query) {
                    $query->where('owner_id', auth()->id());
                })
                ->count(),

            'totalPending' => Activity::where('is_completed', false)
                ->whereNotNull('scheduled_at')
                ->whereHas('candidate', function ($query) {
                    $query->where('owner_id', auth()->id());
                })
                ->count(),

            'byType' => Activity::whereNotNull('scheduled_at')
                ->whereHas('candidate', function ($query) {
                    $query->where('owner_id', auth()->id());
                })
                ->selectRaw('type, count(*) as count')
                ->groupBy('type')
                ->get(),

            'overdueCount' => Activity::where('scheduled_at', '<', Carbon::now())
                ->where('is_completed', false)
                ->whereHas('candidate', function ($query) {
                    $query->where('owner_id', auth()->id());
                })
                ->count()
        ];
    }

    /**
     * Show the form for creating a new follow-up.
     */
    public function create()
    {
        $candidate = Candidate::all();
        return Inertia::render('followups/create', [
            'candidates' => $candidate,
        ]);
    }

    /**
     * Store a newly created follow-up in database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'candidate_id' => 'required|exists:candidates,id',
            'type' => 'required|in:call,meeting,email,task,note',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date',
        ]);

        $activity = Activity::create($validated);

        return redirect()->route('followups.index')
            ->with('success', 'Follow-up scheduled successfully.');
    }

    /**
     * Display the specified follow-up.
     */
    public function show(Activity $followup)
    {
        return Inertia::render('FollowUps/Show', [
            'followUp' => $followup->load('candidate')
        ]);
    }

    /**
     * Show the form for editing the specified follow-up.
     */
    public function edit(Activity $followup)
    {
        return Inertia::render('followups/edit', [
            'followUp' => $followup->load('candidate')
        ]);
    }

    /**
     * Update the specified follow-up in storage.
     */
    public function update(Request $request, Activity $followup)
    {
        $validated = $request->validate([
            'type' => 'required|in:call,meeting,email,task,note',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date',
            'is_completed' => 'boolean',
        ]);

        $followup->update($validated);

        return redirect()->route('followups.index')
            ->with('success', 'Follow-up updated successfully.');
    }

    /**
     * Mark a follow-up as completed.
     */
    public function complete(Activity $followup)
    {
        $followup->update(['is_completed' => true]);

        return redirect()->back()
            ->with('success', 'Follow-up marked as completed.');
    }

    /**
     * Remove the specified follow-up from storage.
     */
    public function destroy(Activity $followup)
    {
        $followup->delete();

        return redirect()->route('followups.index')
            ->with('success', 'Follow-up deleted successfully.');
    }
}
