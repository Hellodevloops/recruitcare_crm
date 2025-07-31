import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import { 
    Avatar, 
    AvatarFallback, 
    AvatarImage 
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
    LayoutGrid, 
    List, 
    Filter, 
    Search 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

// Breadcrumbs definition
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leads', href: '/leads' },
];

// Lead interface and initial data
interface Lead {
    id: string;
    name: string;
    company: string;
    value: string;
    status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Closed';
    email: string;
    lastContact: string;
}

// Predefined lead stages with specific order
const LEAD_STAGES: Array<Lead['status']> = [
    'New', 
    'Contacted', 
    'Qualified', 
    'Proposal', 
    'Closed'
];

// Status color mapping
const STATUS_COLORS = {
    'New': 'bg-blue-50 text-blue-600',
    'Contacted': 'bg-yellow-50 text-yellow-600',
    'Qualified': 'bg-green-50 text-green-600',
    'Proposal': 'bg-purple-50 text-purple-600',
    'Closed': 'bg-gray-50 text-gray-600'
};

// Initial leads data
const initialLeads: Record<Lead['status'], Lead[]> = {
    'New': [
        { id: 'lead-1', name: 'John Doe', company: 'Acme Inc', value: '₹5,000', status: 'New', email: 'john@acme.com', lastContact: '2024-03-24' },
        { id: 'lead-2', name: 'Jane Smith', company: 'Tech Co', value: '₹3,000', status: 'New', email: 'jane@tech.co', lastContact: '2024-03-23' },
    ],
    'Contacted': [
        { id: 'lead-3', name: 'Mike Johnson', company: 'Beta Ltd', value: '₹7,500', status: 'Contacted', email: 'mike@beta.com', lastContact: '2024-03-22' },
    ],
    'Qualified': [
        { id: 'lead-4', name: 'Sarah Williams', company: 'Gamma Corp', value: '₹10,000', status: 'Qualified', email: 'sarah@gamma.com', lastContact: '2024-03-24' },
        { id: 'lead-5', name: 'Tom Brown', company: 'Delta Inc', value: '₹4,500', status: 'Qualified', email: 'tom@delta.com', lastContact: '2024-03-23' },
    ],
    'Proposal': [
        { id: 'lead-6', name: 'Emily Davis', company: 'Epsilon LLC', value: '₹8,000', status: 'Proposal', email: 'emily@epsilon.com', lastContact: '2024-03-24' },
    ],
    'Closed': [
        { id: 'lead-7', name: 'Robert Wilson', company: 'Zeta Co', value: '₹12,000', status: 'Closed', email: 'robert@zeta.com', lastContact: '2024-03-23' },
    ]
};

export default function Leads() {
    // State management
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [searchQuery, setSearchQuery] = useState('');
    const [leads, setLeads] = useState(initialLeads);

    // Drag and drop handler
    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;

        // If dropped outside a droppable area or in the same position
        if (!destination || 
            (source.droppableId === destination.droppableId && 
             source.index === destination.index)) return;

        // Create a copy of leads
        const newLeads = { ...leads };

        // Remove the dragged lead from source stage
        const [movedLead] = newLeads[source.droppableId as Lead['status']].splice(source.index, 1);

        // Update lead's status
        movedLead.status = destination.droppableId as Lead['status'];

        // Insert lead into destination stage
        newLeads[destination.droppableId as Lead['status']].splice(destination.index, 0, movedLead);

        // Update state
        setLeads(newLeads);
    };

    // Lead Card Component
    const LeadCard = ({ 
        lead, 
        isListView = false, 
        isDragging = false 
    }: { 
        lead: Lead; 
        isListView?: boolean; 
        isDragging?: boolean;
    }) => (
        <Card 
            className={`
                mb-2 transition-all 
                ${isListView ? 'w-full' : ''}
                ${isDragging ? 'border-primary/50 shadow-md' : 'hover:shadow-md'}
                ${STATUS_COLORS[lead.status]}
            `}
        >
            <CardContent className="p-4">
                <div className={`flex ${isListView ? 'items-center space-x-4' : 'flex-col space-y-3'}`}>
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={`/api/placeholder/32/${lead.id}`} />
                            <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={isListView ? '' : 'text-center'}>
                            <p className="font-medium text-sm">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.company}</p>
                        </div>
                    </div>
                    <div className={`flex items-center justify-between w-full ${isListView ? 'ml-4' : ''}`}>
                        <div>
                            <p className="text-sm font-semibold">{lead.value}</p>
                            <p className="text-xs text-muted-foreground">Last: {lead.lastContact}</p>
                        </div>
                        <Badge 
                            variant={
                                lead.status === 'New' ? 'default' : 
                                lead.status === 'Contacted' ? 'secondary' : 
                                lead.status === 'Closed' ? 'success' : 'outline'
                            }
                            className="ml-2"
                        >
                            {lead.status}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    // Kanban View with Drag and Drop
    const KanbanView = () => {
        // Filter leads based on search query
        const filteredLeadStages = Object.fromEntries(
            LEAD_STAGES.map(stage => [
                stage, 
                leads[stage].filter(lead => 
                    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lead.company.toLowerCase().includes(searchQuery.toLowerCase())
                )
            ])
        );

        return (
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="overflow-x-auto">
                    <div className="grid grid-cols-5 gap-4 min-w-[1250px]">
                        {LEAD_STAGES.map(stage => (
                            <Droppable key={stage} droppableId={stage}>
                                {(provided, snapshot) => (
                                    <div 
                                        ref={provided.innerRef} 
                                        {...provided.droppableProps}
                                        className={`
                                            bg-gray-100 rounded-lg p-3 
                                            ${snapshot.isDraggingOver ? 'bg-primary/10' : ''}
                                        `}
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-semibold text-sm">{stage}</h3>
                                            <Badge variant="secondary">
                                                {filteredLeadStages[stage].length}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                            {filteredLeadStages[stage].map((lead, index) => (
                                                <Draggable 
                                                    key={lead.id} 
                                                    draggableId={lead.id} 
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <LeadCard 
                                                                lead={lead} 
                                                                isDragging={snapshot.isDragging}
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </div>
            </DragDropContext>
        );
    };

    // List View 
    const ListView = () => {
        const filteredLeads = Object.values(leads)
            .flat()
            .filter(lead => 
                lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lead.company.toLowerCase().includes(searchQuery.toLowerCase())
            );

        return (
            <Card className="w-full">
                <CardContent className="p-0">
                    <div className="divide-y">
                        {filteredLeads.map(lead => (
                            <div key={lead.id} className="p-4">
                                <LeadCard lead={lead} isListView={true} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leads" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Leads Pipeline</h2>
                        <p className="text-sm text-muted-foreground">Track and manage your sales opportunities</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search leads..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 w-full sm:w-[200px] md:w-[300px]"
                            />
                        </div>
                        <Button variant="outline" size="icon" className="flex-shrink-0">
                            <Filter className="h-4 w-4" />
                        </Button>
                        <div className="flex gap-1 flex-shrink-0">
                            <Button
                                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setViewMode('kanban')}
                                className="w-9 h-9"
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setViewMode('list')}
                                className="w-9 h-9"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden">
                    {viewMode === 'kanban' ? <KanbanView /> : <ListView />}
                </div>
            </div>
        </AppLayout>
    );
}