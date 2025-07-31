import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

// Helper functions
const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const calculateTotals = (services) => {
  const totalAmount = services.reduce((sum, item) => sum + (item.total_amount || 0), 0);
  const totalCGST = services.reduce((sum, item) => sum + (item.cgst_amount || 0), 0);
  const totalSGST = services.reduce((sum, item) => sum + (item.sgst_amount || 0), 0);

  return {
    totalAmount,
    totalCGST,
    totalSGST,
  };
};

// Social Age Logo Component
const SocialAgeLogo = () => (
  <svg
    width="150"
    height="90"
    viewBox="0 0 150 90"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M117.5 10L95 50L72.5 10L50 50L27.5 10"
      stroke="#000000"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M140 10L117.5 50L95 10"
      stroke="#000000"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <text
      x="35"
      y="75"
      fontFamily="Arial"
      fontSize="12"
      fontWeight="bold"
      fill="#000"
    >
      SALESCARE
    </text>
  </svg>
);

// Invoice Preview Component
const InvoicePreview = ({ invoice }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <div className="flex items-start">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-bold text-primary">Invoice</h1>
              {invoice.status === 'paid' && (
                <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                  Paid
                </span>
              )}
              {invoice.status === 'unpaid' && (
                <span className="bg-gray-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                  Unpaid
                </span>
              )}
              {invoice.status === 'overdue' && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                  Overdue
                </span>
              )}
            </div>
            <div className="mt-4 space-y-1 text-gray-500">
              <div className="flex">
                <span className="w-32 text-black">Invoice No #</span>
                <span className="font-semibold">{invoice.id || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-black">Invoice Date</span>
                <span className="font-semibold">{invoice.invoice_date}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-black">Due Date</span>
                <span className="font-semibold">{invoice.due_date}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="w-40 h-24">
            <SocialAgeLogo />
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mt-4">
        <h2 className="text-lg font-semibold">Billed To:</h2>
        <div className="mt-2">
          <p className="font-medium">{invoice.billed_to.name}</p>
          <p>{invoice.billed_to.address?.join(', ')}</p>
          <p>
            {invoice.billed_to.city}, {invoice.billed_to.state}, {invoice.billed_to.country} {invoice.billed_to.postalCode}
          </p>
          {invoice.billed_to.gstin && <p>GSTIN: {invoice.billed_to.gstin}</p>}
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Services:</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 bg-gray-50 text-left">Description</th>
              <th className="px-4 py-2 bg-gray-50 text-center">Qty</th>
              <th className="px-4 py-2 bg-gray-50 text-right">Price</th>
              <th className="px-4 py-2 bg-gray-50 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.service_items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="px-4 py-2">{item.description}</td>
                <td className="px-4 py-2 text-center">{item.quantity}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.price)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.total_amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td colSpan={3} className="px-4 py-2 text-right">Total:</td>
              <td className="px-4 py-2 text-right">{formatCurrency(invoice.total_amount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

// Format Invoice ID similar to quotation format
const formatInvoiceId = (id) => {
  if (id === null) return 'INV0000';
  
  // Convert id to string and pad with leading zeros to ensure 4 digits
  const paddedId = id.toString().padStart(4, '0');
  return `INV${paddedId}`;
};

const Edit = ({ invoice }) => {
  // Parse JSON strings in the invoice data
  const parsedInvoice = {
    ...invoice,
    billed_by: JSON.parse(invoice.billed_by),
    billed_to: JSON.parse(invoice.billed_to),
    service_items: JSON.parse(invoice.service_items),
    bank_details: JSON.parse(invoice.bank_details),
    payments: JSON.parse(invoice.payments),
  };

  // Form state using Inertia's useForm
  const { data, setData, put, errors, processing } = useForm({
    invoice_date: parsedInvoice.invoice_date,
    due_date: parsedInvoice.due_date,
    status: parsedInvoice.status,
    billed_by: invoice.billed_by, // Keep as JSON string
    billed_to: invoice.billed_to, // Keep as JSON string
    service_items: invoice.service_items, // Keep as JSON string
    total_amount: parsedInvoice.total_amount,
    bank_details: invoice.bank_details, // Keep as JSON string
    payments: invoice.payments, // Keep as JSON string
    terms_conditions: parsedInvoice.terms_conditions,
  });

  // State for service items
  const [services, setServices] = useState(parsedInvoice.service_items);

  // State for billed_to
  const [billedTo, setBilledTo] = useState(parsedInvoice.billed_to);

  // Calculate subtotal, tax amounts and total
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);
  
  // Breadcrumb
  const breadcrumbs = [
    { title: 'Invoices', href: '/invoices' },
    { title: 'Edit', href: '#' },
  ];

  useEffect(() => {
    const calculatedSubtotal = services.reduce((sum, item) => {
        return sum + (item.quantity * item.price);
    }, 0);

    const calculatedCGST = services.reduce((sum, item) => sum + (item.cgst_amount || 0), 0);
    const calculatedSGST = services.reduce((sum, item) => sum + (item.sgst_amount || 0), 0);
    const calculatedTotal = calculatedSubtotal + calculatedCGST + calculatedSGST;

    setSubtotal(calculatedSubtotal);
    setTaxAmount(calculatedCGST + calculatedSGST);
    setTotal(calculatedTotal);
    
    // Update total in form data
    setData('total_amount', calculatedTotal);
  }, [services]);

  // Add a new service item
  const addService = () => {
    setServices([
      ...services,
      {
        description: '',
        hsn_sac_code: '998314',
        quantity: 1,
        price: 0,
        gst_percentage: 18,
        cgst_amount: 0,
        sgst_amount: 0,
        total_amount: 0,
        notes: '',
      },
    ]);
  };

  // Update a service item
  const updateService = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };

    // Calculate amounts
    const service = updatedServices[index];
    const amount = service.quantity * service.price;
    service.cgst_amount = (amount * service.gst_percentage) / 200; // CGST = GST/2
    service.sgst_amount = (amount * service.gst_percentage) / 200; // SGST = GST/2
    service.total_amount = amount + service.cgst_amount + service.sgst_amount;

    setServices(updatedServices);

    // Update form data
    setData('service_items', JSON.stringify(updatedServices));
  };

  // Remove a service item
  const removeService = (index) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
    setData('service_items', JSON.stringify(updatedServices));
  };

  // Update billed_to
  const updateBilledTo = (field, value) => {
    const updatedBilledTo = { ...billedTo, [field]: value };
    setBilledTo(updatedBilledTo);
    setData('billed_to', JSON.stringify(updatedBilledTo));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('invoices.update', invoice.id));
  };

  // Preview data
  const previewData = {
    id: formatInvoiceId(invoice.id),
    invoice_date: data.invoice_date,
    due_date: data.due_date,
    status: data.status,
    billed_by: parsedInvoice.billed_by,
    billed_to: billedTo,
    service_items: services,
    total_amount: total,
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Invoice #${formatInvoiceId(invoice.id)}`} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Invoice #{formatInvoiceId(invoice.id)}</h2>
            <p className="text-muted-foreground">Update invoice details</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Invoice</CardTitle>
            <CardDescription>Modify the invoice details including client information and service items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Invoice Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Date *</label>
                  <Input
                    type="date"
                    value={data.invoice_date}
                    onChange={(e) => setData('invoice_date', e.target.value)}
                  />
                  {errors.invoice_date && <p className="text-red-500 text-xs">{errors.invoice_date}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date *</label>
                  <Input
                    type="date"
                    value={data.due_date}
                    onChange={(e) => setData('due_date', e.target.value)}
                  />
                  {errors.due_date && <p className="text-red-500 text-xs">{errors.due_date}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={data.status}
                    onValueChange={(value) => setData('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-red-500 text-xs">{errors.status}</p>}
                </div>
              </div>

              {/* Billed To */}
              <div>
                <h3 className="text-lg font-medium mb-2">Client Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <Input
                      type="text"
                      value={billedTo.name || ''}
                      onChange={(e) => updateBilledTo('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      type="text"
                      value={billedTo.address?.join(', ') || ''}
                      onChange={(e) => updateBilledTo('address', e.target.value.split(', '))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input
                      type="text"
                      value={billedTo.city || ''}
                      onChange={(e) => updateBilledTo('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State</label>
                    <Input
                      type="text"
                      value={billedTo.state || ''}
                      onChange={(e) => updateBilledTo('state', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country</label>
                    <Input
                      type="text"
                      value={billedTo.country || ''}
                      onChange={(e) => updateBilledTo('country', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Postal Code</label>
                    <Input
                      type="text"
                      value={billedTo.postalCode || ''}
                      onChange={(e) => updateBilledTo('postalCode', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">GSTIN</label>
                    <Input
                      type="text"
                      value={billedTo.gstin || ''}
                      onChange={(e) => updateBilledTo('gstin', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">PAN</label>
                    <Input
                      type="text"
                      value={billedTo.pan || ''}
                      onChange={(e) => updateBilledTo('pan', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Service Items */}
              <div>
                <h3 className="text-lg font-medium mb-2">Service Items</h3>
                {errors.service_items && <p className="text-red-500 text-xs mb-2">{errors.service_items}</p>}
                
                {services.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 text-left">Description</th>
                          <th className="p-2 text-left">HSN/SAC</th>
                          <th className="p-2 text-left">GST %</th>
                          <th className="p-2 text-left">Qty</th>
                          <th className="p-2 text-left">Price</th>
                          <th className="p-2 text-left">Amount</th>
                          <th className="p-2 text-center w-10">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((service, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">
                              <Input
                                placeholder="Item description"
                                value={service.description || ''}
                                onChange={(e) => updateService(index, 'description', e.target.value)}
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                placeholder="HSN/SAC"
                                value={service.hsn_sac_code || ''}
                                onChange={(e) => updateService(index, 'hsn_sac_code', e.target.value)}
                                className="w-24"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                placeholder="GST %"
                                value={service.gst_percentage || 0}
                                onChange={(e) => updateService(index, 'gst_percentage', parseFloat(e.target.value))}
                                className="w-20"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                placeholder="Qty"
                                value={service.quantity || 0}
                                onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value))}
                                className="w-20"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                placeholder="Price"
                                value={service.price || 0}
                                onChange={(e) => updateService(index, 'price', parseFloat(e.target.value))}
                                className="w-28"
                              />
                            </td>
                            <td className="p-2">
                              <div>{formatCurrency(service.total_amount || 0)}</div>
                            </td>
                            <td className="p-2 text-center">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeService(index)}
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
                    <p className="text-muted-foreground">Add service items to this invoice</p>
                  </div>
                )}
                
                <Button variant="outline" className="mt-4" onClick={addService}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </div>

              {/* Summary and Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div></div>
                <div className="space-y-4">                    
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (CGST + SGST)</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div>
                <h3 className="text-lg font-medium mb-2">Terms & Conditions</h3>
                <Textarea
                  value={data.terms_conditions || ''}
                  onChange={(e) => setData('terms_conditions', e.target.value)}
                  placeholder="Enter terms and conditions (one per line)..."
                  rows={5}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => router.visit(`/invoices/${invoice.id}`)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={processing}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {processing ? 'Updating...' : 'Update Invoice'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Preview</CardTitle>
            <CardDescription>Preview how your invoice will appear</CardDescription>
          </CardHeader>
          <CardContent>
            <InvoicePreview invoice={previewData} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Edit;