// src/pages/Show.tsx
import React, { useState, useEffect } from 'react';
import { Head,router, usePage } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Mail, Phone, MapPin, Edit, ArrowLeft, FileText, Download, Building, Calendar, Briefcase, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import { Candidate } from '@/types';
import AppLayout from '@/layouts/app-layout';
import DealsSection from './DealsSection';
import ActivitySection from './ActivitySection';
import DocumentsSection from './DocumentsSection';
import PersonalDocumentsSection from './PersonalDocumentsSection';
import LogsSection from './LogsSection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Candidates', href: '/candidates' },
    { title: 'Candidate Details', href: null },
];
const Show: React.FC = () => {
    const { props } = usePage<{ candidate: Candidate }>();
    const [candidate, setCandidate] = useState<Candidate>(props.candidate);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('activity');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFullInfo, setShowFullInfo] = useState(false);

    // Check if candidate exists
    if (!candidate) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Error" />
                <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <p className="text-red-500 mb-4">Candidate not found</p>
                            <Button onClick={() => window.history.back()}>Go Back</Button>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Function to reload candidate data
    const reloadCandidate = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(`/candidates/${props.candidate.id}`);
            if (response.data && response.data.data) {
                setCandidate(response.data.data);
            }
        } catch (err) {
            console.error('Failed to reload candidate:', err);
            setError('Error loading candidate data. Please refresh the page.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // setIsLoading(true);
            setError(null);
            const response = await axios.put(`/candidates/${candidate.id}`, candidate);
            // console.log(response);
            
            // Navigate to the candidate details page instead of reloading
            router.visit(`/candidates/${candidate.id}`, {
                method: 'get',
                preserveState: false, // Ensure fresh data is loaded
                onSuccess: () => {
                    setCandidate(response.data);
                    setIsEditing(false);
                },
            });
        } catch (error) {
            console.error('Failed to update candidate:', error);
            setError('Failed to update candidate. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCandidateChange = (field: keyof Candidate, value: string) => {
        setCandidate(prev => ({ ...prev, [field]: value }));
    };

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.put(`/candidates/${candidate.id}/status`, { status: newStatus });
            if (response.data) {
                setCandidate(prev => ({
                    ...prev,
                    status: newStatus
                }));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            setError('Failed to update status. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Loading Candidate..." />
                <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <p className="text-gray-500 animate-pulse">Loading candidate data...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Error" />
                <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <p className="text-red-500 mb-4">{error}</p>
                            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Candidate: ${candidate.name}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 overflow-hidden">
                            <h2
                                className="text-2xl md:text-3xl font-bold tracking-tight truncate"
                                title={candidate.name} // Tooltip for full name
                            >
                                {candidate.name}
                            </h2>
                            <p
                                className="text-sm text-muted-foreground truncate"
                                title={candidate.company_name || 'No company'} // Tooltip for full company name
                            >
                                {candidate.company_name || 'No company'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(prev => !prev)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {isEditing ? 'Cancel' : 'Edit Candidate'}
                        </Button>
                        {candidate.email && (
                            <Button variant="outline" asChild>
                                <a href={`mailto:${candidate.email}`}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Email
                                </a>
                            </Button>
                        )}
                        {candidate.phone && (
                            <Button variant="outline" asChild>
                                <a href={`tel:${candidate.phone}`}>
                                    <Phone className="mr-2 h-4 w-4" />
                                    Call
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Candidate Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Candidate Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {isEditing ? (
                                    // Edit Mode: Form with input fields
                                    <form onSubmit={handleUpdateCandidate} className="space-y-4">
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="name">Name *</Label>
                                                <Input
                                                    id="name"
                                                    value={candidate.name}
                                                    onChange={(e) => handleCandidateChange('name', e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="phone">Phone *</Label>
                                                <Input
                                                    id="phone"
                                                    value={candidate.phone}
                                                    onChange={(e) => handleCandidateChange('phone', e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    value={candidate.email || ''}
                                                    onChange={(e) => handleCandidateChange('email', e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="website">Website</Label>
                                                <Input
                                                    id="website"
                                                    value={candidate.website || ''}
                                                    onChange={(e) => handleCandidateChange('website', e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    value={candidate.city || ''}
                                                    onChange={(e) => handleCandidateChange('city', e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="state">State</Label>
                                                <Input
                                                    id="state"
                                                    value={candidate.state || ''}
                                                    onChange={(e) => handleCandidateChange('state', e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="country">Country</Label>
                                                <Input
                                                    id="country"
                                                    value={candidate.country || ''}
                                                    onChange={(e) => handleCandidateChange('country', e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="company_name">Company Name</Label>
                                                <Input
                                                    id="company_name"
                                                    value={candidate.company_name || ''}
                                                    onChange={(e) => handleCandidateChange('company_name', e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="designations">Designations</Label>
                                                <div className="space-y-2">
                                                    {candidate.designations && candidate.designations.map((designation, index) => (
                                                        <div key={index} className="flex gap-2">
                                                            <Input
                                                                value={designation}
                                                                onChange={(e) => {
                                                                    const newDesignations = [...(candidate.designations || [])];
                                                                    newDesignations[index] = e.target.value;
                                                                    setCandidate(prev => ({ ...prev, designations: newDesignations }));
                                                                }}
                                                                placeholder="Enter designation"
                                                                disabled={isLoading}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const newDesignations = candidate.designations?.filter((_, i) => i !== index) || [];
                                                                    setCandidate(prev => ({ ...prev, designations: newDesignations }));
                                                                }}
                                                                disabled={isLoading}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newDesignations = [...(candidate.designations || []), ''];
                                                            setCandidate(prev => ({ ...prev, designations: newDesignations }));
                                                        }}
                                                        disabled={isLoading}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Add Designation
                                                    </Button>
                                                </div>
                                            </div>
                                            <div>
                                                <Label htmlFor="status">Status</Label>
                                                <Select
                                                    value={candidate.status || 'interested'}
                                                    onValueChange={handleStatusUpdate}
                                                    disabled={isLoading}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="interested">Interested</SelectItem>
                                                        <SelectItem value="not_interested">Not Interested</SelectItem>
                                                        <SelectItem value="dnd">Do Not Disturb</SelectItem>
                                                        <SelectItem value="followup">Follow Up</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="current_ctc">Current CTC (₹)</Label>
                                                <Input
                                                    id="current_ctc"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={candidate.current_ctc || ''}
                                                    onChange={(e) => handleCandidateChange('current_ctc', e.target.value)}
                                                    disabled={isLoading}
                                                    placeholder="Enter current CTC"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="expected_ctc">Expected CTC (₹)</Label>
                                                <Input
                                                    id="expected_ctc"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={candidate.expected_ctc || ''}
                                                    onChange={(e) => handleCandidateChange('expected_ctc', e.target.value)}
                                                    disabled={isLoading}
                                                    placeholder="Enter expected CTC"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="submit"
                                            className="w-full mt-4"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Updating...' : 'Update Candidate'}
                                        </Button>
                                    </form>
                                ) : (
                                    // Display Mode: Static candidate info with accordion
                                    <div className="space-y-4">
                                        {/* Basic Information - Always Visible */}
                                        <div className="space-y-3">
                                            {candidate.email && (
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Email</p>
                                                        <a href={`mailto:${candidate.email}`} className="text-sm text-blue-600 hover:underline">{candidate.email}</a>
                                                    </div>
                                                </div>
                                            )}
                                            {candidate.phone && (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">Phone</p>
                                                        <p className="text-sm">{candidate.phone}</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <span className="h-4 w-4">📊</span>
                                                <div className="w-full">
                                                    <p className="text-sm text-muted-foreground">Status</p>
                                                    <Select
                                                        value={candidate.status || 'interested'}
                                                        onValueChange={handleStatusUpdate}
                                                        disabled={isLoading}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="interested">Interested</SelectItem>
                                                            <SelectItem value="not_interested">Not Interested</SelectItem>
                                                            <SelectItem value="dnd">Do Not Disturb</SelectItem>
                                                            <SelectItem value="followup">Follow Up</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* View More Button */}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowFullInfo(!showFullInfo)}
                                            className="w-full flex items-center justify-center gap-2"
                                        >
                                            {showFullInfo ? (
                                                <>
                                                    <ChevronUp className="h-4 w-4" />
                                                    View Less
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="h-4 w-4" />
                                                    View More Details
                                                </>
                                            )}
                                        </Button>

                                        {/* Expanded Information */}
                                        {showFullInfo && (
                                            <div className="space-y-3 pt-3 border-t">
                                                {(candidate.city || candidate.state || candidate.country) && (
                                                    <div className="flex items-center gap-3">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Location</p>
                                                            <p className="text-sm">
                                                                {candidate.city}{candidate.city && candidate.state ? ', ' : ''}{candidate.state} {candidate.country}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                {candidate.website && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-4 w-4">🌐</span>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Website</p>
                                                            <a href={candidate.website} target="_blank" className="text-sm text-blue-600 hover:underline" rel="noopener noreferrer">
                                                                {candidate.website}
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                                {candidate.resume && (
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <div className="w-full">
                                                            <p className="text-sm text-muted-foreground">Resume</p>
                                                            <a 
                                                                href={`/storage/${candidate.resume}`} 
                                                                target="_blank" 
                                                                className="text-sm text-blue-600 hover:underline"
                                                            >
                                                                Resume.pdf
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                                {candidate.company_name && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-4 w-4">🏢</span>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Company</p>
                                                            <p className="text-sm">{candidate.company_name}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {candidate.designations && candidate.designations.length > 0 && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-4 w-4">💼</span>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Designations</p>
                                                            <div className="space-y-2 mt-1">
                                                                {candidate.designations.map((designation, index) => (
                                                                    <div key={index} className="text-sm">
                                                                        <div className="font-medium">{designation.title}</div>
                                                                        {designation.company && (
                                                                            <div className="text-gray-600">{designation.company}</div>
                                                                        )}
                                                                        {designation.start_date && (
                                                                            <div className="text-gray-500 text-xs">
                                                                                {new Date(designation.start_date).toLocaleDateString()}
                                                                                {designation.end_date && ` - ${new Date(designation.end_date).toLocaleDateString()}`}
                                                                                {designation.is_current && ' (Current)'}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {(candidate.current_ctc || candidate.expected_ctc) && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-4 w-4">💰</span>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">CTC Information</p>
                                                            <div className="space-y-1 mt-1">
                                                                {candidate.current_ctc && (
                                                                    <div className="text-sm">
                                                                        <span className="text-gray-600">Current CTC:</span>
                                                                        <span className="font-medium ml-1">₹{candidate.current_ctc.toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                                {candidate.expected_ctc && (
                                                                    <div className="text-sm">
                                                                        <span className="text-gray-600">Expected CTC:</span>
                                                                        <span className="font-medium ml-1">₹{candidate.expected_ctc.toLocaleString()}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {candidate.owner && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-4 w-4">👤</span>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Created By</p>
                                                            <p className="text-sm font-medium text-blue-600">{candidate.owner.name}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {candidate.created_at && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-4 w-4">📅</span>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Created At</p>
                                                            <p className="text-sm">{new Date(candidate.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {candidate.updated_at && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-4 w-4">🔄</span>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Updated At</p>
                                                            <p className="text-sm">{new Date(candidate.updated_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {candidate.last_activity_at && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-4 w-4">⚡</span>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground">Last Activity</p>
                                                            <p className="text-sm">{new Date(candidate.last_activity_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Tabs */}
                    <div className="lg:col-span-2">
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                            <TabsList className="grid w-full grid-cols-5 gap-4 bg-gray-100 p-3 rounded-lg">
                                <TabsTrigger value="activity" className="rounded-md px-4 py-3">Activity</TabsTrigger>
                                <TabsTrigger value="deals" className="rounded-md px-4 py-3">Positions    </TabsTrigger>
                                {/* <TabsTrigger value="documents" className="rounded-md px-4 py-3">General Docs</TabsTrigger> */}
                                <TabsTrigger value="personal-documents" className="rounded-md px-4 py-3"> Documents</TabsTrigger>
                                <TabsTrigger value="logs" className="rounded-md px-4 py-3">Logs</TabsTrigger>
                            </TabsList>

                            {/* Logs Tab */}
                            <TabsContent value="logs">
                                <LogsSection candidate={candidate} setCandidate={setCandidate} />
                            </TabsContent>

                            {/* Deals Tab */}
                            <TabsContent value="deals">
                                <DealsSection candidate={candidate} setCandidate={setCandidate} />
                            </TabsContent>

                            {/* Activity Tab */}
                            <TabsContent value="activity">
                                <ActivitySection candidate={candidate} setCandidate={setCandidate} />
                            </TabsContent>

                            {/* General Documents Tab */}
                            <TabsContent value="documents">
                                <DocumentsSection candidate={candidate} setCandidate={setCandidate} />
                            </TabsContent>

                            {/* Personal Documents Tab */}
                            <TabsContent value="personal-documents">
                                <PersonalDocumentsSection candidate={candidate} setCandidate={setCandidate} />
                            </TabsContent>

                            {/* Work Experience Section */}
                            {candidate.positions && candidate.positions.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5" />
                                            Work Experience
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {candidate.positions.map((position, index) => (
                                            <div key={index} className="p-4 border rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-lg">{position.title}</h4>
                                                        <p className="text-gray-600">{position.company}</p>
                                                    </div>
                                                    {position.is_current && (
                                                        <Badge variant="default">Current</Badge>
                                                    )}
                                                </div>
                                                
                                                <div className="mt-2 text-sm text-gray-500">
                                                    {position.start_date && (
                                                        <span>
                                                            {new Date(position.start_date).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {position.start_date && position.end_date && (
                                                        <span> - </span>
                                                    )}
                                                    {position.end_date && (
                                                        <span>
                                                            {new Date(position.end_date).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {!position.end_date && position.is_current && (
                                                        <span> - Present</span>
                                                    )}
                                                </div>
                                                
                                                {position.description && (
                                                    <p className="mt-2 text-gray-700">{position.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Show;