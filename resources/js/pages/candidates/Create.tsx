import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Phone, ArrowLeft, User, Mail, Building, Calendar, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';

interface ExistingCandidate {
    id: number;
    name: string;
    email: string;
    phone: string;
    company_name?: string;
    current_designation?: string;
    experience?: string;
    notice_period?: string;
    status: string;
    owner?: {
        id: number;
        name: string;
    };
    created_at: string;
    updated_at: string;
}

export default function CreateCandidate() {
    const [step, setStep] = useState<'phone' | 'form' | 'existing'>('phone');
    const [phoneData, setPhoneData] = useState({
        country_code: '+91',
        phone: ''
    });
    const [phoneError, setPhoneError] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [existingCandidate, setExistingCandidate] = useState<ExistingCandidate | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        company_name: '',
        current_designation: '',
        experience: '',
        notice_period: '',
        designations: [] as Array<{
            title: string;
            company: string;
            description: string;
            start_date: string;
            end_date: string;
            is_current: boolean;
        }>,
        status: 'interested',
        current_ctc: '',
        expected_ctc: '',
        resume: null as File | null,
        documents: [] as File[],
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

    const addDesignation = () => {
        setData('designations', [
            ...data.designations,
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

    const removeDesignation = (index: number) => {
        setData('designations', data.designations.filter((_, i) => i !== index));
    };

    const updateDesignation = (index: number, field: string, value: any) => {
        const updatedDesignations = [...data.designations];
        updatedDesignations[index] = { ...updatedDesignations[index], [field]: value };
        setData('designations', updatedDesignations);
    };

    const checkPhoneNumber = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsChecking(true);
        setPhoneError('');

        try {
            const fullPhone = phoneData.country_code + phoneData.phone;
            const response = await axios.post('/api/check-phone', { phone: fullPhone });
            
            if (response.data.exists) {
                // Phone exists, show existing candidate info
                setExistingCandidate(response.data.candidate);
                setStep('existing');
            } else {
                // Phone is new, proceed to form
                setData('phone', fullPhone);
                setStep('form');
            }
        } catch (error) {
            setPhoneError('Error checking phone number. Please try again.');
        } finally {
            setIsChecking(false);
        }
    };

    const goBackToPhone = () => {
        setStep('phone');
        setPhoneError('');
        setExistingCandidate(null);
    };

    const viewExistingCandidate = () => {
        if (existingCandidate !== null) {
            window.location.href = `/candidates/${existingCandidate.id}`;
        }
    };

    const continueWithNewPhone = () => {
        setStep('phone');
        setPhoneError('');
        setExistingCandidate(null);
        setPhoneData({ country_code: '+91', phone: '' });
    };

    // Phone validation step
    if (step === 'phone') {
        return (
            <AppLayout>
                <div className="container mx-auto py-6">
                    <div className="max-w-md mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    Create New Candidate
                                </CardTitle>
                                <CardDescription>
                                    Enter the candidate's phone number to check if they already exist in the system.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={checkPhoneNumber} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="country_code">Country Code</Label>
                                        <Select
                                            value={phoneData.country_code}
                                            onValueChange={(value) => setPhoneData(prev => ({ ...prev, country_code: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="+91">🇮🇳 +91 (India)</SelectItem>
                                                <SelectItem value="+1">🇺🇸 +1 (USA)</SelectItem>
                                                <SelectItem value="+44">🇬🇧 +44 (UK)</SelectItem>
                                                <SelectItem value="+61">🇦🇺 +61 (Australia)</SelectItem>
                                                <SelectItem value="+86">🇨🇳 +86 (China)</SelectItem>
                                                <SelectItem value="+81">🇯🇵 +81 (Japan)</SelectItem>
                                                <SelectItem value="+49">🇩🇪 +49 (Germany)</SelectItem>
                                                <SelectItem value="+33">🇫🇷 +33 (France)</SelectItem>
                                                <SelectItem value="+39">🇮🇹 +39 (Italy)</SelectItem>
                                                <SelectItem value="+34">🇪🇸 +34 (Spain)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={phoneData.phone}
                                            onChange={(e) => setPhoneData(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="Enter phone number"
                                            required
                                        />
                                    </div>

                                    {phoneError && (
                                        <p className="text-sm text-red-500">{phoneError}</p>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isChecking || !phoneData.phone}
                                    >
                                        {isChecking ? 'Checking...' : 'Check Phone Number'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Existing candidate found step
    if (step === 'existing' && existingCandidate !== null) {
        return (
            <AppLayout>
                <div className="container mx-auto py-6">
                    <div className="max-w-md mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-600">
                                    <AlertTriangle className="h-5 w-5" />
                                    Candidate Already Exists
                                </CardTitle>
                                <CardDescription>
                                    A candidate with this phone number already exists in the system.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Existing Candidate Info */}
                                    <div className="p-4 border rounded-lg bg-gray-50">
                                        <div className="flex items-center gap-2 mb-3">
                                            <User className="h-4 w-4 text-blue-600" />
                                            <h3 className="font-semibold text-lg">{existingCandidate.name}</h3>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-500" />
                                                <span>{existingCandidate.email}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-500" />
                                                <span>{existingCandidate.phone}</span>
                                            </div>
                                            
                                            {existingCandidate.company_name && (
                                                <div className="flex items-center gap-2">
                                                    <Building className="h-4 w-4 text-gray-500" />
                                                    <span>{existingCandidate.company_name}</span>
                                                </div>
                                            )}
                                            
                                            {existingCandidate.current_designation && (
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                    <span>{existingCandidate.current_designation}</span>
                                                </div>
                                            )}
                                            
                                            {existingCandidate.experience && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                    <span>Experience: {existingCandidate.experience}</span>
                                                </div>
                                            )}
                                            
                                            {existingCandidate.notice_period && (
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-gray-500" />
                                                    <span>Notice: {existingCandidate.notice_period}</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                <span>Created: {new Date(existingCandidate.created_at).toLocaleDateString()}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Badge variant={existingCandidate.status === 'interested' ? 'default' : 'secondary'}>
                                                    {existingCandidate.status.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                            </div>
                                            
                                            {existingCandidate.owner && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs text-gray-500">Owner:</span>
                                                    <span className="text-xs font-medium text-blue-600">{existingCandidate.owner.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2">
                                        <Button
                                            onClick={viewExistingCandidate}
                                            className="w-full"
                                        >
                                            View Existing Candidate
                                        </Button>
                                        
                                        <Button
                                            onClick={continueWithNewPhone}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            Try Different Phone Number
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Main candidate creation form
    return (
        <AppLayout>
            <div className="container mx-auto py-6">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={goBackToPhone}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Phone Check
                                </Button>
                                <div>
                                    <CardTitle>Add New Candidate</CardTitle>
                                    <CardDescription>
                                        Create a new candidate with their details and documents.
                                    </CardDescription>
                                </div>
                            </div>
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
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            disabled
                                            className="bg-gray-50"
                                        />
                                        <p className="text-xs text-gray-500">Phone number from previous step</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company_name">Company Name</Label>
                                        <Input
                                            id="company_name"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                            placeholder="Enter company name"
                                        />
                                        {errors.company_name && <p className="text-sm text-red-500">{errors.company_name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="current_designation">Current Designation</Label>
                                        <Input
                                            id="current_designation"
                                            value={data.current_designation}
                                            onChange={(e) => setData('current_designation', e.target.value)}
                                            placeholder="e.g., Senior Fashion Stylist"
                                        />
                                        {errors.current_designation && <p className="text-sm text-red-500">{errors.current_designation}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="experience">Experience</Label>
                                        <Input
                                            id="experience"
                                            value={data.experience}
                                            onChange={(e) => setData('experience', e.target.value)}
                                            placeholder="e.g., 10+ Years"
                                        />
                                        {errors.experience && <p className="text-sm text-red-500">{errors.experience}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notice_period">Notice Period</Label>
                                        <Input
                                            id="notice_period"
                                            value={data.notice_period}
                                            onChange={(e) => setData('notice_period', e.target.value)}
                                            placeholder="e.g., 1 Month"
                                        />
                                        {errors.notice_period && <p className="text-sm text-red-500">{errors.notice_period}</p>}
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

                                    <div className="space-y-2">
                                        <Label htmlFor="current_ctc">Current CTC (₹)</Label>
                                        <Input
                                            id="current_ctc"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.current_ctc}
                                            onChange={(e) => setData('current_ctc', e.target.value)}
                                            placeholder="Enter current CTC"
                                        />
                                        {errors.current_ctc && <p className="text-sm text-red-500">{errors.current_ctc}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="expected_ctc">Expected CTC (₹)</Label>
                                        <Input
                                            id="expected_ctc"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.expected_ctc}
                                            onChange={(e) => setData('expected_ctc', e.target.value)}
                                            placeholder="Enter expected CTC"
                                        />
                                        {errors.expected_ctc && <p className="text-sm text-red-500">{errors.expected_ctc}</p>}
                                    </div>
                                </div>

                                {/* Designations Section */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-base font-medium">Designations</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addDesignation}
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Designation
                                        </Button>
                                    </div>

                                    {data.designations.map((designation, index) => (
                                        <div key={index} className="p-4 border rounded-lg space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium">Designation {index + 1}</h4>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeDesignation(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor={`designation-title-${index}`}>Job Title *</Label>
                                                    <Input
                                                        id={`designation-title-${index}`}
                                                        value={designation.title}
                                                        onChange={(e) => updateDesignation(index, 'title', e.target.value)}
                                                        placeholder="e.g., Senior Developer"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`designation-company-${index}`}>Company</Label>
                                                    <Input
                                                        id={`designation-company-${index}`}
                                                        value={designation.company}
                                                        onChange={(e) => updateDesignation(index, 'company', e.target.value)}
                                                        placeholder="e.g., Tech Corp"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`designation-start-date-${index}`}>Start Date</Label>
                                                    <Input
                                                        id={`designation-start-date-${index}`}
                                                        type="date"
                                                        value={designation.start_date}
                                                        onChange={(e) => updateDesignation(index, 'start_date', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`designation-end-date-${index}`}>End Date</Label>
                                                    <Input
                                                        id={`designation-end-date-${index}`}
                                                        type="date"
                                                        value={designation.end_date}
                                                        onChange={(e) => updateDesignation(index, 'end_date', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`designation-description-${index}`}>Description</Label>
                                                <Textarea
                                                    id={`designation-description-${index}`}
                                                    value={designation.description}
                                                    onChange={(e) => updateDesignation(index, 'description', e.target.value)}
                                                    placeholder="Describe the role and responsibilities..."
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`designation-current-${index}`}
                                                    checked={designation.is_current}
                                                    onChange={(e) => updateDesignation(index, 'is_current', e.target.checked)}
                                                />
                                                <Label htmlFor={`designation-current-${index}`}>Current Position</Label>
                                            </div>
                                        </div>
                                    ))}

                                    {data.designations.length === 0 && (
                                        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                            <p>No designations added yet</p>
                                            <p className="text-sm">Click "Add Designation" to add work experience</p>
                                        </div>
                                    )}
                                </div>

                                {/* Documents Section */}
                                <div className="space-y-4">
                                    <Label className="text-base font-medium">Documents</Label>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="resume">Resume (PDF)</Label>
                                        <Input
                                            id="resume"
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => handleFileChange('resume', e.target.files)}
                                        />
                                        {errors.resume && <p className="text-sm text-red-500">{errors.resume}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="documents">Additional Documents</Label>
                                        <Input
                                            id="documents"
                                            type="file"
                                            multiple
                                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                            onChange={(e) => handleFileChange('documents', e.target.files)}
                                        />
                                        {errors.documents && <p className="text-sm text-red-500">{errors.documents}</p>}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing ? 'Creating Candidate...' : 'Create Candidate'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 