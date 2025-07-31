import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Eye } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
// import {formatQuotationId } from '../../utils/helpers'

interface Quotation {
    id: number;
    quotation_number: string;
    client: { name: string; company_name?: string } | null; // Allow client to be null
    date: string;
    valid_until: string;
    status: string;
    amount: number;
}

interface Props {
    quotations: {
        data: Quotation[];
        links: any;
    };
}

// Helper function to format quotation ID with leading zeros
const formatQuotationId = (id: number): string => {
    // Convert id to string and pad with leading zeros to ensure 4 digits
    const paddedId = id.toString().padStart(4, '0');
    return `DV${paddedId}`;
};

export default function QuotationIndex({ quotations }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this quotation?')) {
            router.delete(`/quotations/${id}`);
        }
    };
    return (
        <AppLayout>
            <Head title="Quotations" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Quotations</h2>
                    <Link href="/quotations/create">
                        <Button>Create Quotation</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Quotation List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Quotation #</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Valid Until</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {quotations.data.map((quotation) => (
                                    <TableRow key={quotation.id}>
                                        <TableCell>{formatQuotationId(quotation.id)}</TableCell>
                                        <TableCell>
                                            {quotation.client ? (
                                                <>
                                                    {quotation.client.name}
                                                    {quotation.client.company_name && ` (${quotation.client.company_name})`}
                                                </>
                                            ) : (
                                                'No Client'
                                            )}
                                        </TableCell>
                                        <TableCell>{new Date(quotation.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(quotation.valid_until).toLocaleDateString()}</TableCell>
                                        <TableCell className="capitalize">{quotation.status}</TableCell>
                                        <TableCell>₹{quotation.amount}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Link href={`/quotations/${quotation.id}`}>
                                                    <Button variant="outline" size="sm">
                                                        {/* this button should only show the show page that page will not have the option of edit email or generate pdf */}
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/quotations/${quotation.id}/edit`}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(quotation.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}