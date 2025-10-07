
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

export interface VehiclePurchase {
  purchasePrice?: number;
  purchaseDate?: string;
  financingCompany?: string;
}

export interface VehicleCurrentRental {
  customerName: string;
  startDate: string;
  endDate: string;
}

export interface VehicleInspectionPoints {
  id: string;
  vehicle_id: string;
  // الهيكل الخارجي
  body_front: boolean;
  body_rear: boolean;
  body_right_side: boolean;
  body_left_side: boolean;
  body_roof: boolean;
  body_hood: boolean;
  body_trunk: boolean;
  // الإطارات
  tires_front_right: boolean;
  tires_front_left: boolean;
  tires_rear_right: boolean;
  tires_rear_left: boolean;
  spare_tire: boolean;
  // الأضواء
  lights_headlights: boolean;
  lights_tail_lights: boolean;
  lights_brake_lights: boolean;
  lights_turn_signals: boolean;
  lights_fog_lights: boolean;
  lights_interior: boolean;
  // الزجاج والمرايا
  glass_windshield: boolean;
  glass_rear_window: boolean;
  glass_side_windows: boolean;
  mirrors: boolean;
  // المحرك
  engine_condition: boolean;
  oil_level: boolean;
  coolant_level: boolean;
  battery_condition: boolean;
  // الداخلية
  interior_seats: boolean;
  interior_dashboard: boolean;
  interior_controls: boolean;
  interior_cleanliness: boolean;
  // معلومات الفحص
  inspector_name?: string;
  inspection_date?: string;
  notes?: string;
  overall_condition?: 'excellent' | 'good' | 'fair' | 'poor';
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Vehicle {
  id: string;
  plate_number: string;
  plateNumber?: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  status: 'available' | 'rented' | 'maintenance' | 'out_of_service';
  daily_rate: number;
  dailyRate?: number;
  min_daily_rate?: number;
  max_daily_rate?: number;
  mileage: number;
  
  // Vehicle Details
  vin?: string;
  engine_number?: string;
  engineNumber?: string;
  chassis_number?: string;
  chassisNumber?: string;
  fuel_type: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  fuelType?: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  transmission: 'manual' | 'automatic';
  seating_capacity: number;
  seatingCapacity?: number;
  features?: string[];
  
  // Elm Integration Fields
  registration_type?: string;
  registration_expiry?: string;
  inspection_expiry?: string;
  inspection_status?: 'valid' | 'expired' | 'near_expiry';
  insurance_status?: 'valid' | 'expired' | 'near_expiry';
  insurance_expiry?: string;
  insurance_company?: string;
  insurance_policy_number?: string;
  renewal_fees?: number;
  renewal_status?: 'active' | 'pending' | 'overdue';
  
  // Owner
  owner_id?: string;
  owner?: VehicleOwner;
  
  // Related data - Always arrays for consistency
  documents?: VehicleDocument[];
  images?: VehicleImage[];
  maintenance?: VehicleMaintenance[];
  inspectionPoints?: VehicleInspectionPoints;
  location?: VehicleLocation;
  purchase?: VehiclePurchase;
  currentRental?: VehicleCurrentRental;
  
  // Administrative - جعل created_at مطلوبة
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface VehicleFilters {
  search?: string;
  status?: string;
  brand?: string;
  fuel_type?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
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
