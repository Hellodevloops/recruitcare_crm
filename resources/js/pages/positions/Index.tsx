import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

interface Position {
    id: number;
    brand?: {
        id: number;
        name: string;
    } | null;
    hr?: {
        id: number;
        email: string;
    } | null;
    designation: string;
    experience: string | null;
    store: string | null;
    city: string | null;
    budget: number | null;
}

interface Props extends PageProps {
    positions: Position[];
}

export default function Index({ positions = [] }: Props) {
    const handleDelete = (positionId: number) => {
        router.delete(`/positions/${positionId}`, {
            onSuccess: () => {
                toast.success('Position deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete position');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Positions" />

            <div className="container mx-auto py-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Positions</h2>
                        <Link href="/positions/create">
                            <Button className="bg-primary hover:bg-primary/90">Create Position</Button>
                        </Link>
                    </div>
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Designation</TableHead>
                                        <TableHead>Brand</TableHead>
                                        <TableHead>HR</TableHead>
                                        <TableHead>Experience</TableHead>
                                        <TableHead>Store</TableHead>
                                        <TableHead>City</TableHead>
                                        <TableHead>Budget</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {positions?.map((position) => (
                                        <TableRow key={position.id}>
                                            <TableCell>{position.designation}</TableCell>
                                            <TableCell>{position.brand?.name || 'N/A'}</TableCell>
                                            <TableCell>{position.hr?.email || 'N/A'}</TableCell>
                                            <TableCell>{position.experience || 'N/A'}</TableCell>
                                            <TableCell>{position.store || 'N/A'}</TableCell>
                                            <TableCell>{position.city || 'N/A'}</TableCell>
                                            <TableCell>
                                                {position.budget ? `₹${position.budget.toLocaleString('en-IN')}` : 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={`/positions/${position.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            View
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/positions/${position.id}/edit`}>
                                                        <Button variant="outline" size="sm">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm">
                                                                Delete
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Position</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this position? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(position.id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {positions.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-4">
                                                No positions found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
} 