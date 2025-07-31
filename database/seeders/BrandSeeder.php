<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        Brand::create([
            'name' => 'Test Brand 1',
            'email' => 'test1@example.com',
            'phone' => '1234567890',
            'address' => 'Test Address 1'
        ]);

        Brand::create([
            'name' => 'Test Brand 2',
            'email' => 'test2@example.com',
            'phone' => '0987654321',
            'address' => 'Test Address 2'
        ]);
    }
} 