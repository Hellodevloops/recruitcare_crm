<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Clear cached permissions
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        // Define all permissions
        $permissions = [
            'view leads',
            'create leads',
            'edit leads',
            'delete leads',
            'manage roles',
            'manage permissions',
            'view dashboard',
            'view Reports',
            'view users',
            'view roles',
        ];

        // Create or update permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create or update admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions($permissions);

        // Create or update admin user
        $adminUser = User::updateOrCreate(
            ['email' => 'surajtiwari6636@gmail.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('surajtiwari6636@gmail.com'), // Password: admin123
            ]
        );

        // Assign admin role to user
        $adminUser->syncRoles(['admin']);

        // Output success message
        $this->command->info('Admin user created/updated with email: surajtiwari6636@gmail.com and password: surajtiwari6636@gmail.com');
    }
}