import React, { useState, useEffect } from 'react';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    ArrowLeft,
    Plus,
    Save
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';

interface Candidate {
    id: number;
    name: string;
    email: string;
}

interface Brand {
    id: number;
    name: string;
}

interface Position {
    id: number;
    title: string;
}

interface Pipeline {
    id: number;
    name: string;
}

interface Stage {
    id: number;
    name: string;
}

interface Props {
    pipelines: Pipeline[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function CreateDeal({ pipelines, flash }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [availableStages, setAvailableStages] = useState<Stage[]>([]);
    const [availableTags] = useState([
        { id: 1, name: 'Hot Lead', color: 'bg-red-100 text-red-800' },
        { id: 2, name: 'Cold Lead', color: 'bg-blue-100 text-blue-800' },
        { id: 3, name: 'Follow Up', color: 'bg-yellow-100 text-yellow-800' },
        { id: 4, name: 'Qualified', color: 'bg-green-100 text-green-800' },
        { id: 5, name: 'Unqualified', color: 'bg-gray-100 text-gray-800' }
    ]);

    const [formData, setFormData] = useState({
        candidate_id: '',
        brand_id: '',
        position_id: '',
        pipeline_id: '',
        stage_id: '',
        title: '',
        amount: '',
        status: 'pending',
        priority: 'medium' as 'low' | 'medium' | 'high',
        due_date: '',
        tags: [] as string[]
    });

    // Fetch dropdown data on component mount
    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const [candidatesRes, brandsRes] = await Promise.all([
                axios.get('/candidates-data'),
                axios.get('/brands-data')
            ]);
            
            setCandidates(candidatesRes.data);
            setBrands(brandsRes.data);
        } catch (error) {
            console.error('Failed to fetch dropdown data:', error);
            toast.error('Failed to load form data');
        }
    };

    // Fetch positions when brand changes
    const fetchPositions = async (brandId: string) => {
        if (!brandId) {
            setPositions([]);
            return;
        }
        try {
            const response = await axios.get(`/positions-data?brand_id=${brandId}`);
            setPositions(response.data);
        } catch (error) {
            console.error('Failed to fetch positions:', error);
        }
    };

    // Fetch stages when pipeline changes
    const fetchStages = async (pipelineId: string) => {
        if (!pipelineId) {
            setAvailableStages([]);
            return;
        }
        try {
            const response = await axios.get(`/stages-data?pipeline_id=${pipelineId}`);
            setAvailableStages(response.data);
        } catch (error) {
            console.error('Failed to fetch stages:', error);
        }
    };

    // Handle form input changes
    const handleFormChange = (field: string, value: any) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            
            // Handle dependent field resets
            if (field === 'brand_id') {
                newData.position_id = '';
                // Fetch positions asynchronously
                setTimeout(() => fetchPositions(value), 0);
            }
            if (field === 'pipeline_id') {
                newData.stage_id = '';
                // Fetch stages asynchronously
                setTimeout(() => fetchStages(value), 0);
            }
            
            return newData;
        });
    };

    // Handle deal creation
    const handleCreateDeal = async () => {
        if (!formData.candidate_id || !formData.brand_id || 
            !formData.position_id || !formData.pipeline_id || 
            !formData.stage_id || !formData.title || !formData.amount) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('/deals', {
                candidate_id: parseInt(formData.candidate_id),
                brand_id: parseInt(formData.brand_id),
                position_id: parseInt(formData.position_id),
                pipeline_id: parseInt(formData.pipeline_id),
                stage_id: parseInt(formData.stage_id),
                title: formData.title,
                amount: formData.amount,
                status: formData.status,
                priority: formData.priority,
                due_date: formData.due_date || null,
                tags: formData.tags
            });

            toast.success('Deal created successfully');
            
            // Redirect to deals page
            router.visit('/deals');
        } catch (error) {
            console.error('Failed to create deal:', error);
            toast.error('Failed to create deal. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Create Deal" />
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.visit('/deals')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Deals
                        </Button>
                        <h1 className="text-2xl font-bold">Create New Deal</h1>
                    </div>
                </div>

                {/* Form */}
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Deal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Basic Information</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Deal Title *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => handleFormChange('title', e.target.value)}
                                        placeholder="Enter deal title"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => handleFormChange('amount', e.target.value)}
                                        placeholder="Enter amount"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleFormChange('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="won">Won</SelectItem>
                                            <SelectItem value="lost">Lost</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => handleFormChange('priority', value as 'low' | 'medium' | 'high')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="due_date">Due Date</Label>
                                <Input
                                    id="due_date"
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) => handleFormChange('due_date', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Relationships */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Relationships</h3>
                            
                            <div className="space-y-2">
                                <Label htmlFor="candidate">Candidate *</Label>
                                <Select
                                    value={formData.candidate_id}
                                    onValueChange={(value) => handleFormChange('candidate_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select candidate" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {candidates.map((candidate) => (
                                            <SelectItem key={candidate.id} value={candidate.id.toString()}>
                                                {candidate.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="brand">Brand *</Label>
                                    <Select
                                        value={formData.brand_id}
                                        onValueChange={(value) => handleFormChange('brand_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select brand" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {brands.map((brand) => (
                                                <SelectItem key={brand.id} value={brand.id.toString()}>
                                                    {brand.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="position">Position *</Label>
                                    <Select
                                        value={formData.position_id}
                                        onValueChange={(value) => handleFormChange('position_id', value)}
                                        disabled={!formData.brand_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select position" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {positions.map((position) => (
                                                <SelectItem key={position.id} value={position.id.toString()}>
                                                    {position.designation}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pipeline">Pipeline *</Label>
                                    <Select
                                        value={formData.pipeline_id}
                                        onValueChange={(value) => handleFormChange('pipeline_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select pipeline" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pipelines.map((pipeline) => (
                                                <SelectItem key={pipeline.id} value={pipeline.id.toString()}>
                                                    {pipeline.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="stage">Stage *</Label>
                                    <Select
                                        value={formData.stage_id}
                                        onValueChange={(value) => handleFormChange('stage_id', value)}
                                        disabled={!formData.pipeline_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select stage" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableStages.map((stage) => (
                                                <SelectItem key={stage.id} value={stage.id.toString()}>
                                                    {stage.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Tags</h3>
                            <div className="flex flex-wrap gap-2 border rounded-md p-3">
                                {availableTags.map(tag => {
                                    const isSelected = formData.tags.includes(tag.name);
                                    return (
                                        <Badge 
                                            key={tag.id}
                                            variant={isSelected ? "default" : "outline"}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                const newTags = isSelected
                                                    ? formData.tags.filter(t => t !== tag.name)
                                                    : [...formData.tags, tag.name];
                                                handleFormChange('tags', newTags);
                                            }}
                                        >
                                            {tag.name}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <Button 
                                variant="outline" 
                                onClick={() => router.visit('/deals')}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleCreateDeal}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Save className="h-4 w-4" />
                                        Creating...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create Deal
                                    </span>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 