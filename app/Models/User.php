<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable,HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'calcom_url', // Add this line
        'default_pipeline_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's default pipeline.
     */
    public function defaultPipeline()
    {
        return $this->belongsTo(Pipeline::class, 'default_pipeline_id');
    }


    /**
     * Get the HR records created by this user.
     */
    public function hrs()
    {
        return $this->hasMany(Hr::class);
    }

    /**
     * Get the positions created by this user.
     */
    public function positions()
    {
        return $this->hasMany(Position::class);
    }

    /**
     * Get the deals created by this user.
     */
    public function deals()
    {
        return $this->hasMany(Deal::class);
    }
}
