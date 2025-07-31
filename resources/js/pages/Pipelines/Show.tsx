import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Plus, GripVertical } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Stage {
    id: number;
    name: string;
    pipeline_id: number;
    order: number;
}

interface Pipeline {
    id: number;
    name: string;
    stages: Stage[];
    created_at: string;
    updated_at: string;
}

interface PageProps {
    pipeline: Pipeline;
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pipelines', href: '/pipelines' },
    { title: 'Pipeline Details', href: null },
];

export default function PipelineDetail() {
    const { pipeline: initialPipeline } = usePage<PageProps>().props;
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingStage, setIsAddingStage] = useState(false);
    const [stages, setStages] = useState<Stage[]>(
        initialPipeline.stages.sort((a, b) => a.order - b.order)
    );

    // Sync stages with props when they change
    useEffect(() => {
        setStages(initialPipeline.stages.sort((a, b) => a.order - b.order));
    }, [initialPipeline.stages]);

    const { data: pipelineData, setData: setPipelineData, put: putPipeline, processing: pipelineProcessing, errors: pipelineErrors } = useForm({
        name: initialPipeline.name,
    });

    const { data: stageData, setData: setStageData, post: postStage, processing: stageProcessing, errors: stageErrors, reset: resetStage } = useForm({
        name: '',
        order: stages.length, // Set initial order for new stage
    });

    const { delete: destroyStage } = useForm();

    const handlePipelineSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        putPipeline(route('pipelines.update', initialPipeline.id), {
            onSuccess: () => setIsEditing(false),
        });
    };

    const handleStageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postStage(route('stages.store', initialPipeline.id), {
            data: {
                ...stageData,
                order: stages.length // Ensure new stage gets next order position
            },
            onSuccess: (page) => {
                setIsAddingStage(false);
                resetStage();
                // The useEffect will handle updating stages from props
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDeleteStage = (stageId: number) => {
        if (confirm('Are you sure you want to delete this stage?')) {
            destroyStage(route('stages.destroy', stageId), {
                onSuccess: () => {
                    // Update local state immediately
                    setStages(stages.filter(stage => stage.id !== stageId));
                },
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        if (!destination || source.index === destination.index) return;

        const newStages = Array.from(stages);
        const [reorderedStage] = newStages.splice(source.index, 1);
        newStages.splice(destination.index, 0, reorderedStage);

        // Update local state immediately for instant UI feedback
        setStages(newStages);

        // Send reorder request to server
        router.put(
            route('stages.reorder', initialPipeline.id),
            {
                stages: newStages.map((stage, index) => ({
                    id: stage.id,
                    order: index
                }))
            },
            {
                preserveState: true,
                preserveScroll: true,
                onError: () => {
                    // Revert to original order if server update fails
                    setStages(initialPipeline.stages.sort((a, b) => a.order - b.order));
                }
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pipeline: ${initialPipeline.name}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{initialPipeline.name}</h2>
                            <p className="text-sm text-muted-foreground">{stages.length} stages</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {isEditing ? 'Cancel' : 'Edit Pipeline'}
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pipeline Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Name</p>
                                        <p className="text-sm font-medium">{initialPipeline.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Created At</p>
                                        <p className="text-sm font-medium">{new Date(initialPipeline.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Updated At</p>
                                        <p className="text-sm font-medium">{new Date(initialPipeline.updated_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {isEditing ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Edit Pipeline</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handlePipelineSubmit} className="space-y-4">
                                        <div>
                                            <Label htmlFor="name">Name *</Label>
                                            <Input
                                                id="name"
                                                value={pipelineData.name}
                                                onChange={(e) => setPipelineData('name', e.target.value)}
                                                required
                                            />
                                            {pipelineErrors.name && <p className="text-red-500 text-xs">{pipelineErrors.name}</p>}
                                        </div>
                                        <Button type="submit" disabled={pipelineProcessing} className="w-full">
                                            Update Pipeline
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        ) : null}

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    Stages
                                    <Button size="sm" onClick={() => setIsAddingStage(true)} disabled={stageProcessing}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Stage
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isAddingStage ? (
                                    <form onSubmit={handleStageSubmit} className="space-y-4 mb-6">
                                        <div>
                                            <Label htmlFor="stageName">Stage Name *</Label>
                                            <Input
                                                id="stageName"
                                                value={stageData.name}
                                                onChange={(e) => setStageData('name', e.target.value)}
                                                required
                                                disabled={stageProcessing}
                                            />
                                            {stageErrors.name && <p className="text-red-500 text-xs">{stageErrors.name}</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={stageProcessing}>
                                                Add Stage
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                onClick={() => setIsAddingStage(false)} 
                                                disabled={stageProcessing}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                ) : null}
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="stages">
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="space-y-4"
                                            >
                                                {stages.map((stage, index) => (
                                                    <Draggable
                                                        key={stage.id}
                                                        draggableId={stage.id.toString()}
                                                        index={index}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className="flex items-center justify-between p-3 bg-muted rounded-md"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div {...provided.dragHandleProps}>
                                                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                                    </div>
                                                                    <p className="text-sm font-medium">{stage.name}</p>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteStage(stage.id)}
                                                                    className="text-red-500"
                                                                    disabled={stageProcessing}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}