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
  emergency_contact_phone_secondary?: string;
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
  
  // Legacy compatibility properties (for existing components)
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

// Form data type for the dialog
export interface CustomerFormData {
  // Basic Info
  name: string;
  phone: string;
  email: string;
  national_id: string;
  nationality: string;
  gender: string;
  marital_status: string;
  date_of_birth: string;
  
  // Address
  city: string;
  address: string;
  country: string;
  district: string;
  postal_code: string;
  address_type: string;
  
  // License
  license_number: string;
  license_expiry: string;
  license_type: string;
  license_issue_date: string;
  international_license: boolean;
  international_license_expiry: string;
  
  // Emergency Contact
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_phone_secondary: string;
  emergency_contact_relation: string;
  
  // Guarantor Info
  guarantor_name?: string;
  guarantor_national_id?: string;
  guarantor_phone?: string;
  guarantor_relation?: string;
  guarantor_job_title?: string;
  guarantor_monthly_income?: number;
  guarantor_address?: string;
  
  // Work Info
  customer_source: string;
  job_title: string;
  company: string;
  work_phone: string;
  monthly_income: number;
  
  // Banking
  bank_name: string;
  bank_account_number: string;
  credit_limit: number;
  payment_terms: string;
  preferred_payment_method: string;
  
  // Insurance
  has_insurance: boolean;
  insurance_company: string;
  insurance_policy_number: string;
  insurance_expiry: string;
  
  // Documents
  license_document?: string;
  residence_document?: string;
  residence_expiry?: string;
  national_id_document?: string;
  passport_document?: string;
  passport_expiry?: string;
  
  // Preferences
  preferred_language: string;
  marketing_consent: boolean;
  sms_notifications: boolean;
  email_notifications: boolean;
  
  // Notes
  notes: string;
}

export const defaultCustomerFormData: CustomerFormData = {
  // Basic Info
  name: '',
  phone: '',
  email: '',
  national_id: '',
  nationality: 'سعودي',
  gender: 'male',
  marital_status: 'single',
  date_of_birth: '',
  
  // Address
  city: '',
  address: '',
  country: 'السعودية',
  district: '',
  postal_code: '',
  address_type: 'residential',
  
  // License
  license_number: '',
  license_expiry: '',
  license_type: 'private',
  license_issue_date: '',
  international_license: false,
  international_license_expiry: '',
  
  // Emergency Contact
  emergency_contact_name: '',
  emergency_contact_phone: '',
  emergency_contact_phone_secondary: '',
  emergency_contact_relation: '',
  
  // Guarantor Info
  guarantor_name: '',
  guarantor_national_id: '',
  guarantor_phone: '',
  guarantor_relation: '',
  guarantor_job_title: '',
  guarantor_monthly_income: 0,
  guarantor_address: '',
  
  // Work Info
  customer_source: 'website',
  job_title: '',
  company: '',
  work_phone: '',
  monthly_income: 0,
  
  // Banking
  bank_name: '',
  bank_account_number: '',
  credit_limit: 0,
  payment_terms: 'immediate',
  preferred_payment_method: 'cash',
  
  // Insurance
  has_insurance: false,
  insurance_company: '',
  insurance_policy_number: '',
  insurance_expiry: '',
  
  // Documents
  license_document: '',
  residence_document: '',
  residence_expiry: '',
  national_id_document: '',
  passport_document: '',
  passport_expiry: '',
  
  // Preferences
  preferred_language: 'ar',
  marketing_consent: false,
  sms_notifications: true,
  email_notifications: true,
  
  // Notes
  notes: ''
};

export interface CustomerFilters {
  search?: string;
  rating?: number;
  status?: 'active' | 'inactive' | 'all';
  blacklisted?: boolean;
  license_expiry?: 'all' | 'valid' | 'expiring' | 'expired';
  city?: string;
  customer_source?: string;
  nationality?: string;
  gender?: string;
  marital_status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  dateRange?: { from?: Date; to?: Date };
}
