import React from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

export default function CreateCandidate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        position: '',
        status: 'interested',
        resume: null,
        documents: [],
        positions: [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('candidates.store'));
    };

    const handleFileChange = (field: string, files: FileList | null) => {
        if (field === 'resume') {
            setData('resume', files?.[0] || null);
        } else if (field === 'documents') {
            setData('documents', Array.from(files || []));
        }
    };

    const addPosition = () => {
        setData('positions', [
            ...data.positions,
            {
                title: '',
                company: '',
                description: '',
                start_date: '',
                end_date: '',
                is_current: false,
            }
        ]);
    };

    const removePosition = (index: number) => {
        setData('positions', data.positions.filter((_, i) => i !== index));
    };

    const updatePosition = (index: number, field: string, value: any) => {
        const updatedPositions = [...data.positions];
        updatedPositions[index] = { ...updatedPositions[index], [field]: value };
        setData('positions', updatedPositions);
    };

    return (
        <AppLayout>
            <div className="container mx-auto py-6">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Add New Candidate</CardTitle>
                            <CardDescription>
                                Create a new candidate with their details and documents.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Enter full name"
                                        />
                                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Enter email address"
                                        />
                                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="Enter phone number"
                                        />
                                        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company_name">Company</Label>
                                        <Input
                                            id="company_name"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                            placeholder="Enter company name"
                                        />
                                        {errors.company_name && <p className="text-sm text-red-500">{errors.company_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="position">Position</Label>
                                        <Input
                                            id="position"
                                            value={data.position}
                                            onChange={(e) => setData('position', e.target.value)}
                                            placeholder="Enter position/title"
                                        />
                                        {errors.position && <p className="text-sm text-red-500">{errors.position}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="status">Status</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(value) => setData('status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="interested">Interested</SelectItem>
                                                <SelectItem value="not_interested">Not Interested</SelectItem>
                                                <SelectItem value="dnd">Do Not Disturb</SelectItem>
                                                <SelectItem value="followup">Follow Up</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                                    </div>
                                </div>

                                {/* Positions Section */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-base font-medium">Work Experience</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addPosition}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Position
                                        </Button>
                                    </div>

                                    {data.positions.map((position, index) => (
                                        <div key={index} className="p-4 border rounded-lg space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium">Position {index + 1}</h4>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removePosition(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`position-title-${index}`}>Job Title *</Label>
                                                    <Input
                                                        id={`position-title-${index}`}
                                                        value={position.title}
                                                        onChange={(e) => updatePosition(index, 'title', e.target.value)}
                                                        placeholder="e.g., Senior Developer"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`position-company-${index}`}>Company</Label>
                                                    <Input
                                                        id={`position-company-${index}`}
                                                        value={position.company}
                                                        onChange={(e) => updatePosition(index, 'company', e.target.value)}
                                                        placeholder="e.g., Tech Corp"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`position-start-date-${index}`}>Start Date</Label>
                                                    <Input
                                                        id={`position-start-date-${index}`}
                                                        type="date"
                                                        value={position.start_date}
                                                        onChange={(e) => updatePosition(index, 'start_date', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`position-end-date-${index}`}>End Date</Label>
                                                    <Input
                                                        id={`position-end-date-${index}`}
                                                        type="date"
                                                        value={position.end_date}
                                                        onChange={(e) => updatePosition(index, 'end_date', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`position-description-${index}`}>Description</Label>
                                                <Textarea
                                                    id={`position-description-${index}`}
                                                    value={position.description}
                                                    onChange={(e) => updatePosition(index, 'description', e.target.value)}
                                                    placeholder="Describe the role and responsibilities..."
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`position-current-${index}`}
                                                    checked={position.is_current}
                                                    onChange={(e) => updatePosition(index, 'is_current', e.target.checked)}
                                                />
                                                <Label htmlFor={`position-current-${index}`}>Current Position</Label>
                                            </div>
                                        </div>
                                    ))}

                                    {data.positions.length === 0 && (
                                        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                            <p>No work experience added yet</p>
                                            <p className="text-sm">Click "Add Position" to add work experience</p>
                                        </div>
                                    )}
                                </div>

                                {/* Resume Upload */}
                                <div className="space-y-2">
                                    <Label htmlFor="resume">Resume (PDF)</Label>
                                    <Input
                                        id="resume"
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => handleFileChange('resume', e.target.files)}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-sm text-gray-500">Upload a PDF resume (max 2MB)</p>
                                    {errors.resume && <p className="text-sm text-red-500">{errors.resume}</p>}
                                </div>

                                {/* Documents Upload */}
                                <div className="space-y-2">
                                    <Label htmlFor="documents">Additional Documents</Label>
                                    <Input
                                        id="documents"
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                        onChange={(e) => handleFileChange('documents', e.target.files)}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-sm text-gray-500">
                                        Upload additional documents (PDF, DOC, DOCX, TXT, JPG, PNG - max 2MB each)
                                    </p>
                                    {errors.documents && <p className="text-sm text-red-500">{errors.documents}</p>}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => window.history.back()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Creating...' : 'Create Candidate'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 