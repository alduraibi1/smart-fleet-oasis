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
  expiryDate?: string;
}

export interface VehicleImage {
  id: string;
  url: string;
  type: 'exterior' | 'interior' | 'damage' | 'other';
  description?: string;
  uploadDate: string;
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
  ownerId: string;
  owner: VehicleOwner;
  documents: VehicleDocument[];
  images: VehicleImage[];
  engineNumber: string;
  chassisNumber: string;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  transmission: 'manual' | 'automatic';
  seatingCapacity: number;
  features: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}