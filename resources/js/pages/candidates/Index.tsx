import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Phone, Eye, Trash2, Plus, Search, Filter, X, Calendar, MapPin, Building, User } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { FormEvent, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@inertiajs/react';

interface Candidate {
    id: number;
    name: string;
    phone: string;
    email?: string;
    website?: string;
    city?: string;
    state?: string;
    country?: string;
    company_name?: string;
    current_designation?: string;
    experience?: string;
    notice_period?: string;
    owner: { id: number; name: string };
    deal?: { id: number; name: string };
}

interface PageProps {
    candidates: {
        data: Candidate[];
        links: any;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: {
        search: string;
        date?: string;
        owner_id?: string;
        state?: string;
        month?: string;
        created_at?: string;
        updated_at?: string;
        per_page?: string;
    };
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Candidates', href: '/candidates' },
];

const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export default function CandidateList() {
    const { candidates, filters } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [dateFilter, setDateFilter] = useState(filters.date || '');
    const [ownerFilter, setOwnerFilter] = useState(filters.owner_id || '');
    const [stateFilter, setStateFilter] = useState(filters.state || '');
    const [monthFilter, setMonthFilter] = useState(filters.month || '');
    const [createdAtFilter, setCreatedAtFilter] = useState(filters.created_at || '');
    const [updatedAtFilter, setUpdatedAtFilter] = useState(filters.updated_at || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState(0);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const { data, setData, post, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        website: '',
        city: '',
        state: '',
        country: '',
        company_name: '',
        deal_id: null as number | null,
    });

    // Count active filters
    useEffect(() => {
        let count = 0;
        if (dateFilter) count++;
        if (stateFilter && stateFilter !== 'all') count++;
        if (monthFilter && monthFilter !== 'all') count++;
        if (createdAtFilter) count++;
        if (updatedAtFilter) count++;
        setActiveFilters(count);
    }, [dateFilter, stateFilter, monthFilter, createdAtFilter, updatedAtFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route('candidates.index'),
                {
                    search: searchTerm,
                    date: dateFilter,
                    owner_id: ownerFilter,
                    state: stateFilter && stateFilter !== 'all' ? stateFilter : undefined,
                    month: monthFilter && monthFilter !== 'all' ? monthFilter : undefined,
                    created_at: createdAtFilter,
                    updated_at: updatedAtFilter,
                    per_page: perPage
                },
                { preserveState: true, preserveScroll: true }
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, dateFilter, ownerFilter, stateFilter, monthFilter, createdAtFilter, updatedAtFilter, perPage]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('candidates.store'), {
            onSuccess: () => {
                setIsDialogOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this candidate?')) {
            destroy(route('candidates.destroy', id));
        }
    };

    const handleViewCandidate = (id: number) => {
        router.visit(route('candidates.show', id));
    };

    const goToPage = (url: string | null) => {
        if (url) {
            router.visit(url, { preserveState: true, preserveScroll: true });
        }
    };

    const clearFilters = () => {
        setDateFilter('');
        setStateFilter('');
        setMonthFilter('');
        setCreatedAtFilter('');
        setUpdatedAtFilter('');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Candidate List" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
                        <p className="text-muted-foreground">
                            Manage your candidate database
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('candidates.create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Candidate
                        </Link>
                    </Button>
                </div>

                {/* Main Content */}
                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle className="text-lg font-semibold text-gray-800">Candidate Directory</CardTitle>
                                <CardDescription className="text-sm text-gray-600">
                                    {candidates.total} candidates in your database
                                </CardDescription>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative w-full sm:w-64 md:w-80">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search candidates..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-full"
                                    />
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className="relative"
                                >
                                    <Filter className="h-4 w-4" />
                                    {activeFilters > 0 && (
                                        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 text-white">
                                            {activeFilters}
                                        </Badge>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Filters Section */}
                        {isFilterOpen && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="text-xs h-8"
                                        >
                                            Clear All
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsFilterOpen(false)}
                                            className="text-xs h-8"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="stateFilter" className="flex items-center text-xs">
                                            <MapPin className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                            State/Province
                                        </Label>
                                        <Select value={stateFilter} onValueChange={setStateFilter}>
                                            <SelectTrigger id="stateFilter" className="text-sm">
                                                <SelectValue placeholder="All states" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All States</SelectItem>
                                                <SelectItem value="andhra-pradesh">Andhra Pradesh</SelectItem>
                                                <SelectItem value="arunachal-pradesh">Arunachal Pradesh</SelectItem>
                                                <SelectItem value="assam">Assam</SelectItem>
                                                <SelectItem value="bihar">Bihar</SelectItem>
                                                <SelectItem value="chhattisgarh">Chhattisgarh</SelectItem>
                                                <SelectItem value="goa">Goa</SelectItem>
                                                <SelectItem value="gujarat">Gujarat</SelectItem>
                                                <SelectItem value="haryana">Haryana</SelectItem>
                                                <SelectItem value="himachal-pradesh">Himachal Pradesh</SelectItem>
                                                <SelectItem value="jharkhand">Jharkhand</SelectItem>
                                                <SelectItem value="karnataka">Karnataka</SelectItem>
                                                <SelectItem value="kerala">Kerala</SelectItem>
                                                <SelectItem value="madhya-pradesh">Madhya Pradesh</SelectItem>
                                                <SelectItem value="maharashtra">Maharashtra</SelectItem>
                                                <SelectItem value="manipur">Manipur</SelectItem>
                                                <SelectItem value="meghalaya">Meghalaya</SelectItem>
                                                <SelectItem value="mizoram">Mizoram</SelectItem>
                                                <SelectItem value="nagaland">Nagaland</SelectItem>
                                                <SelectItem value="odisha">Odisha</SelectItem>
                                                <SelectItem value="punjab">Punjab</SelectItem>
                                                <SelectItem value="rajasthan">Rajasthan</SelectItem>
                                                <SelectItem value="sikkim">Sikkim</SelectItem>
                                                <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                                                <SelectItem value="telangana">Telangana</SelectItem>
                                                <SelectItem value="tripura">Tripura</SelectItem>
                                                <SelectItem value="uttar-pradesh">Uttar Pradesh</SelectItem>
                                                <SelectItem value="uttarakhand">Uttarakhand</SelectItem>
                                                <SelectItem value="west-bengal">West Bengal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="monthFilter" className="flex items-center text-xs">
                                            <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                            Month Created
                                        </Label>
                                        <Select value={monthFilter} onValueChange={setMonthFilter}>
                                            <SelectTrigger id="monthFilter" className="text-sm">
                                                <SelectValue placeholder="All months" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Months</SelectItem>
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <SelectItem key={i + 1} value={`${i + 1}`}>
                                                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="createdAtFilter" className="flex items-center text-xs">
                                            <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                            Created At
                                        </Label>
                                        <Input
                                            id="createdAtFilter"
                                            type="date"
                                            value={createdAtFilter}
                                            onChange={(e) => setCreatedAtFilter(e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="updatedAtFilter" className="flex items-center text-xs">
                                            <Calendar className="h-3.5 w-3.5 mr-1 text-gray-500" />
                                            Updated At
                                        </Label>
                                        <Input
                                            id="updatedAtFilter"
                                            type="date"
                                            value={updatedAtFilter}
                                            onChange={(e) => setUpdatedAtFilter(e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="pt-6">
                        {/* Display Options */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                           

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Label htmlFor="perPage" className="text-xs whitespace-nowrap">
                                    Show:
                                </Label>
                                <Select value={perPage} onValueChange={setPerPage}>
                                    <SelectTrigger id="perPage" className="text-sm w-full sm:w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10 per page</SelectItem>
                                        <SelectItem value="25">25 per page</SelectItem>
                                        <SelectItem value="50">50 per page</SelectItem>
                                        <SelectItem value="100">100 per page</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Candidates Table */}
                        <div className="rounded-lg border border-gray-200">
                            <Table className="table-auto">
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead className="font-medium">Name</TableHead>
                                        <TableHead className="font-medium">Contact Info</TableHead>
                                        <TableHead className="font-medium">Professional Info</TableHead>
                                        <TableHead className="font-medium">Location</TableHead>
                                        <TableHead className="font-medium">Owner</TableHead>
                                        <TableHead className="text-right font-medium">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {candidates.data.map((candidate) => {
                                        const location = `${candidate.city || ''}${candidate.city && candidate.state ? ', ' : ''}${candidate.state || ''} ${candidate.country || ''}`.trim();
                                        return (
                                            <TableRow key={candidate.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium py-4">
                                                    <div
                                                        className="flex items-center gap-3 cursor-pointer hover:text-blue-600"
                                                        onClick={() => handleViewCandidate(candidate.id)}
                                                    >
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={`/api/placeholder/32/${candidate.id}`} />
                                                            <AvatarFallback className="bg-blue-100 text-blue-700">{candidate.name.charAt(0)}{candidate.name.split(' ')[1]?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium">{truncateText(candidate.name, 25)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {candidate.email && (
                                                            <div className="flex items-center gap-1.5 text-sm">
                                                                <Mail className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                                                <span className="truncate max-w-[180px]">{truncateText(candidate.email, 30)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1.5 text-sm">
                                                            <Phone className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                                            <span>{truncateText(candidate.phone, 20)}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {candidate.company_name && (
                                                        <div className="flex items-center gap-1.5 text-sm">
                                                            <Building className="h-3.5 w-3.5 text-gray-500" />
                                                                <span className="truncate max-w-[150px]">{truncateText(candidate.company_name, 25)}</span>
                                                            </div>
                                                        )}
                                                        {candidate.current_designation && (
                                                            <div className="flex items-center gap-1.5 text-sm">
                                                                <User className="h-3.5 w-3.5 text-gray-500" />
                                                                <span className="truncate max-w-[150px]">{truncateText(candidate.current_designation, 25)}</span>
                                                            </div>
                                                        )}
                                                        {candidate.experience && (
                                                            <div className="text-xs text-gray-600">
                                                                Exp: {truncateText(candidate.experience, 15)}
                                                            </div>
                                                        )}
                                                        {candidate.notice_period && (
                                                            <div className="text-xs text-gray-600">
                                                                Notice: {truncateText(candidate.notice_period, 15)}
                                                        </div>
                                                    )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {location ? (
                                                        <div className="flex items-center gap-1.5 text-sm">
                                                            <MapPin className="h-3.5 w-3.5 text-gray-500" />
                                                            <span className="truncate max-w-[150px]">{truncateText(location, 30)}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <User className="h-3.5 w-3.5 text-gray-500" />
                                                        <span>{truncateText(candidate.owner.name, 20)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-1 justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewCandidate(candidate.id)}
                                                            className="h-8 w-8 p-0"
                                                            title="View Candidate"
                                                        >
                                                            <Eye className="h-4 w-4 text-gray-600" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(candidate.id)}
                                                            className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 hover:bg-red-50"
                                                            title="Delete Candidate"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            {candidates.data.length === 0 && (
                                <div className="text-center py-8 px-4">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                                        <Search className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-1">No candidates found</h3>
                                    <p className="text-sm text-gray-500">
                                        Try adjusting your search or filter criteria
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                            <div className="text-sm text-gray-600 order-2 sm:order-1">
                                {candidates.data.length > 0 && (
                                    <>
                                        Showing <span className="font-medium">{(candidates.current_page - 1) * candidates.per_page + 1}</span> to{' '}
                                        <span className="font-medium">{Math.min(candidates.current_page * candidates.per_page, candidates.total)}</span> of{' '}
                                        <span className="font-medium">{candidates.total}</span> candidates
                                    </>
                                )}
                            </div>
                            <div className="flex gap-2 order-1 sm:order-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(candidates.prev_page_url)}
                                    disabled={!candidates.prev_page_url}
                                    className="text-sm"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(candidates.next_page_url)}
                                    disabled={!candidates.next_page_url}
                                    className="text-sm"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}