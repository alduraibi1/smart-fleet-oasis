
import { CustomerFormData, Customer } from '@/types/customer';

// Convert form data to database format
export const convertFormDataToDatabase = (formData: CustomerFormData) => {
  return {
    // Basic Info
    name: formData.name.trim(),
    phone: formData.phone.trim(),
    email: formData.email.trim() || null,
    national_id: formData.national_id.trim(),
    nationality: formData.nationality || 'سعودي',
    
    // Address
    city: formData.city.trim() || null,
    address: formData.address.trim() || null,
    country: formData.country || 'السعودية',
    district: formData.district.trim() || null,
    postal_code: formData.postal_code.trim() || null,
    address_type: formData.address_type || 'residential',
    
    // License
    license_number: formData.license_number.trim() || null,
    license_expiry: formData.license_expiry || null,
    license_type: formData.license_type || 'private',
    license_issue_date: formData.license_issue_date || null,
    international_license: formData.international_license || false,
    international_license_expiry: formData.international_license_expiry || null,
    
    // Personal Info
    gender: formData.gender || 'male',
    marital_status: formData.marital_status || 'single',
    date_of_birth: formData.date_of_birth || null,
    
    // Preferences
    preferred_language: formData.preferred_language || 'ar',
    marketing_consent: formData.marketing_consent || false,
    sms_notifications: formData.sms_notifications !== false,
    email_notifications: formData.email_notifications !== false,
    
    // Work Info
    customer_source: formData.customer_source || 'website',
    job_title: formData.job_title.trim() || null,
    company: formData.company.trim() || null,
    work_phone: formData.work_phone.trim() || null,
    monthly_income: formData.monthly_income || 0,
    
    // Banking
    bank_name: formData.bank_name.trim() || null,
    bank_account_number: formData.bank_account_number.trim() || null,
    credit_limit: formData.credit_limit || 0,
    payment_terms: formData.payment_terms || 'immediate',
    preferred_payment_method: formData.preferred_payment_method || 'cash',
    
    // Emergency Contact
    emergency_contact_name: formData.emergency_contact_name.trim() || null,
    emergency_contact_phone: formData.emergency_contact_phone.trim() || null,
    emergency_contact_relation: formData.emergency_contact_relation.trim() || null,
    
    // Insurance
    has_insurance: formData.has_insurance || false,
    insurance_company: formData.insurance_company.trim() || null,
    insurance_policy_number: formData.insurance_policy_number.trim() || null,
    insurance_expiry: formData.insurance_expiry || null,
    
    // Notes
    notes: formData.notes.trim() || null,
    
    // Default values
    is_active: true,
    blacklisted: false,
    rating: 5,
    total_rentals: 0
  };
};

