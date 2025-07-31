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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Pipeline {
    id: number;
    name: string;
}

interface Stage {
    id: number;
    name: string;
    pipeline_id: number;
    pipeline: Pipeline;
}

interface PageProps {
    stages: {
        data: Stage[];
        links: any;
    };
    pipelines: Pipeline[];
}

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Stages', href: '/stages' },
];

// Default stages to display if no stages exist for a pipeline
const defaultStagesTemplate = [
    { id: -1, name: 'Prospect', pipeline_id: 0, pipeline: { id: 0, name: 'Default Pipeline' } },
    { id: -2, name: 'Negotiation', pipeline_id: 0, pipeline: { id: 0, name: 'Default Pipeline' } },
    { id: -3, name: 'Closed', pipeline_id: 0, pipeline: { id: 0, name: 'Default Pipeline' } },
];

export default function StageList() {
    const { stages, pipelines } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        pipeline_id: '' as string | number,
    });

    const { delete: destroy } = useForm();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('stages.store', data.pipeline_id), {
            onSuccess: () => {
                setIsDialogOpen(false);
                setSelectedPipelineId(null);
                reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (id < 0) {
            alert('Default stages cannot be deleted from this view.');
            return;
        }
        if (confirm('Are you sure you want to delete this stage?')) {
            destroy(route('stages.destroy', id));
        }
    };

    const openAddStageDialog = (pipelineId: number) => {
        setSelectedPipelineId(pipelineId);
        setData('pipeline_id', pipelineId);
        setIsDialogOpen(true);
    };

    // Use default stages if no stages exist, otherwise use fetched stages
    const displayStages = stages.data.length > 0
        ? stages.data
        : defaultStagesTemplate.map(stage => ({
              ...stage,
              pipeline_id: pipelines[0]?.id || 0,
              pipeline: pipelines[0] || { id: 0, name: 'Default Pipeline' },
          }));

    const filteredStages = displayStages.filter(stage =>
        stage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stage.pipeline.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Stage List" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Stage List</h2>
                        <p className="text-sm text-gray-600">Manage your pipeline stages</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setSelectedPipelineId(null);
                    }}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> Add Stage
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Stage</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name *</Label>
                                    <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                    {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="pipeline_id">Pipeline *</Label>
                                    <Select
                                        onValueChange={(value) => setData('pipeline_id', value)}
                                        value={data.pipeline_id.toString()}
                                        disabled={!!selectedPipelineId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a pipeline" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pipelines.map(pipeline => (
                                                <SelectItem key={pipeline.id} value={pipeline.id.toString()}>
                                                    {pipeline.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.pipeline_id && <p className="text-red-500 text-xs">{errors.pipeline_id}</p>}
                                </div>
                                <Button type="submit" disabled={processing} className="w-full">
                                    Create Stage
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="bg-white border-gray-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-800">Stages</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                            All stages across pipelines (Defaults: Prospect, Negotiation, Closed)
                        </CardDescription>
                        <Input
                            placeholder="Search by stage or pipeline name..."
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
                                    <TableHead>Pipeline</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredStages.map((stage) => (
                                    <TableRow key={stage.id}>
                                        <TableCell className="font-medium">
                                            {stage.name}
                                            {defaultStagesTemplate.some(d => d.name === stage.name) && stage.id < 0 && (
                                                <span className="ml-2 text-xs text-gray-500">(Default)</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <a href={route('pipelines.show', stage.pipeline_id)} className="hover:underline">
                                                {stage.pipeline.name}
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openAddStageDialog(stage.pipeline_id)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(stage.id)}
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
                        {filteredStages.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                                No stages found matching your criteria.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}