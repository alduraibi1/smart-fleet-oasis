
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'accountant' | 'mechanic' | 'manager';
  permissions: string[];
  active: boolean;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  mileage: number;
  dailyRate: number;
  images: string[];
  qrCode?: string;
  documents: Document[];
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  insuranceExpiry: Date;
  licenseExpiry: Date;
  inspectionExpiry: Date;
}

export interface Customer {
  id: string;
  name: string;
  name_english?: string;
  phone: string;
  phone_secondary?: string;
  email?: string;
  email_secondary?: string;
  national_id: string;
  nationality: string;
  date_of_birth?: string;
  gender: string;
  marital_status: string;
  
  // معلومات الرخصة
  license_number: string;
  license_expiry: string;
  license_type: string;
  license_issue_date?: string;
  license_issue_place?: string;
  international_license: boolean;
  international_license_number?: string;
  international_license_expiry?: string;
  
  // معلومات العنوان
  address?: string;
  city?: string;
  district?: string;
  postal_code?: string;
  country: string;
  address_type: string;
  
  // معلومات العمل
  job_title?: string;
  company?: string;
  work_address?: string;
  work_phone?: string;
  monthly_income?: number;
  
  // جهة الاتصال في الطوارئ
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  
  // التفضيلات والإعدادات
  preferred_language: string;
  marketing_consent: boolean;
  sms_notifications: boolean;
  email_notifications: boolean;
  
  // التقييم والمعلومات الإضافية
  rating: number;
  notes?: string;
  customer_source: string;
  referred_by?: string;
  
  // معلومات الائتمان
  credit_limit: number;
  payment_terms: string;
  preferred_payment_method: string;
  bank_account_number?: string;
  bank_name?: string;
  
  // معلومات التأمين
  has_insurance: boolean;
  insurance_company?: string;
  insurance_policy_number?: string;
  insurance_expiry?: string;
  
  // معلومات الحالة
  is_active: boolean;
  blacklisted: boolean;
  blacklist_reason?: string;
  blacklist_date?: string;
  total_rentals: number;
  last_rental_date?: string;
  
  created_at: string;
  updated_at: string;
  created_by?: string;
  
  // الحقول للتوافق مع المكونات الحالية
  nationalId: string;
  licenseNumber: string;
  licenseExpiry: Date;
  totalRentals: number;
  blacklistReason?: string;
  blacklistDate?: Date;
  documents: Document[];
}

