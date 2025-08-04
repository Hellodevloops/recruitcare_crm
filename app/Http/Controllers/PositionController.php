<?php

namespace App\Http\Controllers;

use App\Models\Position;
use App\Models\Brand;
use App\Models\Hr;
use App\Models\Candidate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Mail\SendCandidateInfoToHr;
use Illuminate\Support\Facades\Mail;

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
            'brand_id' => 'nullable|exists:brands,id',
            'hr_id' => 'nullable|exists:hr,id',
            'title' => 'required|string|max:255',
            'experience' => 'nullable|string|max:255',
            'store' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'budget' => 'nullable|numeric|min:0',
            'designation' => 'nullable|string|max:255',
        ]);

        // Convert empty strings to null for optional fields
        $data = array_map(function ($value) {
            return $value === '' ? null : $value;
        }, $validated);

        Position::create($data);

        return redirect()->route('positions.index')
            ->with('success', 'Position created successfully.');
    }

    public function show(Position $position)
    {
        $position->load([
            'brand',
            'hr',
            'candidate',
            'deals.candidate',
            'deals.brand',
            'deals.hr',
            'deals.pipeline',
            'deals.stage'
        ]);

        // Get related candidates from deals with same brand_id and hr_id
        $relatedCandidates = [];
        if ($position->brand_id) {
            $query = \App\Models\Deal::where('brand_id', $position->brand_id)
                ->whereNotNull('candidate_id')
                ->with(['candidate' => function($query) {
                    $query->select('id', 'name', 'email', 'phone', 'company_name', 'current_designation', 'experience', 'notice_period', 'status', 'current_ctc', 'expected_ctc', 'resume', 'created_at');
                }, 'candidate.documents']);
            
            // If hr_id is also available, filter by both
            if ($position->hr_id) {
                $query->where('hr_id', $position->hr_id);
            }
            
            $relatedCandidates = $query->get()
                ->pluck('candidate')
                ->filter() // Remove null candidates
                ->unique('id')
                ->values()
                ->map(function($candidate) {
                    // Ensure documents are properly loaded
                    if ($candidate->documents) {
                        $candidate->documents = $candidate->documents->filter(function($doc) {
                            return $doc->type === 'personal';
                        });
                    }
                    return $candidate;
                })
                ->toArray();
        }
        
        return Inertia::render('positions/Show', [
            'position' => $position,
            'relatedCandidates' => $relatedCandidates
        ]);
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
            'brand_id' => 'nullable|exists:brands,id',
            'hr_id' => 'nullable|exists:hr,id',
            'title' => 'required|string|max:255',
            'experience' => 'nullable|string|max:255',
            'store' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'budget' => 'nullable|numeric|min:0',
            'designation' => 'nullable|string|max:255',
        ]);

        // Convert empty strings to null for optional fields
        $data = array_map(function ($value) {
            return $value === '' ? null : $value;
        }, $validated);

        $position->update($data);

        return redirect()->route('positions.index')
            ->with('success', 'Position updated successfully.');
    }

    public function sendCandidateInfoToHr(Request $request, Position $position)
    {
        $request->validate([
            'candidate_id' => 'required|exists:candidates,id',
            'hr_email' => 'required|email'
        ]);

        try {
            $candidate = Candidate::with('documents')->findOrFail($request->candidate_id);
            
            // Send email to HR
            Mail::to($request->hr_email)->send(new SendCandidateInfoToHr($candidate, $position, $request->hr_email));

            return back()->with('success', 'Candidate information sent successfully to ' . $request->hr_email);

        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send email: ' . $e->getMessage());
        }
    }

    public function sendMultipleCandidatesInfoToHr(Request $request, Position $position)
    {
        $request->validate([
            'candidate_ids' => 'required|array',
            'candidate_ids.*' => 'exists:candidates,id',
            'hr_email' => 'required|email'
        ]);

        try {
            $candidates = Candidate::with('documents')->whereIn('id', $request->candidate_ids)->get();
            
            if ($candidates->isEmpty()) {
                return back()->with('error', 'No valid candidates found');
            }

            // Send email to HR with multiple candidates
            Mail::to($request->hr_email)->send(new SendCandidateInfoToHr($candidates, $position, $request->hr_email));

            $candidateCount = $candidates->count();
            return back()->with('success', "Information for {$candidateCount} candidate(s) sent successfully to " . $request->hr_email);

        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send email: ' . $e->getMessage());
        }
    }

    public function destroy(Position $position)
    {
        $position->delete();
        return redirect()->route('positions.index')->with('success', 'Position deleted successfully');
    }
} 