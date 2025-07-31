import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface Client {
  id: number;
  name: string;
  company_name?: string;
}

interface ServiceItem {
  description: string;
  hsn_sac_code?: string;
  quantity: number;
  price: number;
  gst_percentage?: number;
}

interface BillingInfo {
  name?: string;
  address?: string;
  gstin?: string;
  pan?: string;
  email?: string;
  phone?: string;
}

interface BankDetails {
  account_name?: string;
  account_number?: string;
  ifsc?: string;
  account_type?: string;
  bank?: string;
}

interface Props {
  clients: Client[];
}

export default function CreateInvoice({ clients }: Props) {
  const today = new Date();
  
  // State for all form fields
  const [formState, setFormState] = useState({
    client_id: '',
    quotation_date: format(today, 'yyyy-MM-dd'),
    due_date: format(new Date(today.setDate(today.getDate() + 30)), 'yyyy-MM-dd'),
    valid_until: format(new Date(today.setDate(today.getDate() + 30)), 'yyyy-MM-dd'),
    invoice_number: '',  // Will be auto-generated on the server
    status: 'draft',
    tax_rate: 18,
    discount: 0,
    notes: '',
    terms: '',
    service_items: [
      {
        description: '',
        hsn_sac_code: '',
        quantity: 1,
        price: 0,
        gst_percentage: 18
      }
    ] as ServiceItem[],
    billed_by: {
      name: '',
      address: '',
      gstin: '',
      pan: '',
      email: '',
      phone: ''
    } as BillingInfo,
    billed_to: {
      name: '',
      address: '',
      gstin: '',
      pan: '',
      email: '',
      phone: ''
    } as BillingInfo,
    bank_details: {
      account_name: '',
      account_number: '',
      ifsc: '',
      account_type: '',
      bank: ''
    } as BankDetails
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate subtotal, tax amount, and total
  const subtotal = formState.service_items.reduce(
    (sum, item) => sum + (item.quantity * item.price),
    0
  );
  const taxAmount = subtotal * (formState.tax_rate / 100);
  const total = subtotal + taxAmount - formState.discount;

  // Handle client selection and auto-populate client details
  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(client => client.id.toString() === clientId);
    
    setFormState(prev => ({
      ...prev,
      client_id: clientId,
      billed_to: {
        ...prev.billed_to,
        name: selectedClient?.name || '',
        // Additional client details would be populated here if available from the API
      }
    }));
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested fields (contains periods in the name)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormState(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormState(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle service item changes
  const handleServiceItemChange = (index: number, field: keyof ServiceItem, value: string | number) => {
    const updatedItems = [...formState.service_items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'description' || field === 'hsn_sac_code' ? value : Number(value)
    };

    setFormState(prev => ({
      ...prev,
      service_items: updatedItems
    }));
  };

  // Add new service item
  const addServiceItem = () => {
    setFormState(prev => ({
      ...prev,
      service_items: [
        ...prev.service_items,
        {
          description: '',
          hsn_sac_code: '',
          quantity: 1,
          price: 0,
          gst_percentage: prev.tax_rate
        }
      ]
    }));
  };

  // Remove service item
  const removeServiceItem = (index: number) => {
    if (formState.service_items.length > 1) {
      const updatedItems = [...formState.service_items];
      updatedItems.splice(index, 1);
      
      setFormState(prev => ({
        ...prev,
        service_items: updatedItems
      }));
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Send the form data to the server
    router.post('/invoices', formState, {
      onSuccess: () => {
        // On success, redirect or show success message
        setIsSubmitting(false);
      },
      onError: (errors) => {
        setErrors(errors);
        setIsSubmitting(false);
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Create Invoice" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Create New Invoice</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            {/* Client and Basic Details */}
            <Card>
              <CardHeader>
                <CardTitle>Client & Invoice Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="client_id">Client <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formState.client_id} 
                      onValueChange={handleClientChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name} {client.company_name && `(${client.company_name})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.client_id && <p className="text-sm text-red-500">{errors.client_id}</p>}
                  </div>

                  {/* Invoice Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                    <Select 
                      value={formState.status} 
                      onValueChange={(value) => setFormState(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="quotation_date">Invoice Date <span className="text-red-500">*</span></Label>
                    <Input
                      type="date"
                      id="quotation_date"
                      name="quotation_date"
                      value={formState.quotation_date}
                      onChange={handleInputChange}
                    />
                    {errors.quotation_date && <p className="text-sm text-red-500">{errors.quotation_date}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date <span className="text-red-500">*</span></Label>
                    <Input
                      type="date"
                      id="due_date"
                      name="due_date"
                      value={formState.due_date}
                      onChange={handleInputChange}
                    />
                    {errors.due_date && <p className="text-sm text-red-500">{errors.due_date}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="valid_until">Valid Until <span className="text-red-500">*</span></Label>
                    <Input
                      type="date"
                      id="valid_until"
                      name="valid_until"
                      value={formState.valid_until}
                      onChange={handleInputChange}
                    />
                    {errors.valid_until && <p className="text-sm text-red-500">{errors.valid_until}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Items */}
            <Card>
              <CardHeader>
                <CardTitle>Service Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Table Headers */}
                  <div className="grid grid-cols-12 gap-2 font-medium text-sm">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2">HSN/SAC</div>
                    <div className="col-span-1">Qty</div>
                    <div className="col-span-2">Rate (₹)</div>
                    <div className="col-span-1">GST %</div>
                    <div className="col-span-1"></div>
                  </div>
                  
                  {/* Service Items */}
                  {formState.service_items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => handleServiceItemChange(index, 'description', e.target.value)}
                          required
                        />
                        {errors[`service_items.${index}.description`] && (
                          <p className="text-xs text-red-500">{errors[`service_items.${index}.description`]}</p>
                        )}
                      </div>
                      
                      <div className="col-span-2">
                        <Input
                          placeholder="HSN/SAC"
                          value={item.hsn_sac_code || ''}
                          onChange={(e) => handleServiceItemChange(index, 'hsn_sac_code', e.target.value)}
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleServiceItemChange(index, 'quantity', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Rate"
                          value={item.price}
                          onChange={(e) => handleServiceItemChange(index, 'price', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="GST %"
                          value={item.gst_percentage || ''}
                          onChange={(e) => handleServiceItemChange(index, 'gst_percentage', e.target.value)}
                        />
                      </div>
                      
                      <div className="col-span-1 flex justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeServiceItem(index)}
                          disabled={formState.service_items.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Service Item Button */}
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={addServiceItem}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                  </div>
                  
                  {/* Totals Section */}
                  <div className="border-t pt-4 mt-6">
                    <div className="flex justify-end">
                      <div className="w-64 space-y-3">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span>Tax Rate:</span>
                          <div className="w-20">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              name="tax_rate"
                              value={formState.tax_rate}
                              onChange={handleInputChange}
                              className="text-right"
                            />
                          </div>
                          <span>%</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span>Tax Amount:</span>
                          <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span>Discount:</span>
                          <div className="w-32">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              name="discount"
                              value={formState.discount}
                              onChange={handleInputChange}
                              className="text-right"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-between border-t border-t-black pt-2 text-lg font-bold">
                          <span>Total:</span>
                          <span>₹{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company & Client Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Billed By (Company Details) */}
              <Card>
                <CardHeader>
                  <CardTitle>Billed By (Your Company)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="billed_by.name">Company Name</Label>
                    <Input
                      id="billed_by.name"
                      name="billed_by.name"
                      value={formState.billed_by.name || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="billed_by.address">Address</Label>
                    <Textarea
                      id="billed_by.address"
                      name="billed_by.address"
                      value={formState.billed_by.address || ''}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billed_by.gstin">GSTIN</Label>
                      <Input
                        id="billed_by.gstin"
                        name="billed_by.gstin"
                        value={formState.billed_by.gstin || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="billed_by.pan">PAN</Label>
                      <Input
                        id="billed_by.pan"
                        name="billed_by.pan"
                        value={formState.billed_by.pan || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billed_by.email">Email</Label>
                      <Input
                        id="billed_by.email"
                        name="billed_by.email"
                        type="email"
                        value={formState.billed_by.email || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="billed_by.phone">Phone</Label>
                      <Input
                        id="billed_by.phone"
                        name="billed_by.phone"
                        value={formState.billed_by.phone || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billed To (Client Details) */}
              <Card>
                <CardHeader>
                  <CardTitle>Billed To (Client)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="billed_to.name">Client Name</Label>
                    <Input
                      id="billed_to.name"
                      name="billed_to.name"
                      value={formState.billed_to.name || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="billed_to.address">Address</Label>
                    <Textarea
                      id="billed_to.address"
                      name="billed_to.address"
                      value={formState.billed_to.address || ''}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billed_to.gstin">GSTIN</Label>
                      <Input
                        id="billed_to.gstin"
                        name="billed_to.gstin"
                        value={formState.billed_to.gstin || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="billed_to.pan">PAN</Label>
                      <Input
                        id="billed_to.pan"
                        name="billed_to.pan"
                        value={formState.billed_to.pan || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billed_to.email">Email</Label>
                      <Input
                        id="billed_to.email"
                        name="billed_to.email"
                        type="email"
                        value={formState.billed_to.email || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="billed_to.phone">Phone</Label>
                      <Input
                        id="billed_to.phone"
                        name="billed_to.phone"
                        value={formState.billed_to.phone || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bank Details and Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bank Details */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Bank Details</h3>
                    
                    <div>
                      <Label htmlFor="bank_details.account_name">Account Name</Label>
                      <Input
                        id="bank_details.account_name"
                        name="bank_details.account_name"
                        value={formState.bank_details.account_name || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bank_details.account_number">Account Number</Label>
                      <Input
                        id="bank_details.account_number"
                        name="bank_details.account_number"
                        value={formState.bank_details.account_number || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bank_details.ifsc">IFSC Code</Label>
                        <Input
                          id="bank_details.ifsc"
                          name="bank_details.ifsc"
                          value={formState.bank_details.ifsc || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="bank_details.account_type">Account Type</Label>
                        <Input
                          id="bank_details.account_type"
                          name="bank_details.account_type"
                          value={formState.bank_details.account_type || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="bank_details.bank">Bank Name</Label>
                      <Input
                        id="bank_details.bank"
                        name="bank_details.bank"
                        value={formState.bank_details.bank || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  {/* Notes and Terms */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formState.notes}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Additional notes to be displayed on the invoice"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="terms">Terms & Conditions</Label>
                      <Textarea
                        id="terms"
                        name="terms"
                        value={formState.terms}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Terms and conditions for this invoice"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.get('/invoices')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}