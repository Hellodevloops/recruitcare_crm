<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Activity extends Model
{
    use LogsActivity;
    protected $fillable = ['candidate_id', 'type', 'description','scheduled_at','is_completed'];


    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'candidate_id', 'type', 'description','scheduled_at','is_completed'
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Activity was {$eventName}");
    }

    public function activityLogs()
    {
        return $this->morphMany(\Spatie\Activitylog\Models\Activity::class, 'subject');
    }
    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }
}