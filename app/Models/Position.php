<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand_id',
        'hr_id',
        'title',
        'experience',
        'store',
        'city',
        'budget',
        'designation',
        'candidate_id',
        'user_id'
    ];

    protected $casts = [
        'budget' => 'decimal:2',
    ];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function hr()
    {
        return $this->belongsTo(Hr::class);
    }

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }

    public function deals()
    {
        return $this->hasMany(Deal::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
