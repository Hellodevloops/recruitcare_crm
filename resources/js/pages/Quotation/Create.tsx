import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    PlusCircle, Save, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';

const breadcrumbs = [
    { title: 'Quotations', href: '/quotations' },
    { title: 'Create', href: '/quotations/create' },
];

interface Quotation {
    id: number | null;
    // quotation_number: string;
    client_id: string;
    status: string;
    date: string;
    valid_until: string;
    items: { description: string; quantity: string; price: string }[];
    tax_rate: string;
    discount: string;
    notes: string;
    terms: string;
    history: { date: string; action: string; user: string }[];
    amount: number;
}

interface Client {
    id: string;
    name: string;
    company: string;
    email: string;
}

interface Props {
    clients: Client[];
}

export default function QuotationCreate({ clients: initialClients }: Props) {
    const [clients, setClients] = useState<Client[]>(initialClients);
    const defaultQuotation: Quotation = {
        id: null,
        // quotation_number: `QT-${Math.floor(100 + Math.random() * 900)}`,
        client_id: '',
        status: 'draft',
        date: new Date().toISOString().split('T')[0],
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [],
        tax_rate: '18',
        discount: '0',
        notes: '',
        terms: 'Payment due within 30 days of invoice date.\nAll prices are exclusive of taxes unless otherwise stated.',
        history: [],
        amount: 0,
    };

    const [quotation, setQuotation] = useState<Quotation>(defaultQuotation);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [subtotal, setSubtotal] = useState(0);
    const [taxAmount, setTaxAmount] = useState(0);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const calculatedSubtotal = quotation.items.reduce((sum, item) => {
            return sum + (parseFloat(item.quantity || '0') * parseFloat(item.price || '0'));
        }, 0);

        const calculatedTaxAmount = calculatedSubtotal * parseFloat(quotation.tax_rate || '0') / 100;
        const discountAmount = parseFloat(quotation.discount || '0');
        const calculatedTotal = calculatedSubtotal + calculatedTaxAmount - discountAmount;

        setSubtotal(calculatedSubtotal);
        setTaxAmount(calculatedTaxAmount);
        setTotal(calculatedTotal);
    }, [quotation.items, quotation.tax_rate, quotation.discount]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setQuotation(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index: number, field: string, value: string) => {
        const updatedItems = [...quotation.items];
        updatedItems[index][field] = value;
        setQuotation(prev => ({ ...prev, items: updatedItems }));
    };

    const addItem = () => {
        setQuotation(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: '1', price: '0' }],
        }));
    };

    const removeItem = (index: number) => {
        const updatedItems = [...quotation.items];
        updatedItems.splice(index, 1);
        setQuotation(prev => ({ ...prev, items: updatedItems }));
    };

    const handleSaveQuotation = async () => {
        if (isSaving) return;
      
        const newErrors: { [key: string]: string } = {};
        const requiredFields = ['client_id',  'valid_until', 'date', 'status', 'tax_rate', 'discount'];
      
        requiredFields.forEach(field => {
          if (!quotation[field]) {
            newErrors[field] = `${field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} is required`;
          }
        });
      
        if (quotation.items.length === 0) {
          newErrors.items = 'At least one item is required';
        } else if (quotation.items.some(item => !item.description || !item.quantity || !item.price)) {
          newErrors.items = 'All item fields are required';
        }
      
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }
      
        setIsSaving(true);
      
        try {
          const payload = {
            ...quotation,
            // Make sure terms are explicitly included
            terms: quotation.terms,
            // Ensure dates are in yyyy-MM-dd format
            date: new Date(quotation.date).toISOString().split('T')[0],
            valid_until: new Date(quotation.valid_until).toISOString().split('T')[0],
          };
      
          let response;
          if (quotation.id) {
            response = await axios.put(`/quotations/${quotation.id}`, payload);
            // On success, simply redirect to the view page
            if (response.status === 200) {
              setErrors({});
              router.visit(`/quotations/${quotation.id}`);
            }
          } else {
            response = await axios.post('/quotations', payload);
            if (response.status === 201) {
              setErrors({});
              router.visit(`/quotations/${response.data.quotation.id}`);
            }
          }
        } catch (error: any) {
          console.error('Error saving quotation:', error);
          const backendErrors = error.response?.data?.errors || { general: 'Failed to save quotation: ' + (error.message || 'Unknown error') };
          setErrors(backendErrors);
        } finally {
          setIsSaving(false);
        }
      };
      

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Quotation" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Create Quotation</h2>
                        <p className="text-muted-foreground">Create a new client quotation</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Create Quotation</CardTitle>
                        <CardDescription>Fill in the quotation details including client information and line items</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Quotation Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Client *</label>
                                    <Select
                                        value={quotation.client_id}
                                        onValueChange={(value) => setQuotation(prev => ({ ...prev, client_id: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clients.map(client => (
                                                <SelectItem key={client.id} value={client.id.toString()}>
                                                    {client.name} - {client.company}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.client_id && <p className="text-red-500 text-xs">{errors.client_id}</p>}
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date</label>
                                    <Input
                                        type="date"
                                        name="date"
                                        value={quotation.date}
                                        onChange={handleInputChange}
                                    />
                                    {errors.date && <p className="text-red-500 text-xs">{errors.date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Valid Until *</label>
                                    <Input
                                        type="date"
                                        name="valid_until"
                                        value={quotation.valid_until}
                                        onChange={handleInputChange}
                                    />
                                    {errors.valid_until && <p className="text-red-500 text-xs">{errors.valid_until}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select
                                        value={quotation.status}
                                        onValueChange={(value) => setQuotation(prev => ({ ...prev, status: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="sent">Sent</SelectItem>
                                            <SelectItem value="accepted">Accepted</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-red-500 text-xs">{errors.status}</p>}
                                </div>
                            </div>

                            {/* Items/Products */}
                            <div>
                                <h3 className="text-lg font-medium mb-2">Line Items</h3>
                                {errors.items && <p className="text-red-500 text-xs mb-2">{errors.items}</p>}
                                
                                {quotation.items.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="p-2 text-left">Description</th>
                                                    <th className="p-2 text-left">Quantity</th>
                                                    <th className="p-2 text-left">Price</th>
                                                    <th className="p-2 text-left">Amount</th>
                                                    <th className="p-2 text-center w-10">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {quotation.items.map((item, index) => (
                                                    <tr key={index} className="border-b">
                                                        <td className="p-2">
                                                            <Input
                                                                placeholder="Item description"
                                                                value={item.description}
                                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                type="number"
                                                                placeholder="Qty"
                                                                value={item.quantity}
                                                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                                className="w-24"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input
                                                                type="number"
                                                                placeholder="Price"
                                                                value={item.price}
                                                                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                                                className="w-32"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <div>₹{(parseFloat(item.quantity || '0') * parseFloat(item.price || '0')).toFixed(2)}</div>
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm"
                                                                onClick={() => removeItem(index)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 border rounded-md bg-gray-50">
                                        <p className="text-muted-foreground">Add line items to this quotation</p>
                                    </div>
                                )}
                                
                                <Button variant="outline" className="mt-4" onClick={addItem}>
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>

                            {/* Summary and Totals */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div></div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Tax Rate (%)</span>
                                        <Input
                                            type="number"
                                            name="tax_rate"
                                            value={quotation.tax_rate}
                                            onChange={handleInputChange}
                                            className="w-24"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Discount Amount</span>
                                        <Input
                                            type="number"
                                            name="discount"
                                            value={quotation.discount}
                                            onChange={handleInputChange}
                                            className="w-24"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2 border-t pt-4">
                                        <div className="flex justify-between">
                                            <span>Subtotal</span>
                                            <span>₹{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tax ({quotation.tax_rate}%)</span>
                                            <span>₹{taxAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Discount</span>
                                            <span>₹{parseFloat(quotation.discount || '0').toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total Amount</span>
                                            <span>₹{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes and Terms */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Notes</label>
                                    <Textarea
                                        name="notes"
                                        value={quotation.notes}
                                        onChange={handleInputChange}
                                        placeholder="Enter any additional notes"
                                        rows={4}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Terms & Conditions</label>
                                    <Textarea
                                        name="terms"
                                        value={quotation.terms}
                                        onChange={handleInputChange}
                                        placeholder="Enter terms and conditions"
                                        rows={4}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <Button 
                                className="w-full mt-6" 
                                onClick={handleSaveQuotation}
                                disabled={isSaving}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Create Quotation'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}