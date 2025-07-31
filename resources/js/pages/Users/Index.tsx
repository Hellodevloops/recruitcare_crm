import React, { useState } from 'react';
import { Head,Link , usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Save } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface Role {
    id: number;
    name: string;
}

interface Props {
    users: User[];
    roles: Role[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: null },
];

export default function UsersIndex() {
    const { users: initialUsers, roles } = usePage<Props>().props;
    const [users, setUsers] = useState(initialUsers);

    const handleDeleteUser = (userId: number) => {
        router.delete(route('users.destroy', userId), {
            onSuccess: () => {
                setUsers(users.filter((user) => user.id !== userId));
            },
        });
    };

    const handleUpdateUser = (user: User) => {
        router.put(
            route('users.update', user.id),
            {
                name: user.name,
                email: user.email,
                roles: user.roles.map((r) => r.id),
            },
            {
                preserveState: true,
                onSuccess: (page) => {
                    const updatedUsers = page.props.users as User[];
                    setUsers(updatedUsers);
                },
            }
        );
    };

    const toggleRole = (userId: number, roleId: number) => {
        const user = users.find((u) => u.id === userId)!;
        const hasRole = user.roles.some((r) => r.id === roleId);
        const newRoles = hasRole
            ? user.roles.filter((r) => r.id !== roleId)
            : [...user.roles, roles.find((r) => r.id === roleId)!];

        const updatedUser = { ...user, roles: newRoles };
        setUsers(users.map((u) => (u.id === user.id ? updatedUser : u)));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Users</h2>
                    <Button asChild>
                      
                        <Link href={route('users.create')}>Create User</Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {users.map((user) => (
                                <div key={user.id} className="border p-4 rounded-md">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">{user.name}</h3>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUpdateUser(user)}
                                            >
                                                <Save className="mr-2 h-4 w-4" />
                                                Update
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteUser(user.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {roles.map((role) => (
                                            <div key={role.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`user-${user.id}-role-${role.id}`}
                                                    checked={user.roles.some((r) => r.id === role.id)}
                                                    onCheckedChange={() => toggleRole(user.id, role.id)}
                                                />
                                                <label
                                                    htmlFor={`user-${user.id}-role-${role.id}`}
                                                    className="text-sm"
                                                >
                                                    {role.name}
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