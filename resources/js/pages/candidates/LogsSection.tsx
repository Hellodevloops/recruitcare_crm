import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, PlusCircle, Edit2, FileText, ChevronDown, ChevronUp, Filter, Briefcase } from 'lucide-react';
import axios from 'axios';
import { Candidate } from '@/types';

interface LogEntry {
    id: number;
    description: string;
    subject_type: string;
    subject_id: number;
    causer_id?: number;
    causer?: { name: string };
    created_at: string;
    properties?: Record<string, any> & { 
        pipeline?: { name: string };
        stage?: { name: string };
    };
    source: 'spatie' | 'custom' | 'deal';
}

const LogsSection: React.FC<{ candidate: Candidate; setCandidate: (candidate: Candidate) => void }> = ({ candidate }) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
    const [filter, setFilter] = useState<'all' | 'spatie' | 'custom' | 'deal'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 5;
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(`/candidates/${candidate.id}/logs`);
                setLogs(response.data || []);
            } catch (error) {
                console.error('Failed to fetch logs:', error);
                setError('Failed to load logs. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (candidate && candidate.id) {
            fetchLogs();
        }
    }, [candidate.id]);

    const toggleExpand = (logId: string) => {
        setExpandedLogs((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(logId)) newSet.delete(logId);
            else newSet.add(logId);
            return newSet;
        });
    };

    const formatSummary = (log: LogEntry) => {
        if (log.source === 'spatie') {
            if (log.description === 'Candidate was created') {
                const attrs = log.properties?.attributes || {};
                return `Created candidate "${attrs.name || 'Unnamed'}"`;
            } else if (log.description === 'Candidate was updated') {
                const newValues = log.properties?.attributes || {};
                return `Updated ${Object.keys(newValues).length} field${Object.keys(newValues).length > 1 ? 's' : ''}`;
            }
        } else if (log.source === 'custom') {
            const props = log.properties || {};
            if (props.description) {
                return `${props.type || 'Activity'} added: "${props.description.substring(0, 50)}${props.description.length > 50 ? '...' : ''}"`;
            }
            return `${props.type || 'Activity'} created${props.is_completed ? ' (Completed)' : ''}`;
        } else if (log.source === 'deal') {
            const props = log.properties || {};
            const pipelineName = props.pipeline?.name ? ` in pipeline "${props.pipeline.name}"` : '';
            const stageName = props.stage?.name ? `, stage "${props.stage.name}"` : '';
            return `Deal recorded: "${log.description.substring(0, 50)}${log.description.length > 50 ? '...' : ''}"${pipelineName}${stageName}`;
        }
        return log.description || 'Action recorded';
    };

    const getIcon = (log: LogEntry) => {
        if (log.source === 'spatie') {
            if (log.description === 'Candidate was created') return <PlusCircle className="h-5 w-5 text-green-600" />;
            if (log.description === 'Candidate was updated') return <Edit2 className="h-5 w-5 text-blue-600" />;
        } else if (log.source === 'deal') {
            return <Briefcase className="h-5 w-5 text-indigo-600" />;
        }
        return <FileText className="h-5 w-5 text-purple-600" />;
    };

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => filter === 'all' || log.source === filter);
    }, [logs, filter]);

    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * logsPerPage;
        return filteredLogs.slice(start, start + logsPerPage);
    }, [filteredLogs, currentPage]);

    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    if (loading) {
        return (
            <Card className="shadow-lg">
                <CardContent className="pt-6">
                    <p className="text-center text-gray-500 animate-pulse">Loading logs...</p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="shadow-lg">
                <CardContent className="pt-6">
                    <p className="text-center text-red-500">{error}</p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="mt-4 mx-auto block"
                    >
                        Refresh Page
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg border border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-gray-800">Activity Logs</CardTitle>
                    <div className="flex items-center gap-2">
                        <Select value={filter} onValueChange={(value) => setFilter(value as 'all' | 'spatie' | 'custom' | 'deal')}>
                            <SelectTrigger className="w-40 bg-white">
                                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                                <SelectValue placeholder="Filter logs" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Logs</SelectItem>
                                <SelectItem value="spatie">System Logs</SelectItem>
                                <SelectItem value="custom">Activity Logs</SelectItem>
                                <SelectItem value="deal">Deal Logs</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {filteredLogs.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 py-4">No logs match your filter criteria.</p>
                ) : (
                    <>
                        <div className="space-y-4">
                            {paginatedLogs.map((log) => {
                                const logId = `${log.source}-${log.id}`;
                                const isExpanded = expandedLogs.has(logId);
                                return (
                                    <div
                                        key={logId}
                                        className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                                    >
                                        <div className="flex-shrink-0 mt-1">{getIcon(log)}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600 font-medium">
                                                        {new Date(log.created_at).toLocaleString('en-US', {
                                                            year: 'numeric',
                                                            month: 'numeric',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            second: '2-digit',
                                                            hour12: true,
                                                        })}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleExpand(logId)}
                                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                                    aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                                                >
                                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                            <p className="mt-2 text-base font-semibold text-gray-900">
                                                {log.source === 'spatie' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                                        System
                                                    </span>
                                                ) : log.source === 'custom' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                                                        Activity
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                                                        Deal
                                                    </span>
                                                )}
                                                {formatSummary(log)}
                                            </p>
                                            {log.causer && (
                                                <p className="mt-1 text-sm text-gray-600">
                                                    By: <span className="font-semibold text-gray-700">{log.causer.name}</span>
                                                </p>
                                            )}
                                            {isExpanded && log.properties && (
                                                <div className="mt-3 p-4 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-700 transition-all duration-300">
                                                    {log.source === 'spatie' && log.description === 'Candidate was created' && (
                                                        <div>
                                                            <p className="font-semibold text-gray-800 mb-2">Candidate Creation Details:</p>
                                                            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                                {Object.entries(log.properties.attributes || {}).map(([key, value]) => (
                                                                    <div key={key}>
                                                                        <dt className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}:</dt>
                                                                        <dd className="text-sm font-medium">{value ?? 'N/A'}</dd>
                                                                    </div>
                                                                ))}
                                                            </dl>
                                                        </div>
                                                    )}
                                                    {log.source === 'spatie' && log.description === 'Candidate was updated' && (
                                                        <div>
                                                            <p className="font-semibold text-gray-800 mb-2">Update Changes:</p>
                                                            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                                {Object.entries(log.properties.attributes || {}).map(([key, value]) => (
                                                                    <div key={key}>
                                                                        <dt className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}:</dt>
                                                                        <dd className="text-sm font-medium">
                                                                            <span className="text-red-600">{log.properties.old?.[key] ?? 'N/A'}</span> →{' '}
                                                                            <span className="text-green-600">{value ?? 'N/A'}</span>
                                                                        </dd>
                                                                    </div>
                                                                ))}
                                                            </dl>
                                                        </div>
                                                    )}
                                                    {log.source === 'custom' && (
                                                        <div>
                                                            <p className="font-semibold text-gray-800 mb-2">Activity Details:</p>
                                                            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                                {Object.entries(log.properties || {}).map(([key, value]) => (
                                                                    <div key={key}>
                                                                        <dt className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}:</dt>
                                                                        <dd className="text-sm font-medium">{value ?? 'N/A'}</dd>
                                                                    </div>
                                                                ))}
                                                            </dl>
                                                        </div>
                                                    )}
                                                    {log.source === 'deal' && (
                                                        <div>
                                                            <p className="font-semibold text-gray-800 mb-2">Deal Details:</p>
                                                            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                                {Object.entries(log.properties || {}).map(([key, value]) => {
                                                                    if (key === 'pipeline' && value) {
                                                                        return (
                                                                            <div key={key}>
                                                                                <dt className="text-xs text-gray-500 capitalize">Pipeline:</dt>
                                                                                <dd className="text-sm font-medium">{value.name ?? 'N/A'}</dd>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    if (key === 'stage' && value) {
                                                                        return (
                                                                            <div key={key}>
                                                                                <dt className="text-xs text-gray-500 capitalize">Stage:</dt>
                                                                                <dd className="text-sm font-medium">{value.name ?? 'N/A'}</dd>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    // Skip pipeline_id and stage_id
                                                                    if (key === 'pipeline_id' || key === 'stage_id') {
                                                                        return null;
                                                                    }
                                                                    return (
                                                                        <div key={key}>
                                                                            <dt className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}:</dt>
                                                                            <dd className="text-sm font-medium">{value ?? 'N/A'}</dd>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </dl>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="text-gray-700 hover:bg-gray-100"
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="text-gray-700 hover:bg-gray-100"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default LogsSection;