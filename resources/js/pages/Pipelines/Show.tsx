import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, Plus, GripVertical, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Stage {
    id: number;
    name: string;
    pipeline_id: number;
    order: number;
}

interface Candidate {
    id: number;
    name: string;
}

interface Hr {
    id: number;
    name: string;
    brand_id: number;
    brand?: {
        id: number;
        name: string;
    };
}

interface Brand {
    id: number;
    name: string;
}

interface Pipeline {
    id: number;
    name: string;
    stages: Stage[];
    interview_date?: string;
    candidate_id?: number;
    hr_id?: number;
    brand_id?: number;
    interview_rounds?: string[];
    feedback?: string;
    candidate?: Candidate;
    hr?: Hr;
    brand?: Brand;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    pipeline: Pipeline;
    [key: string]: any;
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
    const [formData, setFormData] = useState<{
        candidates: Candidate[];
        hrs: Hr[];
        brands: Brand[];
        stageTemplates: any;
    }>({
        candidates: [],
        hrs: [],
        brands: [],
        stageTemplates: {}
    });

    // Sync stages with props when they change
    useEffect(() => {
        setStages(initialPipeline.stages.sort((a, b) => a.order - b.order));
    }, [initialPipeline.stages]);

    // Fetch form data on component mount
    useEffect(() => {
        fetch(route('pipelines.form-data'))
            .then(response => response.json())
            .then(data => {
                setFormData(data);
            })
            .catch(error => {
                console.error('Error fetching form data:', error);
            });
    }, []);

    const { data: pipelineData, setData: setPipelineData, put: putPipeline, processing: pipelineProcessing, errors: pipelineErrors } = useForm({
        name: initialPipeline.name,
        interview_date: initialPipeline.interview_date || '',
        candidate_id: initialPipeline.candidate_id?.toString() || '',
        hr_id: initialPipeline.hr_id?.toString() || '',
        brand_id: initialPipeline.brand_id?.toString() || '',
        interview_rounds: initialPipeline.interview_rounds || [],
        feedback: initialPipeline.feedback || '',
    });

    const { data: stageData, setData: setStageData, post: postStage, processing: stageProcessing, errors: stageErrors, reset: resetStage } = useForm({
        name: '',
        order: stages.length, // Set initial order for new stage
    });

    const { delete: destroyStage } = useForm();

    const addInterviewRound = () => {
        setPipelineData('interview_rounds', [...pipelineData.interview_rounds, '']);
    };

    const removeInterviewRound = (index: number) => {
        const newRounds = pipelineData.interview_rounds.filter((_, i) => i !== index);
        setPipelineData('interview_rounds', newRounds);
    };

    const updateInterviewRound = (index: number, value: string) => {
        const newRounds = [...pipelineData.interview_rounds];
        newRounds[index] = value;
        setPipelineData('interview_rounds', newRounds);
    };

    const selectStageTemplate = (templateKey: string) => {
        const template = formData.stageTemplates[templateKey];
        if (template) {
            // Clear existing stages and add new ones from template
            const newStages = template.map((stage: any, index: number) => ({
                id: Date.now() + index, // Temporary ID for new stages
                name: stage.name,
                pipeline_id: initialPipeline.id,
                order: index + 1
            }));
            setStages(newStages);
            
            // Auto-populate interview rounds from all stages in the template
            const allInterviewRounds: string[] = [];
            template.forEach((stage: any) => {
                if (stage.interview_rounds) {
                    allInterviewRounds.push(...stage.interview_rounds);
                }
            });
            setPipelineData('interview_rounds', allInterviewRounds);
        }
    };

    const addCustomStage = () => {
        const newStage = {
            id: Date.now(),
            name: '',
            pipeline_id: initialPipeline.id,
            order: stages.length + 1
        };
        setStages([...stages, newStage]);
    };

    const removeStage = (index: number) => {
        const newStages = stages.filter((_, i) => i !== index);
        setStages(newStages);
    };

    const updateStage = (index: number, value: string) => {
        const newStages = [...stages];
        newStages[index] = { ...newStages[index], name: value };
        setStages(newStages);
    };

    const addRoundFromStage = (round: string) => {
        if (!pipelineData.interview_rounds.includes(round)) {
            setPipelineData('interview_rounds', [...pipelineData.interview_rounds, round]);
        }
    };

    const getAllAvailableRounds = () => {
        const allRounds: string[] = [];
        stages.forEach(stage => {
            Object.values(formData.stageTemplates).forEach((template: any) => {
                template.forEach((templateStage: any) => {
                    if (templateStage.name === stage.name && templateStage.interview_rounds) {
                        allRounds.push(...templateStage.interview_rounds);
                    }
                });
            });
        });
        return [...new Set(allRounds)]; // Remove duplicates
    };

