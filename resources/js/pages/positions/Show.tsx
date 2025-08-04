import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';
import { Mail, Phone, Building, User, FileText, Download, MapPin, Calendar, AlertTriangle } from 'lucide-react';

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
    current_designation?: string;
    experience?: string;
    notice_period?: string;
    status?: string;
    current_ctc?: number;
    expected_ctc?: number;
    resume?: string;
    documents?: Array<{
        id: number;
        name: string;
        path: string;
        type: string;
        document_type?: string;
        created_at: string;
        updated_at: string;
    }>;
    created_at: string;
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
                    if ((page.props.flash as any)?.success) {
                        toast.success((page.props.flash as any).success);
                    } else if ((page.props.flash as any)?.error) {
                        toast.error((page.props.flash as any).error);
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

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getDocumentIcon = (documentType: string) => {
        switch (documentType) {
            case 'pan_card':
                return '🆔';
            case 'aadhar_card':
                return '🆔';
            case 'experience_certificate':
                return '🏢';
            case 'salary_slip':
                return '💰';
            default:
                return '📄';
        }
    };

    const getDocumentTypeLabel = (documentType: string) => {
        switch (documentType) {
            case 'pan_card':
                return 'PAN Card';
            case 'aadhar_card':
                return 'Aadhar Card';
            case 'experience_certificate':
                return 'Experience Certificate';
            case 'salary_slip':
                return 'Salary Slip';
            default:
                return 'Other Document';
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

                    {/* Brand & HR Info Corner */}
                    <div className="mb-6 flex gap-4">
                        {position.brand && (
                            <Card className="flex-1">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Building className="h-4 w-4" />
                                        Brand
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium">{position.brand.name}</p>
                                </CardContent>
                            </Card>
                        )}
                        
                        {position.hr && (
                            <Card className="flex-1">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        HR Contact
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium">{position.hr.name || position.hr.email}</p>
                                    <p className="text-sm text-gray-600">{position.hr.email}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Candidates List */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Candidates</CardTitle>
                                <Link href="/candidates/create">
                                    <Button size="sm">Add New Candidate</Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {relatedCandidates.length > 0 ? (
                                <div className="space-y-6">
                                    {relatedCandidates.map((candidate) => (
                                        <div key={candidate.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                                            {/* Candidate Header */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-semibold">{candidate.name}</h3>
                                                        {candidate.status && (
                                                            <Badge variant="secondary">{candidate.status}</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="h-4 w-4" />
                                                            <span>{candidate.email}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-4 w-4" />
                                                            <span>{candidate.phone}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>Created: {new Date(candidate.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={`/candidates/${candidate.id}`}>
                                                        <Button variant="outline" size="sm">View Details</Button>
                                                    </Link>
                                                    {position.hr && (
                                                        <Button 
                                                            onClick={() => sendCandidateInfoToHr(candidate.id, position.hr!.email)}
                                                            disabled={sendingEmail}
                                                            size="sm"
                                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                                        >
                                                            {sendingEmail ? 'Sending...' : '📧 Send to HR'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Professional Information */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                                {candidate.company_name && (
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Company</p>
                                                            <p className="font-medium">{candidate.company_name}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {candidate.current_designation && (
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Designation</p>
                                                            <p className="font-medium">{candidate.current_designation}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {candidate.experience && (
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Experience</p>
                                                            <p className="font-medium">{candidate.experience}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {candidate.notice_period && (
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4 text-gray-500" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Notice Period</p>
                                                            <p className="font-medium">{candidate.notice_period}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* CTC Information */}
                                            {(candidate.current_ctc || candidate.expected_ctc) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    {candidate.current_ctc && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-green-600">💰</span>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Current CTC</p>
                                                                <p className="font-medium text-green-600">₹{candidate.current_ctc.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {candidate.expected_ctc && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-blue-600">💰</span>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Expected CTC</p>
                                                                <p className="font-medium text-blue-600">₹{candidate.expected_ctc.toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Documents Section */}
                                            <div className="border-t pt-4">
                                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Documents
                                                </h4>
                                                
                                                <div className="space-y-2">
                                                    {/* Resume */}
                                                    {candidate.resume && (
                                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-blue-600" />
                                                                <span className="text-sm font-medium">Resume</span>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => window.open(`/storage/${candidate.resume}`, '_blank')}
                                                            >
                                                                <Download className="h-4 w-4 mr-1" />
                                                                View
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {/* Personal Documents */}
                                                    {candidate.documents && candidate.documents.length > 0 && (
                                                        candidate.documents.map((doc) => (
                                                            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-lg">{getDocumentIcon(doc.document_type || '')}</span>
                                                                    <div>
                                                                        <span className="text-sm font-medium">{doc.name}</span>
                                                                        <p className="text-xs text-gray-500">{getDocumentTypeLabel(doc.document_type || '')}</p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => window.open(`/storage/${doc.path}`, '_blank')}
                                                                >
                                                                    <Download className="h-4 w-4 mr-1" />
                                                                    View
                                                                </Button>
                                                            </div>
                                                        ))
                                                    )}

                                                    {(!candidate.resume && (!candidate.documents || candidate.documents.length === 0)) && (
                                                        <p className="text-sm text-gray-500 italic">No documents available</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">No candidates found for this position</p>
                                    <Link href="/candidates/create">
                                        <Button>Add First Candidate</Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 