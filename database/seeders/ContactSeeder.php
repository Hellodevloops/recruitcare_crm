<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class CandidateSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        
        for ($i = 0; $i < 20; $i++) {
            DB::table('candidates')->insert([
                'name' => $faker->name,
                'phone' => $faker->phoneNumber,
                'email' => $faker->unique()->safeEmail,
                'website' => $faker->optional()->url,
                'city' => $faker->city,
                'state' => $faker->state,
                'country' => $faker->country,
                'company_name' => $faker->company,
                'owner_id' => 1, // Change this according to existing user ID
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