// Convert database data to display format
export const convertDatabaseToCustomer = (data: any): Customer => {
  return {
    id: data.id,
    name: data.name || '',
    phone: data.phone || '',
    email: data.email || '',
    national_id: data.national_id || '',
    nationality: data.nationality || 'سعودي',
    city: data.city || '',
    address: data.address || '',
    
    license_number: data.license_number || '',
    license_expiry: data.license_expiry,
    license_type: data.license_type || 'private',
    license_issue_date: data.license_issue_date,
    
    gender: data.gender || 'male',
    marital_status: data.marital_status || 'single',
    date_of_birth: data.date_of_birth,
    
    country: data.country || 'السعودية',
    district: data.district || '',
    postal_code: data.postal_code || '',
    address_type: data.address_type || 'residential',
    
    preferred_language: data.preferred_language || 'ar',
    marketing_consent: data.marketing_consent || false,
    sms_notifications: data.sms_notifications !== false,
    email_notifications: data.email_notifications !== false,
    
    customer_source: data.customer_source || 'website',
    job_title: data.job_title || '',
    company: data.company || '',
    work_phone: data.work_phone || '',
    monthly_income: data.monthly_income || 0,
    
    bank_name: data.bank_name || '',
    bank_account_number: data.bank_account_number || '',
    credit_limit: data.credit_limit || 0,
    payment_terms: data.payment_terms || 'immediate',
    preferred_payment_method: data.preferred_payment_method || 'cash',
    
    emergency_contact_name: data.emergency_contact_name || '',
    emergency_contact_phone: data.emergency_contact_phone || '',
    emergency_contact_relation: data.emergency_contact_relation || '',
    
    has_insurance: data.has_insurance || false,
    insurance_company: data.insurance_company || '',
    insurance_policy_number: data.insurance_policy_number || '',
    insurance_expiry: data.insurance_expiry,
    
    international_license: data.international_license || false,
    international_license_expiry: data.international_license_expiry,
    
    is_active: data.is_active ?? true,
    blacklisted: data.blacklisted || false,
    blacklist_reason: data.blacklist_reason || '',
    blacklist_date: data.blacklist_date || '',
    rating: data.rating || 5,
    total_rentals: data.total_rentals || 0,
    last_rental_date: data.last_rental_date,
    
    notes: data.notes || '',
    
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

// Convert customer to form data for editing
export const convertCustomerToFormData = (customer: Customer): CustomerFormData => {
  return {
    name: customer.name,
    phone: customer.phone,
    email: customer.email || '',
    national_id: customer.national_id,
    nationality: customer.nationality,
    city: customer.city || '',
    address: customer.address || '',
    license_number: customer.license_number || '',
    license_expiry: customer.license_expiry ? customer.license_expiry.split('T')[0] : '',
    license_type: customer.license_type,
    license_issue_date: customer.license_issue_date ? customer.license_issue_date.split('T')[0] : '',
    gender: customer.gender,
    marital_status: customer.marital_status,
    date_of_birth: customer.date_of_birth ? customer.date_of_birth.split('T')[0] : '',
    country: customer.country,
    district: customer.district || '',
    postal_code: customer.postal_code || '',
    address_type: customer.address_type,
    preferred_language: customer.preferred_language,
    marketing_consent: customer.marketing_consent,
    sms_notifications: customer.sms_notifications,
    email_notifications: customer.email_notifications,
    customer_source: customer.customer_source,
    job_title: customer.job_title || '',
    company: customer.company || '',
    work_phone: customer.work_phone || '',
    monthly_income: customer.monthly_income || 0,
    bank_name: customer.bank_name || '',
    bank_account_number: customer.bank_account_number || '',
    credit_limit: customer.credit_limit || 0,
    payment_terms: customer.payment_terms,
    preferred_payment_method: customer.preferred_payment_method,
    emergency_contact_name: customer.emergency_contact_name || '',
    emergency_contact_phone: customer.emergency_contact_phone || '',
    emergency_contact_relation: customer.emergency_contact_relation || '',
    has_insurance: customer.has_insurance,
    insurance_company: customer.insurance_company || '',
    insurance_policy_number: customer.insurance_policy_number || '',
    insurance_expiry: customer.insurance_expiry ? customer.insurance_expiry.split('T')[0] : '',
    international_license: customer.international_license,
    international_license_expiry: customer.international_license_expiry ? customer.international_license_expiry.split('T')[0] : '',
    notes: customer.notes || ''
  };
};

// Validate required fields
export const validateCustomerData = (formData: CustomerFormData): string[] => {
  const errors: string[] = [];
  
  if (!formData.name.trim()) {
    errors.push('الاسم مطلوب');
  }
  
  if (!formData.phone.trim()) {
    errors.push('رقم الهاتف مطلوب');
  } else if (!/^05\d{8}$/.test(formData.phone.trim())) {
    errors.push('رقم الهاتف يجب أن يبدأ بـ 05 ويكون 10 أرقام');
  }
  
  if (!formData.national_id.trim()) {
    errors.push('رقم الهوية مطلوب');
  } else if (!/^\d{10}$/.test(formData.national_id.trim())) {
    errors.push('رقم الهوية يجب أن يكون 10 أرقام');
  }
  
  if (formData.email && formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email.trim())) {
    errors.push('البريد الإلكتروني غير صحيح');
  }
  
  return errors;
};
