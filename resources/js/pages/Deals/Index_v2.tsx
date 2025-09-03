import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle,
    CardDescription,
    CardFooter
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
    User,
    Filter,
    ChevronDown,
    Save,
    X,
    Plus,
    Calendar,
    DollarSign,
    Tag,
    ArrowUpDown
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
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { 
    Tabs, 
    TabsContent, 
    TabsList, 
    TabsTrigger 
} from '@/components/ui/tabs';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from '@/components/ui/accordion';
// import { DateRangePicker } from '@/components/date-range-picker';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import axios from 'axios'; // Added axios import

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
    updated_at: string;
    brand?: {
        id: number;
        name: string;
    };
    position?: {
        id: number;
        title: string;
    };
    pipeline?: {
        id: number;
        name: string;
    };
    stage?: {
        id: number;
        name: string;
    };
    priority?: 'low' | 'medium' | 'high';
    due_date?: string;
    tags?: string[];
}

interface Stage {
    id: number;
    name: string;
    deal_count: number;
}

interface Pipeline {
    id: number;
    name: string;
}

interface Props {
    deals: Record<string, Deal[]>;
    allDeals: Deal[]; // Add this for list view
    stages: Stage[];
    pipelines: Pipeline[];
    selectedPipeline?: number;
    flash?: {
        success?: string;
        deal?: Deal;
    };
}

// Added priority colors
const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
};

// Added status colors
const statusColors = {
    pending: 'bg-orange-100 text-orange-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800'
};

// Sample tags for the demo
const availableTags = [
    { id: 1, name: 'New Lead', color: 'bg-purple-100 text-purple-800' },
    { id: 2, name: 'Hot Deal', color: 'bg-red-100 text-red-800' },
    { id: 3, name: 'Follow Up', color: 'bg-blue-100 text-blue-800' },
    { id: 4, name: 'VIP', color: 'bg-yellow-100 text-yellow-800' },
    { id: 5, name: 'Returning', color: 'bg-green-100 text-green-800' },
];

