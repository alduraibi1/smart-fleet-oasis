
// Clean and unified Customer types
export interface Customer {
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
  
  // Notes
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Form data type for the dialog
export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  national_id: string;
  nationality: string;
  city: string;
  address: string;
  license_number: string;
  license_expiry: string;
  license_type: string;
  license_issue_date: string;
  gender: string;
  marital_status: string;
  date_of_birth: string;
  country: string;
  district: string;
  postal_code: string;
  address_type: string;
  preferred_language: string;
  marketing_consent: boolean;
  sms_notifications: boolean;
  email_notifications: boolean;
  customer_source: string;
  job_title: string;
  company: string;
  work_phone: string;
  monthly_income: number;
  bank_name: string;
  bank_account_number: string;
  credit_limit: number;
  payment_terms: string;
  preferred_payment_method: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  has_insurance: boolean;
  insurance_company: string;
  insurance_policy_number: string;
  insurance_expiry: string;
  international_license: boolean;
  international_license_expiry: string;
  notes: string;
}

// Default form values
export const defaultCustomerFormData: CustomerFormData = {
  name: '',
  phone: '',
  email: '',
  national_id: '',
  nationality: 'سعودي',
  city: '',
  address: '',
  license_number: '',
  license_expiry: '',
  license_type: 'private',
  license_issue_date: '',
  gender: 'male',
  marital_status: 'single',
  date_of_birth: '',
  country: 'السعودية',
  district: '',
  postal_code: '',
  address_type: 'residential',
  preferred_language: 'ar',
  marketing_consent: false,
  sms_notifications: true,
  email_notifications: true,
  customer_source: 'website',
  job_title: '',
  company: '',
  work_phone: '',
  monthly_income: 0,
  bank_name: '',
  bank_account_number: '',
  credit_limit: 0,
  payment_terms: 'immediate',
  preferred_payment_method: 'cash',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_relation: '',
  has_insurance: false,
  insurance_company: '',
  insurance_policy_number: '',
  insurance_expiry: '',
  international_license: false,
  international_license_expiry: '',
  notes: ''
};

export interface CustomerFilters {
  search?: string;
  rating?: number;
  status?: 'active' | 'inactive';
  blacklisted?: boolean;
  license_expiry?: 'all' | 'valid' | 'expiring' | 'expired';
  city?: string;
  customer_source?: string;
  nationality?: string;
  gender?: string;
  marital_status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
