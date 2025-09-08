<?php

namespace App\Http\Controllers;

use App\Models\Pipeline;
use App\Models\Candidate;
use App\Models\Hr;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PipelineController extends Controller
{
    public function index()
    {
        $pipelines = Pipeline::with(['stages', 'candidate', 'hr', 'brand'])->latest()->paginate(10);

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
            'pipeline' => $pipeline->load(['stages', 'candidate', 'hr', 'brand']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'interview_date' => 'nullable|date',
            'candidate_id' => 'nullable|exists:candidates,id',
            'hr_id' => 'nullable|exists:hr,id',
            'brand_id' => 'nullable|exists:brands,id',
            'interview_rounds' => 'nullable|array',
            'interview_rounds.*' => 'string|max:255',
            'feedback' => 'nullable|string',
            'selected_stages' => 'nullable|array',
            'selected_stages.*' => 'string|max:255',
        ]);

        $pipeline = Pipeline::create($validated);

        // Create stages based on selection and auto-populate interview rounds
        if (!empty($validated['selected_stages'])) {
            $allInterviewRounds = [];
            
            $stages = array_map(function($stageName, $index) use (&$allInterviewRounds) {
                // Find the stage template to get interview rounds
                $stageRounds = [];
                foreach ($this->getStageTemplates() as $template) {
                    foreach ($template as $stage) {
                        if ($stage['name'] === $stageName && isset($stage['interview_rounds'])) {
                            $stageRounds = $stage['interview_rounds'];
                            break 2;
                        }
                    }
                }
                
                // Add stage rounds to the main interview rounds
                $allInterviewRounds = array_merge($allInterviewRounds, $stageRounds);
                
                return [
                    'name' => $stageName,
                    'order' => $index + 1
                ];
            }, $validated['selected_stages'], array_keys($validated['selected_stages']));
            
            $pipeline->stages()->createMany($stages);
            
            // Auto-populate interview rounds from stages if not manually set
            if (empty($validated['interview_rounds']) && !empty($allInterviewRounds)) {
                $pipeline->update(['interview_rounds' => $allInterviewRounds]);
            }
        } else {
            // Create default stages if none selected
            $pipeline->stages()->createMany([
                ['name' => 'Prospect', 'order' => 1],
                ['name' => 'Negotiation', 'order' => 2],
                ['name' => 'Closed', 'order' => 3],
            ]);
        }

        return redirect()->route('pipelines.index')->with('success', 'Pipeline created successfully');
    }

    public function update(Request $request, Pipeline $pipeline)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'interview_date' => 'nullable|date',
            'candidate_id' => 'nullable|exists:candidates,id',
            'hr_id' => 'nullable|exists:hr,id',
            'brand_id' => 'nullable|exists:brands,id',
            'interview_rounds' => 'nullable|array',
            'interview_rounds.*' => 'string|max:255',
            'feedback' => 'nullable|string',
            'stages' => 'nullable|array',
            'stages.*.id' => 'required|exists:stages,id',
            'stages.*.name' => 'required|string|max:255',
        ]);

        $pipeline->update($validated);

        // Update stages if provided
        if (isset($validated['stages'])) {
            foreach ($validated['stages'] as $stageData) {
                $stage = $pipeline->stages()->find($stageData['id']);
                if ($stage) {
                    $stage->update(['name' => $stageData['name']]);
                }
            }
        }

        return redirect()->route('pipelines.show', $pipeline)->with('success', 'Pipeline updated successfully');
    }

    public function destroy(Pipeline $pipeline)
    {
        $pipeline->delete();

        return redirect()->route('pipelines.index')->with('success', 'Pipeline deleted successfully');
    }

    public function getFormData()
    {
        $candidates = Candidate::where('owner_id', auth()->id())->get(['id', 'name']);
        $hrs = Hr::with('brand')->get(['id', 'name', 'brand_id']);
        $brands = Brand::get(['id', 'name']);

        // Predefined stage templates with interview rounds
        $stageTemplates = [
            'default' => [
                ['name' => 'Prospect', 'interview_rounds' => ['Initial Contact', 'Qualification']],
                ['name' => 'Negotiation', 'interview_rounds' => ['Proposal Discussion', 'Terms Negotiation']],
                ['name' => 'Closed', 'interview_rounds' => ['Final Review', 'Contract Signing']],
            ],
            'interview' => [
                ['name' => 'Application', 'interview_rounds' => ['Resume Review', 'Initial Screening']],
                ['name' => '1st Round Interview', 'interview_rounds' => ['Technical Assessment', 'HR Interview']],
                ['name' => '2nd Round Interview', 'interview_rounds' => ['Manager Interview', 'Team Fit Assessment']],
                ['name' => 'Final Interview', 'interview_rounds' => ['Final Panel Interview', 'Leadership Interview']],
                ['name' => 'Offer', 'interview_rounds' => ['Salary Discussion', 'Benefits Review']],
                ['name' => 'Hired', 'interview_rounds' => ['Onboarding', 'Welcome Session']],
            ],
            'sales' => [
                ['name' => 'Lead', 'interview_rounds' => ['Lead Qualification', 'Initial Contact']],
                ['name' => 'Qualified', 'interview_rounds' => ['Needs Assessment', 'Budget Verification']],
                ['name' => 'Proposal', 'interview_rounds' => ['Solution Presentation', 'Proposal Review']],
                ['name' => 'Negotiation', 'interview_rounds' => ['Price Negotiation', 'Terms Discussion']],
                ['name' => 'Closed Won', 'interview_rounds' => ['Contract Signing', 'Project Kickoff']],
                ['name' => 'Closed Lost', 'interview_rounds' => ['Loss Analysis', 'Follow-up Planning']],
            ],
            'recruitment' => [
                ['name' => 'Sourcing', 'interview_rounds' => ['Candidate Search', 'Initial Screening']],
                ['name' => 'Screening', 'interview_rounds' => ['Phone Interview', 'Skills Assessment']],
                ['name' => 'Interview', 'interview_rounds' => ['Technical Interview', 'Cultural Fit Interview']],
                ['name' => 'Reference Check', 'interview_rounds' => ['Reference Verification', 'Background Check']],
                ['name' => 'Offer', 'interview_rounds' => ['Offer Discussion', 'Negotiation']],
                ['name' => 'Onboarding', 'interview_rounds' => ['Welcome Process', 'Training Session']],
            ],
        ];

        return response()->json([
            'candidates' => $candidates,
            'hrs' => $hrs,
            'brands' => $brands,
            'stageTemplates' => $stageTemplates,
        ]);
    }

    private function getStageTemplates()
    {
        return [
            'default' => [
                ['name' => 'Prospect', 'interview_rounds' => ['Initial Contact', 'Qualification']],
                ['name' => 'Negotiation', 'interview_rounds' => ['Proposal Discussion', 'Terms Negotiation']],
                ['name' => 'Closed', 'interview_rounds' => ['Final Review', 'Contract Signing']],
            ],
            'interview' => [
                ['name' => 'Application', 'interview_rounds' => ['Resume Review', 'Initial Screening']],
                ['name' => '1st Round Interview', 'interview_rounds' => ['Technical Assessment', 'HR Interview']],
                ['name' => '2nd Round Interview', 'interview_rounds' => ['Manager Interview', 'Team Fit Assessment']],
                ['name' => 'Final Interview', 'interview_rounds' => ['Final Panel Interview', 'Leadership Interview']],
                ['name' => 'Offer', 'interview_rounds' => ['Salary Discussion', 'Benefits Review']],
                ['name' => 'Hired', 'interview_rounds' => ['Onboarding', 'Welcome Session']],
            ],
            'sales' => [
                ['name' => 'Lead', 'interview_rounds' => ['Lead Qualification', 'Initial Contact']],
                ['name' => 'Qualified', 'interview_rounds' => ['Needs Assessment', 'Budget Verification']],
                ['name' => 'Proposal', 'interview_rounds' => ['Solution Presentation', 'Proposal Review']],
                ['name' => 'Negotiation', 'interview_rounds' => ['Price Negotiation', 'Terms Discussion']],
                ['name' => 'Closed Won', 'interview_rounds' => ['Contract Signing', 'Project Kickoff']],
                ['name' => 'Closed Lost', 'interview_rounds' => ['Loss Analysis', 'Follow-up Planning']],
            ],
            'recruitment' => [
                ['name' => 'Sourcing', 'interview_rounds' => ['Candidate Search', 'Initial Screening']],
                ['name' => 'Screening', 'interview_rounds' => ['Phone Interview', 'Skills Assessment']],
                ['name' => 'Interview', 'interview_rounds' => ['Technical Interview', 'Cultural Fit Interview']],
                ['name' => 'Reference Check', 'interview_rounds' => ['Reference Verification', 'Background Check']],
                ['name' => 'Offer', 'interview_rounds' => ['Offer Discussion', 'Negotiation']],
                ['name' => 'Onboarding', 'interview_rounds' => ['Welcome Process', 'Training Session']],
            ],
        ];
    }
}