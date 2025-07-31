import { useState, useEffect } from 'react';
import { ChevronDown, Download, Printer, Share2, Check, Clock, Mail, AlertCircle, CreditCard, MoreHorizontal } from 'lucide-react';

// Mock data for the invoice example
const mockInvoice = {
  id: 1234,
  status: 'sent',
  date: '2025-04-28',
  valid_until: '2025-05-28',
  client_id: '1',
  tax_rate: '18',
  discount: '500',
  notes: 'This invoice includes all items as discussed in our meeting on April 15, 2025.',
  terms: 'Payment due within 30 days of invoice date.\nAll prices are exclusive of taxes unless otherwise stated.\nPlease make payment via bank transfer to the account details provided.',
  items: [
    { description: 'Website Design', quantity: '1', price: '25000' },
    { description: 'Logo Design', quantity: '1', price: '12000' },
    { description: 'Hosting (Annual)', quantity: '1', price: '8000' },
    { description: 'SEO Package - Basic', quantity: '1', price: '15000' },
  ]
};

const mockClient = {
  id: '1',
  name: 'Alex Johnson',
  company: 'Acme Technologies',
  email: 'alex@acmetech.com',
};

// Format invoice ID with leading zeros
const formatInvoiceId = (id) => {
  if (id === null) return 'INV0000';
  const paddedId = id.toString().padStart(4, '0');
  return `INV${paddedId}`;
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

// Get status badge
const StatusBadge = ({ status }) => {
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
    paid: { 
      color: 'bg-green-100 text-green-800', 
      label: 'Paid',
      icon: <Check className="h-3 w-3 mr-1" />
    },
    overdue: { 
      color: 'bg-red-100 text-red-800', 
      label: 'Overdue',
      icon: <AlertCircle className="h-3 w-3 mr-1" />
    },
    pending: { 
      color: 'bg-yellow-100 text-yellow-800', 
      label: 'Pending',
      icon: <Clock className="h-3 w-3 mr-1" />
    }
  };

  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <div className={`${config.color} px-3 py-1 rounded-full text-xs font-medium inline-flex items-center`}>
      {config.icon}
      {config.label}
    </div>
  );
};

