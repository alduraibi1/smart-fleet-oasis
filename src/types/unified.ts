
// Unified type definitions for the entire system
export interface UnifiedCustomer {
  // Basic Info
  id: string;
  name: string;
  phone: string;
  email?: string;
  national_id: string;
  nationality: string;
  city?: string;
  address?: string;
  
  // License Info
  license_number?: string;
  license_expiry?: string;
  license_type: string;
  license_issue_date?: string;
  
  // Personal Info
  gender: string;
  marital_status: string;
  date_of_birth?: string;
  
  // Contact Info
  country: string;
  district?: string;
  postal_code?: string;
  address_type: string;
  
  // Preferences
  preferred_language: string;
  marketing_consent: boolean;
  sms_notifications: boolean;
  email_notifications: boolean;
  
  // Additional Info
  customer_source: string;
  job_title?: string;
  company?: string;
  work_phone?: string;
  monthly_income?: number;
  
  // Banking Info
  bank_name?: string;
  bank_account_number?: string;
  credit_limit?: number;
  payment_terms: string;
  preferred_payment_method: string;
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  
  // Insurance Info
  has_insurance: boolean;
  insurance_company?: string;
  insurance_policy_number?: string;
  insurance_expiry?: string;
  
  // International License
  international_license: boolean;
  international_license_expiry?: string;
  
  // Status
  is_active: boolean;
  blacklisted: boolean;
  blacklist_reason?: string;
  blacklist_date?: string;
  rating: number;
  total_rentals: number;
  last_rental_date?: string;
  
  // Legacy compatibility properties
  nationalId: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  totalRentals: number;
  
  // Notes
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface UnifiedVehicle {
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
  
  // Owner
  owner_id?: string;
  owner?: VehicleOwner;
  
  // Administrative
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

export interface UnifiedContract {
  id: string;
  contract_number: string;
  customer_id: string;
  vehicle_id: string;
  customer_name: string;
  vehicle_info: string;
  start_date: string;
  end_date: string;
  daily_rate: number;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_method: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  deposit_amount?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemAlert {
  id: string;
  type: 'maintenance_due' | 'document_expiry' | 'payment_overdue' | 'contract_ending' | 'low_stock';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  entity_type: 'customer' | 'vehicle' | 'contract' | 'inventory';
  entity_id: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  total_customers: number;
  active_contracts: number;
  monthly_revenue: number;
  pending_maintenance: number;
  overdue_payments: number;
  expiring_documents: number;
}
