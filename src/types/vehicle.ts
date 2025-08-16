
export interface VehicleOwner {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  national_id?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  name: string;
  type: 'license' | 'insurance' | 'inspection' | 'registration' | 'other';
  url?: string;
  file_url?: string;
  file_name?: string;
  upload_date: string;
  uploadDate?: string;
  expiry_date?: string;
  expiryDate?: string;
  status: 'valid' | 'expired' | 'near_expiry';
  uploaded_by?: string;
}

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  url: string;
  type: 'exterior' | 'interior' | 'damage' | 'other';
  description?: string;
  upload_date: string;
  uploadDate?: string;
  uploaded_by?: string;
}

export interface VehicleMaintenance {
  id: string;
  vehicle_id: string;
  status: 'scheduled' | 'in_progress' | 'overdue' | 'completed';
  maintenance_type: string;
  description?: string;
  scheduled_date?: string;
  completed_date?: string;
  cost?: number;
  notes?: string;
  parts_used?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

export interface VehicleLocation {
  id: string;
  vehicle_id: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  last_updated?: string;
  lastUpdated?: string;
  is_tracked: boolean;
}

export interface Vehicle {
  id: string;
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  daily_rate: number;
  mileage: number;
  
  // Vehicle Details
  vin?: string;
  engine_number?: string;
  chassis_number?: string;
  fuel_type: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  transmission: 'manual' | 'automatic';
  seating_capacity: number;
  features?: string[];
  registration_expiry?: string;
  
  // Owner
  owner_id?: string;
  owner?: VehicleOwner;
  
  // Related data
  documents?: VehicleDocument[];
  images?: VehicleImage[];
  maintenance?: VehicleMaintenance[];
  location?: VehicleLocation;
  
  // Administrative
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface VehicleFilters {
  search?: string;
  status?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuel_type?: string;
  transmission?: string;
  owner_id?: string;
}

export interface VehicleStats {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  out_of_service: number;
  total_value: number;
  avg_daily_rate: number;
}
