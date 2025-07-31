import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Pipeline {
    id: number;
    name: string;
}

interface Stage {
    id: number;
    name: string;
    pipeline_id: number;
    pipeline: Pipeline;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    stage: Stage;
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Stages', href: '/stages' },
    { title: 'Stage Details', href: null },
];

export default function StageDetail() {
    const { stage } = usePage<PageProps>().props;
    const [isEditing, setIsEditing] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        name: stage.name,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('stages.update', stage.id), {
            onSuccess: () => setIsEditing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Stage: ${stage.name}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{stage.name}</h2>
                            <p className="text-sm text-muted-foreground">Pipeline: <a href={route('pipelines.show', stage.pipeline_id)} className="hover:underline">{stage.pipeline.name}</a></p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {isEditing ? 'Cancel' : 'Edit Stage'}
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Stage Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="text-sm font-medium">{stage.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pipeline</p>
                                        <p className="text-sm font-medium">
                                            <a href={route('pipelines.show', stage.pipeline_id)} className="hover:underline">{stage.pipeline.name}</a>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Created At</p>
                                        <p className="text-sm font-medium">{new Date(stage.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Updated At</p>
                                        <p className="text-sm font-medium">{new Date(stage.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        {isEditing ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Edit Stage</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Name *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                            />
                                            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                        </div>
                                        <Button type="submit" disabled={processing} className="w-full">
                                            Update Stage
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        ) : null}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}