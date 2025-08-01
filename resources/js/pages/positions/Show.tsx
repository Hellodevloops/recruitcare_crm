import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';

interface Brand {
    id: number;
    name: string;
}

interface Hr {
    id: number;
    email: string;
    name?: string;
}

interface Candidate {
    id: number;
    name: string;
    email: string;
    phone: string;
    company_name?: string;
    status?: string;
}

interface Pipeline {
    id: number;
    name: string;
}

interface Stage {
    id: number;
    name: string;
}

interface Deal {
    id: number;
    title: string;
    amount: number | null;
    status: string;
    priority: string;
    due_date?: string;
    candidate: Candidate | null;
    brand: Brand;
    hr: Hr;
    pipeline: Pipeline | null;
    stage: Stage | null;
    created_at: string;
    updated_at: string;
}

interface Position {
    id: number;
    title: string;
    experience: string | null;
    store: string | null;
    city: string | null;
    budget: number | null;
    designation: string | null;
    brand: Brand | null;
    hr: Hr | null;
    candidate: Candidate | null;
    deals: Deal[];
    created_at: string;
    updated_at: string;
}

interface Props {
    position: Position;
    relatedCandidates: Candidate[];
}

export default function Show({ position, relatedCandidates }: Props) {
    const [sendingEmail, setSendingEmail] = useState(false);

    const sendCandidateInfoToHr = async (candidateId: number, hrEmail: string) => {
        setSendingEmail(true);
        try {
            router.post(`/positions/${position.id}/send-candidate-info`, {
                candidate_id: candidateId,
                hr_email: hrEmail
            }, {
                onSuccess: (page) => {
                    if (page.props.flash?.success) {
                        toast.success(page.props.flash.success);
                    } else if (page.props.flash?.error) {
                        toast.error(page.props.flash.error);
                    }
                },
                onError: (errors) => {
                    console.error('Email sending errors:', errors);
                    toast.error('Failed to send email. Please try again.');
                },
                onFinish: () => {
                    setSendingEmail(false);
                }
            });
        } catch (error) {
            console.error('Email sending error:', error);
            toast.error('Failed to send email. Please try again.');
            setSendingEmail(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'won':
                return 'bg-green-100 text-green-800';
            case 'lost':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'bg-red-100 text-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout>
            <Head title={`Position: ${position.title}`} />

            <div className="container mx-auto py-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold">{position.title}</h1>
                            <p className="text-gray-600 mt-1">
                                Position ID: {position.id} • Created: {new Date(position.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link href="/positions">
                                <Button variant="outline">Back to Positions</Button>
                            </Link>
                            <Link href={`/positions/${position.id}/edit`}>
                                <Button>Edit Position</Button>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Position Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Position Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Title</label>
                                            <p className="text-lg font-semibold">{position.title}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Designation</label>
                                            <p className="text-lg">{position.designation || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Experience</label>
                                            <p className="text-lg">{position.experience || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Budget</label>
                                            <p className="text-lg font-semibold text-green-600">
                                                {position.budget ? `₹${position.budget.toLocaleString('en-IN')}` : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Store</label>
                                            <p className="text-lg">{position.store || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">City</label>
                                            <p className="text-lg">{position.city || 'N/A'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Connected Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Connected Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Brand Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Brand</h3>
                                        {position.brand ? (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div>
                                                    <p className="font-medium">{position.brand.name}</p>
                                                    <p className="text-sm text-gray-600">Brand ID: {position.brand.id}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">No brand connected</p>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* HR Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">HR Contact</h3>
                                        {position.hr ? (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">{position.hr.name || position.hr.email}</p>
                                                        <p className="text-sm text-gray-600">{position.hr.email}</p>
                                                        <p className="text-sm text-gray-600">HR ID: {position.hr.id}</p>
                                                    </div>
                                                    {position.candidate && (
                                                        <Button 
                                                            onClick={() => sendCandidateInfoToHr(position.candidate!.id, position.hr!.email)}
                                                            disabled={sendingEmail}
                                                            size="sm"
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            {sendingEmail ? 'Sending...' : '📧 Send to Email'}
                                                        </Button>
                                                    )}
                                                </div>
                                                {position.candidate && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Send candidate information including resume and documents to HR
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">No HR contact connected</p>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Candidate Information */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3">Assigned Candidate</h3>
                                        {position.candidate ? (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium">{position.candidate.name}</p>
                                                        <p className="text-sm text-gray-600">{position.candidate.email}</p>
                                                        <p className="text-sm text-gray-600">{position.candidate.phone}</p>
                                                        {position.candidate.company_name && (
                                                            <p className="text-sm text-gray-600">{position.candidate.company_name}</p>
                                                        )}
                                                        {position.candidate.status && (
                                                            <Badge className="mt-1">{position.candidate.status}</Badge>
                                                        )}
                                                    </div>
                                                    <Link href={`/candidates/${position.candidate.id}`}>
                                                        <Button variant="outline" size="sm">View Candidate</Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">No candidate assigned</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Deals</span>
                                        <span className="font-semibold">{position.deals.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Active Deals</span>
                                        <span className="font-semibold">
                                            {position.deals.filter(deal => deal.status === 'pending').length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Won Deals</span>
                                        <span className="font-semibold text-green-600">
                                            {position.deals.filter(deal => deal.status === 'won').length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Value</span>
                                        <span className="font-semibold text-green-600">
                                            ₹{position.deals.reduce((sum, deal) => sum + (deal.amount || 0), 0).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Related Candidates</span>
                                        <span className="font-semibold text-blue-600">
                                            {relatedCandidates.length}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">
                                        Last updated: {new Date(position.updated_at).toLocaleString()}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Deals Section */}
                    <div className="mt-8">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Related Deals</CardTitle>
                                    <Link href="/deals/create">
                                        <Button size="sm">Create New Deal</Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {position.deals.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Deal Title</TableHead>
                                                <TableHead>Candidate</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Priority</TableHead>
                                                <TableHead>Pipeline</TableHead>
                                                <TableHead>Stage</TableHead>
                                                <TableHead>Due Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {position.deals.map((deal) => (
                                                <TableRow key={deal.id}>
                                                    <TableCell className="font-medium">{deal.title}</TableCell>
                                                    <TableCell>
                                                        {deal.candidate ? (
                                                            <Link href={`/candidates/${deal.candidate.id}`} className="text-blue-600 hover:underline">
                                                                {deal.candidate.name}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-gray-500">N/A</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        {deal.amount ? `₹${deal.amount.toLocaleString('en-IN')}` : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusColor(deal.status)}>
                                                            {deal.status || 'N/A'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getPriorityColor(deal.priority)}>
                                                            {deal.priority || 'N/A'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{deal.pipeline?.name || 'N/A'}</TableCell>
                                                    <TableCell>{deal.stage?.name || 'N/A'}</TableCell>
                                                    <TableCell>
                                                        {deal.due_date ? new Date(deal.due_date).toLocaleDateString() : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2 justify-end">
                                                            <Link href={`/deals/${deal.id}`}>
                                                                <Button variant="outline" size="sm">View</Button>
                                                            </Link>
                                                            <Link href={`/deals/${deal.id}/edit`}>
                                                                <Button variant="outline" size="sm">Edit</Button>
                                                            </Link>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 mb-4">No deals found for this position</p>
                                        <Link href="/deals/create">
                                            <Button>Create First Deal</Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Related Candidates Section */}
                    <div className="mt-8">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Related Candidates</CardTitle>
                                    <Link href="/candidates/create">
                                        <Button size="sm">Create New Candidate</Button>
                                    </Link>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    Candidates from deals with the same brand ({position.brand?.name || 'N/A'}) and HR ({position.hr?.email || 'N/A'})
                                </p>
                            </CardHeader>
                            <CardContent>
                                                                    {relatedCandidates.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {relatedCandidates.map((candidate) => (
                                                <div key={candidate.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="font-semibold text-lg">{candidate.name}</h3>
                                                            <p className="text-sm text-gray-600">{candidate.email}</p>
                                                            <p className="text-sm text-gray-600">{candidate.phone}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Link href={`/candidates/${candidate.id}`}>
                                                                <Button variant="outline" size="sm">View</Button>
                                                            </Link>
                                                            {position.hr && (
                                                                <Button 
                                                                    onClick={() => sendCandidateInfoToHr(candidate.id, position.hr!.email)}
                                                                    disabled={sendingEmail}
                                                                    size="sm"
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                                >
                                                                    📧
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                
                                                <div className="space-y-2">
                                                    {candidate.company_name && (
                                                        <div className="flex items-center text-sm">
                                                            <span className="font-medium text-gray-700">Company:</span>
                                                            <span className="ml-2 text-gray-600">{candidate.company_name}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {candidate.status && (
                                                        <div className="flex items-center text-sm">
                                                            <span className="font-medium text-gray-700">Status:</span>
                                                            <Badge className="ml-2" variant="secondary">
                                                                {candidate.status}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 mb-4">No related candidates found</p>
                                        <p className="text-sm text-gray-400">
                                            Related candidates will appear here if they are part of deals with the same brand or HR contact as this position.
                                        </p>
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