<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use App\Models\Brand;
use App\Models\Hr;
use App\Models\Position;
use App\Models\Deal;

return new class extends Migration
{
    public function up()
    {
        // Get the first user or create a default one
        $user = User::first();
        
        if (!$user) {
            $user = User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        // Update existing HR records
        Hr::whereNull('user_id')->update(['user_id' => $user->id]);

        // Update existing positions
        Position::whereNull('user_id')->update(['user_id' => $user->id]);

        // Update existing deals
        Deal::whereNull('user_id')->update(['user_id' => $user->id]);
    }

    public function down()
    {
        // This migration doesn't need a down method as it's just updating existing data
    }
};
