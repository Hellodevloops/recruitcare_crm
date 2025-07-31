import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Calendar, Pencil, CheckCircle2, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { Candidate } from '@/types';
import { format } from 'date-fns';

interface ActivitySectionProps {
    candidate: Candidate;
    setCandidate: React.Dispatch<React.SetStateAction<Candidate>>;
}

interface ActivityFormData {
    id?: number;
    type: string;
    description: string;
    scheduled_at: string;
    is_completed: boolean;
}

const ActivitySection: React.FC<ActivitySectionProps> = ({ candidate, setCandidate }) => {
    const [newActivity, setNewActivity] = useState<ActivityFormData>({
        type: '',
        description: '',
        scheduled_at: '',
        is_completed: false
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [filter, setFilter] = useState('all');

    const activityTypes = [
        { value: 'call', label: 'Call', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
        { value: 'meeting', label: 'Meeting', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
        { value: 'email', label: 'Email', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16c1.1 0 2 .9 2 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
        { value: 'task', label: 'Task', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
        { value: 'note', label: 'Note', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    ];

    const handleAddOrUpdateActivity = async () => {
        if (!candidate.id) return console.error('Candidate ID missing');

        const payload = {
            candidate_id: candidate.id,
            type: newActivity.type,
            description: newActivity.description,
            scheduled_at: newActivity.scheduled_at || null,
            is_completed: newActivity.is_completed
        };

        try {
            let response;
            if (editingId) {
                response = await axios.put(`/activities/${editingId}`, payload);
                setCandidate({
                    ...candidate,
                    activities: candidate.activities.map(act => 
                        act.id === editingId ? response.data : act
                    )
                });
            } else {
                response = await axios.post('/activities', payload);
                setCandidate({ 
                    ...candidate, 
                    activities: [...candidate.activities, response.data] 
                });
            }

            setNewActivity({ type: '', description: '', scheduled_at: '', is_completed: false });
            setEditingId(null);
            setIsFormVisible(false);
        } catch (error) {
            console.error('Error saving activity:', error);
        }
    };

    const handleEditActivity = (activity: ActivityFormData) => {
        setNewActivity(activity);
        setEditingId(activity.id || null);
        setIsFormVisible(true);
    };

    const handleDeleteActivity = async (activityId: number) => {
        try {
            await axios.delete(`/activities/${activityId}`);
            setCandidate({ 
                ...candidate, 
                activities: candidate.activities.filter(activity => activity.id !== activityId) 
            });
        } catch (error) {
            console.error('Error deleting activity:', error);
        }
    };

    const toggleComplete = async (activity: ActivityFormData) => {
        try {
            const response = await axios.put(`/activities/${activity.id}`, {
                ...activity,
                is_completed: !activity.is_completed
            });
            setCandidate({
                ...candidate,
                activities: candidate.activities.map(act => 
                    act.id === activity.id ? response.data : act
                )
            });
        } catch (error) {
            console.error('Error toggling completion status:', error);
        }
    };

    const cancelForm = () => {
        setNewActivity({ type: '', description: '', scheduled_at: '', is_completed: false });
        setEditingId(null);
        setIsFormVisible(false);
    };

    const getActivityIcon = (type: string) => {
        const activityType = activityTypes.find(t => t.value === type);
        return activityType ? activityType.icon : null;
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString; // Fallback if date is invalid
            }
            return format(date, 'MMM d, yyyy h:mm a');
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    };

    const getFilteredActivities = () => {
        if (filter === 'completed') {
            return candidate.activities.filter(activity => activity.is_completed);
        } else if (filter === 'pending') {
            return candidate.activities.filter(activity => !activity.is_completed);
        } else {
            return candidate.activities;
        }
    };

    const sortedActivities = getFilteredActivities().sort((a, b) => {
        if (a.is_completed !== b.is_completed) {
            return a.is_completed ? 1 : -1;
        }
        
        if (a.scheduled_at && b.scheduled_at) {
            return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
        }
        
        if (a.scheduled_at && !b.scheduled_at) return -1;
        if (!a.scheduled_at && b.scheduled_at) return 1;
        
        return 0;
    });

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle>Activities</CardTitle>
                    <Button 
                        onClick={() => setIsFormVisible(!isFormVisible)} 
                        variant={isFormVisible ? "destructive" : "default"}
                        size="sm"
                    >
                        {isFormVisible ? (
                            <>
                                <X className="h-4 w-4 mr-2" /> Cancel
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" /> New Activity
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isFormVisible && (
                    <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-semibold mb-3">{editingId ? 'Edit Activity' : 'New Activity'}</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="activity-type">Activity Type</Label>
                                    <Select
                                        value={newActivity.type}
                                        onValueChange={(value) => setNewActivity({ ...newActivity, type: value })}
                                    >
                                        <SelectTrigger id="activity-type" className="w-full">
                                            <SelectValue placeholder="Select Activity Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {activityTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <div className="flex items-center">
                                                        <span className="mr-2">{type.icon}</span>
                                                        {type.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="scheduled-at">Schedule (Optional)</Label>
                                    <Input
                                        id="scheduled-at"
                                        type="datetime-local"
                                        value={newActivity.scheduled_at}
                                        onChange={(e) => {
                                            const newScheduledAt = e.target.value;
                                            if (!newScheduledAt && newActivity.is_completed) {
                                                setNewActivity({ 
                                                    ...newActivity, 
                                                    scheduled_at: newScheduledAt,
                                                    is_completed: false 
                                                });
                                            } else {
                                                setNewActivity({ ...newActivity, scheduled_at: newScheduledAt });
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Add details about this activity..."
                                    value={newActivity.description}
                                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            
                            {newActivity.scheduled_at && (
                                <div className="flex items-center space-x-2">
                                    <Switch 
                                        id="is-completed"
                                        checked={newActivity.is_completed}
                                        onCheckedChange={(checked) => setNewActivity({ ...newActivity, is_completed: checked })}
                                    />
                                    <Label htmlFor="is-completed">Mark as completed</Label>
                                </div>
                            )}
                            
                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={cancelForm}>
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleAddOrUpdateActivity} 
                                    disabled={!newActivity.type}
                                >
                                    {editingId ? 'Update' : 'Add'} Activity
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
                    <div className="border-b">
                        <TabsList className="w-full justify-start">
                            <TabsTrigger value="all" className="flex-1">
                                All ({candidate.activities.length})
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="flex-1">
                                Pending ({candidate.activities.filter(a => !a.is_completed).length})
                            </TabsTrigger>
                            <TabsTrigger value="completed" className="flex-1">
                                Completed ({candidate.activities.filter(a => a.is_completed).length})
                            </TabsTrigger>
                        </TabsList>
                    </div>
                    
                    <TabsContent value="all" className="mt-0">
                        <ActivityList 
                            activities={sortedActivities}
                            handleEditActivity={handleEditActivity}
                            handleDeleteActivity={handleDeleteActivity}
                            toggleComplete={toggleComplete}
                            getActivityIcon={getActivityIcon}
                            formatDate={formatDate}
                        />
                    </TabsContent>
                    <TabsContent value="pending" className="mt-0">
                        <ActivityList 
                            activities={sortedActivities}
                            handleEditActivity={handleEditActivity}
                            handleDeleteActivity={handleDeleteActivity}
                            toggleComplete={toggleComplete}
                            getActivityIcon={getActivityIcon}
                            formatDate={formatDate}
                        />
                    </TabsContent>
                    <TabsContent value="completed" className="mt-0">
                        <ActivityList 
                            activities={sortedActivities}
                            handleEditActivity={handleEditActivity}
                            handleDeleteActivity={handleDeleteActivity}
                            toggleComplete={toggleComplete}
                            getActivityIcon={getActivityIcon}
                            formatDate={formatDate}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

interface ActivityListProps {
    activities: ActivityFormData[];
    handleEditActivity: (activity: ActivityFormData) => void;
    handleDeleteActivity: (activityId: number) => void;
    toggleComplete: (activity: ActivityFormData) => void;
    getActivityIcon: (type: string) => React.ReactNode;
    formatDate: (dateString: string) => string;
}

const ActivityList: React.FC<ActivityListProps> = ({ 
    activities, 
    handleEditActivity, 
    handleDeleteActivity, 
    toggleComplete,
    getActivityIcon,
    formatDate
}) => {
    if (!activities || activities.length === 0) {
        return (
            <div className="py-6 text-center text-muted-foreground">
                No activities found.
            </div>
        );
    }
    
    return (
        <div className="space-y-2 mt-2">
            {activities.map((activity) => {
                const isPastDue = activity.scheduled_at 
                    && !activity.is_completed 
                    && !isNaN(new Date(activity.scheduled_at).getTime())
                    && new Date(activity.scheduled_at) < new Date();
                return (
                    <div 
                        key={activity.id || `activity-${activity.type}-${activity.scheduled_at}`} 
                        className={`
                            flex justify-between items-start p-3 rounded-lg transition-all
                            ${activity.is_completed ? 'bg-slate-50' : 'bg-white'}
                            ${!activity.is_completed ? 'border border-slate-200 hover:border-slate-300' : 'border border-slate-100'}
                        `}
                    >
                        <div className="flex items-start gap-3">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                className={`
                                    rounded-full p-1 h-6 w-6 flex items-center justify-center
                                    ${activity.is_completed ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-slate-500'}
                                `}
                                onClick={() => activity.id && toggleComplete(activity)}
                                title={activity.is_completed ? "Mark as incomplete" : "Mark as completed"}
                                disabled={!activity.id}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className={`
                                        font-medium capitalize flex items-center
                                        ${activity.is_completed ? 'text-slate-500' : 'text-slate-900'}
                                    `}>
                                        <span className="mr-2 text-slate-500">{getActivityIcon(activity.type)}</span>
                                        {activity.type}
                                    </div>
                                    
                                    {activity.scheduled_at && (
                                        <div className={`
                                            text-xs flex items-center
                                            ${activity.is_completed ? 'text-slate-400' : isPastDue ? 'text-red-500' : 'text-blue-500'}
                                        `}>
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {formatDate(activity.scheduled_at)}
                                        </div>
                                    )}
                                </div>
                                
                                {activity.description && (
                                    <p className={`
                                        mt-1 text-sm whitespace-pre-line
                                        ${activity.is_completed ? 'text-slate-400' : 'text-slate-600'}
                                    `}>
                                        {activity.description}
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex gap-1 ml-2 shrink-0">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-slate-600"
                                onClick={() => handleEditActivity(activity)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600"
                                onClick={() => activity.id && handleDeleteActivity(activity.id)}
                                disabled={!activity.id}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ActivitySection;