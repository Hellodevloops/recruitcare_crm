<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Models\Activity;
use App\Models\Activity as CustomActivity;
use App\Models\Deal;
use Illuminate\Support\Facades\Storage;
use App\Models\Position;

class CandidateController extends Controller
{
    public function index(Request $request)
{
    $search = $request->query('search', '');
    $date = $request->query('date');
    $owner_id = $request->query('owner_id');
    $state = $request->query('state');
    $month = $request->query('month');
    $created_at = $request->query('created_at');
    $updated_at = $request->query('updated_at');
    $per_page = $request->query('per_page', 10);

    $query = Candidate::with(['owner'])
        ->where('owner_id', Auth::id());

    // Search filter
    if (strlen($search) >= 3) {
        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('company_name', 'like', "%{$search}%");
        });
    }

    // Date filter
    if ($date) {
        $query->whereDate('created_at', $date);
    }

    // Owner filter (if you want to allow filtering by different owners)
    if ($owner_id) {
        $query->where('owner_id', $owner_id);
    }

    // State filter
    if ($state && $state !== 'all') {
        $query->where('state', $state);
    }

    // Month filter
    if ($month && $month !== 'all') {
        $query->whereMonth('created_at', $month);
    }

    // Created at filter
    if ($created_at) {
        $query->whereDate('created_at', '>=', $created_at);
    }

    // Updated at filter
    if ($updated_at) {
        $query->whereDate('updated_at', '>=', $updated_at);
    }

    $candidates = $query->latest()
        ->paginate($per_page)
        ->appends([
            'search' => $search,
            'date' => $date,
            'owner_id' => $owner_id,
            'state' => $state,
            'month' => $month,
            'created_at' => $created_at,
            'updated_at' => $updated_at,
            'per_page' => $per_page
        ]);

    return Inertia::render('candidates/Index', [
        'candidates' => $candidates,
        'filters' => [
            'search' => $search,
            'date' => $date,
            'owner_id' => $owner_id,
            'state' => $state,
            'month' => $month,
            'created_at' => $created_at,
            'updated_at' => $updated_at,
            'per_page' => $per_page
        ],
    ]);
}
public function show(Candidate $candidate)
{
    $candidate->load(['deals.brand', 'deals.position', 'deals.hr', 'deals.pipeline', 'deals.stage', 'activities', 'notes', 'documents', 'positions', 'owner']);
    
    return Inertia::render('candidates/Show', [
        'candidate' => $candidate,
    ]);
}

