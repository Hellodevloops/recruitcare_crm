import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';
import { 
    ArrowLeft, 
    Save, 
    User, 
    Building, 
    Phone, 
    Mail,
    Briefcase,
    Calendar,
    DollarSign,
    Tag,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';

interface Deal {
    id: number;
    title?: string;
    amount?: string;
    status?: string;
    priority?: 'low' | 'medium' | 'high';
    due_date?: string;
    tags?: string[];
    brand_id: number;
    position_id: number;
    hr_id?: number;
    pipeline_id: number;
    stage_id: number;
    created_at: string;
    updated_at: string;
    brand?: {
        id: number;
        name: string;
    };
    position?: {
        id: number;
        title: string;
    };
    hr?: {
        id: number;
        name: string;
    };
    pipeline?: {
        id: number;
        name: string;
    };
    stage?: {
        id: number;
        name: string;
    };
    candidate?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        company?: string;
    };
}

interface Brand {
    id: number;
    name: string;
}

interface Position {
    id: number;
    title: string;
    brand_id: number;
}

interface Hr {
    id: number;
    name: string;
    brand_id: number;
}

interface Pipeline {
    id: number;
    name: string;
}

interface Stage {
    id: number;
    name: string;
    pipeline_id: number;
}

interface Props {
    deal: Deal;
    brands: Brand[];
    pipelines: Pipeline[];
    stages: Stage[];
    positions: Position[];
    hrs: Hr[];
    flash?: {
        success?: string;
        error?: string;
    };
}

// Priority colors
const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
};

// Status colors
const statusColors = {
    pending: 'bg-orange-100 text-orange-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800'
};

// Available tags
const availableTags = [
    { id: 1, name: 'New Lead', color: 'bg-purple-100 text-purple-800' },
    { id: 2, name: 'Hot Deal', color: 'bg-red-100 text-red-800' },
    { id: 3, name: 'Follow Up', color: 'bg-blue-100 text-blue-800' },
    { id: 4, name: 'VIP', color: 'bg-yellow-100 text-yellow-800' },
    { id: 5, name: 'Returning', color: 'bg-green-100 text-green-800' },
];

