<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'view leads',
            'create leads',
            'edit leads',
            'delete leads',
            'manage-roles-and-permissions', // Single permission
            'view dashboard',
            'view Reports',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        $admin = Role::create(['name' => 'admin']);
        $admin->syncPermissions($permissions);

        $manager = Role::create(['name' => 'manager']);
        $manager->syncPermissions(['view leads', 'create leads', 'edit leads', 'view dashboard']);

        $sales = Role::create(['name' => 'sales']);
        $sales->syncPermissions(['view leads', 'create leads', 'view dashboard']);

        if ($user = \App\Models\User::first()) {
            $user->assignRole('admin');
        }
    }
}