export interface CustomerGuarantor {
  id: string;
  customer_id: string;
  name: string;
  phone: string;
  national_id: string;
  relation: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerDocument {
  id: string;
  customer_id: string;
  document_type: string;
  document_name: string;
  file_url?: string;
  expiry_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerFilters {
  search?: string;
  rating?: number;
  status?: 'all' | 'active' | 'inactive';
  blacklisted?: boolean;
  license_expiry?: 'all' | 'valid' | 'expiring' | 'expired';
  city?: string;
  customer_source?: string;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  blacklisted: number;
  newThisMonth: number;
  averageRating: number;
  totalRentals: number;
  averageRentalValue: number;
}

export interface RentalContract {
  id: string;
  contractNumber: string;
  vehicleId: string;
  customerId: string;
  startDate: Date;
  endDate: Date;
  dailyRate: number;
  totalAmount: number;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  paymentStatus: 'paid' | 'partial' | 'pending' | 'overdue';
  documents: Document[];
  notes?: string;
  damageNotes?: string;
  
  // Financial Details
  delegationFee: number;
  vat: number;
  vatRate: number;
  additionalCharges: number;
  discount: number;
  securityDeposit: number;
  paymentMethod: 'cash' | 'transfer' | 'credit_card' | 'installments';
  installmentPlan?: {
    numberOfInstallments: number;
    installmentAmount: number;
    installmentDates: Date[];
  };
  
  // Delivery & Pickup Information
  deliveryLocation: string;
  pickupLocation: string;
  deliveryTime: Date;
  pickupTime: Date;
  deliveryStaff: string;
  pickupStaff: string;
  emergencyContact: string;
  usageType: 'personal' | 'commercial' | 'tourism';
  
  // Vehicle Inspection
  inspection: {
    mileageAtDelivery: number;
    fuelLevelAtDelivery: number;
    conditionAtDelivery: string;
    damagesAtDelivery: string[];
    imagesAtDelivery: string[];
    mileageAtReturn?: number;
    fuelLevelAtReturn?: number;
    conditionAtReturn?: string;
    damagesAtReturn?: string[];
    imagesAtReturn?: string[];
  };
  
  // Insurance & Emergency
  insurance: {
    company: string;
    policyNumber: string;
    expiryDate: Date;
    coverage: string;
  };
  
  // Terms & Conditions
  terms: {
    maxMileagePerDay?: number;
    allowedAreas: string[];
    penalties: {
      lateReturnPerHour: number;
      excessMileagePerKm: number;
      smokingFine: number;
      cleaningFee: number;
      damageFee: number;
    };
    cancellationPolicy: string;
    refundPolicy: string;
    autoRenewal: boolean;
  };
  
  // Legal & Administrative
  signedAt: Date;
  signedBy: string;
  digitalSignature?: string;
  createdBy: string;
  approvedBy?: string;
  printedAt?: Date;
  emailSentAt?: Date;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  mechanicId: string;
  date: Date;
  type: 'scheduled' | 'breakdown' | 'inspection';
  description: string;
  partsUsed: PartUsage[];
  oilsUsed: OilUsage[];
  laborCost: number;
  partsCost: number;
  oilsCost: number;
  totalCost: number;
  laborHours: number;
  warranty: boolean;
  warrantyExpiry?: Date;
  notes: string;
  status: 'pending' | 'in_progress' | 'completed';
  beforeImages: string[];
  afterImages: string[];
  vehicleConditionBefore: string;
  vehicleConditionAfter: string;
  workStartTime?: Date;
  workEndTime?: Date;
  qualityRating?: number;
}

export interface PartUsage {
  partId: string;
  partName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  stockBefore: number;
  stockAfter: number;
}

export interface OilUsage {
  oilId: string;
  oilName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  stockBefore: number;
  stockAfter: number;
  viscosity: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'oil' | 'filter' | 'brake' | 'tire' | 'battery' | 'belt' | 'spark_plug' | 'coolant' | 'other';
  brand: string;
  stockLevel: number;
  minStockLevel: number;
  unitCost: number;
  sellingPrice: number;
  barcode?: string;
  supplier: string;
  supplierContact: string;
  lastRestocked: Date;
  expiryDate?: Date;
  location: string;
  description: string;
}

export interface OilInventory {
  id: string;
  name: string;
  brand: string;
  viscosity: string;
  type: 'engine' | 'transmission' | 'brake' | 'hydraulic' | 'coolant';
  stockLevel: number;
  minStockLevel: number;
  unitCost: number;
  sellingPrice: number;
  supplier: string;
  supplierContact: string;
  lastRestocked: Date;
  expiryDate: Date;
  location: string;
  barcode?: string;
  specifications: string;
}

export interface Mechanic {
  id: string;
  name: string;
  phone: string;
  email?: string;
  specialization: string[];
  hourlyRate: number;
  hireDate: Date;
  experienceYears: number;
  rating: number;
  totalJobsCompleted: number;
  active: boolean;
  shift: 'morning' | 'evening' | 'night' | 'flexible';
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: Date;
  expiryDate?: Date;
}

export interface DashboardMetrics {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  maintenanceVehicles: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeContracts: number;
  pendingMaintenance: number;
}

// ====================== INTEGRATED ACCOUNTING SYSTEM ======================

// Chart of Accounts - دليل الحسابات
export interface ChartOfAccounts {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentAccountId?: string;
  isActive: boolean;
  balance: number;
  description?: string;
}

// Journal Entries - القيود اليومية  
export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: Date;
  description: string;
  referenceType: 'contract' | 'maintenance' | 'purchase' | 'payment' | 'adjustment';
  referenceId: string;
  referenceNumber: string;
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'reversed';
  entryDetails: JournalEntryDetail[];
  createdBy: string;
  createdAt: Date;
  postedAt?: Date;
}

export interface JournalEntryDetail {
  id: string;
  journalEntryId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
}

// Integrated Invoice System - نظام الفواتير المتكامل
export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: 'rental' | 'maintenance' | 'purchase' | 'additional_charges';
  
