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
  vin?: string;
  engine_number?: string;
  chassis_number?: string;
  fuel_type: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  transmission: 'manual' | 'automatic';
  seating_capacity: number;
  features?: string[];
  owner_id?: string;
  owner?: VehicleOwner;
  registration_expiry?: string; // إضافة هذا الحقل
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

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
