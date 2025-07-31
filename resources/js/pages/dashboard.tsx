import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DollarSign, Users, TrendingUp, Target, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

// Sample data
const pipelineData = [
    { stage: 'Prospect', value: 30 },
    { stage: 'Qualified', value: 20 },
    { stage: 'Proposal', value: 15 },
    { stage: 'Negotiation', value: 10 },
    { stage: 'Closed', value: 25 },
];

const salesTrendData = [
    { day: 'Mon', sales: 4000 },
    { day: 'Tue', sales: 3000 },
    { day: 'Wed', sales: 5000 },
    { day: 'Thu', sales: 4500 },
    { day: 'Fri', sales: 6000 },
];

const teamPerformanceData = [
    { name: 'John', value: 400 },
    { name: 'Sarah', value: 300 },
    { name: 'Mike', value: 200 },
    { name: 'Emma', value: 250 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const recentActivities = [
    { name: "John Smith", action: "Closed deal", value: "₹5,000", time: "15m ago" },
    { name: "Sarah Johnson", action: "New lead", value: "₹2,500", time: "1h ago" },
    { name: "Mike Brown", action: "Follow-up", value: "₹1,000", time: "3h ago" },
    { name: "Emma Davis", action: "Proposal sent", value: "₹3,500", time: "Today" },
];

export default function SalesDashboard() {
    const [timeframe, setTimeframe] = useState("30d");

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Sales Dashboard</h2>
                        <p className="text-sm text-gray-600">Your sales performance at a glance</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                        <Select value={timeframe} onValueChange={setTimeframe}>
                            <SelectTrigger className="w-full sm:w-[160px] bg-white border-gray-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                                <SelectItem value="90d">Last 90 Days</SelectItem>
                                <SelectItem value="qtd">Quarter to Date</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                            Export
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-700">Total Sales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-gray-800">₹125,450</div>
                            <p className="text-xs text-gray-500 mt-1">+15% from last period</p>
                            <Progress value={65} className="h-1 mt-2 bg-gray-200" indicatorClassName="bg-blue-500" />
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-700">New Leads</CardTitle>
                            <Users className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-gray-800">145</div>
                            <p className="text-xs text-gray-500 mt-1">+25% from last period</p>
                            <Progress value={75} className="h-1 mt-2 bg-gray-200" indicatorClassName="bg-green-500" />
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-700">Conversion Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-gray-800">32%</div>
                            <p className="text-xs text-gray-500 mt-1">+5% from last period</p>
                            <Progress value={32} className="h-1 mt-2 bg-gray-200" indicatorClassName="bg-purple-500" />
                        </CardContent>
                    </Card>
                </div>

                {/* Main Charts */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Pipeline Chart */}
                    <Card className="lg:col-span-2 bg-white border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-800">Sales Pipeline</CardTitle>
                            <CardDescription className="text-sm text-gray-600">Deals by stage</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={pipelineData}>
                                    <XAxis dataKey="stage" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Team Performance */}
                    <Card className="bg-white border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-800">Team Performance</CardTitle>
                            <CardDescription className="text-sm text-gray-600">Sales by rep</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={teamPerformanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                                        {teamPerformanceData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Section */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Sales Trend */}
                    <Card className="lg:col-span-2 bg-white border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-800">Sales Trend</CardTitle>
                            <CardDescription className="text-sm text-gray-600">Daily performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={salesTrendData}>
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `₹${value}`} />
                                    <Area type="monotone" dataKey="sales" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Recent Activities */}
                    <Card className="bg-white border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-800">Recent Activities</CardTitle>
                            <CardDescription className="text-sm text-gray-600">Latest updates</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
                            {recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-center">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`/api/placeholder/32/${index + 1}`} />
                                        <AvatarFallback>{activity.name.charAt(0)}{activity.name.split(' ')[1]?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-800">{activity.name}</p>
                                        <p className="text-xs text-gray-500">{activity.action} • {activity.time}</p>
                                    </div>
                                    <div className="text-sm font-medium text-gray-700">{activity.value}</div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Metrics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-white border-gray-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                                <Target className="h-4 w-4 mr-2 text-red-500" />
                                Open Deals
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold text-gray-800">23</div>
                            <p className="text-xs text-gray-500">₹45K Potential</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-gray-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                                Quota Attainment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold text-gray-800">78%</div>
                            <Progress value={78} className="h-1 mt-2 bg-gray-200" indicatorClassName="bg-green-500" />
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-gray-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                                Avg. Deal Size
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold text-gray-800">₹2,450</div>
                            <p className="text-xs text-gray-500">+12% Growth</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-gray-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-purple-500" />
                                Sales Velocity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-semibold text-gray-800">18 days</div>
                            <p className="text-xs text-gray-500">Avg. Close Time</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}