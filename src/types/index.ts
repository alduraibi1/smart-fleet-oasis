
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
  phone: string;
  email?: string;
  nationalId: string;
  licenseNumber: string;
  licenseExpiry: Date;
  address: string;
  rating: number;
  totalRentals: number;
  documents: Document[];
  blacklisted: boolean;
  blacklistReason?: string;
  blacklistDate?: Date;
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