public function getCandidateData(Candidate $candidate)
{
    $candidate->load(['deals.brand', 'deals.position', 'deals.hr', 'deals.pipeline', 'deals.stage', 'activities', 'notes', 'documents', 'positions', 'owner']);
    
    return response()->json([
        'candidate' => $candidate,
    ]);
}
public function logs(Candidate $candidate)
{
    // Uncomment if authorization is needed
    // $this->authorize('view', $candidate);

    // Eager load the owner to avoid N+1 issues
    $candidate->load('owner');

    // Fetch Spatie Activity Logs
    $spatieLogs = Activity::where('subject_type', Candidate::class)
        ->where('subject_id', $candidate->id)
        ->with('causer')
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($activity) {
            return [
                'id' => $activity->id,
                'description' => $activity->description ?? 'Activity recorded',
                'subject_type' => $activity->subject_type,
                'subject_id' => $activity->subject_id,
                'causer_id' => $activity->causer_id,
                'causer' => $activity->causer ? ['name' => $activity->causer->name] : null,
                'created_at' => $activity->created_at->toIso8601String(),
                'properties' => $activity->properties->toArray(),
                'source' => 'spatie',
            ];
        });

    // Fetch Custom Activity Logs
    $customLogs = CustomActivity::where('candidate_id', $candidate->id)
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($activity) use ($candidate) {
            return [
                'id' => $activity->id,
                'description' => $activity->description ?? 'Custom activity recorded',
                'subject_type' => CustomActivity::class,
                'subject_id' => $activity->id,
                'causer_id' => $candidate->owner_id,
                'causer' => $candidate->owner ? ['name' => $candidate->owner->name] : null,
                'created_at' => $activity->created_at->toIso8601String(),
                'properties' => $activity->attributesToArray(),
                'source' => 'custom',
            ];
        });

    // Fetch Deal Logs with pipeline and stage
    $dealLogs = Deal::where('candidate_id', $candidate->id)
        ->with(['pipeline', 'stage'])
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($deal) use ($candidate) {
            return [
                'id' => $deal->id,
                'description' => "Deal '{$deal->title}' was created",
                'subject_type' => Deal::class,
                'subject_id' => $deal->id,
                'causer_id' => $candidate->owner_id,
                'causer' => $candidate->owner ? ['name' => $candidate->owner->name] : null,
                'created_at' => $deal->created_at->toIso8601String(),
                'properties' => [
                    'deal_title' => $deal->title,
                    'deal_amount' => $deal->amount,
                    'pipeline_name' => $deal->pipeline->name ?? 'Unknown Pipeline',
                    'stage_name' => $deal->stage->name ?? 'Unknown Stage',
                ],
                'source' => 'deal',
            ];
        });

    // Combine all logs and sort by created_at
    $allLogs = collect([$spatieLogs, $customLogs, $dealLogs])
        ->flatten(1)
        ->sortByDesc('created_at')
        ->values();

    return response()->json($allLogs);
}

    public function getCandidatesData()
    {
        $candidates = Candidate::where('owner_id', auth()->id())
            ->select('id', 'name', 'email', 'phone', 'company_name')
            ->orderBy('name')
            ->get();
        
        return response()->json($candidates);
    }

    public function create()
    {
        return Inertia::render('candidates/Create');
    }

    public function edit(Candidate $candidate)
{
    $candidate->load(['positions', 'owner']);
    
    return Inertia::render('candidates/Edit', [
        'candidate' => $candidate,
    ]);
}

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:candidates,email',
            'phone' => 'required|string|max:20|unique:candidates,phone',
            'company_name' => 'nullable|string|max:255',
            'designations' => 'nullable|array',
            'designations.*.title' => 'required|string|max:255',
            'designations.*.company' => 'nullable|string|max:255',
            'designations.*.description' => 'nullable|string',
            'designations.*.start_date' => 'nullable|date',
            'designations.*.end_date' => 'nullable|date',
            'designations.*.is_current' => 'nullable|boolean',
            'status' => 'nullable|string|max:50',
            'current_ctc' => 'nullable|numeric|min:0|max:99999999.99',
            'expected_ctc' => 'nullable|numeric|min:0|max:99999999.99',
            'resume' => 'nullable|file|mimes:pdf|max:2048',
            'documents.*' => 'nullable|file|mimes:pdf,doc,docx,txt,jpg,jpeg,png|max:2048',
        ]);

        // Handle resume upload
        if ($request->hasFile('resume')) {
            $data['resume'] = $request->file('resume')->store('resumes', 'public');
        }

        // Handle documents upload
        $documents = [];
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $document) {
                $path = $document->store('documents', 'public');
                $documents[] = [
                    'name' => $document->getClientOriginalName(),
                    'path' => $path,
                    'size' => $document->getSize(),
                    'type' => $document->getMimeType(),
                ];
            }
        }
        $data['documents'] = $documents;

        // Set the owner_id to the currently authenticated user
        $data['owner_id'] = auth()->id();

        // Clean and format phone number
        if (isset($data['phone'])) {
            $data['phone'] = preg_replace('/[^0-9+]/', '', $data['phone']);
        }

        // Handle designations - store as array with work experience data
        if ($request->has('designations')) {
            $data['designations'] = array_filter($request->designations, function($designation) {
                return !empty($designation['title']); // Only keep designations with titles
            });
        }

        $candidate = Candidate::create($data);

        return redirect()->route('candidates.index')
            ->with('success', 'Candidate created successfully.');
    }

    public function update(Request $request, Candidate $candidate)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:candidates,email,' . $candidate->id,
            'phone' => 'required|string|max:20|unique:candidates,phone,' . $candidate->id,
            'company_name' => 'nullable|string|max:255',
            'designations' => 'nullable|array',
            'designations.*.title' => 'required|string|max:255',
            'designations.*.company' => 'nullable|string|max:255',
            'designations.*.description' => 'nullable|string',
            'designations.*.start_date' => 'nullable|date',
            'designations.*.end_date' => 'nullable|date',
            'designations.*.is_current' => 'nullable|boolean',
            'status' => 'nullable|string|max:50',
            'current_ctc' => 'nullable|numeric|min:0|max:99999999.99',
            'expected_ctc' => 'nullable|numeric|min:0|max:99999999.99',
            'resume' => 'nullable|file|mimes:pdf|max:2048',
            'documents.*' => 'nullable|file|mimes:pdf,doc,docx,txt,jpg,jpeg,png|max:2048',
        ]);

        // Handle resume upload
        if ($request->hasFile('resume')) {
            // Delete old resume if exists
            if ($candidate->resume) {
                Storage::disk('public')->delete($candidate->resume);
            }
            $data['resume'] = $request->file('resume')->store('resumes', 'public');
        }

        // Handle documents upload
        $documents = $candidate->documents ?? [];
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $document) {
                $path = $document->store('documents', 'public');
                $documents[] = [
                    'name' => $document->getClientOriginalName(),
                    'path' => $path,
                    'size' => $document->getSize(),
                    'type' => $document->getMimeType(),
                ];
            }
        }
        $data['documents'] = $documents;

        // Clean and format phone number
        if (isset($data['phone'])) {
            $data['phone'] = preg_replace('/[^0-9+]/', '', $data['phone']);
        }

        // Handle designations - store as array with work experience data
        if ($request->has('designations')) {
            $data['designations'] = array_filter($request->designations, function($designation) {
                return !empty($designation['title']); // Only keep designations with titles
            });
        }

        $candidate->update($data);

        return redirect()->route('candidates.show', $candidate)
            ->with('success', 'Candidate updated successfully.');
    }

    public function destroy(Candidate $candidate)
    {
        // $this->authorize('delete', $candidate);
        
        $candidate->delete();

        return redirect()->route('candidates.index')->with('success', 'Candidate deleted successfully');
    }

    public function updateStatus(Request $request, Candidate $candidate)
    {
        $validated = $request->validate([
            'status' => 'required|in:interested,not_interested,dnd,followup',
        ]);

        $candidate->update($validated);

        return response()->json($candidate);
    }

    public function checkPhone(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|max:20',
        ]);

        $phone = $request->phone;
        
        // Clean and format phone number (remove spaces, dashes, etc.)
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        
        // Check if candidate with this phone number exists
        $candidate = Candidate::where('phone', $phone)->with('owner')->first();
        
        if ($candidate) {
            return response()->json([
                'exists' => true,
                'candidate_id' => $candidate->id,
                'candidate' => [
                    'id' => $candidate->id,
                    'name' => $candidate->name,
                    'email' => $candidate->email,
                    'phone' => $candidate->phone,
                    'company_name' => $candidate->company_name,
                    'status' => $candidate->status,
                    'owner' => $candidate->owner ? [
                        'id' => $candidate->owner->id,
                        'name' => $candidate->owner->name
                    ] : null,
                    'created_at' => $candidate->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $candidate->updated_at->format('Y-m-d H:i:s')
                ],
                'message' => 'Candidate with this phone number already exists.'
            ]);
        }
        
        return response()->json([
            'exists' => false,
            'message' => 'Phone number is available for new candidate.'
        ]);
    }
}