export default function EditDeal() {
    const { deal: initialDeal, brands, pipelines, stages: initialStages, positions: initialPositions, hrs: initialHrs, flash } = usePage<Props>().props;
    
    const [formData, setFormData] = useState({
        title: initialDeal.title || '',
        amount: initialDeal.amount || '',
        status: initialDeal.status || 'pending',
        priority: initialDeal.priority || 'medium',
        due_date: initialDeal.due_date || '',
        brand_id: initialDeal.brand_id.toString(),
        position_id: initialDeal.position_id.toString(),
        hr_id: initialDeal.hr_id?.toString() || '',
        pipeline_id: initialDeal.pipeline_id.toString(),
        stage_id: initialDeal.stage_id.toString(),
        tags: initialDeal.tags || [],
    });

    const [positions, setPositions] = useState<Position[]>(initialPositions);
    const [hrs, setHrs] = useState<Hr[]>(initialHrs);
    const [stages, setStages] = useState<Stage[]>(initialStages);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Fetch positions when brand changes
    const fetchPositions = async (brandId: string) => {
        if (!brandId) {
            setPositions([]);
            return;
        }
        try {
            const response = await axios.get<Position[]>(`/positions-data?brand_id=${brandId}`);
            setPositions(response.data);
        } catch (error) {
            console.error('Failed to fetch positions:', error);
        }
    };

    // Fetch HRs when brand changes
    const fetchHrs = async (brandId: string) => {
        if (!brandId) {
            setHrs([]);
            return;
        }
        try {
            const response = await axios.get<Hr[]>(`/hr-data?brand_id=${brandId}`);
            setHrs(response.data);
        } catch (error) {
            console.error('Failed to fetch HRs:', error);
        }
    };

    // Fetch stages when pipeline changes
    const fetchStages = async (pipelineId: string) => {
        if (!pipelineId) {
            setStages([]);
            return;
        }
        try {
            const response = await axios.get<Stage[]>(`/stages-data?pipeline_id=${pipelineId}`);
            setStages(response.data);
        } catch (error) {
            console.error('Failed to fetch stages:', error);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }

        // Handle dependent dropdowns
        if (field === 'brand_id') {
            setFormData(prev => ({ 
                ...prev, 
                position_id: '', 
                hr_id: '' 
            }));
            fetchPositions(value);
            fetchHrs(value);
        } else if (field === 'pipeline_id') {
            setFormData(prev => ({ 
                ...prev, 
                stage_id: '' 
            }));
            fetchStages(value);
        }
    };

    const handleTagToggle = (tagName: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tagName)
                ? prev.tags.filter(t => t !== tagName)
                : [...prev.tags, tagName]
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!formData.amount || isNaN(Number(formData.amount))) {
            newErrors.amount = 'Valid amount is required';
        }
        if (!formData.brand_id) {
            newErrors.brand_id = 'Brand is required';
        }
        if (!formData.position_id) {
            newErrors.position_id = 'Position is required';
        }
        if (!formData.hr_id) {
            newErrors.hr_id = 'HR is required';
        }
        if (!formData.pipeline_id) {
            newErrors.pipeline_id = 'Pipeline is required';
        }
        if (!formData.stage_id) {
            newErrors.stage_id = 'Stage is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        setIsLoading(true);
        
        try {
            const submitData = {
                ...formData,
                brand_id: parseInt(formData.brand_id),
                position_id: parseInt(formData.position_id),
                hr_id: formData.hr_id ? parseInt(formData.hr_id) : null,
                pipeline_id: parseInt(formData.pipeline_id),
                stage_id: parseInt(formData.stage_id),
                amount: formData.amount,
            };

            await router.put(`/deals/${initialDeal.id}`, submitData, {
                onSuccess: () => {
                    toast.success('Deal updated successfully');
                },
                onError: (errors) => {
                    setErrors(errors);
                    toast.error('Failed to update deal');
                },
            });
        } catch (error) {
            console.error('Failed to update deal:', error);
            toast.error('Failed to update deal');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title={`Edit Deal - ${initialDeal.title || 'Untitled'}`} />
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit('/deals')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Deals
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Deal</h1>
                        <p className="text-sm text-gray-600">Update deal information and settings</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Deal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Title and Amount */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title" className="text-sm font-medium">
                                                Deal Title *
                                            </Label>
                                            <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(e) => handleInputChange('title', e.target.value)}
                                                className={errors.title ? 'border-red-500' : ''}
                                                placeholder="Enter deal title"
                                            />
                                            {errors.title && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.title}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="amount" className="text-sm font-medium">
                                                Amount *
                                            </Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    value={formData.amount}
                                                    onChange={(e) => handleInputChange('amount', e.target.value)}
                                                    className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            {errors.amount && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.amount}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status and Priority */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="status" className="text-sm font-medium">
                                                Status
                                            </Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value) => handleInputChange('status', value)}
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
                                            <Label htmlFor="priority" className="text-sm font-medium">
                                                Priority
                                            </Label>
                                            <Select
                                                value={formData.priority}
                                                onValueChange={(value) => handleInputChange('priority', value)}
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

                                    {/* Due Date */}
                                    <div className="space-y-2">
                                        <Label htmlFor="due_date" className="text-sm font-medium">
                                            Due Date
                                        </Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="due_date"
                                                type="date"
                                                value={formData.due_date}
                                                onChange={(e) => handleInputChange('due_date', e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Brand and Position */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="brand_id" className="text-sm font-medium">
                                                Brand *
                                            </Label>
                                            <Select
                                                value={formData.brand_id}
                                                onValueChange={(value) => handleInputChange('brand_id', value)}
                                            >
                                                <SelectTrigger className={errors.brand_id ? 'border-red-500' : ''}>
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
                                            {errors.brand_id && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.brand_id}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="position_id" className="text-sm font-medium">
                                                Position *
                                            </Label>
                                            <Select
                                                value={formData.position_id}
                                                onValueChange={(value) => handleInputChange('position_id', value)}
                                                disabled={!formData.brand_id}
                                            >
                                                <SelectTrigger className={errors.position_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder={!formData.brand_id ? 'Select a brand first' : 'Select position'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {positions.map((position) => (
                                                        <SelectItem key={position.id} value={position.id.toString()}>
                                                            {position.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.position_id && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.position_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* HR */}
                                    <div className="space-y-2">
                                        <Label htmlFor="hr_id" className="text-sm font-medium">
                                            HR *
                                        </Label>
                                        <Select
                                            value={formData.hr_id}
                                            onValueChange={(value) => handleInputChange('hr_id', value)}
                                            disabled={!formData.brand_id}
                                        >
                                            <SelectTrigger className={errors.hr_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder={!formData.brand_id ? 'Select a brand first' : 'Select HR'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {hrs.map((hr) => (
                                                    <SelectItem key={hr.id} value={hr.id.toString()}>
                                                        {hr.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.hr_id && (
                                            <p className="text-xs text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.hr_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Pipeline and Stage */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="pipeline_id" className="text-sm font-medium">
                                                Pipeline *
                                            </Label>
                                            <Select
                                                value={formData.pipeline_id}
                                                onValueChange={(value) => handleInputChange('pipeline_id', value)}
                                            >
                                                <SelectTrigger className={errors.pipeline_id ? 'border-red-500' : ''}>
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
                                            {errors.pipeline_id && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.pipeline_id}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="stage_id" className="text-sm font-medium">
                                                Stage *
                                            </Label>
                                            <Select
                                                value={formData.stage_id}
                                                onValueChange={(value) => handleInputChange('stage_id', value)}
                                                disabled={!formData.pipeline_id}
                                            >
                                                <SelectTrigger className={errors.stage_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder={!formData.pipeline_id ? 'Select a pipeline first' : 'Select stage'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stages.map((stage) => (
                                                        <SelectItem key={stage.id} value={stage.id.toString()}>
                                                            {stage.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.stage_id && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.stage_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                            <Tag className="h-4 w-4" />
                                            Tags
                                        </Label>
                                        <div className="flex flex-wrap gap-2 border rounded-md p-3">
                                            {availableTags.map((tag) => {
                                                const isSelected = formData.tags.includes(tag.name);
                                                return (
                                                    <Badge
                                                        key={tag.id}
                                                        variant={isSelected ? "default" : "outline"}
                                                        className={`cursor-pointer ${isSelected ? '' : tag.color}`}
                                                        onClick={() => handleTagToggle(tag.name)}
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.visit('/deals')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isLoading}
                                            className="flex items-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    Update Deal
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Candidate Info */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Candidate Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {initialDeal.candidate && (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 font-semibold text-lg">
                                                    {initialDeal.candidate.name.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {initialDeal.candidate.name}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {initialDeal.candidate.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {initialDeal.candidate.phone && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <span>{initialDeal.candidate.phone}</span>
                                                </div>
                                            )}
                                            {initialDeal.candidate.company && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Building className="h-4 w-4 text-gray-400" />
                                                    <span>{initialDeal.candidate.company}</span>
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => router.visit(`/candidates/${initialDeal.candidate?.id}`)}
                                        >
                                            View Full Profile
                                        </Button>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Current Deal Status */}
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle className="text-sm">Current Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <Badge className={statusColors[formData.status as keyof typeof statusColors] || ''}>
                                        {formData.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Priority</span>
                                    <Badge className={priorityColors[formData.priority as keyof typeof priorityColors]}>
                                        {formData.priority}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Amount</span>
                                    <span className="font-semibold">${formData.amount}</span>
                                </div>
                                {formData.due_date && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Due Date</span>
                                        <span className="text-sm">
                                            {new Date(formData.due_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