export default function ProfessionalInvoice() {
  const [invoice, setInvoice] = useState(mockInvoice);
  const [client, setClient] = useState(mockClient);
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    const calculatedSubtotal = invoice.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || '0') * parseFloat(item.price || '0'));
    }, 0);

    const calculatedTaxAmount = calculatedSubtotal * parseFloat(invoice.tax_rate || '0') / 100;
    const calculatedTotal = calculatedSubtotal + calculatedTaxAmount - parseFloat(invoice.discount || '0');

    setSubtotal(calculatedSubtotal);
    setTaxAmount(calculatedTaxAmount);
    setTotal(calculatedTotal);
  }, [invoice.items, invoice.tax_rate, invoice.discount]);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice {formatInvoiceId(invoice.id)}</h1>
            <p className="text-gray-500">Manage and view invoice details</p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <button className="flex items-center justify-center px-3 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border hover:bg-gray-50 transition-colors">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            
            <button className="flex items-center justify-center px-3 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
            
            <button className="flex items-center justify-center px-3 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border hover:bg-gray-50 transition-colors">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
            
            <div className="relative">
              <button 
                className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => setShowActions(!showActions)}
              >
                Actions
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border overflow-hidden">
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Mark as Paid
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Reminder
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Edit Invoice
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Invoice Card */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 md:p-8 border-b">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
              {/* Company Logo and Info */}
              <div className="flex-1">
                <div className="h-12 w-40 bg-blue-600 rounded-md mb-4 flex items-center justify-center text-white font-bold">COMPANY LOGO</div>
                <h2 className="text-lg font-semibold text-gray-900">Your Company Name</h2>
                <p className="text-gray-500 text-sm">123 Business Street</p>
                <p className="text-gray-500 text-sm">City, State 12345</p>
                <p className="text-gray-500 text-sm mt-2">contact@yourcompany.com</p>
                <p className="text-gray-500 text-sm">+91 1234567890</p>
              </div>
              
              {/* Invoice Details */}
              <div className="flex-1 flex flex-col items-start md:items-end">
                <div className="text-3xl font-bold text-gray-900 mb-4">INVOICE</div>
                <StatusBadge status={invoice.status} />
                
                <div className="mt-4 space-y-1">
                  <div className="flex gap-2 text-sm">
                    <span className="font-medium text-gray-500 w-24 text-right">Invoice No:</span>
                    <span className="font-medium text-gray-900">{formatInvoiceId(invoice.id)}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="font-medium text-gray-500 w-24 text-right">Issue Date:</span>
                    <span className="text-gray-700">{new Date(invoice.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="font-medium text-gray-500 w-24 text-right">Due Date:</span>
                    <span className="text-gray-700">{new Date(invoice.valid_until).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 text-sm font-medium">
                    <span className="text-gray-500 w-24 text-right">Amount Due:</span>
                    <span className="text-blue-600">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Invoice Body */}
          <div className="p-6 md:p-8">
            {/* Client Information */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-500 mb-3">BILL TO</h3>
              <div className="font-semibold text-gray-900">{client.company}</div>
              <div className="text-gray-700">{client.name}</div>
              <div className="text-gray-500 text-sm mt-1">{client.email}</div>
            </div>
            
            {/* Items Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">QTY</th>
                    <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-36">UNIT PRICE</th>
                    <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-36">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items.map((item, index) => {
                    const itemAmount = parseFloat(item.quantity) * parseFloat(item.price);
                    return (
                      <tr key={index}>
                        <td className="py-4 text-sm text-gray-900">{item.description}</td>
                        <td className="py-4 text-sm text-gray-700 text-right">{item.quantity}</td>
                        <td className="py-4 text-sm text-gray-700 text-right">{formatCurrency(parseFloat(item.price))}</td>
                        <td className="py-4 text-sm font-medium text-gray-900 text-right">{formatCurrency(itemAmount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Summary */}
            <div className="flex justify-end mb-8">
              <div className="w-full max-w-xs">
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 text-sm">Subtotal</span>
                    <span className="text-gray-900 text-sm font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 text-sm">Tax ({invoice.tax_rate}%)</span>
                    <span className="text-gray-900 text-sm font-medium">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 text-sm">Discount</span>
                    <span className="text-red-600 text-sm font-medium">- {formatCurrency(parseFloat(invoice.discount))}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-200">
                    <span className="text-gray-900 font-semibold">Total</span>
                    <span className="text-blue-600 font-bold">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Notes & Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                <p className="text-gray-600 text-sm whitespace-pre-line">{invoice.notes}</p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-2">Terms & Conditions</h3>
                <p className="text-gray-600 text-sm whitespace-pre-line">{invoice.terms}</p>
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="border rounded-lg p-4 mb-8">
              <h3 className="font-medium text-gray-900 mb-3">Payment Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Bank Transfer</h4>
                  <div className="text-sm text-gray-600 mt-1">
                    <p>Account Name: Your Company</p>
                    <p>Account Number: 1234567890</p>
                    <p>IFSC Code: ABCD0123456</p>
                    <p>Bank: Example Bank</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">UPI</h4>
                  <p className="text-sm text-gray-600 mt-1">payments@yourcompany.upi</p>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-center border-t pt-8">
              <p className="text-gray-500 text-sm">Thank you for your business!</p>
              <p className="text-gray-400 text-xs mt-2">This is a computer generated invoice and does not require a signature.</p>
            </div>
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="mt-6 flex justify-between items-center">
          <button className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors">
            ← Back to Invoices
          </button>
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
            <Check className="h-4 w-4 mr-2" />
            Edit Invoice
          </button>
        </div>
      </div>
    </div>
  );
}