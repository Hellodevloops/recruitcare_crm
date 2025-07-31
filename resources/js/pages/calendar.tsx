import { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Calendar, momentLocalizer, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { toast } from 'sonner';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
    Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
    Calendar as CalendarIcon, Plus, Trash2, Edit 
} from 'lucide-react';

const localizer = momentLocalizer(moment);

interface Activity {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: 'call' | 'meeting' | 'email' | 'task' | 'note';
    client: string;
    candidateId: number;
    status: 'pending' | 'completed';
    notes?: string;
}

interface Candidate {
    id: number;
    name: string;
    company_name?: string;
}

interface PageProps {
    initialEvents: Activity[];
    candidates: Candidate[];
}

const eventTypes = [
    { value: 'call', label: 'Call' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'email', label: 'Email' },
    { value: 'task', label: 'Task' },
    { value: 'note', label: 'Note' }
];

const eventStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' }
];

export default function CalendarPage() {
    const { initialEvents, candidates } = usePage<PageProps>().props;
    
    const [events, setEvents] = useState<Activity[]>(initialEvents.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
    })));
    const [selectedEvent, setSelectedEvent] = useState<Activity | null>(null);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState<Partial<Activity>>({
        title: '',
        type: 'note',
        client: '',
        status: 'pending',
        notes: '',
        candidateId: undefined,
        start: new Date(),
        end: new Date(new Date().getTime() + 30 * 60000),
    });

    useEffect(() => {
        setEvents(initialEvents.map(event => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
        })));
    }, [initialEvents]);

    const handleSelectEvent = (event: Activity) => {
        setSelectedEvent(event);
        setFormData({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
        });
        setIsCreateMode(false);
        setIsDialogOpen(true);
    };

    const handleSelectSlot = (slotInfo: SlotInfo) => {
        setFormData({
            title: '',
            type: 'note',
            client: '',
            status: 'pending',
            notes: '',
            candidateId: undefined,
            start: slotInfo.start,
            end: new Date(slotInfo.start.getTime() + 30 * 60000),
        });
        setIsCreateMode(true);
        setIsDialogOpen(true);
    };

    const handleEventDrop = async ({ event, start }: { event: Activity; start: Date }) => {
        try {
            const response = await axios.put(`/activities/${event.id}/drag`, {
                scheduled_at: moment(start).format('YYYY-MM-DD HH:mm:ss'),
            });

            setEvents(prev => prev.map(ev => 
                ev.id === event.id 
                    ? { ...ev, start: new Date(response.data.start), end: new Date(response.data.end) }
                    : ev
            ));

            toast.success("Activity rescheduled successfully");
        } catch (error) {
            console.error('Failed to update event:', error);
            toast.error("Failed to reschedule activity");
        }
    };

    const handleInputChange = (field: keyof Activity, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveEvent = async () => {
        if (!formData.candidateId || !formData.type) {
            toast.error("Please fill out all required fields (Candidate and Type)");
            return;
        }

        setIsLoading(true);

        try {
            const eventData = {
                candidate_id: formData.candidateId,
                type: formData.type,
                description: formData.notes,
                scheduled_at: formData.start ? moment(formData.start).format('YYYY-MM-DD HH:mm:ss') : null,
                is_completed: formData.status === 'completed'
            };

            let response;
            if (isCreateMode) {
                response = await axios.post('/activities', eventData);
            } else {
                response = await axios.put(`/activities/${formData.id}`, eventData);
            }

            const updatedEvent = {
                ...response.data,
                start: new Date(response.data.start),
                end: new Date(response.data.end)
            };

            if (isCreateMode) {
                setEvents(prev => [...prev, updatedEvent]);
            } else {
                setEvents(prev => prev.map(event => 
                    event.id === updatedEvent.id ? updatedEvent : event
                ));
            }

            toast.success(isCreateMode ? "Activity scheduled successfully" : "Activity updated successfully");
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to save event:', error);
            toast.error(isCreateMode ? "Failed to schedule activity" : "Failed to update activity");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteEvent = async () => {
        if (!selectedEvent) return;

        setIsLoading(true);

        try {
            await axios.delete(`/activities/${selectedEvent.id}`);
            setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
            toast.success("Activity deleted successfully");
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to delete event:', error);
            toast.error("Failed to delete activity");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Calendar" />
            <div className="container mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-6 w-6" />
                            Activity Calendar
                        </CardTitle>
                        <CardDescription>Manage your scheduled activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <Button onClick={() => {
                                setIsCreateMode(true);
                                setFormData({
                                    title: '',
                                    type: 'note',
                                    client: '',
                                    status: 'pending',
                                    notes: '',
                                    candidateId: undefined,
                                    start: new Date(),
                                    end: new Date(new Date().getTime() + 30 * 60000),
                                });
                                setIsDialogOpen(true);
                            }}>
                                <Plus className="mr-2 h-4 w-4" /> New Activity
                            </Button>
                        </div>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 500 }}
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot}
                            selectable
                            onEventDrop={handleEventDrop}
                            draggableAccessor={() => true}
                        />
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {isCreateMode ? 'Create Activity' : 'Edit Activity'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="candidateId">Candidate *</Label>
                                <Select
                                    value={formData.candidateId?.toString()}
                                    onValueChange={(value) => handleInputChange('candidateId', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a candidate" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {candidates.map(candidate => (
                                            <SelectItem key={candidate.id} value={candidate.id.toString()}>
                                                {candidate.name} {candidate.company_name && `(${candidate.company_name})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="type">Type *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => handleInputChange('type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {eventTypes.map(type => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="scheduled_at">Scheduled At</Label>
                                <Input
                                    id="scheduled_at"
                                    type="datetime-local"
                                    value={formData.start ? moment(formData.start).format('YYYY-MM-DDTHH:mm') : ''}
                                    onChange={(e) => handleInputChange('start', e.target.value ? new Date(e.target.value) : null)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => handleInputChange('status', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {eventStatuses.map(status => (
                                            <SelectItem key={status.value} value={status.value}>
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="notes">Description</Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes || ''}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            {!isCreateMode && (
                                <Button variant="destructive" onClick={handleDeleteEvent} disabled={isLoading}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveEvent} disabled={isLoading}>
                                {isLoading ? 'Saving...' : (isCreateMode ? 'Create' : 'Update')}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}