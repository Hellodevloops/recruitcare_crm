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
    Search,
    Edit,
    Mail,
    Building,
    Phone,
    User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Candidate {
    id: number;
    name: string;
    email: string;
    phone?: string;
    company?: string;
}

interface Deal {
    id: number;
    title: string;
    amount: string;
    status: string;
    candidate: Candidate;
    stage_id: number;
    pipeline_id: number;
    created_at: string;
}

interface DealFormData {
    title: string;
    amount: string;
    status: string;
    pipeline_id: number;
    stage_id: number;
}

interface Stage {
    id: number;
    name: string;
}

interface Pipeline {
    id: number;
    name: string;
}

interface Props {
    deals: Record<string, Deal[]>;
    stages: Stage[];
    pipelines: Pipeline[];
    selectedPipeline?: number;
    flash?: {
        success?: string;
        deal?: Deal;
    };
}

export default function Deals() {
    const { deals: initialDeals, stages, pipelines, selectedPipeline, flash } = usePage<Props>().props;
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<DealFormData>>({});
    const [deals, setDeals] = useState<Record<string, Deal[]>>(initialDeals);

    React.useEffect(() => {
        if (flash?.deal) {
            updateDealsState(flash.deal);
            if (flash.success) toast.success(flash.success);
        }
    }, [flash]);

    const updateDealsState = (updatedDeal: Deal) => {
        setDeals(prevDeals => {
            const newDeals = { ...prevDeals };
            const oldStageId = Object.keys(prevDeals).find(stageId => 
                prevDeals[stageId].some(d => d.id === updatedDeal.id)
            );
            const newStageId = updatedDeal.stage_id.toString();

            if (oldStageId && oldStageId !== newStageId) {
                newDeals[oldStageId] = newDeals[oldStageId].filter(d => d.id !== updatedDeal.id);
            }

            newDeals[newStageId] = [
                ...(newDeals[newStageId] || []).filter(d => d.id !== updatedDeal.id),
                updatedDeal,
            ].sort((a, b) => a.id - b.id);

            return newDeals;
        });
    };

    const onDragEnd = (result: DropResult) => {
        const { draggableId, source, destination } = result;
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

        const dealId = parseInt(draggableId);
        const newStageId = parseInt(destination.droppableId);
        const oldStageId = parseInt(source.droppableId);

        const newDeals = { ...deals };
        const deal = newDeals[oldStageId].find(d => d.id === dealId);
        if (!deal) return;

        deal.stage_id = newStageId;
        newDeals[oldStageId] = newDeals[oldStageId].filter(d => d.id !== dealId);
        newDeals[newStageId] = [...(newDeals[newStageId] || []), deal].sort((a, b) => a.id - b.id);
        setDeals(newDeals);

        router.put(
            `/deals/${dealId}`,
            { stage_id: newStageId },
            {
                preserveState: true,
                preserveScroll: true,
                onError: () => {
                    setDeals(initialDeals);
                    toast.error('Failed to move deal');
                },
            }
        );
    };

    const handleEditSubmit = () => {
        if (!selectedDeal) return;

        if (!formData.title?.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!formData.amount || isNaN(Number(formData.amount))) {
            toast.error('Valid amount is required');
            return;
        }

        const updatedData = {
            ...formData,
            pipeline_id: Number(formData.pipeline_id),
            stage_id: Number(formData.stage_id),
            amount: String(formData.amount)
        };

        router.put(
            `/deals/${selectedDeal.id}`,
            updatedData,
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Deal updated successfully');
                    setSelectedDeal(null);
                    setIsEditMode(false);
                    setFormData({});
                },
                onError: (errors) => {
                    toast.error('Failed to update deal');
                    Object.values(errors).forEach(error => toast.error(String(error)));
                },
            }
        );
    };

    const DealCard = ({ 
        deal, 
        isListView = false, 
        isDragging = false 
    }: { 
        deal: Deal; 
        isListView?: boolean; 
        isDragging?: boolean;
    }) => (
        <Card 
            className={`
                mb-2 transition-all 
                ${isListView ? 'w-full' : ''}
                ${isDragging ? 'border-primary/50 shadow-md' : 'hover:shadow-md'}
            `}
        >
            <CardContent className="p-4">
                <div className={`flex ${isListView ? 'items-center justify-between' : 'flex-col space-y-3'}`}>
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={`/api/placeholder/32/${deal.id}`} />
                            <AvatarFallback>{deal.candidate.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={isListView ? '' : 'text-center'}>
                            <p className="font-medium text-sm">{deal.title}</p>
                            <p className="text-xs text-muted-foreground">{deal.candidate.name}</p>
                        </div>
                    </div>
                    <div className={`flex items-center ${isListView ? 'space-x-4' : 'justify-between w-full'}`}>
                        <div>
                            <p className="text-sm font-semibold">₹{deal.amount}</p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(deal.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={deal.status === 'pending' ? 'default' : 'success'}>
                                {deal.status}
                            </Badge>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                    setSelectedDeal(deal);
                                    setIsEditMode(false);
                                }}
                            >
                                <User className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => {
                                    setSelectedDeal(deal);
                                    setIsEditMode(true);
                                    setFormData({
                                        title: deal.title,
                                        amount: deal.amount,
                                        status: deal.status,
                                        pipeline_id: deal.pipeline_id,
                                        stage_id: deal.stage_id
                                    });
                                }}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const KanbanView = () => {
        const filteredDeals = Object.fromEntries(
            Object.entries(deals).map(([stageId, stageDeals]) => [
                stageId,
                stageDeals.filter(deal => 
                    deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    deal.candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            ])
        );

        return (
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="overflow-x-auto">
                    <div className="grid grid-flow-col auto-cols-[minmax(300px,1fr)] gap-4">
                        {stages.map(stage => (
                            <Droppable key={stage.id} droppableId={stage.id.toString()}>
                                {(provided, snapshot) => (
                                    <div 
                                        ref={provided.innerRef} 
                                        {...provided.droppableProps}
                                        className={`
                                            bg-gray-100 rounded-lg p-3 
                                            ${snapshot.isDraggingOver ? 'bg-primary/10' : ''}
                                        `}
                                    >
                                        <CardHeader className="p-2">
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-sm font-semibold">{stage.name}</CardTitle>
                                                <Badge variant="secondary">
                                                    {(filteredDeals[stage.id] || []).length}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                            {(filteredDeals[stage.id] || []).map((deal, index) => (
                                                <Draggable 
                                                    key={deal.id} 
                                                    draggableId={deal.id.toString()} 
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <DealCard 
                                                                deal={deal} 
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

    const ListView = () => {
        const allDeals = Object.values(deals).flat().filter(deal =>
            deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            deal.candidate.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <Card className="w-full">
                <CardContent className="p-0">
                    <div className="divide-y">
                        {allDeals.map(deal => (
                            <div key={deal.id} className="p-4">
                                <DealCard deal={deal} isListView={true} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    const handlePipelineChange = (value: string) => {
        router.get(
            '/deals',
            { pipeline_id: value === 'all' ? undefined : value },
            { preserveState: true }
        );
    };

    return (
        <AppLayout>
            <Head title="Deals" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Deals Pipeline</h2>
                        <p className="text-sm text-muted-foreground">Manage your sales opportunities</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search deals..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 w-full sm:w-[200px] md:w-[300px]"
                            />
                        </div>
                        <Select 
                            value={selectedPipeline?.toString() || 'all'} 
                            onValueChange={handlePipelineChange}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Pipeline" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Pipelines</SelectItem>
                                {pipelines.map(pipeline => (
                                    <SelectItem key={pipeline.id} value={pipeline.id.toString()}>
                                        {pipeline.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex gap-1 flex-shrink-0">
                            <Button
                                variant={viewMode === 'kanban' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setViewMode('kanban')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => setViewMode('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    {viewMode === 'kanban' ? <KanbanView /> : <ListView />}
                </div>

                {selectedDeal && (
                    <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>
                                    {isEditMode ? 'Edit Deal' : 'Candidate Details'}
                                </DialogTitle>
                            </DialogHeader>
                            {isEditMode ? (
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            className={formData.title?.trim() ? '' : 'border-red-500'}
                                            placeholder="Enter deal title"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="amount" className="text-sm font-medium">Amount *</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            value={formData.amount || ''}
                                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                            className={formData.amount && !isNaN(Number(formData.amount)) ? '' : 'border-red-500'}
                                            placeholder="Enter amount"
                                            min="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) => setFormData({...formData, status: value})}
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
                                        <Label htmlFor="pipeline" className="text-sm font-medium">Pipeline</Label>
                                        <Select
                                            value={formData.pipeline_id?.toString()}
                                            onValueChange={(value) => setFormData({...formData, pipeline_id: parseInt(value)})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select pipeline" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {pipelines.map(pipeline => (
                                                    <SelectItem key={pipeline.id} value={pipeline.id.toString()}>
                                                        {pipeline.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stage" className="text-sm font-medium">Stage</Label>
                                        <Select
                                            value={formData.stage_id?.toString()}
                                            onValueChange={(value) => setFormData({...formData, stage_id: parseInt(value)})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select stage" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {stages.map(stage => (
                                                    <SelectItem key={stage.id} value={stage.id.toString()}>
                                                        {stage.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => {
                                                setSelectedDeal(null);
                                                setIsEditMode(false);
                                                setFormData({});
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            onClick={handleEditSubmit}
                                            disabled={!formData.title?.trim() || !formData.amount}
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Candidate Details</h3>
                                        <Button
                                            variant="outline"
                                            className="w-full sm:w-auto border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all text-sm"
                                            onClick={() => router.visit(`/candidates/${selectedDeal.candidate.id}`)}
                                        >
                                            View Candidate
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                <User className="h-4 w-4 text-gray-500" /> Name
                                            </Label>
                                            <p className="text-sm text-gray-900">{selectedDeal.candidate.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                <Mail className="h-4 w-4 text-gray-500" /> Email
                                            </Label>
                                            <p className="text-sm text-gray-900">{selectedDeal.candidate.email}</p>
                                        </div>
                                        {selectedDeal.candidate.phone && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                    <Phone className="h-4 w-4 text-gray-500" /> Phone
                                                </Label>
                                                <p className="text-sm text-gray-900">{selectedDeal.candidate.phone}</p>
                                            </div>
                                        )}
                                        {selectedDeal.candidate.company && (
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                    <Building className="h-4 w-4 text-gray-500" /> Company
                                                </Label>
                                                <p className="text-sm text-gray-900">{selectedDeal.candidate.company}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </AppLayout>
    );
}