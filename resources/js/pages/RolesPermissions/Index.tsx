import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Save } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface Permission {
    id: number;
    name: string;
}

interface Props {
    roles: Role[];
    permissions: Permission[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Roles & Permissions', href: null },
];

export default function RolesPermissions() {
    const { roles: initialRoles, permissions } = usePage<Props>().props;
    const [roles, setRoles] = useState(initialRoles);
    const [newRoleName, setNewRoleName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

    const handleCreateRole = () => {
        if (!newRoleName) return;

        router.post(
            route('roles.store'),
            {
                name: newRoleName,
                permissions: selectedPermissions,
            },
            {
                onSuccess: () => {
                    setNewRoleName('');
                    setSelectedPermissions([]);
                    router.reload({ only: ['roles'], onSuccess: (page) => setRoles(page.props.roles) });
                },
            }
        );
    };

    const handleUpdateRole = (role: Role) => {
        router.put(
            route('roles.update', role.id),
            {
                name: role.name,
                permissions: role.permissions.map((p) => p.id),
            },
            {
                preserveState: true,
                onSuccess: (page) => {
                    const updatedRoles = page.props.roles as Role[];
                    setRoles(updatedRoles);
                },
            }
        );
    };

    const handleDeleteRole = (roleId: number) => {
        router.delete(route('roles.destroy', roleId), {
            onSuccess: () => {
                setRoles(roles.filter((role) => role.id !== roleId));
            },
        });
    };

    const togglePermission = (roleId: number, permissionId: number) => {
        const role = roles.find((r) => r.id === roleId)!;
        const hasPermission = role.permissions.some((p) => p.id === permissionId);
        const newPermissions = hasPermission
            ? role.permissions.filter((p) => p.id !== permissionId)
            : [...role.permissions, permissions.find((p) => p.id === permissionId)!];

        const updatedRole = { ...role, permissions: newPermissions };
        setRoles(roles.map((r) => (r.id === role.id ? updatedRole : r)));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles & Permissions" />
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Roles & Permissions</h2>

                {/* Create New Role */}
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Role</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Input
                                placeholder="Role name"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={handleCreateRole}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Role
                            </Button>
                        </div>
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {permissions.map((permission) => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`perm-${permission.id}`}
                                        checked={selectedPermissions.includes(permission.id)}
                                        onCheckedChange={(checked) => {
                                            setSelectedPermissions(
                                                checked
                                                    ? [...selectedPermissions, permission.id]
                                                    : selectedPermissions.filter((id) => id !== permission.id)
                                            );
                                        }}
                                    />
                                    <label htmlFor={`perm-${permission.id}`} className="text-sm">
                                        {permission.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Roles List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Existing Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {roles.map((role) => (
                                <div key={role.id} className="border p-4 rounded-md">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">{role.name}</h3>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUpdateRole(role)}
                                            >
                                                <Save className="mr-2 h-4 w-4" />
                                                Update
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteRole(role.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {permissions.map((permission) => (
                                            <div key={permission.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`role-${role.id}-perm-${permission.id}`}
                                                    checked={role.permissions.some((p) => p.id === permission.id)}
                                                    onCheckedChange={() => togglePermission(role.id, permission.id)}
                                                />
                                                <label
                                                    htmlFor={`role-${role.id}-perm-${permission.id}`}
                                                    className="text-sm"
                                                >
                                                    {permission.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}