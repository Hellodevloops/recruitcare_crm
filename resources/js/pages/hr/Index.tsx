import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';

interface Brand {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
}

interface HrRecord {
    id: number;
    name: string;
    email: string;
    brand: Brand;
}

interface Props {
    hrList: HrRecord[];
    brands: Brand[];
}

export default function HRIndex({ hrList, brands }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const form = useForm({
        name: '',
        email: '',
        brand_id: '',
    });

    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

    const [brandForm, setBrandForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/hr', {
            onSuccess: () => {
                form.reset();
                setSelectedBrand(null);
                toast({
                    title: "Success",
                    description: "HR record created successfully",
                });
            },
        });
    };

    const handleBrandSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('/hr/brand', brandForm);
            if (response.data.success) {
                setIsOpen(false);
                setBrandForm({ name: '', email: '', phone: '', address: '' });
                toast({
                    title: "Success",
                    description: "Brand created successfully",
                });
                // Refresh the page to get updated brands list
                window.location.reload();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create brand",
                variant: "destructive",
            });
        }
    };

    const handleBrandSelect = (brand: Brand) => {
        setSelectedBrand(brand);
        form.setData('brand_id', brand.id.toString());
    };

    return (
        <>
            <Head title="HR Dashboard" />
            
            <div className="flex flex-col gap-4 p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Create HR Record</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={e => form.setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Brand</Label>
                                    <div className="flex gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between">
                                                    {selectedBrand ? selectedBrand.name : 'Select Brand'}
                                                    <ChevronDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-full max-h-[200px] overflow-y-auto">
                                                {brands.map(brand => (
                                                    <DropdownMenuItem 
                                                        key={brand.id}
                                                        onClick={() => handleBrandSelect(brand)}
                                                    >
                                                        {brand.name}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                            <DialogTrigger asChild>
                                                <Button type="button" variant="outline">+</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Create New Brand</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleBrandSubmit} className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="brandName">Brand Name</Label>
                                                        <Input
                                                            id="brandName"
                                                            value={brandForm.name}
                                                            onChange={e => setBrandForm({ ...brandForm, name: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="brandEmail">Email</Label>
                                                        <Input
                                                            id="brandEmail"
                                                            type="email"
                                                            value={brandForm.email}
                                                            onChange={e => setBrandForm({ ...brandForm, email: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="brandPhone">Phone</Label>
                                                        <Input
                                                            id="brandPhone"
                                                            value={brandForm.phone}
                                                            onChange={e => setBrandForm({ ...brandForm, phone: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="brandAddress">Address</Label>
                                                        <Input
                                                            id="brandAddress"
                                                            value={brandForm.address}
                                                            onChange={e => setBrandForm({ ...brandForm, address: e.target.value })}
                                                        />
                                                    </div>
                                                    <Button type="submit" className="w-full">
                                                        Create Brand
                                                    </Button>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Create HR Record
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>HR Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-2">Name</th>
                                        <th className="text-left p-2">Email</th>
                                        <th className="text-left p-2">Brand</th>
                                        <th className="text-left p-2">Brand Contact</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hrList.map(hr => (
                                        <tr key={hr.id} className="border-b">
                                            <td className="p-2">{hr.name}</td>
                                            <td className="p-2">{hr.email}</td>
                                            <td className="p-2">{hr.brand.name}</td>
                                            <td className="p-2">
                                                {hr.brand.email && <div>{hr.brand.email}</div>}
                                                {hr.brand.phone && <div>{hr.brand.phone}</div>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

HRIndex.layout = (page: React.ReactNode) => <AppLayout children={page} />; 