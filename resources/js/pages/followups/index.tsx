import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { format, parseISO } from 'date-fns';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Icons
import { 
  DollarSign,
  Users, 
  TrendingUp, 
  Target, 
  Clock, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Phone, 
  Mail, 
  FileText, 
  Video,
  Filter,
  RefreshCw,
  Plus,
  MoreHorizontal,
  ArrowUp,
  ChevronRight
} from 'lucide-react';

// Layout
import AppLayout from '@/layouts/app-layout';

// Types
interface BreadcrumbItem {
  title: string;
  href: string;
}

interface FollowUp {
  id: number;
  type: string;
  description: string;
  scheduled_at: string;
  is_completed: boolean;
                  candidate: {
    name: string;
    id: number;
  };
}

interface Filters {
  type?: string;
  date_range?: string;
  status?: string;
  specific_date?: string;
}

interface Stats {
  today: number;
  thisWeek: number;
  totalPending: number;
  byType: { type: string; count: number }[];
}

interface FollowUpsResponse {
  data: FollowUp[];
  total: number;
  current_page: number;
  last_page: number;
  prev_page_url: string | null;
  next_page_url: string | null;
}

// Constants
const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const typeIcons: { [key: string]: JSX.Element } = {
  call: <Phone className="h-4 w-4" />,
  meeting: <Video className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  task: <FileText className="h-4 w-4" />,
  note: <FileText className="h-4 w-4" />,
};

const typeColors: { [key: string]: string } = {
  call: "bg-blue-600",
  meeting: "bg-purple-600",
  email: "bg-green-600",
  task: "bg-amber-600",
  note: "bg-gray-600",
};

// Utilities
const calculateCompletionRate = (total: number, pending: number): number => {
  return total > 0 ? Math.round(((total - pending) / total) * 100) : 0;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Follow Ups', href: '/followups' },
];

interface FollowUpsDashboardProps {
  followUps: FollowUpsResponse;
  filters?: Filters;
  stats: Stats;
}

