
export interface Vehicle {
  id: string;
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  daily_rate: number;
  status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  engine_number?: string;
  chassis_number?: string;
  seating_capacity?: number;
  registration_expiry?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  expiry_date?: string;
}

export interface VehicleImage {
  id: string;
  url: string;
  description?: string;
}
