<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        // Get the first user or create a default one
        $user = \App\Models\User::first();
        
        if (!$user) {
            $user = \App\Models\User::create([
                'name' => 'Admin User',
                'email' => 'admin@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        Brand::create([
            'name' => 'Test Brand 1',
            'email' => 'test1@example.com',
            'phone' => '1234567890',
            'address' => 'Test Address 1',
            'user_id' => $user->id
        ]);

        Brand::create([
            'name' => 'Test Brand 2',
            'email' => 'test2@example.com',
            'phone' => '0987654321',
            'address' => 'Test Address 2',
            'user_id' => $user->id
        ]);
    }
} 