export default function Deals() {
    const { deals: initialDeals, allDeals: initialAllDeals, stages, pipelines, selectedPipeline, flash } = usePage<Props>().props;
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<Partial<Deal>>({});
    const [deals, setDeals] = useState<Record<string, Deal[]>>(initialDeals);
    const [allDeals, setAllDeals] = useState<Deal[]>(initialAllDeals);
    const [editingDealId, setEditingDealId] = useState<number | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [sortConfig, setSortConfig] = useState<{column: string, direction: 'asc' | 'desc'}>({
        column: 'created_at',
        direction: 'desc'
    });




    
    // Additional filters
    const [filters, setFilters] = useState({
        status: [] as string[],
        priority: [] as string[],
        dateRange: { from: undefined, to: undefined } as { from: Date | undefined, to: Date | undefined },
        amountRange: [0, 100000] as [number, number],
        tags: [] as number[],
        hasCandidate: false
    });

    // Add sample data for the enhanced UI
    useEffect(() => {
        // Enrich deals with additional fields for the demo
        const enrichedDeals = Object.fromEntries(
            Object.entries(initialDeals).map(([stageId, stageDeals]) => [
                stageId,
                stageDeals.map(deal => ({
                    ...deal,
                    priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
                    due_date: new Date(
                        Date.now() + (Math.floor(Math.random() * 30) * 86400000)
                    ).toISOString().split('T')[0],
                    tags: Math.random() > 0.5 
                        ? [availableTags[Math.floor(Math.random() * availableTags.length)].name] 
                        : []
                }))
            ])
        );
        
        setDeals(enrichedDeals);
    }, [initialDeals]);

    // Update deals state with server response if available
    useEffect(() => {
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

        // Optimistically update local state
        const newDeals = { ...deals };
        const deal = newDeals[oldStageId].find(d => d.id === dealId);
        if (!deal) return;

        deal.stage_id = newStageId;
        newDeals[oldStageId] = newDeals[oldStageId].filter(d => d.id !== dealId);
        newDeals[newStageId] = [...(newDeals[newStageId] || []), deal].sort((a, b) => a.id - b.id);
        setDeals(newDeals);

        // Send update to server
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

        router.put(
            `/deals/${selectedDeal.id}`,
            formData,
            {
                preserveState: true,
                preserveScroll: true,
                onError: () => toast.error('Failed to update deal'),
            }
        );
        // Optimistically update local state
        const updatedDeal = { ...selectedDeal, ...formData };
        updateDealsState(updatedDeal);
        setSelectedDeal(null);
        setIsEditMode(false);
        setFormData({});
    };

    const handleInlineEdit = (dealId: number, field: string, value: any) => {
        const allDeals = Object.values(deals).flat();
        const deal = allDeals.find(d => d.id === dealId);
        if (!deal) return;

        const updatedDeal = { ...deal, [field]: value };
        
        // Optimistically update UI
        updateDealsState(updatedDeal);
        
        // Send to server
        router.put(
            `/deals/${dealId}`,
            { [field]: value },
            {
                preserveState: true,
                preserveScroll: true,
                onError: () => {
                    toast.error(`Failed to update ${field}`);
                    // Revert to original state on error
                    updateDealsState(deal);
                },
            }
        );
    };

    const handleSort = (column: string) => {
        setSortConfig({
            column,
            direction: 
                sortConfig.column === column && sortConfig.direction === 'asc' 
                    ? 'desc' 
                    : 'asc'
        });
    };

    // Apply filters to deals
    const getFilteredDeals = () => {
        let filteredDeals = [...allDeals]; // Use allDeals instead of Object.values(deals).flat()
        
        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredDeals = filteredDeals.filter(deal => 
                deal.title.toLowerCase().includes(query) ||
                deal.candidate.name.toLowerCase().includes(query) ||
                deal.candidate.email.toLowerCase().includes(query) ||
                (deal.candidate.company && deal.candidate.company.toLowerCase().includes(query)) ||
                (deal.brand?.name && deal.brand.name.toLowerCase().includes(query)) ||
                (deal.position?.designation && deal.position.designation.toLowerCase().includes(query))
            );
        }
        
        // Apply status filter
        if (filters.status.length > 0) {
            filteredDeals = filteredDeals.filter(deal => filters.status.includes(deal.status));
        }
        
        // Apply priority filter
        if (filters.priority.length > 0) {
            filteredDeals = filteredDeals.filter(deal => deal.priority && filters.priority.includes(deal.priority));
        }
        
        // Apply date range filter
        if (filters.dateRange.from && filters.dateRange.to) {
            const fromDate = new Date(filters.dateRange.from).getTime();
            const toDate = new Date(filters.dateRange.to).getTime();
            filteredDeals = filteredDeals.filter(deal => {
                const dealDate = new Date(deal.created_at).getTime();
                return dealDate >= fromDate && dealDate <= toDate;
            });
        }
        
        // Apply amount range filter
        if (filters.amountRange.length === 2) {
            const [min, max] = filters.amountRange;
            filteredDeals = filteredDeals.filter(deal => {
                const amount = parseFloat(deal.amount);
                return amount >= min && amount <= max;
            });
        }
        
        // Apply tags filter
        if (filters.tags.length > 0) {
            filteredDeals = filteredDeals.filter(deal => 
                deal.tags && deal.tags.some(tag => {
                    const tagId = availableTags.findIndex(t => t.name === tag) + 1;
                    return filters.tags.includes(tagId);
                })
            );
        }
        
        // Apply candidate filter
        if (filters.hasCandidate) {
            filteredDeals = filteredDeals.filter(deal => 
                deal.candidate.phone || deal.candidate.company
            );
        }
        
        // Apply sorting
        if (sortConfig.column) {
            filteredDeals.sort((a, b) => {
                let valueA: any;
                let valueB: any;
                
                switch (sortConfig.column) {
                    case 'title':
                        valueA = a.title;
                        valueB = b.title;
                        break;
                    case 'amount':
                        valueA = parseFloat(a.amount);
                        valueB = parseFloat(b.amount);
                        break;
                    case 'created_at':
                        valueA = new Date(a.created_at).getTime();
                        valueB = new Date(b.created_at).getTime();
                        break;
                    case 'candidate':
                        valueA = a.candidate.name;
                        valueB = b.candidate.name;
                        break;
                    case 'status':
                        valueA = a.status;
                        valueB = b.status;
                        break;
                    case 'stage':
                        valueA = a.stage?.name || '';
                        valueB = b.stage?.name || '';
                        break;
                    case 'brand':
                        valueA = a.brand?.name || '';
                        valueB = b.brand?.name || '';
                        break;
                    case 'position':
                        valueA = a.position?.designation || '';
                        valueB = b.position?.designation || '';
                        break;
                    default:
                        valueA = a[sortConfig.column as keyof Deal];
                        valueB = b[sortConfig.column as keyof Deal];
                }
                
                if (valueA < valueB) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (valueA > valueB) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        
        return filteredDeals;
    };

    // Organize filtered deals by stage for Kanban view
    const getFilteredDealsByStage = () => {
        const filteredDeals = getFilteredDeals();
        const dealsByStage: Record<string, Deal[]> = {};
        
        // Initialize empty arrays for each stage
        stages.forEach(stage => {
            dealsByStage[stage.id] = [];
        });
        
        // Populate with filtered deals
        filteredDeals.forEach(deal => {
            if (dealsByStage[deal.stage_id]) {
                dealsByStage[deal.stage_id].push(deal);
            }
        });
        
        return dealsByStage;
    };

    // Reset all filters
    const resetFilters = () => {
        setFilters({
            status: [],
            priority: [],
            dateRange: { from: undefined, to: undefined },
            amountRange: [0, 100000],
            tags: [],
            hasCandidate: false
        });
        setSearchQuery('');
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
            <CardHeader className="p-3 pb-0 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium truncate">{deal.title}</CardTitle>
                <div className="flex gap-1">
                    {deal.priority && (
                        <Badge variant="outline" className={priorityColors[deal.priority]}>
                            {deal.priority}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-3">
                <div className={`flex ${isListView ? 'items-center justify-between' : 'flex-col space-y-3'}`}>
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(deal.candidate.name)}&size=32&background=random`}
                                onError={(e) => {
                                    // Hide the image on error, fallback will show
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <AvatarFallback>{deal.candidate.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-sm">{deal.candidate.name}</p>
                            <p className="text-xs text-muted-foreground">{deal.candidate.email}</p>
                        </div>
                    </div>
                    <div className={`flex items-center ${isListView ? 'space-x-4' : 'justify-between w-full mt-3'}`}>
                        <div>
                            <p className="text-sm font-semibold">${deal.amount}</p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(deal.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={statusColors[deal.status as keyof typeof statusColors] || ''}>
                                {deal.status}
                            </Badge>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedDeal(deal);
                                            setIsEditMode(false);
                                        }}>
                                            <User className="h-4 w-4 mr-2" />
                                            View Candidate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedDeal(deal);
                                            setIsEditMode(true);
                                            setFormData({
                                                title: deal.title,
                                                amount: deal.amount,
                                                status: deal.status,
                                                pipeline_id: deal.pipeline_id,
                                                stage_id: deal.stage_id,
                                                priority: deal.priority,
                                                due_date: deal.due_date
                                            });
                                        }}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Deal
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
                {deal.tags && deal.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {deal.tags.map((tag, index) => {
                            const tagInfo = availableTags.find(t => t.name === tag);
                            return (
                                <Badge 
                                    key={index} 
                                    variant="outline" 
                                    className={tagInfo?.color || ''}
                                >
                                    {tag}
                                </Badge>
                            );
                        })}
                    </div>
                )}
                {deal.due_date && (
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due: {new Date(deal.due_date).toLocaleDateString()}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    const KanbanView = () => {
        const filteredDealsByStage = getFilteredDealsByStage();
        
        return (
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="overflow-x-auto pb-4">
                    <div className="grid grid-flow-col auto-cols-[minmax(300px,1fr)] gap-4">
                        {stages.map(stage => (
                            <Droppable 
                                key={stage.id} 
                                droppableId={stage.id.toString()}
                                isDropDisabled={false}
                                isCombineEnabled={false}
                            >
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
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">
                                                        {(filteredDealsByStage[stage.id] || []).length}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        Total: {stage.deal_count}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto">
                                            {(filteredDealsByStage[stage.id] || []).map((deal, index) => (
                                                <Draggable 
                                                    key={deal.id} 
                                                    draggableId={deal.id.toString()} 
                                                    index={index}
                                                    isDragDisabled={false}
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
        const filteredDeals = getFilteredDeals();
        
        const getStageNameById = (stageId: number) => {
            const stage = stages.find(s => s.id === stageId);
            return stage ? `${stage.name} (${stage.deal_count})` : '';
        };
        
        return (
            <Card className="w-full">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox />
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                                        <div className="flex items-center">
                                            Deal Name
                                            {sortConfig.column === 'title' && (
                                                <ArrowUpDown className={`ml-1 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                                        <div className="flex items-center">
                                            Amount
                                            {sortConfig.column === 'amount' && (
                                                <ArrowUpDown className={`ml-1 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('candidate')}>
                                        <div className="flex items-center">
                                            Candidate
                                            {sortConfig.column === 'candidate' && (
                                                <ArrowUpDown className={`ml-1 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('brand')}>
                                        <div className="flex items-center">
                                            Brand
                                            {sortConfig.column === 'brand' && (
                                                <ArrowUpDown className={`ml-1 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('position')}>
                                        <div className="flex items-center">
                                            Position
                                            {sortConfig.column === 'position' && (
                                                <ArrowUpDown className={`ml-1 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('stage')}>
                                        <div className="flex items-center">
                                            Stage
                                            {sortConfig.column === 'stage' && (
                                                <ArrowUpDown className={`ml-1 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
                                        <div className="flex items-center">
                                            Date
                                            {sortConfig.column === 'created_at' && (
                                                <ArrowUpDown className={`ml-1 h-4 w-4 ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDeals.map(deal => (
                                    <TableRow key={deal.id} className="group">
                                        <TableCell>
                                            <Checkbox />
                                        </TableCell>
                                        <TableCell>
                                            {editingDealId === deal.id ? (
                                                <div className="flex items-center">
                                                    <Input 
                                                        value={formData.title || deal.title}
                                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                        className="h-8"
                                                    />
                                                    <div className="flex ml-2">
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-8 w-8"
                                                            onClick={() => {
                                                                handleInlineEdit(deal.id, 'title', formData.title);
                                                                setEditingDealId(null);
                                                                setFormData({});
                                                            }}
                                                        >
                                                            <Save className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-8 w-8"
                                                            onClick={() => {
                                                                setEditingDealId(null);
                                                                setFormData({});
                                                            }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <span>{deal.title}</span>
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                                        onClick={() => {
                                                            setEditingDealId(deal.id);
                                                            setFormData({ title: deal.title });
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                            {deal.tags && deal.tags.length > 0 && (
                                                <div className="flex gap-1 mt-1">
                                                    {deal.tags.map((tag, index) => {
                                                        const tagInfo = availableTags.find(t => t.name === tag);
                                                        return (
                                                            <Badge 
                                                                key={index} 
                                                                variant="outline" 
                                                                className={`text-xs px-1 py-0 ${tagInfo?.color || ''}`}
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editingDealId === deal.id ? (
                                                <div className="flex items-center">
                                                    <Input 
                                                        type="number"
                                                        value={formData.amount || deal.amount}
                                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                                        className="h-8 w-24"
                                                    />
                                                    <div className="flex ml-2">
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-8 w-8"
                                                            onClick={() => {
                                                                handleInlineEdit(deal.id, 'amount', formData.amount);
                                                                setEditingDealId(null);
                                                                setFormData({});
                                                            }}
                                                        >
                                                            <Save className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                                size="icon" 
                                                                variant="ghost" 
                                                                className="h-8 w-8"
                                                                onClick={() => {
                                                                    setEditingDealId(null);
                                                                    setFormData({});
                                                                }}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        ${deal.amount}
                                                        <Button 
                                                            size="icon" 
                                                            variant="ghost" 
                                                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                                            onClick={() => {
                                                                setEditingDealId(deal.id);
                                                                setFormData({ amount: deal.amount });
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage 
                                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(deal.candidate.name)}&size=32&background=random`}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                        <AvatarFallback>{deal.candidate.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{deal.candidate.name}</div>
                                                        <div className="text-xs text-muted-foreground">{deal.candidate.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">
                                                    {deal.brand?.name || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">
                                                    {deal.position?.designation || 'N/A'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {editingDealId === deal.id ? (
                                                    <div className="flex items-center">
                                                        <Select 
                                                            defaultValue={deal.stage_id.toString()}
                                                            onValueChange={(value) => handleInlineEdit(deal.id, 'stage_id', parseInt(value))}
                                                        >
                                                            <SelectTrigger className="w-32 h-8">
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
                                                ) : (
                                                    <div className="font-medium text-sm">
                                                        {deal.stage?.name || 'N/A'}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingDealId === deal.id ? (
                                                    <div className="flex items-center">
                                                        <Select 
                                                            defaultValue={deal.status}
                                                            onValueChange={(value) => handleInlineEdit(deal.id, 'status', value)}
                                                        >
                                                            <SelectTrigger className="w-28 h-8">
                                                                <SelectValue placeholder="Status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="pending">Pending</SelectItem>
                                                                <SelectItem value="won">Won</SelectItem>
                                                                <SelectItem value="lost">Lost</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline" className={statusColors[deal.status as keyof typeof statusColors] || ''}>
                                                        {deal.status}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingDealId === deal.id ? (
                                                    <div className="flex items-center">
                                                        <Select 
                                                            defaultValue={deal.priority}
                                                            onValueChange={(value) => handleInlineEdit(deal.id, 'priority', value as 'low' | 'medium' | 'high')}
                                                        >
                                                            <SelectTrigger className="w-28 h-8">
                                                                <SelectValue placeholder="Priority" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="low">Low</SelectItem>
                                                                <SelectItem value="medium">Medium</SelectItem>
                                                                <SelectItem value="high">High</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                ) : (
                                                    deal.priority && (
                                                        <Badge variant="outline" className={priorityColors[deal.priority]}>
                                                            {deal.priority}
                                                        </Badge>
                                                    )
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(deal.created_at).toLocaleDateString()}
                                                {deal.due_date && (
                                                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                                                        <Calendar className="h-3 w-3 mr-1" /> 
                                                        Due: {new Date(deal.due_date).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <ChevronDown className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem onClick={() => {
                                                                setSelectedDeal(deal);
                                                                setIsEditMode(false);
                                                            }}>
                                                                <User className="h-4 w-4 mr-2" />
                                                                View Candidate
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => {
                                                                setSelectedDeal(deal);
                                                                setIsEditMode(true);
                                                                setFormData({
                                                                    title: deal.title,
                                                                    amount: deal.amount,
                                                                    status: deal.status,
                                                                    pipeline_id: deal.pipeline_id,
                                                                    stage_id: deal.stage_id,
                                                                    priority: deal.priority,
                                                                    due_date: deal.due_date
                                                                });
                                                            }}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Edit Deal
                                                            </DropdownMenuItem>
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredDeals.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={11} className="text-center py-8">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <Search className="h-10 w-10 mb-2" />
                                                    <p>No deals found matching your filters</p>
                                                    <Button 
                                                        variant="outline" 
                                                        className="mt-4"
                                                        onClick={resetFilters}
                                                    >
                                                        Reset Filters
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            );
        };
        
        const FilterPanel = () => (
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-2">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                        {Object.values(filters).some(f => 
                            Array.isArray(f) ? f.length > 0 : f
                        ) && (
                            <Badge className="ml-1 bg-primary text-white">
                                {Object.values(filters).reduce((count, f) => 
                                    count + (Array.isArray(f) ? (f.length > 0 ? 1 : 0) : (f ? 1 : 0)), 0
                                )}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-96" align="start">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">Filters</h3>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={resetFilters}
                            >
                                Reset
                            </Button>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <div className="flex flex-wrap gap-2">
                                {['pending', 'won', 'lost'].map(status => (
                                    <Badge 
                                        key={status}
                                        variant={filters.status.includes(status) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setFilters(prev => ({
                                                ...prev,
                                                status: prev.status.includes(status)
                                                    ? prev.status.filter(s => s !== status)
                                                    : [...prev.status, status]
                                            }));
                                        }}
                                    >
                                        {status}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Priority</Label>
                            <div className="flex flex-wrap gap-2">
                                {['low', 'medium', 'high'].map(priority => (
                                    <Badge 
                                        key={priority}
                                        variant={filters.priority.includes(priority) ? "default" : "outline"}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            setFilters(prev => ({
                                                ...prev,
                                                priority: prev.priority.includes(priority)
                                                    ? prev.priority.filter(p => p !== priority)
                                                    : [...prev.priority, priority]
                                            }));
                                        }}
                                    >
                                        {priority}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Date Range</Label>
                            {/* <DateRangePicker 
                                value={filters.dateRange}
                                onChange={(range) => {
                                    setFilters(prev => ({
                                        ...prev,
                                        dateRange: range
                                    }));
                                }}
                            /> */}
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Amount Range</Label>
                                <span className="text-sm text-muted-foreground">
                                    ${filters.amountRange[0]} - ${filters.amountRange[1]}
                                </span>
                            </div>
                            <div className="py-4">
                                <Slider 
                                    defaultValue={[0, 100000]} 
                                    min={0}
                                    max={100000}
                                    step={1000}
                                    value={filters.amountRange}
                                    onValueChange={(value) => {
                                        setFilters(prev => ({
                                            ...prev,
                                            amountRange: value as [number, number]
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2">
                                {availableTags.map(tag => (
                                    <Badge 
                                        key={tag.id}
                                        variant={filters.tags.includes(tag.id) ? "default" : "outline"}
                                        className={`cursor-pointer ${filters.tags.includes(tag.id) ? '' : tag.color}`}
                                        onClick={() => {
                                            setFilters(prev => ({
                                                ...prev,
                                                tags: prev.tags.includes(tag.id)
                                                    ? prev.tags.filter(t => t !== tag.id)
                                                    : [...prev.tags, tag.id]
                                            }));
                                        }}
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                                                id="hasCandidate"
                                checked={filters.hasCandidate}
                                onCheckedChange={(checked) => {
                                    setFilters(prev => ({
                                        ...prev,
                                        hasCandidate: checked as boolean
                                    }));
                                }}
                            />
                            <label
                                htmlFor="hasCandidate"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Has complete candidate info
                            </label>
                        </div>
                        
                        <Button 
                            className="w-full" 
                            onClick={() => setIsFilterOpen(false)}
                        >
                            Apply Filters
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        );
        
        const ViewModeToggle = () => (
            <div className="bg-muted rounded-md p-1 flex">
                <Button 
                    variant={viewMode === 'kanban' ? "default" : "ghost"} 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setViewMode('kanban')}
                >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Kanban
                </Button>
                <Button 
                    variant={viewMode === 'list' ? "default" : "ghost"} 
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewMode('list')}
                >
                    <List className="h-4 w-4 mr-2" />
                    List
                </Button>
            </div>
        );
        
        const PipelineSelector = () => (
            <Select 
                defaultValue={selectedPipeline?.toString()} 
                onValueChange={(value) => {
                    router.get(`/deals`, {pipeline_id: value}, {
                        preserveState: true,
                        preserveScroll: true,
                    });
                }}
            >
                <SelectTrigger className="w-[180px]">
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
        );
        
        // Dialog for viewing or editing a deal
        const DealDialog = () => (
            <Dialog 
                open={!!selectedDeal} 
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedDeal(null);
                        setIsEditMode(false);
                        setFormData({});
                    }
                }}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {isEditMode 
                                ? 'Edit Deal' 
                                : selectedDeal?.title
                            }
                        </DialogTitle>
                        <DialogDescription>
                            {isEditMode 
                                ? 'Update the details of this deal.' 
                                : `Deal with ${selectedDeal?.candidate.name}`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    
                    {isEditMode ? (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Deal Name</Label>
                                <Input 
                                    id="title" 
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount</Label>
                                <div className="relative">
                                    <Input 
                                        id="amount" 
                                        className="pl-8"
                                        value={formData.amount || ''}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select 
                                        defaultValue={formData.status || selectedDeal?.status}
                                        onValueChange={(value) => setFormData({...formData, status: value})}
                                    >
                                        <SelectTrigger id="status">
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
                                        defaultValue={formData.priority || selectedDeal?.priority}
                                        onValueChange={(value) => setFormData({...formData, priority: value as 'low' | 'medium' | 'high'})}
                                    >
                                        <SelectTrigger id="priority">
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
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pipeline">Pipeline</Label>
                                    <Select 
                                        defaultValue={formData.pipeline_id?.toString() || selectedDeal?.pipeline_id.toString()}
                                        onValueChange={(value) => setFormData({...formData, pipeline_id: parseInt(value)})}
                                    >
                                        <SelectTrigger id="pipeline">
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
                                    <Label htmlFor="stage">Stage</Label>
                                    <Select 
                                        defaultValue={formData.stage_id?.toString() || selectedDeal?.stage_id.toString()}
                                        onValueChange={(value) => setFormData({...formData, stage_id: parseInt(value)})}
                                    >
                                        <SelectTrigger id="stage">
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
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="due_date">Due Date</Label>
                                <Input 
                                    id="due_date" 
                                    type="date"
                                    value={formData.due_date || selectedDeal?.due_date || ''}
                                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <div className="flex flex-wrap gap-2 border rounded-md p-2">
                                    {availableTags.map(tag => {
                                        const isSelected = selectedDeal?.tags?.includes(tag.name);
                                        return (
                                            <Badge 
                                                key={tag.id}
                                                variant={isSelected ? "default" : "outline"}
                                                className={`cursor-pointer ${isSelected ? '' : tag.color}`}
                                                onClick={() => {
                                                    const currentTags = formData.tags || selectedDeal?.tags || [];
                                                    const newTags = currentTags.includes(tag.name)
                                                        ? currentTags.filter(t => t !== tag.name)
                                                        : [...currentTags, tag.name];
                                                    setFormData({...formData, tags: newTags});
                                                }}
                                            >
                                                {tag.name}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-4">
                            <Tabs defaultValue="details">
                                <TabsList className="w-full">
                                    <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                                    <TabsTrigger value="candidate" className="flex-1">Candidate</TabsTrigger>
                                    <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="details" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm text-muted-foreground">Amount</div>
                                            <div className="text-xl font-semibold">${selectedDeal?.amount}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Status</div>
                                            <Badge variant="outline" className={statusColors[selectedDeal?.status as keyof typeof statusColors] || ''}>
                                                {selectedDeal?.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm text-muted-foreground">Stage</div>
                                            {/* <div>{getStageNameById(selectedDeal?.stage_id || 0)}</div> */}
                                        </div>
                                        <div>
                                            <div className="text-sm text-muted-foreground">Pipeline</div>
                                            <div>
                                                {pipelines.find(p => p.id === selectedDeal?.pipeline_id)?.name}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm text-muted-foreground">Created</div>
                                            <div>{new Date(selectedDeal?.created_at || '').toLocaleDateString()}</div>
                                        </div>
                                        {selectedDeal?.due_date && (
                                            <div>
                                                <div className="text-sm text-muted-foreground">Due Date</div>
                                                <div>{new Date(selectedDeal.due_date).toLocaleDateString()}</div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {selectedDeal?.priority && (
                                        <div>
                                            <div className="text-sm text-muted-foreground">Priority</div>
                                            <Badge variant="outline" className={priorityColors[selectedDeal.priority]}>
                                                {selectedDeal.priority}
                                            </Badge>
                                        </div>
                                    )}
                                    
                                    {selectedDeal?.tags && selectedDeal.tags.length > 0 && (
                                        <div>
                                            <div className="text-sm text-muted-foreground">Tags</div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {selectedDeal.tags.map((tag, index) => {
                                                    const tagInfo = availableTags.find(t => t.name === tag);
                                                    return (
                                                        <Badge 
                                                            key={index} 
                                                            variant="outline" 
                                                            className={tagInfo?.color || ''}
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                                
                                <TabsContent value="candidate" className="space-y-4 mt-4">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-16 w-16">
                                            <AvatarImage 
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDeal?.candidate.name || 'User')}&size=64&background=random`}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                            <AvatarFallback>{selectedDeal?.candidate.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-xl font-semibold">{selectedDeal?.candidate.name}</h3>
                                            <div className="flex items-center text-muted-foreground">
                                                <Mail className="h-4 w-4 mr-1" />
                                                {selectedDeal?.candidate.email}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedDeal?.candidate.phone && (
                                            <div>
                                                <div className="text-sm text-muted-foreground">Phone</div>
                                                <div className="flex items-center">
                                                    <Phone className="h-4 w-4 mr-1" />
                                                    {selectedDeal.candidate.phone}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {selectedDeal?.candidate.company && (
                                            <div>
                                                <div className="text-sm text-muted-foreground">Company</div>
                                                <div className="flex items-center">
                                                    <Building className="h-4 w-4 mr-1" />
                                                    {selectedDeal.candidate.company}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="activity" className="mt-4">
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p>Activity feed coming soon</p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                    
                    <DialogFooter>
                        {isEditMode ? (
                            <>
                                <Button variant="outline" onClick={() => {
                                    setSelectedDeal(null);
                                    setIsEditMode(false);
                                    setFormData({});
                                }}>
                                    Cancel
                                </Button>
                                <Button onClick={handleEditSubmit}>Save Changes</Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => {
                                    setSelectedDeal(null);
                                }}>
                                    Close
                                </Button>
                                <Button onClick={() => {
                                    setIsEditMode(true);
                                    setFormData({
                                        title: selectedDeal?.title,
                                        amount: selectedDeal?.amount,
                                        status: selectedDeal?.status,
                                        pipeline_id: selectedDeal?.pipeline_id,
                                        stage_id: selectedDeal?.stage_id,
                                        priority: selectedDeal?.priority,
                                        due_date: selectedDeal?.due_date
                                    });
                                }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Deal
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
                    );



                    return (
                        <AppLayout>
                            <Head title="Deals" />
                            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
                                {/* Header Section */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <h1 className="text-2xl font-bold">Deals</h1>
                                        <PipelineSelector />
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <div className="relative flex-1 sm:flex-none">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search deals..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-8 w-full sm:w-64"
                                            />
                                        </div>
                                        <FilterPanel />
                                        <ViewModeToggle />
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => router.visit('/deals/create')}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Add New Deal</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </div>
            
                                {/* Main Content */}
                                <div className="mt-4">
                                    {viewMode === 'kanban' ? <KanbanView /> : <ListView />}
                                </div>
            
                                {/* Deal Dialog */}
                                <DealDialog />
                                
                            </div>
                        </AppLayout>
                    );
                }
            
          