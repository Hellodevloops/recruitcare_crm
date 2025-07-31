import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function EditFollowUp({ followUp }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Follow Ups', href: '/followups' },
        { title: 'Edit', href: `/followups/${followUp.id}/edit` },
    ];

    // Parse the initial scheduled_at date from the followUp prop
    const scheduledDate = parseISO(followUp.scheduled_at);
    const hours = scheduledDate.getHours().toString().padStart(2, '0');
    const minutes = scheduledDate.getMinutes().toString().padStart(2, '0');

    const { data, setData, put, processing, errors } = useForm({
        type: followUp.type,
        description: followUp.description || '',
        scheduled_at: followUp.scheduled_at, // Initial value as ISO string
        scheduled_time: `${hours}:${minutes}`,
        is_completed: followUp.is_completed || false,
    });

    const [date, setDate] = useState(scheduledDate);

    useEffect(() => {
        if (date) {
            // Combine date and time
            const dateObj = new Date(date);
            const [hours, minutes] = data.scheduled_time.split(':');
            dateObj.setHours(parseInt(hours), parseInt(minutes));

            // Format to MySQL-compatible datetime: "YYYY-MM-DD HH:MM:SS"
            const mysqlDateTime = format(dateObj, 'yyyy-MM-dd HH:mm:ss');
            setData('scheduled_at', mysqlDateTime);
        }
    }, [date, data.scheduled_time]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('followups.update', followUp.id), {
            onSuccess: () => {
                // Redirect is handled by the backend, but you can add client-side logic here if needed
            },
            onError: (errors) => {
                console.log('Update failed:', errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Follow-up" />

            <Card>
                <CardHeader>
                    <CardTitle>Edit Follow-up</CardTitle>
                    <CardDescription>Update the follow-up activity details</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Activity Type</Label>
                            <Select
                                value={data.type}
                                onValueChange={(value) => setData('type', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select activity type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="call">Call</SelectItem>
                                    <SelectItem value="meeting">Meeting</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="task">Task</SelectItem>
                                    <SelectItem value="note">Note</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Enter details about this follow-up..."
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">{errors.description}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Schedule Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !date && 'text-muted-foreground'
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, 'PPP') : 'Select a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {errors.scheduled_at && (
                                    <p className="text-sm text-red-500">{errors.scheduled_at}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="scheduled_time">Time</Label>
                                <div className="flex items-center">
                                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="scheduled_time"
                                        type="time"
                                        value={data.scheduled_time}
                                        onChange={(e) => setData('scheduled_time', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_completed"
                                    checked={data.is_completed}
                                    onCheckedChange={(checked) =>
                                        setData('is_completed', checked)
                                    }
                                />
                                <Label htmlFor="is_completed">Mark as Completed</Label>
                            </div>
                            {errors.is_completed && (
                                <p className="text-sm text-red-500">{errors.is_completed}</p>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing} className="mt-4">
                                Update Follow-up
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AppLayout>
    );
}