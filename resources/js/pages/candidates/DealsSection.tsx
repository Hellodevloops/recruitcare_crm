import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, ChevronUp, Briefcase, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { Candidate, Brand, Position, Pipeline, Stage, Hr } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Deal {
    id: number;
    candidate_id: number;
    brand_id: number;
    position_id: number;
    hr_id?: number;
    pipeline_id: number;
    stage_id: number;
    created_at: string;
    updated_at: string;
    brand?: Brand;
    position?: Position;
    hr?: Hr;
    pipeline?: Pipeline;
    stage?: Stage;
}

interface NewDeal {
    brand_id: string;
    position_id: string;
    hr_id: string;
    pipeline_id: string;
    stage_id: string;
}

interface DealsSectionProps {
    candidate: Candidate;
    setCandidate: (candidate: Candidate) => void;
}

// DealItem component (unchanged)
const DealItem: React.FC<{
    deal: Deal;
    onEdit: (deal: Deal) => void;
    onDelete: (id: number) => void;
}> = ({ deal, onEdit, onDelete }) => {
    const [dealData, setDealData] = useState<Deal>(deal);

    // Fetch full deal data if brand or position is missing
    useEffect(() => {
        const fetchDealData = async () => {
            if (!deal.brand || !deal.position) {
                try {
                    const response = await axios.get<Deal>(`/deals/${deal.id}`);
                    setDealData(response.data);
                } catch (error) {
                    console.error('Failed to fetch deal data:', error);
                }
            }
        };
        fetchDealData();
    }, [deal]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-500 bg-white dark:bg-gray-900">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg p-2 bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 transition-colors">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                        onClick={() => onEdit(dealData)}
                                    >
                                        {dealData.position?.title || 'Loading...'}
                                    </h4>
                                    <Badge className="text-xs font-medium px-2 py-0.5 bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200 transition-colors">
                                        {dealData.brand?.name || 'Loading...'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{dealData.pipeline?.name || 'Loading...'}</span>
                                    <span>•</span>
                                    <span>{dealData.stage?.name || 'Loading...'}</span>
                                    {dealData.hr && (
                                        <>
                                            <span>•</span>
                                            <span className="text-indigo-600 dark:text-indigo-400">{dealData.hr.name}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 sm:flex-shrink-0">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border-indigo-200 dark:border-indigo-600 dark:text-indigo-400 dark:hover:bg-indigo-800/20 transition-colors"
                                            onClick={() => onEdit(dealData)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Edit position</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-800/20 transition-colors"
                                            onClick={() => onDelete(dealData.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Delete position</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const DealsSection: React.FC<DealsSectionProps> = ({ candidate, setCandidate }) => {
    const [newDeal, setNewDeal] = useState<NewDeal>({
        brand_id: '',
        position_id: '',
        hr_id: '',
        pipeline_id: '',
        stage_id: '',
    });
    const [brands, setBrands] = useState<Brand[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [hrs, setHrs] = useState<Hr[]>([]);
    const [pipelines, setPipelines] = useState<Pipeline[]>([]);
    const [stages, setStages] = useState<Stage[]>([]);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editFormData, setEditFormData] = useState<Partial<NewDeal>>({});
    const [localDeals, setLocalDeals] = useState<Deal[]>(candidate.deals || []);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(5);

    // Update local deals when candidate.deals changes, with sorting
    useEffect(() => {
        const sortedDeals = [...candidate.deals].sort((a, b) => {
            if (a.created_at && b.created_at) {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            // Fallback to id if created_at is not available
            return b.id - a.id;
        });
        setLocalDeals(sortedDeals);
        setCurrentPage(1); // Reset to first page when deals change
    }, [candidate.deals]);

    // Fetch brands on mount
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await axios.get<Brand[]>('/brands-data');
                setBrands(response.data);
            } catch (error) {
                console.error('Failed to fetch brands:', error);
            }
        };
        fetchBrands();
    }, []);

    // Fetch positions when brand changes
    const fetchPositions = async (brandId: string) => {
        if (!brandId) return;
        try {
            const response = await axios.get<Position[]>(`/positions-data?brand_id=${brandId}`);
            setPositions(response.data);
        } catch (error) {
            console.error('Failed to fetch positions:', error);
        }
    };

    // Fetch HR when brand changes
    const fetchHrs = async (brandId: string) => {
        if (!brandId) return;
        try {
            const response = await axios.get<Hr[]>(`/hr-data?brand_id=${brandId}`);
            setHrs(response.data);
        } catch (error) {
            console.error('Failed to fetch HR:', error);
        }
    };

    // Fetch pipelines on mount
    useEffect(() => {
        const fetchPipelines = async () => {
            try {
                const response = await axios.get<Pipeline[]>('/pipelines-data');
                setPipelines(response.data);
            } catch (error) {
                console.error('Failed to fetch pipelines:', error);
            }
        };
        fetchPipelines();
    }, []);

    // Fetch stages when pipeline changes
    const fetchStages = async (pipelineId: string) => {
        if (!pipelineId) return;
        try {
            const response = await axios.get<Stage[]>(`/stages-data?pipeline_id=${pipelineId}`);
            setStages(response.data);
        } catch (error) {
            console.error('Failed to fetch stages:', error);
        }
    };

    // Refetch candidate deals to sync with server
    const refetchDeals = async () => {
        try {
            const response = await axios.get<{ candidate: Candidate }>(`/candidates/${candidate.id}/data`);
            setCandidate(response.data.candidate);
            // Sorting will be handled by useEffect
        } catch (error) {
            console.error('Failed to refetch deals:', error);
        }
    };

    // Handle form input changes
    const handleInputChange = (field: keyof NewDeal, value: string) => {
        setNewDeal(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    // Handle edit form input changes
    const handleEditInputChange = (field: string, value: string) =>     {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    // Validate form
    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};
        if (!newDeal.brand_id) errors.brand_id = 'Please select a brand';
        if (!newDeal.position_id) errors.position_id = 'Please select a position';
        if (!newDeal.hr_id) errors.hr_id = 'Please select an HR';
        if (!newDeal.pipeline_id) errors.pipeline_id = 'Please select a pipeline';
        if (!newDeal.stage_id) errors.stage_id = 'Please select a stage';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validate edit form
    const validateEditForm = (): boolean => {
        const errors: { [key: string]: string } = {};
        if (!editFormData.brand_id) errors.brand_id = 'Please select a brand';
        if (!editFormData.position_id) errors.position_id = 'Please select a position';
        if (!editFormData.hr_id) errors.hr_id = 'Please select an HR';
        if (!editFormData.pipeline_id) errors.pipeline_id = 'Please select a pipeline';
        if (!editFormData.stage_id) errors.stage_id = 'Please select a stage';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle adding a new deal
    const handleAddDeal = async () => {
        if (!candidate.id || !validateForm()) return;

        setIsLoading(true);
        try {
            const response = await axios.post<{message: string; deal: Deal}>('/deals_store_in_candidate', {
                candidate_id: candidate.id,
                brand_id: parseInt(newDeal.brand_id),
                position_id: parseInt(newDeal.position_id),
                hr_id: parseInt(newDeal.hr_id),
                pipeline_id: parseInt(newDeal.pipeline_id),
                stage_id: parseInt(newDeal.stage_id),
            });

            const { deal: newDealData, message } = response.data;
            
            // Show success message
            toast.success(message || 'Deal created successfully');
            
            setLocalDeals(prevDeals => [newDealData, ...prevDeals]);
            setCandidate({
                ...candidate,
                deals: [newDealData, ...candidate.deals],
            });

            await refetchDeals();

            // Reset form and close
            resetForm();
            setCurrentPage(1); // Reset to first page to show the new deal
        } catch (error) {
            console.error('Failed to add deal:', error);
            toast.error('Failed to create deal. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form and close
    const resetForm = () => {
        setNewDeal({
            brand_id: '',
            position_id: '',
            hr_id: '',
            pipeline_id: '',
            stage_id: '',
        });
        setFormErrors({});
        setIsFormOpen(false);
        setStages([]);
        setPositions([]);
        setHrs([]);
    };

    // Reset edit form
    const resetEditForm = () => {
        setEditFormData({});
        setEditingDeal(null);
        setIsEditModalOpen(false);
        setFormErrors({});
        setStages([]);
        setPositions([]);
        setHrs([]);
    };

    // Handle opening edit modal
    const handleEditClick = (deal: Deal) => {
        setEditingDeal(deal);
        setEditFormData({
            brand_id: deal.brand_id.toString(),
            position_id: deal.position_id.toString(),
            hr_id: deal.hr_id?.toString() || '',
            pipeline_id: deal.pipeline_id.toString(),
            stage_id: deal.stage_id.toString(),
        });
        fetchStages(deal.pipeline_id.toString());
        fetchPositions(deal.brand_id.toString());
        fetchHrs(deal.brand_id.toString());
        setIsEditModalOpen(true);
    };

    // Handle editing a deal
    const handleUpdateDeal = async () => {
        if (!editingDeal || !validateEditForm()) return;

        setIsLoading(true);
        try {
            const response = await axios.put<{message: string; deal: Deal}>(`/deals/${editingDeal.id}`, {
                brand_id: parseInt(editFormData.brand_id!),
                position_id: parseInt(editFormData.position_id!),
                hr_id: parseInt(editFormData.hr_id!),
                pipeline_id: parseInt(editFormData.pipeline_id!),
                stage_id: parseInt(editFormData.stage_id!),
            });

            const { deal: updatedDeal, message } = response.data;
            
            // Update local state
            setLocalDeals(prevDeals =>
                prevDeals.map(deal => (deal.id === editingDeal.id ? updatedDeal : deal))
            );
            
            // Update parent state with new deals array
            const updatedCandidate = {
                ...candidate,
                deals: candidate.deals.map(deal =>
                    deal.id === editingDeal.id ? updatedDeal : deal
                ),
            };
            setCandidate(updatedCandidate);

            // Show success message
            toast.success(message || 'Deal updated successfully');

            // Close modal and reset form
            setIsEditModalOpen(false);
            setEditingDeal(null);
            setEditFormData({});
            setStages([]);

        } catch (error) {
            console.error('Failed to update deal:', error);
            toast.error('Failed to update deal. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle deleting a deal
    const handleDeleteDeal = async (dealId: number) => {
        if (!confirm('Are you sure you want to delete this deal?')) return;

        try {
            const response = await axios.delete<{message: string}>(`/deals/${dealId}`);
            
            // Update local state
            setLocalDeals(prevDeals => prevDeals.filter(deal => deal.id !== dealId));
            
            // Update parent state
            const updatedCandidate = {
                ...candidate,
                deals: candidate.deals.filter(deal => deal.id !== dealId),
            };
            setCandidate(updatedCandidate);

            // Show success message
            toast.success(response.data.message || 'Deal deleted successfully');

            // Adjust current page if necessary
            const totalPages = Math.ceil((localDeals.length - 1) / itemsPerPage);
            if (currentPage > totalPages && totalPages > 0) {
                setCurrentPage(totalPages);
            }
        } catch (error) {
            console.error('Failed to delete deal:', error);
            toast.error('Failed to delete deal. Please try again.');
        }
    };

    // Handle brand selection
    const handleBrandChange = (value: string) => {
        handleInputChange('brand_id', value);
        handleInputChange('position_id', '');
        handleInputChange('hr_id', '');
        fetchPositions(value);
        fetchHrs(value);
    };

    // Handle edit brand selection
    const handleEditBrandChange = (value: string) => {
        handleEditInputChange('brand_id', value);
        handleEditInputChange('position_id', '');
        handleEditInputChange('hr_id', '');
        fetchPositions(value);
        fetchHrs(value);
    };

    // Handle position selection
    const handlePositionChange = (value: string) => {
        handleInputChange('position_id', value);
    };

    // Handle edit position selection
    const handleEditPositionChange = (value: string) => {
        handleEditInputChange('position_id', value);
    };

    // Handle pipeline selection
    const handlePipelineChange = (value: string) => {
        handleInputChange('pipeline_id', value);
        handleInputChange('stage_id', '');
        fetchStages(value);
    };

    // Handle edit pipeline selection
    const handleEditPipelineChange = (value: string) => {
        handleEditInputChange('pipeline_id', value);
        handleEditInputChange('stage_id', '');
        fetchStages(value);
    };

    // Pagination logic
    const indexOfLastDeal = currentPage * itemsPerPage;
    const indexOfFirstDeal = indexOfLastDeal - itemsPerPage;
    const currentDeals = localDeals.slice(indexOfFirstDeal, indexOfLastDeal);
    const totalPages = Math.ceil(localDeals.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-lg rounded-lg overflow-hidden border border-gray-200 transition-all hover:shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-indigo-600" />
                        Positions
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 mt-1">
                        Manage positions for {candidate.name}
                    </CardDescription>
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto bg-white border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all flex items-center justify-center gap-2 font-medium"
                                onClick={() => setIsFormOpen(prev => !prev)}
                            >
                                {isFormOpen ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        <span>Cancel</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        <span>New Position</span>
                                    </>
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isFormOpen ? 'Cancel new position' : 'Create a new position'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 bg-white">
                <div className="space-y-6">
                    {/* Add Position Form */}
                    <AnimatePresence>
                        {isFormOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden mb-6"
                            >
                                <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-md border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                                        <Plus className="h-4 w-4 text-indigo-600" />
                                        New Position Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Brand Dropdown */}
                                        <div className="space-y-1">
                                            <Label htmlFor="brand" className={`text-sm font-medium ${formErrors.brand_id ? 'text-red-500' : 'text-gray-700'}`}>
                                                Brand*
                                            </Label>
                                            <Select
                                                value={newDeal.brand_id}
                                                onValueChange={handleBrandChange}
                                            >
                                                <SelectTrigger
                                                    id="brand"
                                                    className={`bg-white border ${formErrors.brand_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md text-sm`}
                                                >
                                                    <SelectValue placeholder="Select brand" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-gray-200 rounded-md shadow-lg">
                                                    {brands.length > 0 ? (
                                                        brands.map((brand) => (
                                                            <SelectItem
                                                                key={brand.id}
                                                                value={brand.id.toString()}
                                                                className="hover:bg-indigo-50 text-sm"
                                                            >
                                                                {brand.name}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="loading" disabled className="text-sm text-gray-400">
                                                            Loading brands...
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {formErrors.brand_id && <p className="text-xs text-red-500 mt-1">{formErrors.brand_id}</p>}
                                        </div>

                                        {/* Position Dropdown */}
                                        <div className="space-y-1">
                                            <Label htmlFor="position" className={`text-sm font-medium ${formErrors.position_id ? 'text-red-500' : 'text-gray-700'}`}>
                                                Position*
                                            </Label>
                                            <Select
                                                value={newDeal.position_id}
                                                onValueChange={(value) => handleInputChange('position_id', value)}
                                                disabled={!newDeal.brand_id}
                                            >
                                                <SelectTrigger
                                                    id="position"
                                                    className={`bg-white border ${formErrors.position_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md text-sm`}
                                                >
                                                    <SelectValue placeholder={!newDeal.brand_id ? 'Select a brand first' : 'Select position'} />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-gray-200 rounded-md shadow-lg">
                                                    {positions.length > 0 ? (
                                                        positions.map((position) => (
                                                            <SelectItem
                                                                key={position.id}
                                                                value={position.id.toString()}
                                                                className="hover:bg-indigo-50 text-sm"
                                                            >
                                                                {position.title}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="loading" disabled className="text-sm text-gray-400">
                                                            {newDeal.brand_id ? 'Loading positions...' : 'Select a brand first'}
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {formErrors.position_id && <p className="text-xs text-red-500 mt-1">{formErrors.position_id}</p>}
                                        </div>

                                        {/* HR Dropdown */}
                                        <div className="space-y-1">
                                            <Label htmlFor="hr" className={`text-sm font-medium ${formErrors.hr_id ? 'text-red-500' : 'text-gray-700'}`}>
                                                HR*
                                            </Label>
                                            <Select
                                                value={newDeal.hr_id}
                                                onValueChange={(value) => handleInputChange('hr_id', value)}
                                                disabled={!newDeal.brand_id}
                                            >
                                                <SelectTrigger
                                                    id="hr"
                                                    className={`bg-white border ${formErrors.hr_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md text-sm`}
                                                >
                                                    <SelectValue placeholder={!newDeal.brand_id ? 'Select a brand first' : 'Select HR'} />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-gray-200 rounded-md shadow-lg">
                                                    {hrs.length > 0 ? (
                                                        hrs.map((hr) => (
                                                            <SelectItem
                                                                key={hr.id}
                                                                value={hr.id.toString()}
                                                                className="hover:bg-indigo-50 text-sm"
                                                            >
                                                                {hr.name}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="loading" disabled className="text-sm text-gray-400">
                                                            {newDeal.brand_id ? 'Loading HR...' : 'Select a brand first'}
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {formErrors.hr_id && <p className="text-xs text-red-500 mt-1">{formErrors.hr_id}</p>}
                                        </div>

                                        {/* Pipeline Dropdown */}
                                        <div className="space-y-1">
                                            <Label htmlFor="pipeline" className={`text-sm font-medium ${formErrors.pipeline_id ? 'text-red-500' : 'text-gray-700'}`}>
                                                Pipeline*
                                            </Label>
                                            <Select
                                                value={newDeal.pipeline_id}
                                                onValueChange={handlePipelineChange}
                                            >
                                                <SelectTrigger
                                                    id="pipeline"
                                                    className={`bg-white border ${formErrors.pipeline_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md text-sm`}
                                                >
                                                    <SelectValue placeholder="Select pipeline" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-gray-200 rounded-md shadow-lg">
                                                    {pipelines.length > 0 ? (
                                                        pipelines.map((pipeline) => (
                                                            <SelectItem
                                                                key={pipeline.id}
                                                                value={pipeline.id.toString()}
                                                                className="hover:bg-indigo-50 text-sm"
                                                            >
                                                                {pipeline.name}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="loading" disabled className="text-sm text-gray-400">
                                                            Loading pipelines...
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {formErrors.pipeline_id && <p className="text-xs text-red-500 mt-1">{formErrors.pipeline_id}</p>}
                                        </div>

                                        {/* Stage Dropdown */}
                                        <div className="space-y-1">
                                            <Label htmlFor="stage" className={`text-sm font-medium ${formErrors.stage_id ? 'text-red-500' : 'text-gray-700'}`}>
                                                Stage*
                                            </Label>
                                            <Select
                                                value={newDeal.stage_id}
                                                onValueChange={(value) => handleInputChange('stage_id', value)}
                                                disabled={!newDeal.pipeline_id}
                                            >
                                                <SelectTrigger
                                                    id="stage"
                                                    className={`bg-white border ${formErrors.stage_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md text-sm`}
                                                >
                                                    <SelectValue placeholder={!newDeal.pipeline_id ? 'Select a pipeline first' : 'Select stage'} />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-gray-200 rounded-md shadow-lg">
                                                    {stages.length > 0 ? (
                                                        stages.map((stage) => (
                                                            <SelectItem
                                                                key={stage.id}
                                                                value={stage.id.toString()}
                                                                className="hover:bg-indigo-50 text-sm"
                                                            >
                                                                {stage.name}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="loading" disabled className="text-sm text-gray-400">
                                                            {newDeal.pipeline_id ? 'Loading stages...' : 'Select a pipeline first'}
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {formErrors.stage_id && <p className="text-xs text-red-500 mt-1">{formErrors.stage_id}</p>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                        <Button
                                            onClick={handleAddDeal}
                                            disabled={isLoading}
                                            className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-md shadow-sm transition-all text-sm font-medium disabled:bg-indigo-300 flex-1"
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                                                    </svg>
                                                    Creating...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <Plus className="h-4 w-4" /> Create Board
                                                </span>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={resetForm}
                                            className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Positions List */}
                    {localDeals.length > 0 ? (
                        <div className="space-y-4">
                            <AnimatePresence>
                                {currentDeals.map((deal) => (
                                    <motion.div
                                        key={deal.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <DealItem
                                            deal={deal}
                                            onEdit={handleEditClick}
                                            onDelete={handleDeleteDeal}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-gray-600">
                                        Showing {indexOfFirstDeal + 1} to {Math.min(indexOfLastDeal, localDeals.length)} of {localDeals.length} positions
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <Button
                                                    key={`pagination-${page}`}
                                                    variant={currentPage === page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handlePageChange(page)}
                                                    className={currentPage === page 
                                                        ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                                                        : "border-gray-300 text-gray-700 hover:bg-gray-50"}
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 mb-1">No positions yet</p>
                            <p className="text-sm text-gray-400 mb-4">Create your first position to track opportunities with this candidate</p>
                            {!isFormOpen && (
                                <Button
                                    variant="outline"
                                    className="bg-white border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
                                    onClick={() => setIsFormOpen(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Add Your First Position
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Edit Position Modal */}
            {editingDeal && (
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Edit className="h-4 w-4 text-indigo-600" />
                                Edit Position
                            </DialogTitle>
                        </DialogHeader>
                        <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-md border border-gray-200 mt-2">
                            <div className="grid grid-cols-1 gap-4">
                                {/* Brand Dropdown */}
                                <div className="space-y-1">
                                    <Label htmlFor="edit-brand" className={`text-sm font-medium ${formErrors.brand_id ? 'text-red-500' : 'text-gray-700'}`}>
                                        Brand*
                                    </Label>
                                    <Select
                                        value={editFormData.brand_id || ''}
                                        onValueChange={handleEditBrandChange}
                                    >
                                        <SelectTrigger
                                            id="edit-brand"
                                            className={`bg-white border ${formErrors.brand_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md text-sm`}
                                        >
                                            <SelectValue placeholder="Select brand" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-200 rounded-md shadow-lg">
                                            {brands.length > 0 ? (
                                                brands.map((brand) => (
                                                    <SelectItem
                                                        key={brand.id}
                                                        value={brand.id.toString()}
                                                        className="hover:bg-indigo-50 text-sm"
                                                    >
                                                        {brand.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="loading" disabled className="text-sm text-gray-400">
                                                    Loading brands...
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.brand_id && <p className="text-xs text-red-500 mt-1">{formErrors.brand_id}</p>}
                                </div>

                                {/* Position Dropdown */}
                                <div className="space-y-1">
                                    <Label htmlFor="edit-position" className={`text-sm font-medium ${formErrors.position_id ? 'text-red-500' : 'text-gray-700'}`}>
                                        Position*
                                    </Label>
                                    <Select
                                        value={editFormData.position_id || ''}
                                        onValueChange={handleEditPositionChange}
                                        disabled={!editFormData.brand_id}
                                    >
                                        <SelectTrigger
                                            id="edit-position"
                                            className={`bg-white border ${formErrors.position_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md text-sm`}
                                        >
                                            <SelectValue placeholder={!editFormData.brand_id ? 'Select a brand first' : 'Select position'} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-200 rounded-md shadow-lg">
                                            {positions.length > 0 ? (
                                                positions.map((position) => (
                                                    <SelectItem
                                                        key={position.id}
                                                        value={position.id.toString()}
                                                        className="hover:bg-indigo-50 text-sm"
                                                    >
                                                        {position.title}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="loading" disabled className="text-sm text-gray-400">
                                                    {editFormData.brand_id ? 'Loading positions...' : 'Select a brand first'}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.position_id && <p className="text-xs text-red-500 mt-1">{formErrors.position_id}</p>}
                                </div>

                                {/* HR Dropdown */}
                                <div className="space-y-1">
                                    <Label htmlFor="edit-hr" className={`text-sm font-medium ${formErrors.hr_id ? 'text-red-500' : 'text-gray-700'}`}>
                                        HR*
                                    </Label>
                                    <Select
                                        value={editFormData.hr_id || ''}
                                        onValueChange={(value) => handleEditInputChange('hr_id', value)}
                                        disabled={!editFormData.brand_id}
                                    >
                                        <SelectTrigger
                                            id="edit-hr"
                                            className={`bg-white border ${formErrors.hr_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md text-sm`}
                                        >
                                            <SelectValue placeholder={!editFormData.brand_id ? 'Select a brand first' : 'Select HR'} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-200 rounded-md shadow-lg">
                                            {hrs.length > 0 ? (
                                                hrs.map((hr) => (
                                                    <SelectItem
                                                        key={hr.id}
                                                        value={hr.id.toString()}
                                                        className="hover:bg-indigo-50 text-sm"
                                                    >
                                                        {hr.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="loading" disabled className="text-sm text-gray-400">
                                                    {editFormData.brand_id ? 'Loading HR...' : 'Select a brand first'}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.hr_id && <p className="text-xs text-red-500 mt-1">{formErrors.hr_id}</p>}
                                </div>

                                {/* Pipeline Dropdown */}
                                <div className="space-y-1">
                                    <Label htmlFor="edit-pipeline" className={`text-sm font-medium ${formErrors.pipeline_id ? 'text-red-500' : 'text-gray-700'}`}>
                                        Pipeline*
                                    </Label>
                                    <Select
                                        value={editFormData.pipeline_id || ''}
                                        onValueChange={handleEditPipelineChange}
                                    >
                                        <SelectTrigger
                                            id="edit-pipeline"
                                            className={`bg-white border ${formErrors.pipeline_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md text-sm`}
                                        >
                                            <SelectValue placeholder="Select pipeline" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-200 rounded-md shadow-lg">
                                            {pipelines.length > 0 ? (
                                                pipelines.map((pipeline) => (
                                                    <SelectItem
                                                        key={pipeline.id}
                                                        value={pipeline.id.toString()}
                                                        className="hover:bg-indigo-50 text-sm"
                                                    >
                                                        {pipeline.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="loading" disabled className="text-sm text-gray-400">
                                                    Loading pipelines...
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.pipeline_id && <p className="text-xs text-red-500 mt-1">{formErrors.pipeline_id}</p>}
                                </div>

                                {/* Stage Dropdown */}
                                <div className="space-y-1">
                                    <Label htmlFor="edit-stage" className={`text-sm font-medium ${formErrors.stage_id ? 'text-red-500' : 'text-gray-700'}`}>
                                        Stage*
                                    </Label>
                                    <Select
                                        value={editFormData.stage_id || ''}
                                        onValueChange={(value) => handleEditInputChange('stage_id', value)}
                                        disabled={!editFormData.pipeline_id}
                                    >
                                        <SelectTrigger
                                            id="edit-stage"
                                            className={`bg-white border ${formErrors.stage_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md text-sm`}
                                        >
                                            <SelectValue placeholder={!editFormData.pipeline_id ? 'Select a pipeline first' : 'Select stage'} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border-gray-200 rounded-md shadow-lg">
                                            {stages.length > 0 ? (
                                                stages.map((stage) => (
                                                    <SelectItem
                                                        key={stage.id}
                                                        value={stage.id.toString()}
                                                        className="hover:bg-indigo-50 text-sm"
                                                    >
                                                        {stage.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="loading" disabled className="text-sm text-gray-400">
                                                    {editFormData.pipeline_id ? 'Loading stages...' : 'Select a pipeline first'}
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.stage_id && <p className="text-xs text-red-500 mt-1">{formErrors.stage_id}</p>}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                <Button
                                    onClick={handleUpdateDeal}
                                    disabled={isLoading}
                                    className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-md shadow-sm transition-all text-sm font-medium disabled:bg-indigo-300 flex-1"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                                            </svg>
                                            Updating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Edit className="h-4 w-4" /> Update Deal
                                        </span>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={resetEditForm}
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md text-sm font-medium"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </Card>
    );
};

export default DealsSection;