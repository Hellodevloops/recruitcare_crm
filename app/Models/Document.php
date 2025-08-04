<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
class Document extends Model
{

    use LogsActivity;
    protected $fillable = ['candidate_id', 'path', 'name', 'type', 'document_type'];
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
               'candidate_id', 'file_path', 'name', 'type'
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Note was {$eventName}");
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