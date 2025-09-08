import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, X, Eye, Edit } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Stage {
    id: number;
    name: string;
    pipeline_id: number;
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
    pipelines: {
        data: Pipeline[];
        links: any;
    };
    [key: string]: any;
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pipelines', href: '/pipelines' },
];

// Default pipeline with stages to display if no pipelines exist
const defaultPipelineTemplate: Pipeline[] = [{
    id: -1,
    name: 'Default Pipeline',
    stages: [
        { id: -1, name: 'Prospect', pipeline_id: -1 },
        { id: -2, name: 'Negotiation', pipeline_id: -1 },
        { id: -3, name: 'Closed', pipeline_id: -1 },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
}];

export default function PipelineList() {
    const { pipelines } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState<{
        candidates: Candidate[];
        hrs: Hr[];
        brands: Brand[];
        stageTemplates: {
            [key: string]: { name: string; interview_rounds?: string[] }[];
        };
    }>({
        candidates: [],
        hrs: [],
        brands: [],
        stageTemplates: {}
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        interview_date: '',
        candidate_id: '',
        hr_id: '',
        brand_id: '',
        interview_rounds: [] as string[],
        feedback: '',
        selected_stages: [] as string[],
    });

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

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('pipelines.store'), {
            onSuccess: () => {
                setIsDialogOpen(false);
                reset();
            },
        });
    };

    const addInterviewRound = () => {
        setData('interview_rounds', [...data.interview_rounds, '']);
    };

    const removeInterviewRound = (index: number) => {
        const newRounds = data.interview_rounds.filter((_, i) => i !== index);
        setData('interview_rounds', newRounds);
    };

    const updateInterviewRound = (index: number, value: string) => {
        const newRounds = [...data.interview_rounds];
        newRounds[index] = value;
        setData('interview_rounds', newRounds);
    };

    const selectStageTemplate = (templateKey: string) => {
        const template = formData.stageTemplates[templateKey];
        if (template) {
            setData('selected_stages', template.map(stage => stage.name));
            
            // Auto-populate interview rounds from all stages in the template
            const allInterviewRounds: string[] = [];
            template.forEach(stage => {
                if (stage.interview_rounds) {
                    allInterviewRounds.push(...stage.interview_rounds);
                }
            });
            setData('interview_rounds', allInterviewRounds);
        }
    };

    const addCustomStage = () => {
        setData('selected_stages', [...data.selected_stages, '']);
    };

    const removeStage = (index: number) => {
        const newStages = data.selected_stages.filter((_, i) => i !== index);
        setData('selected_stages', newStages);
    };

    const updateStage = (index: number, value: string) => {
        const newStages = [...data.selected_stages];
        newStages[index] = value;
        setData('selected_stages', newStages);
    };

    const addRoundFromStage = (round: string) => {
        if (!data.interview_rounds.includes(round)) {
            setData('interview_rounds', [...data.interview_rounds, round]);
        }
    };

    const getAllAvailableRounds = () => {
        const allRounds: string[] = [];
        data.selected_stages.forEach(stageName => {
            Object.values(formData.stageTemplates).forEach(template => {
                template.forEach(stage => {
                    if (stage.name === stageName && stage.interview_rounds) {
                        allRounds.push(...stage.interview_rounds);
                    }
                });
            });
        });
        return [...new Set(allRounds)]; // Remove duplicates
    };

    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (id < 0) {
            alert('Default pipeline cannot be deleted from this view.');
            return;
        }
        if (confirm('Are you sure you want to delete this pipeline?')) {
            destroy(route('pipelines.destroy', id));
        }
    };

    // Use default pipeline if no pipelines exist, otherwise use fetched pipelines
    const displayPipelines = pipelines.data.length > 0 ? pipelines.data : defaultPipelineTemplate;

    const filteredPipelines = displayPipelines.filter(pipeline =>
        pipeline.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pipeline List" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Pipeline List</h2>
                        <p className="text-sm text-gray-600">Manage your pipelines</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> Add Pipeline
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Pipeline</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Pipeline Name *</Label>
                                    <Input 
                                        id="name" 
                                        value={data.name} 
                                        onChange={e => setData('name', e.target.value)} 
                                        required 
                                    />
                                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="interview_date">Interview Date</Label>
                                    <Input 
                                        id="interview_date" 
                                        type="date"
                                        value={data.interview_date} 
                                        onChange={e => setData('interview_date', e.target.value)} 
                                    />
                                    {errors.interview_date && <p className="text-red-500 text-xs">{errors.interview_date}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="candidate_id">Candidate (Interviewer)</Label>
                                    <Select value={data.candidate_id} onValueChange={(value) => setData('candidate_id', value)}>
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
                                    {errors.candidate_id && <p className="text-red-500 text-xs">{errors.candidate_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="hr_id">HR</Label>
                                    <Select value={data.hr_id} onValueChange={(value) => {
                                        setData('hr_id', value);
                                        // Auto-select brand based on HR's brand_id
                                        if (value) {
                                            const selectedHr = formData.hrs.find(hr => hr.id.toString() === value);
                                            if (selectedHr && selectedHr.brand_id) {
                                                setData('brand_id', selectedHr.brand_id.toString());
                                            }
                                        } else {
                                            // Clear brand selection if HR is cleared
                                            setData('brand_id', '');
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
                                    {errors.hr_id && <p className="text-red-500 text-xs">{errors.hr_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="brand_id">Brand</Label>
                                    {data.hr_id ? (
                                        <div className="space-y-1">
                                            <Select value={data.brand_id} onValueChange={(value) => setData('brand_id', value)}>
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
                                        <Select value={data.brand_id} onValueChange={(value) => setData('brand_id', value)}>
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
                                    {errors.brand_id && <p className="text-red-500 text-xs">{errors.brand_id}</p>}
                                </div>

                                <div>
                                    <Label>Interview Rounds</Label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        {data.interview_rounds.length > 0 
                                            ? `Current rounds (${data.interview_rounds.length}). You can edit, add more, or select from stages below.`
                                            : "Add rounds manually or select from stages below."
                                        }
                                    </p>
                                    <div className="space-y-2">
                                        {data.interview_rounds.map((round, index) => (
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
                                    {errors.interview_rounds && <p className="text-red-500 text-xs">{errors.interview_rounds}</p>}
                                    
                                    {/* Stage Round Selection - Integrated */}
                                    {data.selected_stages.length > 0 && (
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
                                                        disabled={data.interview_rounds.includes(round)}
                                                        className={`p-2 text-sm rounded border text-left transition-colors ${
                                                            data.interview_rounds.includes(round)
                                                                ? 'bg-green-100 text-green-800 border-green-300 cursor-not-allowed'
                                                                : 'bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-300'
                                                        }`}
                                                    >
                                                        {round}
                                                        {data.interview_rounds.includes(round) && (
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
                                        value={data.feedback} 
                                        onChange={e => setData('feedback', e.target.value)}
                                        placeholder="Enter interview feedback..."
                                        rows={3}
                                    />
                                    {errors.feedback && <p className="text-red-500 text-xs">{errors.feedback}</p>}
                                </div>

                                <div>
                                    <Label>Pipeline Stages</Label>
                                    <div className="space-y-4">
                                        {/* Stage Templates */}
                                        <div>
                                            <p className="text-sm font-medium mb-2">Choose a template (will auto-populate interview rounds):</p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {Object.entries(formData.stageTemplates).map(([key, template]) => {
                                                    const totalRounds = template.reduce((sum, stage) => sum + (stage.interview_rounds?.length || 0), 0);
                                                    const stageNames = template.map(stage => stage.name).join(', ');
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

                                        {/* Selected Stages */}
                                        <div>
                                            <p className="text-sm font-medium mb-2">Selected Stages:</p>
                                            {data.selected_stages.length > 0 ? (
                                                <div className="space-y-2">
                                                    {/* Show selected stages as badges first */}
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {data.selected_stages.map((stage, index) => (
                                                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border">
                                                                {stage}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    
                                                    {/* Editable stage inputs */}
                                                    <div className="space-y-2">
                                                        {data.selected_stages.map((stage, index) => (
                                                            <div key={index} className="flex gap-2">
                                                                <Input
                                                                    value={stage}
                                                                    onChange={(e) => updateStage(index, e.target.value)}
                                                                    placeholder={`Stage ${index + 1}`}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => removeStage(index)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
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
                                            ) : (
                                                <div className="text-sm text-gray-500 italic">
                                                    No stages selected. Choose a template above or add custom stages.
                                                </div>
                                            )}
                                            {errors.selected_stages && <p className="text-red-500 text-xs">{errors.selected_stages}</p>}
                                        </div>

                                    </div>
                                </div>

                                <Button type="submit" disabled={processing} className="w-full">
                                    Create Pipeline
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="bg-white border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">Pipelines</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                            Your current pipelines (Default stages: Prospect, Negotiation, Closed)
                        </CardDescription>
                        <Input
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mt-2 max-w-md"
                        />
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Interview Date</TableHead>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>HR</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Interview Rounds</TableHead>
                                    <TableHead>Feedback</TableHead>
                                    <TableHead>Stages</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPipelines.map((pipeline) => (
                                    <TableRow key={pipeline.id}>
                                        <TableCell className="font-medium">
                                            <a href={route('pipelines.show', pipeline.id)} className="hover:underline">
                                                {pipeline.name}
                                            </a>
                                            {pipeline.id < 0 && (
                                                <span className="ml-2 text-xs text-gray-500">(Default)</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {pipeline.interview_date ? new Date(pipeline.interview_date).toLocaleDateString() : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {pipeline.candidate?.name || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {pipeline.hr?.name || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {pipeline.brand?.name || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {pipeline.interview_rounds && pipeline.interview_rounds.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {pipeline.interview_rounds.map((round: string, index: number) => (
                                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                            {round}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {pipeline.feedback ? (
                                                <div className="max-w-xs">
                                                    <p className="text-sm text-gray-700 truncate" title={pipeline.feedback}>
                                                        {pipeline.feedback}
                                                    </p>
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {pipeline.stages.length} stages
                                            {pipeline.id < 0 && ' (Prospect, Negotiation, Closed)'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.location.href = route('pipelines.show', pipeline.id)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                    title="View Pipeline"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.location.href = route('pipelines.show', pipeline.id)}
                                                    className="text-green-500 hover:text-green-700"
                                                    title="Edit Pipeline"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(pipeline.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                    title="Delete Pipeline"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {filteredPipelines.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                                No pipelines found matching your criteria.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}