export default function FollowUpsDashboard({ followUps, filters = {}, stats }: FollowUpsDashboardProps) {
  const [selectedType, setSelectedType] = useState<string>(filters.type || 'all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>(filters.date_range || 'upcoming');
  const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || 'pending');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    filters.specific_date ? parseISO(filters.specific_date) : undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { get, setData, processing } = useForm({
    type: selectedType,
    date_range: selectedDateRange,
    status: selectedStatus,
    specific_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  });

  // Initial sync with server filters (runs only once on mount)
  useEffect(() => {
    setSelectedType(filters.type || 'all');
    setSelectedDateRange(filters.date_range || 'upcoming');
    setSelectedStatus(filters.status || 'pending');
    setSelectedDate(filters.specific_date ? parseISO(filters.specific_date) : undefined);
  }, []); // Empty dependency array to run only on initial render

  // Update form data when filter states change
  useEffect(() => {
    setData({
      type: selectedType,
      date_range: selectedDateRange,
      status: selectedStatus,
      specific_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
    });
  }, [selectedType, selectedDateRange, selectedStatus, selectedDate, setData]);

  // Update URL to reflect current filter states
  useEffect(() => {
    const params = new URLSearchParams({
      ...(selectedType !== 'all' && { type: selectedType }),
      ...(selectedDateRange !== 'upcoming' && { date_range: selectedDateRange }),
      ...(selectedStatus !== 'pending' && { status: selectedStatus }),
      ...(selectedDate && { specific_date: format(selectedDate, 'yyyy-MM-dd') }),
      page: followUps.current_page.toString(),
    });
    window.history.replaceState({}, '', `${route('followups.index')}?${params.toString()}`);
  }, [selectedType, selectedDateRange, selectedStatus, selectedDate, followUps.current_page]);

  const typeData = stats.byType.map((item, index) => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    value: item.count,
  }));
  
  const applyFilters = () => {
    setIsLoading(true);
    console.log('Applying filters:', { 
      type: selectedType === 'all' ? '' : selectedType,
      date_range: selectedDateRange === 'upcoming' ? '' : selectedDateRange,
      status: selectedStatus === 'pending' ? '' : selectedStatus,
      specific_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      page: 1 
    }); // Debug log

    get(route('followups.index'), {
      data: {
        type: selectedType === 'all' ? '' : selectedType,
        date_range: selectedDateRange === 'upcoming' ? '' : selectedDateRange,
        status: selectedStatus === 'pending' ? '' : selectedStatus,
        specific_date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
        page: 1
      },
      preserveState: false, // Ensure a fresh state update
      preserveScroll: true,
      onSuccess: () => {
        console.log('Filters applied successfully');
        setIsLoading(false);
      },
      onError: (errors) => {
        console.error('Error applying filters:', errors);
        setIsLoading(false);
      },
    });
  };

  const resetFilters = () => {
    setSelectedType('all');
    setSelectedDateRange('upcoming');
    setSelectedStatus('pending');
    setSelectedDate(undefined);
    setIsLoading(true);
    get(route('followups.index'), {
      preserveState: false,
      preserveScroll: true,
      onSuccess: () => setIsLoading(false),
      onError: () => setIsLoading(false),
    });
  };

  const getPageUrl = (page: number): string => {
    const params = new URLSearchParams({
      page: page.toString(),
      ...(selectedType !== 'all' && { type: selectedType }),
      ...(selectedDateRange !== 'upcoming' && { date_range: selectedDateRange }),
      ...(selectedStatus !== 'pending' && { status: selectedStatus }),
      ...(selectedDate && { specific_date: format(selectedDate, 'yyyy-MM-dd') }),
    });
    return `${route('followups.index')}?${params.toString()}`;
  };

  const completionRate = calculateCompletionRate(followUps.total, stats.totalPending);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Follow-up Dashboard" />
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Follow-up Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track and manage your scheduled activities</p>
          </div>
          <div className="flex gap-2">
            <Link href={route('followups.create')}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Follow-up
              </Button>
            </Link>
          </div>
        </div>
        
        <Separator />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard 
            title="Today's Follow-ups" 
            value={stats.today} 
            description="Scheduled for today"
            icon={<Clock className="h-5 w-5 text-blue-600" />}
            trend={{ value: "+2", label: "from yesterday", positive: true }}
          />
          <StatsCard 
            title="This Week" 
            value={stats.thisWeek} 
            description="Planned this week"
            icon={<CalendarIcon className="h-5 w-5 text-purple-600" />}
            trend={{ value: "+5", label: "from last week", positive: true }}
          />
          <StatsCard 
            title="Pending Follow-ups" 
            value={stats.totalPending} 
            description="Total pending activities"
            icon={<Target className="h-5 w-5 text-amber-600" />}
            trend={{ value: "-3", label: "from last month", positive: true }}
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Follow-ups by Type</CardTitle>
              </div>
              <CardDescription>Distribution of activities by category</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Distribution</CardTitle>
              <CardDescription>Activity type breakdown</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card className="overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Follow-ups</CardTitle>
                <CardDescription>Manage your scheduled activities</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FilterSelect
                  label="Activity Type"
                  value={selectedType}
                  onValueChange={setSelectedType}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'call', label: 'Call' },
                    { value: 'meeting', label: 'Meeting' },
                    { value: 'email', label: 'Email' },
                    { value: 'task', label: 'Task' },
                    { value: 'note', label: 'Note' },
                  ]}
                  icon={<FileText className="h-4 w-4" />}
                />
                
                <FilterSelect
                  label="Date Range"
                  value={selectedDateRange}
                  onValueChange={setSelectedDateRange}
                  options={[
                    { value: 'today', label: 'Today' },
                    { value: 'this_week', label: 'This Week' },
                    { value: 'upcoming', label: 'Upcoming' },
                    { value: 'all', label: 'All Dates' },
                  ]}
                  icon={<CalendarIcon className="h-4 w-4" />}
                />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Specific Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !selectedDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <FilterSelect
                  label="Status"
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'all', label: 'All Status' },
                  ]}
                  icon={<CheckCircle className="h-4 w-4" />}
                />
              </div>
              
              <div className="flex justify-end mt-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyFilters}
                  disabled={processing || isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Apply Filter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  disabled={processing || isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {followUps.data.length > 0 ? (
                followUps.data.map((item) => (
                  <FollowUpItem 
                    key={item.id} 
                    item={item} 
                  />
                ))
              ) : (
                <EmptyState />
              )}
            </div>
            
            {followUps.data.length > 0 && (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-1">
                  <Link 
                    href={followUps.prev_page_url || '#'} 
                    disabled={!followUps.prev_page_url}
                    preserveState
                    preserveScroll
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={!followUps.prev_page_url}
                    >
                      Previous
                    </Button>
                  </Link>
                  {Array.from({ length: followUps.last_page }, (_, i) => i + 1).map(page => (
                    <Link 
                      key={page} 
                      href={getPageUrl(page)}
                      preserveState
                      preserveScroll
                    >
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={followUps.current_page === page ? 'bg-slate-100' : ''}
                      >
                        {page}
                      </Button>
                    </Link>
                  ))}
                  <Link 
                    href={followUps.next_page_url || '#'} 
                    disabled={!followUps.next_page_url}
                    preserveState
                    preserveScroll
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={!followUps.next_page_url}
                    >
                      Next
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: JSX.Element;
  showProgress?: boolean;
  progressValue?: number;
  trend?: {
    value: string;
    label: string;
    positive: boolean;
  };
}

function StatsCard({ title, value, description, icon, showProgress = false, progressValue = 0, trend }: StatsCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-full p-2 bg-slate-100 dark:bg-slate-800">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline">
          <div className="text-3xl font-bold">{value}</div>
          {trend && (
            <div className={`ml-2 text-xs px-1.5 py-0.5 rounded-full flex items-center ${trend.positive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {trend.positive ? (
                <ArrowUp className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowUp className="h-3 w-3 mr-0.5 transform rotate-180" />
              )}
              {trend.value}
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
          {trend && (
            <span className="text-xs ml-1 text-muted-foreground">
              {trend.label}
            </span>
          )}
        </p>
        {showProgress && (
          <Progress 
            value={progressValue} 
            className="mt-3 h-2" 
          />
        )}
      </CardContent>
    </Card>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  icon?: JSX.Element;
}

function FilterSelect({ label, value, onValueChange, options, icon }: FilterSelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        {icon}
        {label}
      </label>
      <Select 
        value={value} 
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-full bg-white dark:bg-slate-900">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface FollowUpItemProps {
  item: FollowUp;
}

function FollowUpItem({ item }: FollowUpItemProps) {
  // Capitalize the activity type for display
  const activityType = item.type.charAt(0).toUpperCase() + item.type.slice(1);

  return (
    <div className="rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar className={`${typeColors[item.type]} text-white h-10 w-10 shadow-sm`}>
            <AvatarFallback>{typeIcons[item.type]}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link 
                                href={route('candidates.show', item.candidate.id)}
                className="font-medium text-lg hover:text-blue-600 transition-colors"
            >
                {item.candidate.name}
              </Link>
              <Badge 
                className={`${item.type === 'call' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                             item.type === 'meeting' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                             item.type === 'email' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                             item.type === 'task' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                             'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                {activityType}
              </Badge>
              {item.is_completed ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Pending</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
            <p className="text-xs font-medium flex items-center text-muted-foreground">
              <Clock className="h-3 w-3 inline mr-1" />
              {format(new Date(item.scheduled_at), 'MMM d, yyyy - h:mm a')}
            </p>
          </div>
        </div>
        <div className="flex gap-2 sm:flex-shrink-0">
          {!item.is_completed && (
            <Link href={route('followups.complete', item.id)} method="patch" as="button">
              <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={route('followups.edit', item.id)} className="cursor-pointer">
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-red-600 focus:text-red-600">
                <Link 
                  href={route('followups.destroy', item.id)} 
                  method="delete" 
                  as="button"
                  className="w-full text-left cursor-pointer"
                >
                  Delete
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 border rounded-lg bg-slate-50 dark:bg-slate-900">
      <FileText className="h-16 w-16 mx-auto text-slate-300" />
      <h3 className="mt-4 text-xl font-medium">No follow-ups found</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
        No follow-ups match your current filter criteria. Try adjusting your filters or create a new follow-up.
      </p>
      <div className="mt-6">
        <Link href={route('followups.create')}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Follow-up
          </Button>
        </Link>
      </div>
    </div>
  );
}