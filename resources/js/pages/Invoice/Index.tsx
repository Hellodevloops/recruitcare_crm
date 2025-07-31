import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Eye, FileText, Download } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Invoice {
    id: number;
    invoice_number: string;
    client: { name: string; company_name?: string } | null;
    quotation_date: string;
    due_date: string;
    status: 'draft' | 'sent' | 'paid' | 'unpaid' | 'overdue';
    amount: number;
}

interface Client {
    id: number;
    name: string;
    company_name?: string;
}

interface Props {
    invoices: {
        data: Invoice[];
        links: any;
    };
    clients: Client[];
}

export default function InvoiceIndex({ invoices, clients }: Props) {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [clientFilter, setClientFilter] = useState<string>('');

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            router.delete(`/invoices/${id}`);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs';
            case 'unpaid':
                return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs';
            case 'overdue':
                return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs';
            case 'draft':
                return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs';
            case 'sent':
                return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs';
            default:
                return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs';
        }
    };

    // Filter invoices based on status and client name
    const filteredInvoices = invoices.data.filter(invoice => {
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        const matchesClient = clientFilter === '' || 
            (invoice.client && invoice.client.name.toLowerCase().includes(clientFilter.toLowerCase())) ||
            (invoice.client && invoice.client.company_name && 
             invoice.client.company_name.toLowerCase().includes(clientFilter.toLowerCase()));
        return matchesStatus && matchesClient;
    });

    // Handle export functions (placeholder for now)
    const exportToPDF = () => {
        alert('Export to PDF functionality to be implemented');
    };

    const exportToExcel = () => {
        alert('Export to Excel functionality to be implemented');
    };

    return (
        <AppLayout>
            <Head title="Invoices" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={exportToPDF} size="sm">
                            <FileText className="h-4 w-4 mr-2" /> Export PDF
                        </Button>
                        <Button variant="outline" onClick={exportToExcel} size="sm">
                            <Download className="h-4 w-4 mr-2" /> Export Excel
                        </Button>
                        <Link href="/invoices/create">
                            <Button>Create New</Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoice List</CardTitle>
                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Filter by client name..."
                                    value={clientFilter}
                                    onChange={(e) => setClientFilter(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="w-48">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="sent">Sent</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="unpaid">Unpaid</SelectItem>
                                        <SelectItem value="overdue">Overdue</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Desktop View */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Client Name</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredInvoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell>
                                                <Link href={`/invoices/${invoice.id}`} className="hover:underline text-blue-600">
                                                    {invoice.invoice_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {invoice.client ? (
                                                    <>
                                                        {invoice.client.name}
                                                        {invoice.client.company_name && ` (${invoice.client.company_name})`}
                                                    </>
                                                ) : (
                                                    'No Client'
                                                )}
                                            </TableCell>
                                            <TableCell>{new Date(invoice.quotation_date).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                                            <TableCell>₹{invoice.amount.toLocaleString('en-IN')}</TableCell>
                                            <TableCell>
                                                <span className={getStatusBadgeClass(invoice.status)}>
                                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Link href={`/invoices/${invoice.id}`}>
                                                        <Button variant="outline" size="sm" title="View">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/invoices/${invoice.id}/edit`}>
                                                        <Button variant="outline" size="sm" title="Edit">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(invoice.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" title="Download PDF">
                                                        <FileText className="h-4 w-4 text-blue-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredInvoices.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-4">
                                                No invoices found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        
                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                            {filteredInvoices.map((invoice) => (
                                <Card key={invoice.id} className="overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <div>
                                                <Link href={`/invoices/${invoice.id}`} className="text-blue-600 font-medium">
                                                    {invoice.invoice_number}
                                                </Link>
                                            </div>
                                            <span className={getStatusBadgeClass(invoice.status)}>
                                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                            </span>
                                        </div>
                                        
                                        <div className="text-sm">
                                            <div className="grid grid-cols-2 gap-1">
                                                <span className="text-gray-500">Client:</span>
                                                <span>
                                                    {invoice.client ? invoice.client.name : 'No Client'}
                                                </span>
                                                
                                                <span className="text-gray-500">Date:</span>
                                                <span>{new Date(invoice.quotation_date).toLocaleDateString()}</span>
                                                
                                                <span className="text-gray-500">Due Date:</span>
                                                <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
                                                
                                                <span className="text-gray-500">Amount:</span>
                                                <span className="font-medium">₹{invoice.amount.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between mt-4 border-t pt-3">
                                            <div className="flex gap-2">
                                                <Link href={`/invoices/${invoice.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/invoices/${invoice.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm">
                                                    <FileText className="h-4 w-4 text-blue-500" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(invoice.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <div className="text-center py-4">
                                    No invoices found
                                </div>
                            )}
                        </div>
                        
                        {/* Pagination can be added here similar to the links in the Quotation component */}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}