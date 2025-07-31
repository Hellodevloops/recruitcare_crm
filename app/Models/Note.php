<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    protected $fillable = ['candidate_id', 'content'];

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }
}