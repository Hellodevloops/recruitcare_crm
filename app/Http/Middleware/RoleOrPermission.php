<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\Exceptions\UnauthorizedException;

class RoleOrPermission
{
    public function handle(Request $request, Closure $next, string $roleOrPermission)
    {
        $user = auth()->user();

        if (!$user || (!$user->hasRole($roleOrPermission) && !$user->hasPermissionTo($roleOrPermission))) {
            throw UnauthorizedException::forRolesOrPermissions([$roleOrPermission]);
        }

        return $next($request);
    }
}