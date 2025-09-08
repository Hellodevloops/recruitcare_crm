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
    error?: string;
}

export default function HRIndex({ hrList, brands, error }: Props) {
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
        
        // Validate brand selection
        if (!form.data.brand_id) {
            toast({
                title: "Error",
                description: "Please select a brand",
                variant: "destructive",
            });
            return;
        }
        
        form.post('/hr', {
            onSuccess: () => {
                form.reset();
                setSelectedBrand(null);
                toast({
                    title: "Success",
                    description: "HR record created successfully",
                });
            },
            onError: (errors) => {
                toast({
                    title: "Error",
                    description: "Please check the form for errors",
                    variant: "destructive",
                });
            },
        });
    };

    const handleBrandSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate brand name
        if (!brandForm.name.trim()) {
            toast({
                title: "Error",
                description: "Brand name is required",
                variant: "destructive",
            });
            return;
        }
        
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
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to create brand";
            toast({
                title: "Error",
                description: errorMessage,
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
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Create HR Record</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                        required
                                    />
                                    {form.errors.name && (
                                        <p className="text-red-500 text-xs">{form.errors.name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={e => form.setData('email', e.target.value)}
                                        required
                                    />
                                    {form.errors.email && (
                                        <p className="text-red-500 text-xs">{form.errors.email}</p>
                                    )}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="brand_id">Brand <span className="text-red-500">*</span></Label>
                                    <div className="flex gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    className="w-full justify-between min-w-[200px]"
                                                    type="button"
                                                >
                                                    {selectedBrand ? selectedBrand.name : 'Select Brand'}
                                                    <ChevronDown className="ml-2 h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[300px] max-h-[200px] overflow-y-auto">
                                                {brands.length > 0 ? (
                                                    brands.map(brand => (
                                                        <DropdownMenuItem 
                                                            key={brand.id}
                                                            onClick={() => handleBrandSelect(brand)}
                                                            className="cursor-pointer"
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{brand.name}</span>
                                                                {brand.email && (
                                                                    <span className="text-xs text-gray-500">{brand.email}</span>
                                                                )}
                                                            </div>
                                                        </DropdownMenuItem>
                                                    ))
                                                ) : (
                                                    <DropdownMenuItem disabled>
                                                        No brands available
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        {form.errors.brand_id && (
                                            <p className="text-red-500 text-xs mt-1">{form.errors.brand_id}</p>
                                        )}
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
                                                        <Label htmlFor="brandName">Brand Name <span className="text-red-500">*</span></Label>
                                                        <Input
                                                            id="brandName"
                                                            value={brandForm.name}
                                                            onChange={e => setBrandForm({ ...brandForm, name: e.target.value })}
                                                            placeholder="Enter brand name"
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
                                                            placeholder="Enter brand email (optional)"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="brandPhone">Phone</Label>
                                                        <Input
                                                            id="brandPhone"
                                                            value={brandForm.phone}
                                                            onChange={e => setBrandForm({ ...brandForm, phone: e.target.value })}
                                                            placeholder="Enter brand phone (optional)"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="brandAddress">Address</Label>
                                                        <Input
                                                            id="brandAddress"
                                                            value={brandForm.address}
                                                            onChange={e => setBrandForm({ ...brandForm, address: e.target.value })}
                                                            placeholder="Enter brand address (optional)"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                                                            Cancel
                                                        </Button>
                                                        <Button type="submit" className="flex-1">
                                                            Create Brand
                                                        </Button>
                                                    </div>
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
                                    {hrList.length > 0 ? (
                                        hrList.map(hr => (
                                            <tr key={hr.id} className="border-b">
                                                <td className="p-2">{hr.name}</td>
                                                <td className="p-2">{hr.email}</td>
                                                <td className="p-2">{hr.brand?.name || 'N/A'}</td>
                                                <td className="p-2">
                                                    {hr.brand?.email && <div>{hr.brand.email}</div>}
                                                    {hr.brand?.phone && <div>{hr.brand.phone}</div>}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-4 text-center text-gray-500">
                                                No HR records found
                                            </td>
                                        </tr>
                                    )}
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