import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface Stage {
    id: number;
    name: string;
    pipeline_id: number;
}

interface Pipeline {
    id: number;
    name: string;
    stages: Stage[];
    created_at: string;
    updated_at: string;
}

interface PageProps {
    pipelines: {
        data: Pipeline[];
        links: any;
    };
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pipelines', href: '/pipelines' },
];

// Default pipeline with stages to display if no pipelines exist
const defaultPipelineTemplate = [{
    id: -1,
    name: 'Default Pipeline',
    stages: [
        { id: -1, name: 'Prospect', pipeline_id: -1 },
        { id: -2, name: 'Negotiation', pipeline_id: -1 },
        { id: -3, name: 'Closed', pipeline_id: -1 },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
}];

export default function PipelineList() {
    const { pipelines } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('pipelines.store'), {
            onSuccess: () => {
                setIsDialogOpen(false);
                reset();
            },
        });
    };

    const { delete: destroy } = useForm();

    const handleDelete = (id: number) => {
        if (id < 0) {
            alert('Default pipeline cannot be deleted from this view.');
            return;
        }
        if (confirm('Are you sure you want to delete this pipeline?')) {
            destroy(route('pipelines.destroy', id));
        }
    };

    // Use default pipeline if no pipelines exist, otherwise use fetched pipelines
    const displayPipelines = pipelines.data.length > 0 ? pipelines.data : defaultPipelineTemplate;

    const filteredPipelines = displayPipelines.filter(pipeline =>
        pipeline.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pipeline List" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Pipeline List</h2>
                        <p className="text-sm text-gray-600">Manage your pipelines</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> Add Pipeline
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Pipeline</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name *</Label>
                                    <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                </div>
                                <Button type="submit" disabled={processing} className="w-full">
                                    Create Pipeline
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="bg-white border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">Pipelines</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                            Your current pipelines (Default stages: Prospect, Negotiation, Closed)
                        </CardDescription>
                        <Input
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mt-2 max-w-md"
                        />
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Stages</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPipelines.map((pipeline) => (
                                    <TableRow key={pipeline.id}>
                                        <TableCell className="font-medium">
                                            <a href={route('pipelines.show', pipeline.id)} className="hover:underline">
                                                {pipeline.name}
                                            </a>
                                            {pipeline.id < 0 && (
                                                <span className="ml-2 text-xs text-gray-500">(Default)</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {pipeline.stages.length} stages
                                            {pipeline.id < 0 && ' (Prospect, Negotiation, Closed)'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                               

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(pipeline.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {filteredPipelines.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                                No pipelines found matching your criteria.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}