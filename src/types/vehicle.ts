export interface VehicleOwner {
  id: string;
  name: string;
  phone: string;
  email: string;
  nationalId: string;
  address: string;
  isActive: boolean;
}

export interface VehicleDocument {
  id: string;
  name: string;
  type: 'license' | 'insurance' | 'inspection' | 'registration' | 'other';
  file: File | string;
  uploadDate: string;
  expiryDate: string;
  status: 'valid' | 'expired' | 'near_expiry';
}

export interface VehicleImage {
  id: string;
  url: string;
  type: 'exterior' | 'interior' | 'damage' | 'other';
  description?: string;
  uploadDate: string;
}

export interface VehicleRental {
  customerId: string;
  customerName: string;
  startDate: string;
  endDate: string;
  contractId?: string;
}

export interface VehicleMaintenance {
  status: 'scheduled' | 'in_progress' | 'overdue' | 'completed';
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
  partsUsed?: string[];
}

export interface VehicleLocation {
  latitude?: number;
  longitude?: number;
  address?: string;
  lastUpdated?: string;
  isTracked: boolean;
}

export interface VehiclePurchase {
  purchaseDate?: string;
  purchasePrice?: number;
  financingCompany?: string;
  depreciationInfo?: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  dailyRate: number;
  mileage: number;
  
  // Vehicle Details
  vin: string; // Vehicle Identification Number
  engineNumber: string;
  chassisNumber: string;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  transmission: 'manual' | 'automatic';
  seatingCapacity: number;
  features: string[];
  
  // Owner & Documents
  ownerId: string;
  owner: VehicleOwner;
  documents: VehicleDocument[];
  images: VehicleImage[];
  
  // Operational Status
  currentRental?: VehicleRental;
  maintenance: VehicleMaintenance;
  location: VehicleLocation;
  purchase: VehiclePurchase;
  
  // Administrative
  notes?: string;
  createdAt: string;
  updatedAt: string;
}