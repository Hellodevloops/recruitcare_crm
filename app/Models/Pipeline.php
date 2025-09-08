<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pipeline extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'interview_date',
        'candidate_id',
        'hr_id',
        'brand_id',
        'interview_rounds',
        'feedback',
    ];

    protected $casts = [
        'interview_rounds' => 'array',
        'interview_date' => 'date',
    ];

    public function stages(): HasMany
    {
        return $this->hasMany(Stage::class);
    }
    public function deals()
    {
        return $this->hasMany(Deal::class);
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }

    public function hr(): BelongsTo
    {
        return $this->belongsTo(Hr::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }
}