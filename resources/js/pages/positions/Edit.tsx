import React, { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

interface Brand {
    id: number;
    name: string;
}

interface Hr {
    id: number;
    email: string;
    brand_id: number;
}

interface Position {
    id: number;
    brand_id: string;
    hr_id: string;
    experience: string;
    store: string;
    city: string;
    budget: string;
    designation: string;
}

interface Props {
    position: Position;
    brands: Brand[];
    hrs: {
        [key: string]: Hr[];
    };
}

export default function Edit({ position, brands, hrs }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        brand_id: position.brand_id,
        hr_id: position.hr_id,
        designation: position.designation,
        experience: position.experience,
        store: position.store,
        city: position.city,
        budget: position.budget,
    });

    // Reset HR selection when brand changes
    useEffect(() => {
        if (data.brand_id !== position.brand_id) {
            setData('hr_id', '');
        }
    }, [data.brand_id]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/positions/${position.id}`);
    }

    // Get HRs for selected brand
    const availableHrs = data.brand_id ? hrs[data.brand_id] || [] : [];

    return (
        <AppLayout>
            <Head title="Edit Position" />

            <div className="container mx-auto py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Brand (Optional)</Label>
                                <Select
                                    value={data.brand_id}
                                    onValueChange={(value) => setData('brand_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Brand (Optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id.toString()}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.brand_id && <div className="text-red-500">{errors.brand_id}</div>}
                            </div>

                            <div className="space-y-2">
                                <Label>HR (Optional)</Label>
                                <Select
                                    value={data.hr_id}
                                    onValueChange={(value) => setData('hr_id', value)}
                                    disabled={!data.brand_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select HR (Optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableHrs.map((hr) => (
                                            <SelectItem key={hr.id} value={hr.id.toString()}>
                                                {hr.email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.hr_id && <div className="text-red-500">{errors.hr_id}</div>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="designation">Designation <span className="text-red-500">*</span></Label>
                                <Input
                                    id="designation"
                                    type="text"
                                    value={data.designation}
                                    onChange={e => setData('designation', e.target.value)}
                                    required
                                    placeholder="Enter designation"
                                />
                                {errors.designation && <div className="text-red-500">{errors.designation}</div>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="experience">Experience <span className="text-red-500">*</span></Label>
                                <Input
                                    id="experience"
                                    type="text"
                                    value={data.experience}
                                    onChange={e => setData('experience', e.target.value)}
                                    required
                                    placeholder="Enter experience requirements"
                                />
                                {errors.experience && <div className="text-red-500">{errors.experience}</div>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="store">Store (Optional)</Label>
                                <Input
                                    id="store"
                                    type="text"
                                    value={data.store}
                                    onChange={e => setData('store', e.target.value)}
                                    placeholder="Enter store name"
                                />
                                {errors.store && <div className="text-red-500">{errors.store}</div>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">City (Optional)</Label>
                                <Input
                                    id="city"
                                    type="text"
                                    value={data.city}
                                    onChange={e => setData('city', e.target.value)}
                                    placeholder="Enter city"
                                />
                                {errors.city && <div className="text-red-500">{errors.city}</div>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="budget">Budget (₹) (Optional)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                                    <Input
                                        id="budget"
                                        type="number"
                                        step="0.01"
                                        value={data.budget}
                                        onChange={e => setData('budget', e.target.value)}
                                        className="pl-7"
                                        placeholder="Enter budget amount"
                                    />
                                </div>
                                {errors.budget && <div className="text-red-500">{errors.budget}</div>}
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={processing}>
                                    Update Position
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 