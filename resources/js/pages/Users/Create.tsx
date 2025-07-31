import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react'; // Added usePage import
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { type BreadcrumbItem } from '@/types';

interface Role {
    id: number;
    name: string;
}

interface Props {
    roles: Role[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: '/users' },
    { title: 'Create User', href: null },
];

export default function UserCreate() {
    const { roles } = usePage<Props>().props; // Use usePage to access props
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('users.store'), form, {
            onSuccess: () => {
                router.visit(route('users.index'));
            },
        });
    };

    const toggleRole = (roleId: number) => {
        setForm({
            ...form,
            roles: form.roles.includes(roleId)
                ? form.roles.filter(id => id !== roleId)
                : [...form.roles, roleId],
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Create New User</h2>

                <Card>
                    <CardHeader>
                        <CardTitle>User Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                                    <Input
                                        id="name"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password_confirmation" className="text-sm font-medium">Confirm Password</label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={form.password_confirmation}
                                        onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Assign Roles</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {roles.map(role => (
                                        <div key={role.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={form.roles.includes(role.id)}
                                                onCheckedChange={() => toggleRole(role.id)}
                                            />
                                            <label htmlFor={`role-${role.id}`} className="text-sm">
                                                {role.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Button type="submit">Create User</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}