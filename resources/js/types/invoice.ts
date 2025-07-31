export interface ServiceItem {
  id: number;
  name: string;
  hsnSac?: string;
  gstRate: number;
  quantity: number;
  price: number;
  amount?: number;
  cgst?: number;
  sgst?: number;
  total?: number;
  description?: string;
}

export interface BillingDetails {
  companyName: string;
  address?: string[];
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  gstin?: string;
  pan?: string;
  email?: string;
  phone?: string;
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  accountType: string;
  bank: string;
}

export interface Payment {
  date: string;
  mode: string;
  amountReceived: number;
  paymentAccount: string;
}

export interface InvoiceType {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: "paid" | "unpaid" | "overdue";
  billedBy: BillingDetails;
  billedTo?: BillingDetails;
  services: ServiceItem[];
  bankDetails: BankDetails;
  termsAndConditions: string[];
  payments: Payment[];
  totalInWords: string;
  notes?: string;
}