  // Customer/Vendor Details
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  vendorId?: string;
  vendorName?: string;
  
  // Invoice Details
  invoiceDate: Date;
  dueDate: Date;
  currency: 'SAR';
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  discountAmount: number;
  totalAmount: number;
  
  // Reference Details
  contractId?: string;
  vehicleId?: string;
  plateNumber?: string;
  maintenanceId?: string;
  
  // Payment Status
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  paidAmount: number;
  remainingAmount: number;
  paymentTerms: string;
  
  // Line Items
  lineItems: InvoiceLineItem[];
  
  // Approval & Administrative
  approvedBy?: string;
  issuedBy: string;
  issuedAt: Date;
  sentAt?: Date;
  notes?: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vatRate: number;
  vatAmount: number;
  accountId: string; // للربط مع دليل الحسابات
}

// Enhanced Owner Interface
export interface Owner {
  id: string;
  name: string;
  phone: string;
  email?: string;
  nationalId: string;
  address: string;
  bankAccount?: string;
  iban?: string;
  contractDate: Date;
  commissionRate: number;
  totalVehicles: number;
  accountId: string; // ربط مع دليل الحسابات
  active: boolean;
  documents: Document[];
  
  // Financial Summary
  totalRevenue: number;
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
  lastPaymentDate?: Date;
  paymentFrequency: 'monthly' | 'quarterly' | 'annual';
}

// Enhanced Payment Receipt - سندات القبض المحدثة
export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  
  // Invoice Reference
  invoiceId?: string;
  invoiceNumber?: string;
  contractId?: string;
  
  // Customer Details
  customerId: string;
  customerName: string;
  vehicleId?: string;
  plateNumber?: string;
  
  // Payment Details
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'pos';
  paymentDate: Date;
  
  // Reference Details
  referenceNumber?: string;
  checkNumber?: string;
  bankDetails?: string;
  transactionId?: string;
  
  // Classification & Accounting
  type: 'rental_payment' | 'security_deposit' | 'additional_charges' | 'penalty' | 'refund' | 'advance_payment';
  accountId: string; // للربط مع دليل الحسابات
  
  // Status & Processing
  status: 'pending' | 'confirmed' | 'deposited' | 'cancelled' | 'returned';
  journalEntryId?: string; // ربط مع القيد المحاسبي
  
  // Administrative
  issuedBy: string;
  issuedAt: Date;
  confirmedBy?: string;
  confirmedAt?: Date;
  depositedAt?: Date;
  printedAt?: Date;
  emailSentAt?: Date;
  notes?: string;
}

// Enhanced Payment Voucher - سندات الصرف المحدثة
export interface PaymentVoucher {
  id: string;
  voucherNumber: string;
  
  // Vendor/Payee Details
  recipientType: 'owner' | 'supplier' | 'mechanic' | 'employee' | 'vendor' | 'service_provider' | 'other';
  recipientId?: string;
  recipientName: string;
  recipientPhone?: string;
  recipientAccount?: string;
  
  // Payment Details
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'pos';
  paymentDate: Date;
  currency: 'SAR';
  
  // Invoice Reference
  invoiceId?: string;
  invoiceNumber?: string;
  
  // Classification & Accounting
  expenseCategory: 'maintenance' | 'fuel' | 'insurance' | 'owner_commission' | 'salary' | 'office_expenses' | 'parts_purchase' | 'oil_purchase' | 'service_fees' | 'other';
  expenseType: 'operational' | 'capital' | 'administrative';
  accountId: string; // للربط مع دليل الحسابات
  
