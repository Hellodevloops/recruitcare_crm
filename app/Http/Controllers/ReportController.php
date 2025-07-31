<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Candidate;
use App\Models\Activity;
use App\Models\Note;
use App\Models\Deal;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Spatie\Activitylog\Models\Activity as ActivityLog;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    
    
    
    public function index()
{

    if (!Auth::user()->can('view Reports')) {
        return Inertia::render('Unauthorized', [
            'message' => 'You do not have permission to view user reports.',
            'returnUrl' => route('dashboard'),
        ]);
    }

    $users = User::select('id', 'name')->get();
    // dd(Auth::user()->can('view Reports'));
    // Check if the user has permission to view reports
    // abort_unless(Auth::user()->can('view Reports'), 403);
    return Inertia::render('UserReport', [
        
        'users' => $users,
        'reportData' => [],
    ]);
}


    public function getUserReport(Request $request, $userId)
    {
        // Determine date range based on filter
        $dateFilter = $request->input('date_filter', 'today');
        $fromDate = null;
        $toDate = null;

        if ($dateFilter === 'custom') {
            $fromDate = Carbon::parse($request->input('from_date'))->startOfDay();
            $toDate = Carbon::parse($request->input('to_date'))->endOfDay();
        } else {
            switch ($dateFilter) {
                case 'today':
                    $fromDate = Carbon::today();
                    $toDate = Carbon::today()->endOfDay();
                    break;
                case 'week':
                    $fromDate = Carbon::now()->startOfWeek();
                    $toDate = Carbon::now()->endOfWeek();
                    break;
                case 'month':
                    $fromDate = Carbon::now()->startOfMonth();
                    $toDate = Carbon::now()->endOfMonth();
                    break;
                default:
                    $fromDate = Carbon::today();
                    $toDate = Carbon::today()->endOfDay();
            }
        }

        // Get candidates with changes tracking
        $candidates = Candidate::where('owner_id', $userId)
            ->where(function ($query) use ($fromDate, $toDate) {
                $query->whereBetween('created_at', [$fromDate, $toDate])
                      ->orWhereBetween('updated_at', [$fromDate, $toDate]);
            })
            ->get();

        // Get activity logs for candidates
        $candidateIds = $candidates->pluck('id')->toArray();
        $candidateLogs = ActivityLog::where('causer_id', $userId)
            ->where('subject_type', Candidate::class)
            ->whereIn('subject_id', $candidateIds)
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->orderBy('created_at', 'desc')
            ->get();

        // Enhance candidates with activity logs
        $candidates = $candidates->map(function ($candidate) use ($candidateLogs) {
            $candidateActivityLogs = $candidateLogs->where('subject_id', $candidate->id);
            
            $changes = [];
            $activityHistory = [];
            
            foreach ($candidateActivityLogs as $log) {
                $properties = $log->properties->toArray();
                $eventChanges = [];
                
                if (isset($properties['attributes']) && isset($properties['old'])) {
                    foreach ($properties['attributes'] as $key => $newValue) {
                        if (isset($properties['old'][$key]) && $properties['old'][$key] !== $newValue) {
                            $eventChanges[$key] = [
                                'from' => $properties['old'][$key] ?: 'None',
                                'to' => $newValue ?: 'None'
                            ];
                        }
                    }
                }
                
                if (!empty($eventChanges)) {
                    $changes = array_merge($changes, $eventChanges);
                    
                    $activityHistory[] = [
                        'id' => $log->id,
                        'description' => $log->description,
                        'created_at' => $log->created_at,
                        'causer_name' => $log->causer ? $log->causer->name : 'System',
                        'changes' => $eventChanges
                    ];
                }
            }
            
            $candidate->changes = $changes;
            $candidate->activity_history = $activityHistory;
            
            return $candidate;
        });

        // Get activities
        $activities = Activity::whereIn('candidate_id', $candidateIds)
        ->whereBetween('activities.created_at', [$fromDate, $toDate]) // Specify table
        ->join('candidates', 'candidates.id', '=', 'activities.candidate_id')
        ->select('activities.*', 'candidates.name as candidate_name')
        ->get();
    

        // Get notes
        $notes = Note::whereIn('notes.candidate_id', $candidateIds)
        ->whereBetween('notes.created_at', [$fromDate, $toDate]) // Specify table
        ->join('candidates', 'candidates.id', '=', 'notes.candidate_id')
        ->select('notes.*', 'candidates.name as candidate_name')
        ->get();
    

        // Get deals
        $deals = Deal::whereIn('deals.candidate_id', $candidateIds)
        ->where(function ($query) use ($fromDate, $toDate) {
            $query->whereBetween('deals.created_at', [$fromDate, $toDate])
                  ->orWhereBetween('deals.updated_at', [$fromDate, $toDate]);
        })
        ->join('candidates', 'candidates.id', '=', 'deals.candidate_id')
        ->select('deals.*', 'candidates.name as candidate_name')
        ->get();
    

        // Get deal activity logs
        $dealIds = $deals->pluck('id')->toArray();
        $dealLogs = ActivityLog::where('causer_id', $userId)
            ->where('subject_type', Deal::class)
            ->whereIn('subject_id', $dealIds)
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->orderBy('created_at', 'desc')
            ->get();

        // Enhance deals with activity logs
        $deals = $deals->map(function ($deal) use ($dealLogs) {
            $dealActivityLogs = $dealLogs->where('subject_id', $deal->id);
            
            $changes = [];
            $activityHistory = [];
            
            foreach ($dealActivityLogs as $log) {
                $properties = $log->properties->toArray();
                $eventChanges = [];
                
                if (isset($properties['attributes']) && isset($properties['old'])) {
                    foreach ($properties['attributes'] as $key => $newValue) {
                        if (isset($properties['old'][$key]) && $properties['old'][$key] !== $newValue) {
                            // Format monetary values
                            if ($key === 'amount') {
                                $eventChanges[$key] = [
                                    'from' => '$' . number_format($properties['old'][$key], 2),
                                    'to' => '$' . number_format($newValue, 2)
                                ];
                            } 
                            // Format date values
                            elseif (strpos($key, 'date') !== false) {
                                $eventChanges[$key] = [
                                    'from' => $properties['old'][$key] ? Carbon::parse($properties['old'][$key])->format('M d, Y') : 'None',
                                    'to' => $newValue ? Carbon::parse($newValue)->format('M d, Y') : 'None'
                                ];
                            }
                            // Regular values
                            else {
                                $eventChanges[$key] = [
                                    'from' => $properties['old'][$key] ?: 'None',
                                    'to' => $newValue ?: 'None'
                                ];
                            }
                        }
                    }
                }
                
                if (!empty($eventChanges)) {
                    $changes = array_merge($changes, $eventChanges);
                    
                    $activityHistory[] = [
                        'id' => $log->id,
                        'description' => $log->description,
                        'created_at' => $log->created_at,
                        'causer_name' => $log->causer ? $log->causer->name : 'System',
                        'changes' => $eventChanges
                    ];
                }
            }
            
            $deal->changes = $changes;
            $deal->activity_history = $activityHistory;
            
            return $deal;
        });

        // Get user activity stats
        $stats = [
            // 'today_activities' => Activity::where('user_id', $userId)
            //     ->whereDate('created_at', Carbon::today())
            //     ->count(),
            // 'week_activities' => Activity::where('user_id', $userId)
            //     ->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            //     ->count(),
        ];

        // Get overall activity logs for this user in the specified period
        $activityLogs = ActivityLog::where('causer_id', $userId)
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($log) {
                $properties = $log->properties->toArray();
                $changes = [];
                
                if (isset($properties['attributes']) && isset($properties['old'])) {
                    foreach ($properties['attributes'] as $key => $newValue) {
                        if (isset($properties['old'][$key]) && $properties['old'][$key] !== $newValue) {
                            $changes[$key] = [
                                'from' => $properties['old'][$key] ?: 'None',
                                'to' => $newValue ?: 'None'
                            ];
                        }
                    }
                }
                
                // Get the related entity name if available
                $entityName = null;
                if ($log->subject) {
                    if (method_exists($log->subject, 'getName')) {
                        $entityName = $log->subject->getName();
                    } elseif (property_exists($log->subject, 'name')) {
                        $entityName = $log->subject->name;
                    } elseif (property_exists($log->subject, 'title')) {
                        $entityName = $log->subject->title;
                    }
                }
                
                return [
                    'id' => $log->id,
                    'description' => $log->description,
                    'subject_type' => class_basename($log->subject_type),
                    'subject_id' => $log->subject_id,
                    'entity_name' => $entityName,
                    'created_at' => $log->created_at,
                    'changes' => $changes
                ];
            });

        return response()->json(compact('candidates', 'activities', 'notes', 'deals', 'stats', 'activityLogs'));
    }

    // Get detailed activity log for a specific entity
    public function getActivityLog(Request $request, $entityType, $entityId)
    {
        $model = $this->getModelClass($entityType);
        if (!$model) {
            return response()->json(['error' => 'Invalid entity type'], 400);
        }

        $logs = ActivityLog::where('subject_type', $model)
            ->where('subject_id', $entityId)
            ->orderBy('created_at', 'desc')
            ->get();

        $formattedLogs = $logs->map(function ($log) {
            $properties = $log->properties->toArray();
            $changes = [];
            
            if (isset($properties['attributes']) && isset($properties['old'])) {
                foreach ($properties['attributes'] as $key => $newValue) {
                    if (isset($properties['old'][$key]) && $properties['old'][$key] !== $newValue) {
                        $changes[$key] = [
                            'from' => $properties['old'][$key] ?: 'None',
                            'to' => $newValue ?: 'None'
                        ];
                    }
                }
            }
            
            return [
                'id' => $log->id,
                'description' => $log->description,
                'causer_id' => $log->causer_id,
                'causer_name' => $log->causer ? $log->causer->name : 'System',
                'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                'changes' => $changes
            ];
        });

        // Get entity details
        $entity = $model::find($entityId);
        $entityName = '';
        
        if ($entity) {
            if (method_exists($entity, 'getName')) {
                $entityName = $entity->getName();
            } elseif (property_exists($entity, 'name')) {
                $entityName = $entity->name;
            } elseif (property_exists($entity, 'title')) {
                $entityName = $entity->title;
            }
        }

        return response()->json([
            'logs' => $formattedLogs, 
            'entity' => [
                'id' => $entityId,
                'type' => class_basename($model),
                'name' => $entityName
            ]
        ]);
    }

    private function getModelClass($entityType)
    {
        switch ($entityType) {
            case 'candidates':
                return Candidate::class;
            case 'activities':
                return Activity::class;
            case 'notes':
                return Note::class;
            case 'deals':
                return Deal::class;
            default:
                return null;
        }
    }
    
    // Get all activity logs for a user
    public function getUserActivityLogs(Request $request, $userId)
    {
        // Determine date range based on filter
        $dateFilter = $request->input('date_filter', 'today');
        $fromDate = null;
        $toDate = null;

        if ($dateFilter === 'custom') {
            $fromDate = Carbon::parse($request->input('from_date'))->startOfDay();
            $toDate = Carbon::parse($request->input('to_date'))->endOfDay();
        } else {
            switch ($dateFilter) {
                case 'today':
                    $fromDate = Carbon::today();
                    $toDate = Carbon::today()->endOfDay();
                    break;
                case 'week':
                    $fromDate = Carbon::now()->startOfWeek();
                    $toDate = Carbon::now()->endOfWeek();
                    break;
                case 'month':
                    $fromDate = Carbon::now()->startOfMonth();
                    $toDate = Carbon::now()->endOfMonth();
                    break;
                default:
                    $fromDate = Carbon::today();
                    $toDate = Carbon::today()->endOfDay();
            }
        }
        
        $logs = ActivityLog::where('causer_id', $userId)
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->orderBy('created_at', 'desc')
            ->get();
            
        $formattedLogs = $logs->map(function ($log) {
            $properties = $log->properties->toArray();
            $changes = [];
            
            if (isset($properties['attributes']) && isset($properties['old'])) {
                foreach ($properties['attributes'] as $key => $newValue) {
                    if (isset($properties['old'][$key]) && $properties['old'][$key] !== $newValue) {
                        $changes[$key] = [
                            'from' => $properties['old'][$key] ?: 'None',
                            'to' => $newValue ?: 'None'
                        ];
                    }
                }
            }
            
            // Get the related entity name if available
            $entityName = null;
            if ($log->subject) {
                if (method_exists($log->subject, 'getName')) {
                    $entityName = $log->subject->getName();
                } elseif (property_exists($log->subject, 'name')) {
                    $entityName = $log->subject->name;
                } elseif (property_exists($log->subject, 'title')) {
                    $entityName = $log->subject->title;
                }
            }
            
            return [
                'id' => $log->id,
                'description' => $log->description,
                'subject_type' => class_basename($log->subject_type),
                'subject_id' => $log->subject_id,
                'entity_name' => $entityName,
                'causer_name' => $log->causer ? $log->causer->name : 'System',
                'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                'changes' => $changes
            ];
        });
        
        return response()->json(['logs' => $formattedLogs]);
    }
}