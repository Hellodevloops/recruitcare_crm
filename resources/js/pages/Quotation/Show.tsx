import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { 
  Printer, 
  Download, 
  Share2, 
  AlertCircle, 
  Check, 
  Clock, 
  ExternalLink,
  Mail
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/Dialog';
import AppLayout from "@/layouts/app-layout";
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface Quotation {
  id: number | null;
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
  avatar?: string;
}

interface Props {
  quotation?: Quotation;
  clients: Client[];
}

const breadcrumbs = [
  { title: 'Quotations', href: '/quotations' },
  { title: 'Quotation Detail', href: '#' },
];

// Helper function to format quotation ID with leading zeros
const formatQuotationId = (id: number | null): string => {
  if (id === null) return 'DV0000';
  
  // Convert id to string and pad with leading zeros to ensure 4 digits
  const paddedId = id.toString().padStart(4, '0');
  return `DV${paddedId}`;
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

// Helper function to get status badge color
const getStatusBadge = (status: string) => {
  const statusConfig = {
    draft: { 
      color: 'bg-gray-100 text-gray-800', 
      label: 'Draft',
      icon: <Clock className="h-3 w-3 mr-1" />
    },
    sent: { 
      color: 'bg-blue-100 text-blue-800', 
      label: 'Sent',
      icon: <Mail className="h-3 w-3 mr-1" />
    },
    accepted: { 
      color: 'bg-green-100 text-green-800', 
      label: 'Accepted',
      icon: <Check className="h-3 w-3 mr-1" />
    },
    rejected: { 
      color: 'bg-red-100 text-red-800', 
      label: 'Rejected',
      icon: <AlertCircle className="h-3 w-3 mr-1" />
    },
    expired: { 
      color: 'bg-yellow-100 text-yellow-800', 
      label: 'Expired',
      icon: <AlertCircle className="h-3 w-3 mr-1" />
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  return (
    <Badge className={config.color + " capitalize px-3 py-1"} variant="outline">
      <span className="flex items-center">
        {config.icon}
        {config.label}
      </span>
    </Badge>
  );
};

export default function QuotationPage({ quotation: initialQuotation, clients: initialClients }: Props) {
  const { props } = usePage();
  const [clients] = useState<Client[]>(initialClients);
  const defaultQuotation: Quotation = {
    id: null,
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

  const [quotation] = useState<Quotation>({
    ...defaultQuotation,
    ...initialQuotation,
    client_id: initialQuotation?.client_id?.toString() || '',
    notes: initialQuotation?.notes || '',
    terms: initialQuotation?.terms || '',
    tax_rate: initialQuotation?.tax_rate || '18',
    discount: initialQuotation?.discount || '0',
    items: initialQuotation?.items || [],
    date: initialQuotation?.date ? new Date(initialQuotation.date).toISOString().split('T')[0] : defaultQuotation.date,
    valid_until: initialQuotation?.valid_until ? new Date(initialQuotation.valid_until).toISOString().split('T')[0] : defaultQuotation.valid_until,
  });

  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const calculatedSubtotal = quotation.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || '0') * parseFloat(item.price || '0'));
    }, 0);

    const calculatedTaxAmount = calculatedSubtotal * parseFloat(quotation.tax_rate || '0') / 100;
    const calculatedDiscountAmount = parseFloat(quotation.discount || '0');
    const calculatedTotal = calculatedSubtotal + calculatedTaxAmount - calculatedDiscountAmount;

    setSubtotal(calculatedSubtotal);
    setTaxAmount(calculatedTaxAmount);
    setDiscountAmount(calculatedDiscountAmount);
    setTotal(calculatedTotal);
  }, [quotation.items, quotation.tax_rate, quotation.discount]);

  const getSelectedClient = (): Client | undefined => {
    return clients.find(client => client.id.toString() === quotation.client_id?.toString());
  };

  const handlePrint = () => {
    window.print();
  };

  // State for dialogs
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  // Function to generate PDF
  const generatePDF = () => {
    // In a real implementation, this would use a library like jsPDF or call an API endpoint
    const pdfFileName = `Quotation_${formatQuotationId(quotation.id)}.pdf`;
    // Placeholder for actual PDF generation logic
    alert(`PDF file "${pdfFileName}" would be generated and downloaded in a real implementation`);
    setShowDownloadOptions(false);
  };

  // Function to export as Excel
  const exportAsExcel = () => {
    // In a real implementation, this would use a library like exceljs or call an API endpoint
    const excelFileName = `Quotation_${formatQuotationId(quotation.id)}.xlsx`;
    // Placeholder for actual Excel generation logic
    alert(`Excel file "${excelFileName}" would be generated and downloaded in a real implementation`);
    setShowDownloadOptions(false);
  };

  const handleDownload = () => {
    setShowDownloadOptions(!showDownloadOptions);
  };

  const handleShare = () => {
    setShareDialogOpen(true);
  };
  
  const handleEmailShare = () => {
    // In a real implementation, this would trigger an API call to share via email
    alert(`Quotation shared with ${shareEmail}`);
    setShareDialogOpen(false);
    setShareEmail('');
  };

  // Calculate days until expiration
  const getDaysUntilExpiration = (): number | null => {
    if (!quotation.valid_until) return null;
    
    const today = new Date();
    const expirationDate = new Date(quotation.valid_until);
    const diffTime = expirationDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilExpiration();
  const isExpiring = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  const isExpired = daysLeft !== null && daysLeft < 0;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={quotation.id ? `Quotation ${formatQuotationId(quotation.id)}` : "Quotation Details"} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {quotation.id ? `Quotation ${formatQuotationId(quotation.id)}` : "Quotation Details"}
            </h2>
            <p className="text-muted-foreground">View quotation details</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Print quotation</p>
                </TooltipContent>
              </Tooltip>
            
              <div className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download quotation</p>
                  </TooltipContent>
                </Tooltip>
                
                {showDownloadOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                    <div className="py-1">
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" 
                        onClick={generatePDF}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download as PDF
                      </button>
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" 
                        onClick={exportAsExcel}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export as Excel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share quotation</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="primary" size="sm" onClick={() => router.visit(`/quotations/${quotation.id}/edit`)}>
                    <Check className="mr-2 h-4 w-4" />
                    Edit Quotation
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit this quotation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Share Dialog */}
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Quotation</DialogTitle>
                <DialogDescription>
                  Share this quotation via email or generate a shareable link.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="email" className="text-right text-sm font-medium col-span-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="recipient@example.com"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right text-sm font-medium col-span-1">
                    Link
                  </label>
                  <div className="col-span-3 flex">
                    <input
                      type="text"
                      readOnly
                      value={`https://app.example.com/quotations/public/${formatQuotationId(quotation.id)}`}
                      className="flex h-10 w-full rounded-l-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    />
                    <Button variant="outline" className="rounded-l-none" onClick={() => {
                      navigator.clipboard.writeText(`https://app.example.com/quotations/public/${formatQuotationId(quotation.id)}`);
                      alert('Link copied to clipboard!');
                    }}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-between">
                <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleEmailShare} disabled={!shareEmail}>
                  <Mail className="mr-2 h-4 w-4" />
                  Share via Email
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Quotation Details</CardTitle>
                <CardDescription>Review quotation information and details</CardDescription>
              </div>
              <div className="mt-2 md:mt-0">
                {getStatusBadge(quotation.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Quotation Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">From</h3>
                    <div className="font-medium">Your Company</div>
                    <div className="text-sm text-gray-600">123 Business Street</div>
                    <div className="text-sm text-gray-600">City, State 12345</div>
                    <div className="text-sm text-gray-600 mt-2">contact@yourcompany.com</div>
                    <div className="text-sm text-gray-600">+91 1234567890</div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">To</h3>
                    {getSelectedClient() ? (
                      <>
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={getSelectedClient()?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(getSelectedClient()?.name || 'Unknown')}&size=32`} alt="Avatar" />
                            <AvatarFallback>{getSelectedClient()?.name?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{getSelectedClient()?.name}</div>
                        </div>
                        <div className="text-sm text-gray-600">{getSelectedClient()?.company}</div>
                        <div className="text-sm text-gray-600 mt-2">{getSelectedClient()?.email}</div>
                      </>
                    ) : (
                      <div className="text-gray-500">No client selected</div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Quotation Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Number</div>
                        <div className="font-medium">{formatQuotationId(quotation.id)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Date</div>
                        <div className="font-medium">{quotation.date ? new Date(quotation.date).toLocaleDateString() : 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Valid Until</div>
                        <div className="font-medium">
                          {quotation.valid_until ? new Date(quotation.valid_until).toLocaleDateString() : 'N/A'}
                          {isExpiring && !isExpired && (
                            <span className="text-yellow-600 text-xs ml-2">
                              ({daysLeft} {daysLeft === 1 ? 'day' : 'days'} left)
                            </span>
                          )}
                          {isExpired && (
                            <span className="text-red-600 text-xs ml-2">(Expired)</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Amount</div>
                        <div className="font-medium">{formatCurrency(total)}</div>
                      </div>
                    </div>
                  </div>

                  {quotation.history && quotation.history.length > 0 && (
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">History</h3>
                      <div className="space-y-2">
                        {quotation.history.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.action}</span>
                            <span className="text-gray-500">{new Date(item.date).toLocaleDateString()} by {item.user}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Items/Products */}
              <div>
                <h3 className="text-lg font-medium mb-4">Line Items</h3>
                {quotation.items.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="p-3 text-left font-medium text-gray-500">Description</th>
                          <th className="p-3 text-right font-medium text-gray-500">Quantity</th>
                          <th className="p-3 text-right font-medium text-gray-500">Price</th>
                          <th className="p-3 text-right font-medium text-gray-500">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotation.items.map((item, index) => {
                          const amount = parseFloat(item.quantity || '0') * parseFloat(item.price || '0');
                          return (
                            <tr key={index} className={`border-b hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                              <td className="p-3">
                                <div className="font-medium">{item.description}</div>
                              </td>
                              <td className="p-3 text-right">
                                <div>{item.quantity}</div>
                              </td>
                              <td className="p-3 text-right">
                                <div>{formatCurrency(parseFloat(item.price || '0'))}</div>
                              </td>
                              <td className="p-3 text-right">
                                <div className="font-medium">{formatCurrency(amount)}</div>
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-gray-50/80">
                          <td colSpan={3} className="p-3 text-right font-medium">
                            Items Total ({quotation.items.length} {quotation.items.length === 1 ? 'item' : 'items'})
                          </td>
                          <td className="p-3 text-right font-medium">
                            {formatCurrency(subtotal)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16 border rounded-lg bg-gray-50 flex flex-col items-center justify-center space-y-2">
                    <div className="rounded-full bg-gray-100 p-3">
                      <AlertCircle className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No line items added</p>
                    <p className="text-gray-400 text-sm">Add items to this quotation by editing it</p>
                  </div>
                )}
              </div>

              {/* Summary and Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div></div>
                <div className="space-y-4">
                  <div className="rounded-lg border overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b">
                      <h3 className="font-medium">Summary</h3>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Tax ({quotation.tax_rate}%)</span>
                        <span>{formatCurrency(taxAmount)}</span>
                      </div>
                      {parseFloat(quotation.discount) > 0 && (
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Discount</span>
                          <span className="text-red-600">-{formatCurrency(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg py-3 border-t mt-2">
                        <span>Total Amount</span>
                        <span className="text-primary">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes and Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="rounded-lg border overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                      <h3 className="font-medium">Notes</h3>
                    </div>
                    <div className="p-4 bg-white min-h-[120px]">
                      {quotation.notes ? (
                        <div className="whitespace-pre-line text-gray-700">{quotation.notes}</div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                          <div className="rounded-full bg-gray-100 p-2 mb-2">
                            <AlertCircle className="h-5 w-5 text-gray-400" />
                          </div>
                          <span className="text-gray-500">No notes available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg border overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
                      <h3 className="font-medium">Terms & Conditions</h3>
                    </div>
                    <div className="p-4 bg-white min-h-[120px]">
                      {quotation.terms ? (
                        <div className="whitespace-pre-line text-gray-700">{quotation.terms}</div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                          <div className="rounded-full bg-gray-100 p-2 mb-2">
                            <AlertCircle className="h-5 w-5 text-gray-400" />
                          </div>
                          <span className="text-gray-500">No terms & conditions specified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons at the bottom */}
              <div className="flex justify-end pt-6 border-t mt-8">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.visit('/quotations')}>
                    Back to Quotations
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => router.visit(`/quotations/${quotation.id}/edit`)}>
                    Edit Quotation
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}