    const handlePipelineSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        putPipeline(route('pipelines.update', initialPipeline.id), {
            data: {
                ...pipelineData,
                stages: stages.map(stage => ({ id: stage.id, name: stage.name }))
            },
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
        router.post(
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
                    <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {isEditing ? 'Cancel' : 'Edit Pipeline'}
                    </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this pipeline? This action cannot be undone.')) {
                                    router.delete(route('pipelines.destroy', initialPipeline.id), {
                                        onSuccess: () => {
                                            router.visit(route('pipelines.index'));
                                        }
                                    });
                                }
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Pipeline
                        </Button>
                    </div>
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
                                        <p className="text-sm text-muted-foreground">Interview Date</p>
                                        <p className="text-sm font-medium">
                                            {initialPipeline.interview_date ? new Date(initialPipeline.interview_date).toLocaleDateString() : 'Not scheduled'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Candidate (Interviewer)</p>
                                        <p className="text-sm font-medium">{initialPipeline.candidate?.name || 'Not assigned'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">HR</p>
                                        <p className="text-sm font-medium">{initialPipeline.hr?.name || 'Not assigned'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Brand</p>
                                        <p className="text-sm font-medium">{initialPipeline.brand?.name || 'Not assigned'}</p>
                                    </div>
                                    {initialPipeline.interview_rounds && initialPipeline.interview_rounds.length > 0 && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Interview Rounds</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {initialPipeline.interview_rounds.map((round: string, index: number) => (
                                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                        {round}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {initialPipeline.feedback && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Feedback</p>
                                            <p className="text-sm font-medium bg-gray-50 p-2 rounded">{initialPipeline.feedback}</p>
                                        </div>
                                    )}
                                    {stages.length > 0 && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">Pipeline Stages</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {stages.map((stage, index) => (
                                                    <span key={stage.id} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                                        {stage.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
                                            <Label htmlFor="name">Pipeline Name *</Label>
                                            <Input
                                                id="name"
                                                value={pipelineData.name}
                                                onChange={(e) => setPipelineData('name', e.target.value)}
                                                required
                                            />
                                            {pipelineErrors.name && <p className="text-red-500 text-xs">{pipelineErrors.name}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="interview_date">Interview Date</Label>
                                            <Input
                                                id="interview_date"
                                                type="date"
                                                value={pipelineData.interview_date}
                                                onChange={(e) => setPipelineData('interview_date', e.target.value)}
                                            />
                                            {pipelineErrors.interview_date && <p className="text-red-500 text-xs">{pipelineErrors.interview_date}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="candidate_id">Candidate (Interviewer)</Label>
                                            <Select value={pipelineData.candidate_id} onValueChange={(value) => setPipelineData('candidate_id', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select candidate" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {formData.candidates.map((candidate) => (
                                                        <SelectItem key={candidate.id} value={candidate.id.toString()}>
                                                            {candidate.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {pipelineErrors.candidate_id && <p className="text-red-500 text-xs">{pipelineErrors.candidate_id}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="hr_id">HR</Label>
                                            <Select value={pipelineData.hr_id} onValueChange={(value) => {
                                                setPipelineData('hr_id', value);
                                                // Auto-select brand based on HR's brand_id
                                                if (value) {
                                                    const selectedHr = formData.hrs.find(hr => hr.id.toString() === value);
                                                    if (selectedHr && selectedHr.brand_id) {
                                                        setPipelineData('brand_id', selectedHr.brand_id.toString());
                                                    }
                                                } else {
                                                    // Clear brand selection if HR is cleared
                                                    setPipelineData('brand_id', '');
                                                }
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select HR" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {formData.hrs.map((hr) => (
                                                        <SelectItem key={hr.id} value={hr.id.toString()}>
                                                            {hr.name} {hr.brand && `(${hr.brand.name})`}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {pipelineErrors.hr_id && <p className="text-red-500 text-xs">{pipelineErrors.hr_id}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="brand_id">Brand</Label>
                                            {pipelineData.hr_id ? (
                                                <div className="space-y-1">
                                                    <Select value={pipelineData.brand_id} onValueChange={(value) => setPipelineData('brand_id', value)}>
                                                        <SelectTrigger className="bg-blue-50 border-blue-200">
                                                            <SelectValue placeholder="Select brand" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {formData.brands.map((brand) => (
                                                                <SelectItem key={brand.id} value={brand.id.toString()}>
                                                                    {brand.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <p className="text-xs text-blue-600">
                                                        ✓ Brand auto-selected based on HR selection
                                                    </p>
                                                </div>
                                            ) : (
                                                <Select value={pipelineData.brand_id} onValueChange={(value) => setPipelineData('brand_id', value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select brand" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {formData.brands.map((brand) => (
                                                            <SelectItem key={brand.id} value={brand.id.toString()}>
                                                                {brand.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            {pipelineErrors.brand_id && <p className="text-red-500 text-xs">{pipelineErrors.brand_id}</p>}
                                        </div>

                                        <div>
                                            <Label>Interview Rounds</Label>
                                            <div className="space-y-2">
                                                {pipelineData.interview_rounds.map((round, index) => (
                                                    <div key={index} className="flex gap-2">
                                                        <Input
                                                            value={round}
                                                            onChange={(e) => updateInterviewRound(index, e.target.value)}
                                                            placeholder={`Round ${index + 1} (e.g., 1st Round, 2nd Round, 3rd Round)`}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeInterviewRound(index)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={addInterviewRound}
                                                    className="w-full"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Interview Round
                                                </Button>
                                            </div>
                                            {pipelineErrors.interview_rounds && <p className="text-red-500 text-xs">{pipelineErrors.interview_rounds}</p>}
                                            
                                            {/* Stage Round Selection - Integrated */}
                                            {stages.length > 0 && (
                                                <div className="mt-4 p-3 border rounded-lg bg-gray-50">
                                                    <p className="text-sm font-medium mb-2">Add Rounds from Selected Stages:</p>
                                                    <p className="text-xs text-gray-500 mb-3">
                                                        Click on any round below to add it to your interview rounds above.
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                                        {getAllAvailableRounds().map((round) => (
                                                            <button
                                                                key={round}
                                                                type="button"
                                                                onClick={() => addRoundFromStage(round)}
                                                                disabled={pipelineData.interview_rounds.includes(round)}
                                                                className={`p-2 text-sm rounded border text-left transition-colors ${
                                                                    pipelineData.interview_rounds.includes(round)
                                                                        ? 'bg-green-100 text-green-800 border-green-300 cursor-not-allowed'
                                                                        : 'bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-300'
                                                                }`}
                                                            >
                                                                {round}
                                                                {pipelineData.interview_rounds.includes(round) && (
                                                                    <span className="ml-1 text-xs">✓</span>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="feedback">Feedback</Label>
                                            <Textarea
                                                id="feedback"
                                                value={pipelineData.feedback}
                                                onChange={(e) => setPipelineData('feedback', e.target.value)}
                                                placeholder="Enter interview feedback..."
                                                rows={3}
                                            />
                                            {pipelineErrors.feedback && <p className="text-red-500 text-xs">{pipelineErrors.feedback}</p>}
                                        </div>

                                        <div>
                                            <Label>Pipeline Stages</Label>
                                            <p className="text-xs text-gray-500 mb-2">
                                                Choose a template to replace current stages, or edit stage names below.
                                            </p>
                                            
                                            {/* Stage Templates */}
                                            <div className="mb-4">
                                                <p className="text-sm font-medium mb-2">Choose a template (will replace current stages):</p>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {Object.entries(formData.stageTemplates).map(([key, template]: [string, any]) => {
                                                        const totalRounds = template.reduce((sum: number, stage: any) => sum + (stage.interview_rounds?.length || 0), 0);
                                                        const stageNames = template.map((stage: any) => stage.name).join(', ');
                                                        return (
                                                            <Button
                                                                key={key}
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => selectStageTemplate(key)}
                                                                className="text-left justify-start h-auto p-3"
                                                            >
                                                                <div className="w-full">
                                                                    <div className="font-medium capitalize mb-1">{key}</div>
                                                                    <div className="text-xs text-gray-500 mb-2">
                                                                        {template.length} stages • {totalRounds} interview rounds
                                                                    </div>
                                                                    <div className="text-xs text-blue-600 font-medium">
                                                                        Stages: {stageNames}
                                                                    </div>
                                                                </div>
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            {/* Current Stages */}
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">Current Stages:</p>
                                                {stages.length > 0 ? (
                                                    <>
                                                        {/* Show selected stages as badges first */}
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            {stages.map((stage, index) => (
                                                                <span key={stage.id} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border">
                                                                    {stage.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        
                                                        {/* Editable stage inputs */}
                                                        <div className="space-y-2">
                                                            {stages.map((stage, index) => (
                                                                <div key={stage.id} className="flex gap-2">
                                                                    <Input
                                                                        value={stage.name}
                                                                        onChange={(e) => updateStage(index, e.target.value)}
                                                                        placeholder={`Stage ${index + 1}`}
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            if (confirm('Are you sure you want to delete this stage?')) {
                                                                                if (stage.id > 1000000) { // Temporary ID
                                                                                    removeStage(index);
                                                                                } else {
                                                                                    destroyStage(route('stages.destroy', stage.id), {
                                                                                        onSuccess: () => {
                                                                                            const newStages = stages.filter(s => s.id !== stage.id);
                                                                                            setStages(newStages);
                                                                                        }
                                                                                    });
                                                                                }
                                                                            }
                                                                        }}
                                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-sm text-gray-500 italic">
                                                        No stages selected. Choose a template above or add custom stages.
                                                    </div>
                                                )}
                                                
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={addCustomStage}
                                                    className="w-full"
                                                >
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Custom Stage
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button type="submit" disabled={pipelineProcessing} className="flex-1">
                                            Update Pipeline
                                        </Button>
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setIsEditing(false)}
                                                disabled={pipelineProcessing}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
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