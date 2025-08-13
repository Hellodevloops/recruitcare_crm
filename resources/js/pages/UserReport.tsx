import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function UserReport({ users, reportData }) {
    const [selectedUser, setSelectedUser] = useState(users.length ? users[0].id : '');
    const [filteredData, setFilteredData] = useState(reportData);
    const [isLoading, setIsLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        from: new Date(),
        to: new Date(),
    });
    const [dateFilter, setDateFilter] = useState('today'); // 'today', 'week', 'month', 'custom'
    const [activityStats, setActivityStats] = useState({
        candidates: 0,
        activities: 0,
        notes: 0,
        deals: 0
    });
    const [expandedActivities, setExpandedActivities] = useState({});
    const [activityLogs, setActivityLogs] = useState([]);
    const [activityLogsLoading, setActivityLogsLoading] = useState(false);

    const toggleActivityExpand = (id) => {
        setExpandedActivities(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const fetchReportData = () => {
        setIsLoading(true);

        let endpoint = `/reports/user/${selectedUser}`;

        // Add date parameters based on filter
        const params = new URLSearchParams();

        if (dateFilter === 'custom') {
            params.append('from_date', format(dateRange.from, 'yyyy-MM-dd'));
            params.append('to_date', format(dateRange.to, 'yyyy-MM-dd'));
        } else {
            params.append('date_filter', dateFilter);
        }

        endpoint = `${endpoint}?${params.toString()}`;

        fetch(endpoint)
            .then(res => res.json())
            .then(data => {
                setFilteredData(data);
                // Update activity stats
                setActivityStats({
                    candidates: data.candidates?.length || 0,
                    activities: data.activities?.length || 0,
                    notes: data.notes?.length || 0,
                    deals: data.deals?.length || 0
                });
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching report data:', error);
                setIsLoading(false);
            });
    };

    const fetchActivityLogs = () => {
        setActivityLogsLoading(true);

        const endpoint = `/reports/user/${selectedUser}/activity-logs`;
        const params = new URLSearchParams();

        if (dateFilter === 'custom') {
            params.append('from_date', format(dateRange.from, 'yyyy-MM-dd'));
            params.append('to_date', format(dateRange.to, 'yyyy-MM-dd'));
        } else {
            params.append('date_filter', dateFilter);
        }

        fetch(`${endpoint}?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setActivityLogs(data.logs || []);
                setActivityLogsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching activity logs:', error);
                setActivityLogsLoading(false);
            });
    };

    useEffect(() => {
        fetchReportData();
    }, [selectedUser, dateFilter]);

    useEffect(() => {
        if (dateFilter === 'custom') {
            fetchReportData();
        }
    }, [dateRange]);

    // Fetch activity logs when the tab is selected
    const handleTabChange = (value) => {
        if (value === 'activity-logs') {
            fetchActivityLogs();
        }
    };

    const handleDateFilterChange = (filter) => {
        setDateFilter(filter);
    };

    const handleDateRangeChange = (range) => {
        if (range.from && range.to) {
            setDateRange(range);
        }
    };

    const formatDateRange = () => {
        if (!dateRange.from || !dateRange.to) return 'Select date range';

        if (format(dateRange.from, 'yyyy-MM-dd') === format(dateRange.to, 'yyyy-MM-dd')) {
            return format(dateRange.from, 'MMM dd, yyyy');
        }

        return `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return format(date, 'MMM dd, yyyy HH:mm');
    };

    return (
        <AppLayout>
            <Head title="User Activity Report" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">User Activity Report</h2>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchReportData}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Candidates Updated</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activityStats.candidates}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Activities Created</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activityStats.activities}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Notes Added</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activityStats.notes}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Deals Updated</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activityStats.deals}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Select User</label>
                        <Select onValueChange={setSelectedUser} value={selectedUser}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select User" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Date Filter</label>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant={dateFilter === 'today' ? 'default' : 'outline'}
                                onClick={() => handleDateFilterChange('today')}
                            >
                                Today
                            </Button>
                            <Button
                                size="sm"
                                variant={dateFilter === 'week' ? 'default' : 'outline'}
                                onClick={() => handleDateFilterChange('week')}
                            >
                                This Week
                            </Button>
                            <Button
                                size="sm"
                                variant={dateFilter === 'month' ? 'default' : 'outline'}
                                onClick={() => handleDateFilterChange('month')}
                            >
                                This Month
                            </Button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Custom Date Range</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={dateFilter === 'custom' ? 'default' : 'outline'}
                                    className="w-full justify-start text-left font-normal"
                                    onClick={() => setDateFilter('custom')}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateFilter === 'custom' ? formatDateRange() : 'Select date range'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={handleDateRangeChange}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                                    <Tabs defaultValue="candidates" className="mt-6" onValueChange={handleTabChange}>
                        <TabsList>
                            <TabsTrigger value="candidates">Candidates ({activityStats.candidates})</TabsTrigger>
                        <TabsTrigger value="activities">Activities ({activityStats.activities})</TabsTrigger>
                        <TabsTrigger value="notes">Notes ({activityStats.notes})</TabsTrigger>
                        <TabsTrigger value="deals">Deals ({activityStats.deals})</TabsTrigger>
                        <TabsTrigger value="activity-logs">Activity Logs</TabsTrigger>
                    </TabsList>

                    <TabsContent value="candidates">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                            </div>
                        ) : filteredData.candidates?.length > 0 ? (
                            <div>
                                {filteredData.candidates.map(candidate => (
                                    <Link href={`/candidates/${candidate.id}`} key={candidate.id}>
                                        <Card className="mb-4 cursor-pointer hover:shadow-lg transition">
                                            <CardHeader>
                                                <CardTitle>{candidate.name}</CardTitle>
                                                <div className="flex justify-between">
                                                    <p className="text-sm text-gray-500">
                                                        Created: {new Date(candidate.created_at).toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Updated: {new Date(candidate.updated_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <p><strong>Phone:</strong> {candidate.phone || 'N/A'}</p>
                                                    <p><strong>Email:</strong> {candidate.email || 'N/A'}</p>
                                                    <p><strong>Company:</strong> {candidate.company_name || 'N/A'}</p>
                                                    <p><strong>Status:</strong> {candidate.status || 'N/A'}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No candidate updates found for the selected period.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="activities">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                            </div>
                        ) : filteredData.activities?.length > 0 ? (
                            <div>
                                {filteredData.activities.map(activity => (
                                    <Card key={activity.id} className="mb-4">
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <span className="mr-2">{activity.title}</span>
                                                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    {activity.activity_type}
                                                </span>
                                            </CardTitle>
                                            <div className="text-gray-500">
                                                {activity.candidate_id && activity.candidate_name && (
                                                    <span>
                                                        Candidate:
                                                        <Link
                                                            href={`/candidates/${activity.candidate_id}`}
                                                            className="text-blue-600 hover:underline ml-1"
                                                        >
                                                            {activity.candidate_name}
                                                        </Link>
                                                        {" | "}
                                                    </span>
                                                )}
                                                {activity.deal_name && <span>Deal: {activity.deal_name} | </span>}
                                                <span>Scheduled: {new Date(activity.scheduled_at).toLocaleString()}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p><strong>Status:</strong> {activity.status}</p>
                                            <p><strong>Description:</strong> {activity.description || 'No description'}</p>
                                            {activity.outcome && (
                                                <div className="mt-2 p-2 bg-gray-50 rounded">
                                                    <p><strong>Outcome:</strong> {activity.outcome}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Completed: {new Date(activity.completed_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No activities found for the selected period.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="notes">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                            </div>
                        ) : filteredData.notes?.length > 0 ? (
                            <div>
                                {filteredData.notes.map(note => (
                                    <Card key={note.id} className="mb-4">
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle className="text-lg">
                                                    {note.title || 'Untitled Note'}
                                                </CardTitle>
                                                <div className="text-sm text-gray-500">
                                                    {formatDateTime(note.created_at)}
                                                </div>
                                            </div>
                                            <div className="text-sm">
                                                {note.candidate_name && <span>Candidate: {note.candidate_name} | </span>}
                                                {note.deal_name && <span>Deal: {note.deal_name}</span>}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="whitespace-pre-wrap">{note.content}</div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No notes found for the selected period.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="deals">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                            </div>
                        ) : filteredData.deals?.length > 0 ? (
                            <div>
                                {filteredData.deals.map(deal => (
                                    <Card key={deal.id} className="mb-4">
                                        <CardHeader>
                                            <CardTitle>{deal.name}</CardTitle>
                                            <div className="flex justify-between">
                                                <p className="text-sm text-gray-500">Created: {new Date(deal.created_at).toLocaleString()}</p>
                                                <p className="text-sm text-gray-500">Updated: {new Date(deal.updated_at).toLocaleString()}</p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-2">
                                                <p><strong>Stage:</strong> {deal.stage}</p>
                                                <p><strong>Value:</strong> ₹{deal.value?.toLocaleString() || '0'}</p>
                                                <p><strong>Candidate:</strong> {deal.candidate_name || 'N/A'}</p>
                                                <p><strong>Status:</strong> {deal.status || 'N/A'}</p>

                                                {deal.changes && Object.keys(deal.changes).length > 0 && (
                                                    <div className="col-span-2 mt-2">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-semibold">Recent Changes:</p>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleActivityExpand(deal.id)}
                                                                className="h-6 px-2"
                                                            >
                                                                {expandedActivities[deal.id] ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                        </div>
                                                        <ul className="list-disc pl-5 mt-1">
                                                            {Object.entries(deal.changes).map(([field, change], index) => (
                                                                <li key={index} className="text-sm">
                                                                    <span className="font-medium">{field}:</span> {change.from} → {change.to}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No deal updates found for the selected period.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="activity-logs">
    {activityLogsLoading ? (
        <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
    ) : activityLogs.length > 0 ? (
        <div className="overflow-hidden border rounded-lg">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Performed By</th>
                        <th className="px-4 py-3">Entity</th>
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">Description</th>
                    </tr>
                </thead>
                <tbody>
                    {activityLogs.map((log, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {/* Timestamp */}
                            <td className="px-4 py-3 border-t">
                                {new Date(log.created_at).toLocaleString()}
                            </td>

                            {/* Performed By (User or System) */}
                            <td className="px-4 py-3 border-t">
                                {log.causer_id ? (
                                    <Link
                                        href={`/users/${log.causer_id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        User #{log.causer_id}
                                    </Link>
                                ) : (
                                    <span className="text-gray-500">System</span>
                                )}
                            </td>

                            {/* Entity Type & ID */}
                            <td className="px-4 py-3 border-t">
                                {log.subject_id && log.subject_type ? (
                                    <Link
                                        href={`/${log.subject_type.replace('App\\Models\\', '').toLowerCase()}s/${log.subject_id}`}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {log.subject_type.replace('App\\Models\\', '')} #{log.subject_id}
                                    </Link>
                                ) : (
                                    <span className="text-gray-500">N/A</span>
                                )}
                            </td>

                            {/* Action */}
                            <td className="px-4 py-3 border-t">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    {log.event}
                                </span>
                            </td>

                            {/* Description */}
                            <td className="px-4 py-3 border-t">
                                {log.description || 'No description available'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <div className="text-center py-8 text-gray-500">
            No activity logs found for the selected period.
        </div>
    )}
</TabsContent>


                </Tabs>
            </div>
        </AppLayout>
    );
}