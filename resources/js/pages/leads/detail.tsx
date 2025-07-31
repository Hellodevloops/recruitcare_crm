import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
    Calendar, Mail, Phone, MapPin, Edit, ArrowLeft, 
    DollarSign, Clock, User, Briefcase, FileText, Plus, Download, Trash 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface Lead {
    id: string;
    name: string;
    company: string;
    value: string;
    status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Closed';
    email: string;
    phone: string;
    address: string;
    lastContact: string;
    createdDate: string;
    source: string;
    industry: string;
    annualRevenue: string;
    employees: number;
    website: string;
    notes: string;
    activities: { date: string; type: string; description: string; user: string }[];
    documents: { name: string; url: string; uploadedDate: string }[];
    customFields: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leads', href: '/leads' },
    { title: 'Lead Details', href: null },
];

// Sample lead data with more details
const lead: Lead = {
    id: 'lead-1',
    name: 'John Doe',
    company: 'Acme Inc',
    value: '$5,000',
    status: 'New',
    email: 'john@acme.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business St, New York, NY 10001',
    lastContact: '2024-03-24',
    createdDate: '2024-03-20',
    source: 'Website Form',
    industry: 'Technology',
    annualRevenue: '$10M',
    employees: 50,
    website: 'https://acme.com',
    notes: 'Interested in premium package. Needs follow-up next week.',
    activities: [
        { date: '2024-03-24', type: 'Email', description: 'Sent initial proposal', user: 'Jane Smith' },
        { date: '2024-03-23', type: 'Call', description: 'Introductory call - 15 mins', user: 'Mike Johnson' },
    ],
    documents: [
        { name: 'Proposal.pdf', url: '/docs/proposal.pdf', uploadedDate: '2024-03-24' },
        { name: 'Contract.docx', url: '/docs/contract.docx', uploadedDate: '2024-03-23' },
    ],
    customFields: {
        'Preferred Contact Time': 'Morning',
        'Budget Approval': 'Pending',
    },
};

export default function LeadDetail() {
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notes, setNotes] = useState(lead.notes);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Lead: ${lead.name}`} />
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{lead.name}</h2>
                            <p className="text-sm text-muted-foreground">{lead.company}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Lead
                        </Button>
                        <Button variant="outline">
                            <Mail className="mr-2 h-4 w-4" />
                            Email
                        </Button>
                        <Button variant="outline">
                            <Phone className="mr-2 h-4 w-4" />
                            Call
                        </Button>
                        <Button>
                            Schedule Meeting
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column - Lead Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Basic Info Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Lead Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={`/api/placeholder/32/${lead.id}`} />
                                        <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{lead.name}</p>
                                        <div className="flex items-center gap-2">
                                            <Badge 
                                                variant={
                                                    lead.status === 'New' ? 'default' :
                                                    lead.status === 'Contacted' ? 'secondary' :
                                                    lead.status === 'Closed' ? 'success' : 'outline'
                                                }
                                            >
                                                {lead.status}
                                            </Badge>
                                            <Select defaultValue={lead.status}>
                                                <SelectTrigger className="w-[100px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="New">New</SelectItem>
                                                    <SelectItem value="Contacted">Contacted</SelectItem>
                                                    <SelectItem value="Qualified">Qualified</SelectItem>
                                                    <SelectItem value="Proposal">Proposal</SelectItem>
                                                    <SelectItem value="Closed">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <a href={`mailto:${lead.email}`} className="text-sm text-blue-600 hover:underline">{lead.email}</a>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p className="text-sm">{lead.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Address</p>
                                            <p className="text-sm">{lead.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Last Contact</p>
                                            <p className="text-sm">{lead.lastContact}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Created</p>
                                            <p className="text-sm">{lead.createdDate}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Add Note
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Log Activity
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Lead
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Detailed Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-4">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="activities">Activities</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                                <TabsTrigger value="custom">Custom Fields</TabsTrigger>
                            </TabsList>

                            {/* Details Tab */}
                            <TabsContent value="details">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Lead Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Company</p>
                                                <p className="text-sm font-medium">{lead.company}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Value</p>
                                                <p className="text-sm font-medium">{lead.value}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Source</p>
                                                <p className="text-sm font-medium">{lead.source}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Industry</p>
                                                <p className="text-sm font-medium">{lead.industry}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Annual Revenue</p>
                                                <p className="text-sm font-medium">{lead.annualRevenue}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Employees</p>
                                                <p className="text-sm font-medium">{lead.employees}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Website</p>
                                                <a href={lead.website} target="_blank" className="text-sm text-blue-600 hover:underline">{lead.website}</a>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-muted-foreground">Notes</p>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setIsEditingNotes(!isEditingNotes)}
                                                >
                                                    {isEditingNotes ? 'Save' : 'Edit'}
                                                </Button>
                                            </div>
                                            {isEditingNotes ? (
                                                <Textarea 
                                                    value={notes} 
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    className="mt-2"
                                                />
                                            ) : (
                                                <p className="text-sm mt-1 p-3 bg-muted rounded-md">{notes}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Activities Tab */}
                            <TabsContent value="activities">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recent Activities</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {lead.activities.map((activity, index) => (
                                                <div key={index} className="flex items-start gap-4 border-b pb-4 last:border-b-0">
                                                    <div className="flex-shrink-0 w-24 text-sm text-muted-foreground">
                                                        {activity.date}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-medium text-sm">{activity.type}</p>
                                                            <p className="text-xs text-muted-foreground">by {activity.user}</p>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Documents Tab */}
                            <TabsContent value="documents">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            Documents
                                            <Button size="sm">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Upload
                                            </Button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {lead.documents.map((doc, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm font-medium">{doc.name}</p>
                                                            <p className="text-xs text-muted-foreground">Uploaded: {doc.uploadedDate}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="text-red-500">
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Custom Fields Tab */}
                            <TabsContent value="custom">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Custom Fields</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {Object.entries(lead.customFields).map(([key, value]) => (
                                                <div key={key}>
                                                    <p className="text-sm text-muted-foreground">{key}</p>
                                                    <p className="text-sm font-medium">{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}