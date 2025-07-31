<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Deal extends Model
{
    use LogsActivity;
    
    protected $fillable = [
        'candidate_id',
        'brand_id',
        'position_id',
        'pipeline_id',
        'stage_id',
        'title',
        'amount',
        'status',
        'priority',
        'due_date',
        'tags'
    ];

    protected $casts = [
        'tags' => 'array',
        'due_date' => 'date',
        'amount' => 'decimal:2'
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'candidate_id',
                'brand_id',
                'position_id',
                'pipeline_id',
                'stage_id',
                'title',
                'amount',
                'status',
                'priority',
                'due_date',
                'tags'
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Deal was {$eventName}");
    }

    public function activityLogs()
    {
        return $this->morphMany(\Spatie\Activitylog\Models\Activity::class, 'subject');
    }

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function pipeline()
    {
        return $this->belongsTo(Pipeline::class);
    }

    public function stage()
    {
        return $this->belongsTo(Stage::class);
    }
}