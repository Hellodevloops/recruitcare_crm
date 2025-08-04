<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Candidate extends Model
{
    use HasFactory,LogsActivity;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'company_name',
        'current_designation',
        'experience',
        'notice_period',
        'designations',
        'status',
        'current_ctc',
        'expected_ctc',
        'resume',
        'documents',
        'owner_id',
    ];

    protected $casts = [
        'documents' => 'array',
        'designations' => 'array',
    ];
    public function deals()
    {
        return $this->hasMany(Deal::class);
    }

    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function positions()
    {
        return $this->hasMany(Position::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name', 'email', 'phone', 'company_name', 'status', 'owner_id'
            ])
            ->logOnlyDirty() // Only log changed attributes
            ->dontSubmitEmptyLogs() // Don't create log entries when nothing changed
            ->setDescriptionForEvent(fn(string $eventName) => "Candidate was {$eventName}");
    }

    public function activityLogs()
    {
        return $this->morphMany(\Spatie\Activitylog\Models\Activity::class, 'subject');
    }
} 