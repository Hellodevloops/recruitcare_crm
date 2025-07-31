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

interface Props {
    brands: Brand[];
    hrs: {
        [key: string]: Hr[];
    };
}

export default function Create({ brands, hrs }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        brand_id: '',
        hr_id: '',
        title: '',
        experience: '',
        store: '',
        city: '',
        budget: '',
        designation: '',
    });

    // Reset HR selection when brand changes
    useEffect(() => {
        setData('hr_id', '');
    }, [data.brand_id]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/positions');
    }

    // Get HRs for selected brand
    const availableHrs = data.brand_id ? hrs[data.brand_id] || [] : [];

    return (
        <AppLayout>
            <Head title="Create Position" />

            <div className="container mx-auto py-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Brand</Label>
                                <Select
                                    value={data.brand_id}
                                    onValueChange={(value) => setData('brand_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Brand" />
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
                                <Label>HR</Label>
                                <Select
                                    value={data.hr_id}
                                    onValueChange={(value) => setData('hr_id', value)}
                                    disabled={!data.brand_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select HR" />
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
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={e => setData('title', e.target.value)}
                                />
                                {errors.title && <div className="text-red-500">{errors.title}</div>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="experience">Experience</Label>
                                <Input
                                    id="experience"
                                    type="text"
                                    value={data.experience}
                                    onChange={e => setData('experience', e.target.value)}
                                />
                                {errors.experience && <div className="text-red-500">{errors.experience}</div>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="store">Store</Label>
                                <Input
                                    id="store"
                                    type="text"
                                    value={data.store}
                                    onChange={e => setData('store', e.target.value)}
                                />
                                {errors.store && <div className="text-red-500">{errors.store}</div>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    type="text"
                                    value={data.city}
                                    onChange={e => setData('city', e.target.value)}
                                />
                                {errors.city && <div className="text-red-500">{errors.city}</div>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="budget">Budget (₹)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2">₹</span>
                                    <Input
                                        id="budget"
                                        type="number"
                                        step="0.01"
                                        value={data.budget}
                                        onChange={e => setData('budget', e.target.value)}
                                        className="pl-7"
                                    />
                                </div>
                                {errors.budget && <div className="text-red-500">{errors.budget}</div>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="designation">Designation</Label>
                                <Input
                                    id="designation"
                                    type="text"
                                    value={data.designation}
                                    onChange={e => setData('designation', e.target.value)}
                                />
                                {errors.designation && <div className="text-red-500">{errors.designation}</div>}
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={processing}>
                                    Create Position
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 