  // Reference Details
  referenceNumber?: string;
  checkNumber?: string;
  bankDetails?: string;
  transactionId?: string;
  
  // Related Records
  vehicleId?: string;
  contractId?: string;
  maintenanceId?: string;
  purchaseOrderId?: string;
  
  // Status & Processing
  status: 'draft' | 'pending_approval' | 'approved' | 'paid' | 'cancelled' | 'rejected';
  journalEntryId?: string; // ربط مع القيد المحاسبي
  
  // Approval Workflow
  requestedBy: string;
  approvedBy?: string;
  approvalDate?: Date;
  approvalNotes?: string;
  requiresHigherApproval: boolean;
  
  // Administrative
  description: string;
  notes?: string;
  issuedBy: string;
  issuedAt: Date;
  paidAt?: Date;
  printedAt?: Date;
}

export interface DiscountVoucher {
  id: string;
  voucherNumber: string;
  contractId: string;
  customerId: string;
  customerName: string;
  
  // Discount Details
  discountAmount: number;
  discountPercentage?: number;
  originalAmount: number;
  finalAmount: number;
  
  // Classification
  discountType: 'early_payment' | 'long_term_rental' | 'loyalty_customer' | 'promotional' | 'compensation' | 'other';
  discountReason: string;
  
  // Approval & Authorization
  approvedBy: string;
  approvalDate: Date;
  requiresHigherApproval: boolean;
  
  // Status & Notes
  status: 'pending' | 'approved' | 'applied' | 'cancelled';
  notes?: string;
  
  // Administrative
  issuedBy: string;
  issuedAt: Date;
  appliedAt?: Date;
}

export interface VehicleProfitability {
  vehicleId: string;
  plateNumber: string;
  brand: string;
  model: string;
  ownerId: string;
  ownerName: string;
  
  // Revenue Breakdown
  rentalRevenue: number;
  additionalChargesRevenue: number;
  totalRevenue: number;
  
  // Expense Breakdown
  maintenanceCosts: number;
  fuelCosts: number;
  insuranceCosts: number;
  depreciationCosts: number;
  ownerCommission: number;
  otherExpenses: number;
  totalExpenses: number;
  
  // Profitability Metrics
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  roi: number; // Return on Investment
  
  // Operational Metrics
  utilization: number; // نسبة الاستخدام
  averageDailyRate: number;
  totalRentalDays: number;
  revenuePerDay: number;
  
  // Time Period
  periodStart: Date;
  periodEnd: Date;
  
  // Status
  isActive: boolean;
  lastUpdated: Date;
}

export interface OwnerProfitability {
  ownerId: string;
  ownerName: string;
  
  // Fleet Overview
  totalVehicles: number;
  activeVehicles: number;
  
  // Revenue Details
  totalRevenue: number;
  averageRevenuePerVehicle: number;
  bestPerformingVehicle: string;
  worstPerformingVehicle: string;
  
  // Commission & Payments
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
  commissionRate: number;
  
  // Performance Metrics
  fleetUtilization: number;
  totalProfitGenerated: number;
  averageProfitPerVehicle: number;
  
  // Vehicle Performance List
  vehiclePerformance: VehicleProfitability[];
  
  // Time Period
  periodStart: Date;
  periodEnd: Date;
  
  // Payment History
  lastPaymentDate?: Date;
  paymentFrequency: 'monthly' | 'quarterly' | 'annual';
}

export interface AccountingTransaction {
  id: string;
  date: Date;
  type: 'receipt' | 'voucher' | 'discount';
  referenceId: string; // ID of related receipt/voucher/discount
  referenceNumber: string;
  
  // Transaction Details
  description: string;
  amount: number;
  
  // Classification
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  accountCategory: string;
  
  // Related Entities
  vehicleId?: string;
  customerId?: string;
  ownerId?: string;
  contractId?: string;
  
  // Double Entry
  debitAccount: string;
  creditAccount: string;
  
  // Status
  status: 'pending' | 'posted' | 'cancelled';
  
  // Administrative
  createdBy: string;
  createdAt: Date;
  postedAt?: Date;
}
