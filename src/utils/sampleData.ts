
import { supabase } from '@/integrations/supabase/client';

// بيانات تجريبية للعملاء
const sampleCustomers = [
  {
    name: 'أحمد محمد الأحمد',
    name_english: 'Ahmed Mohammed Al-Ahmed',
    phone: '0501234567',
    phone_secondary: '0112345678',
    email: 'ahmed@example.com',
    national_id: '1234567890',
    license_number: 'LIC123456',
    license_expiry: '2025-12-31',
    date_of_birth: '1985-05-15',
    nationality: 'سعودي',
    job_title: 'مهندس',
    monthly_income: 15000,
    address: 'الرياض، حي النزهة، شارع الملك فهد',
    city: 'الرياض',
    district: 'النزهة',
    postal_code: '12345',
    country: 'السعودية'
  },
  {
    name: 'فاطمة علي السالم',
    name_english: 'Fatima Ali Al-Salem',
    phone: '0509876543',
    email: 'fatima@example.com',
    national_id: '0987654321',
    license_number: 'LIC789012',
    license_expiry: '2024-08-20',
    date_of_birth: '1990-03-22',
    nationality: 'سعودي',
    job_title: 'معلمة',
    monthly_income: 12000,
    address: 'جدة، حي الروضة، شارع الأمير محمد',
    city: 'جدة',
    district: 'الروضة',
    postal_code: '21461',
    country: 'السعودية'
  },
  {
    name: 'خالد عبدالعزيز المطيري',
    name_english: 'Khalid Abdulaziz Al-Mutairi',
    phone: '0555555555',
    phone_secondary: '0133333333',
    email: 'khalid@example.com',
    national_id: '1122334455',
    license_number: 'LIC345678',
    license_expiry: '2026-01-15',
    date_of_birth: '1982-11-10',
    nationality: 'سعودي',
    job_title: 'طبيب',
    monthly_income: 25000,
    address: 'الدمام، حي الفيصلية، شارع الخليج',
    city: 'الدمام',
    district: 'الفيصلية',
    postal_code: '31411',
    country: 'السعودية'
  }
];

// بيانات تجريبية لملاك المركبات
const sampleOwners = [
  {
    name: 'شركة الأسطول الذهبي',
    name_english: 'Golden Fleet Company',
    phone: '0112223333',
    email: 'info@goldenfleet.com',
    national_id: '7001234567',
    license_number: 'CR7001234567',
    commission_rate: 70,
    payment_terms: 'شهري',
    bank_name: 'البنك الأهلي',
    account_number: '123456789',
    address: 'الرياض، حي العليا، برج الأعمال',
    city: 'الرياض',
    country: 'السعودية'
  },
  {
    name: 'مؤسسة النقل المتطور',
    name_english: 'Advanced Transport Est.',
    phone: '0501112222',
    email: 'contact@advancedtransport.com',
    national_id: '7009876543',
    license_number: 'CR7009876543',
    commission_rate: 65,
    payment_terms: 'أسبوعي',
    bank_name: 'بنك الراجحي',
    account_number: '987654321',
    address: 'جدة، حي المروة، مجمع التجارة',
    city: 'جدة',
    country: 'السعودية'
  }
];

// بيانات تجريبية للمركبات
const sampleVehicles = [
  {
    plate_number: 'ا ب ج 1234',
    brand: 'تويوتا',
    model: 'كامري',
    year: 2022,
    color: 'أبيض',
    status: 'available' as const,
    daily_rate: 150,
    mileage: 25000,
    vin: '1HGBH41JXMN109186',
    engine_number: 'ENG123456',
    chassis_number: 'CHS789012',
    fuel_type: 'gasoline' as const,
    transmission: 'automatic' as const,
    seating_capacity: 5,
    registration_expiry: '2024-12-31',
    notes: 'مركبة في حالة ممتازة'
  },
  {
    plate_number: 'د هـ و 5678',
    brand: 'هونداي',
    model: 'إلنترا',
    year: 2021,
    color: 'فضي',
    status: 'rented' as const,
    daily_rate: 120,
    mileage: 35000,
    vin: '2HGBH41JXMN109187',
    engine_number: 'ENG789012',
    chassis_number: 'CHS345678',
    fuel_type: 'gasoline' as const,
    transmission: 'automatic' as const,
    seating_capacity: 5,
    registration_expiry: '2024-08-15',
    notes: 'تحتاج صيانة دورية قريباً'
  },
  {
    plate_number: 'ز ح ط 9999',
    brand: 'نيسان',
    model: 'التيما',
    year: 2023,
    color: 'أسود',
    status: 'maintenance' as const,
    daily_rate: 180,
    mileage: 15000,
    vin: '3HGBH41JXMN109188',
    engine_number: 'ENG345678',
    chassis_number: 'CHS901234',
    fuel_type: 'gasoline' as const,
    transmission: 'automatic' as const,
    seating_capacity: 5,
    registration_expiry: '2025-06-30',
    notes: 'في الصيانة الدورية'
  },
  {
    plate_number: 'ي ك ل 7777',
    brand: 'كيا',
    model: 'أوبتيما',
    year: 2020,
    color: 'أحمر',
    status: 'available' as const,
    daily_rate: 100,
    mileage: 45000,
    vin: '4HGBH41JXMN109189',
    engine_number: 'ENG567890',
    chassis_number: 'CHS567890',
    fuel_type: 'gasoline' as const,
    transmission: 'manual' as const,
    seating_capacity: 5,
    registration_expiry: '2024-10-20',
    notes: 'مركبة اقتصادية'
  },
  {
    plate_number: 'م ن س 3333',
    brand: 'فورد',
    model: 'فوكس',
    year: 2019,
    color: 'أزرق',
    status: 'out_of_service' as const,
    daily_rate: 90,
    mileage: 60000,
    vin: '5HGBH41JXMN109190',
    engine_number: 'ENG678901',
    chassis_number: 'CHS678901',
    fuel_type: 'gasoline' as const,
    transmission: 'manual' as const,
    seating_capacity: 5,
    registration_expiry: '2024-03-10',
    notes: 'خارج الخدمة - تحتاج إصلاحات كبيرة'
  }
];

// بيانات تجريبية للميكانيكيين
const sampleMechanics = [
  {
    name: 'محمد أحمد الفني',
    employee_id: 'MECH001',
    phone: '0501111111',
    email: 'mohammed@workshop.com',
    specializations: ['محركات', 'كهرباء'],
    hourly_rate: 50,
    hire_date: '2020-01-15'
  },
  {
    name: 'علي سالم المختص',
    employee_id: 'MECH002',
    phone: '0502222222',
    email: 'ali@workshop.com',
    specializations: ['فرامل', 'تكييف'],
    hourly_rate: 45,
    hire_date: '2021-03-10'
  }
];

// بيانات تجريبية للموردين
const sampleSuppliers = [
  {
    name: 'مؤسسة قطع الغيار الحديثة',
    contact_person: 'أحمد المدير',
    email: 'parts@modern.com',
    phone: '0112345678',
    address: 'الرياض، حي الصناعية، شارع الصناعات',
    tax_number: 'VAT123456789',
    payment_terms: 'الدفع خلال 30 يوم',
    rating: 4.5
  },
  {
    name: 'شركة الزيوت المتقدمة',
    contact_person: 'فاطمة المسؤولة',
    email: 'oils@advanced.com',
    phone: '0509876543',
    address: 'جدة، حي المستودعات، طريق الملك عبدالعزيز',
    tax_number: 'VAT987654321',
    payment_terms: 'الدفع عند التسليم',
    rating: 4.8
  }
];

// بيانات تجريبية لمواد المخزون
const sampleInventoryItems = [
  {
    name: 'زيت محرك 5W-30',
    description: 'زيت محرك عالي الجودة للسيارات الحديثة',
    sku: 'OIL-5W30-001',
    barcode: '1234567890123',
    part_number: 'ENG-OIL-001',
    unit_of_measure: 'liter',
    unit_cost: 25,
    selling_price: 35,
    current_stock: 50,
    minimum_stock: 10,
    maximum_stock: 100,
    reorder_point: 15,
    location: 'المستودع الرئيسي - الرف A1'
  },
  {
    name: 'فلتر هواء',
    description: 'فلتر هواء أصلي للمحركات',
    sku: 'FILTER-AIR-001',
    barcode: '2345678901234',
    part_number: 'AIR-FLT-001',
    unit_of_measure: 'piece',
    unit_cost: 15,
    selling_price: 25,
    current_stock: 30,
    minimum_stock: 5,
    maximum_stock: 50,
    reorder_point: 8,
    location: 'المستودع الرئيسي - الرف B2'
  },
  {
    name: 'إطار 195/65R15',
    description: 'إطار عالي الجودة للسيارات الصغيرة',
    sku: 'TIRE-195-65-15',
    barcode: '3456789012345',
    part_number: 'TIRE-001',
    unit_of_measure: 'piece',
    unit_cost: 200,
    selling_price: 280,
    current_stock: 20,
    minimum_stock: 4,
    maximum_stock: 40,
    reorder_point: 6,
    location: 'مستودع الإطارات - الرف T1'
  }
];

// دالة لإدراج البيانات التجريبية
export const insertSampleData = async () => {
  try {
    console.log('بدء إدراج البيانات التجريبية...');

    // إدراج العملاء
    console.log('إدراج العملاء...');
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .insert(sampleCustomers)
      .select();
    
    if (customersError) {
      console.error('خطأ في إدراج العملاء:', customersError);
    } else {
      console.log('تم إدراج العملاء بنجاح:', customersData?.length);
    }

    // إدراج ملاك المركبات
    console.log('إدراج ملاك المركبات...');
    const { data: ownersData, error: ownersError } = await supabase
      .from('vehicle_owners')
      .insert(sampleOwners)
      .select();
    
    if (ownersError) {
      console.error('خطأ في إدراج ملاك المركبات:', ownersError);
    } else {
      console.log('تم إدراج ملاك المركبات بنجاح:', ownersData?.length);
    }

    // إدراج المركبات (مع ربطها بالملاك)
    console.log('إدراج المركبات...');
    const vehiclesWithOwners = sampleVehicles.map((vehicle, index) => ({
      ...vehicle,
      owner_id: ownersData?.[index % (ownersData?.length || 1)]?.id
    }));

    const { data: vehiclesData, error: vehiclesError } = await supabase
      .from('vehicles')
      .insert(vehiclesWithOwners)
      .select();
    
    if (vehiclesError) {
      console.error('خطأ في إدراج المركبات:', vehiclesError);
    } else {
      console.log('تم إدراج المركبات بنجاح:', vehiclesData?.length);
    }

    // إدراج الميكانيكيين
    console.log('إدراج الميكانيكيين...');
    const { data: mechanicsData, error: mechanicsError } = await supabase
      .from('mechanics')
      .insert(sampleMechanics)
      .select();
    
    if (mechanicsError) {
      console.error('خطأ في إدراج الميكانيكيين:', mechanicsError);
    } else {
      console.log('تم إدراج الميكانيكيين بنجاح:', mechanicsData?.length);
    }

    // إدراج الموردين
    console.log('إدراج الموردين...');
    const { data: suppliersData, error: suppliersError } = await supabase
      .from('suppliers')
      .insert(sampleSuppliers)
      .select();
    
    if (suppliersError) {
      console.error('خطأ في إدراج الموردين:', suppliersError);
    } else {
      console.log('تم إدراج الموردين بنجاح:', suppliersData?.length);
    }

    // إدراج مواد المخزون (مع ربطها بالموردين)
    console.log('إدراج مواد المخزون...');
    const inventoryWithSuppliers = sampleInventoryItems.map((item, index) => ({
      ...item,
      supplier_id: suppliersData?.[index % (suppliersData?.length || 1)]?.id
    }));

    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory_items')
      .insert(inventoryWithSuppliers)
      .select();
    
    if (inventoryError) {
      console.error('خطأ في إدراج مواد المخزون:', inventoryError);
    } else {
      console.log('تم إدراج مواد المخزون بنجاح:', inventoryData?.length);
    }

    // إنشاء بعض العقود التجريبية
    if (customersData && vehiclesData) {
      console.log('إنشاء العقود التجريبية...');
      const sampleContracts = [
        {
          contract_number: 'CR-2024-0001',
          customer_id: customersData[0].id,
          vehicle_id: vehiclesData[1].id, // المركبة المؤجرة
          start_date: '2024-01-15',
          end_date: '2024-02-15',
          daily_rate: 120,
          total_amount: 3600,
          deposit_amount: 500,
          insurance_amount: 200,
          paid_amount: 700,
          remaining_amount: 2900,
          payment_method: 'cash',
          payment_status: 'partial',
          status: 'active',
          pickup_location: 'الرياض - المكتب الرئيسي',
          return_location: 'الرياض - المكتب الرئيسي',
          mileage_start: 34500,
          fuel_level_start: 'full',
          notes: 'عقد تجريبي للعميل أحمد'
        },
        {
          contract_number: 'CR-2024-0002',
          customer_id: customersData[1].id,
          vehicle_id: vehiclesData[0].id,
          start_date: '2024-01-10',
          end_date: '2024-01-25',
          actual_return_date: '2024-01-25',
          daily_rate: 150,
          total_amount: 2250,
          deposit_amount: 300,
          insurance_amount: 150,
          paid_amount: 2250,
          remaining_amount: 0,
          payment_method: 'bank_transfer',
          payment_status: 'paid',
          status: 'completed',
          pickup_location: 'جدة - فرع الروضة',
          return_location: 'جدة - فرع الروضة',
          mileage_start: 24500,
          mileage_end: 24800,
          fuel_level_start: 'full',
          fuel_level_end: 'half',
          notes: 'عقد مكتمل - تم الإرجاع بنجاح'
        }
      ];

      const { error: contractsError } = await supabase
        .from('rental_contracts')
        .insert(sampleContracts);
      
      if (contractsError) {
        console.error('خطأ في إدراج العقود:', contractsError);
      } else {
        console.log('تم إدراج العقود بنجاح');
      }
    }

    console.log('تم الانتهاء من إدراج جميع البيانات التجريبية بنجاح!');
    return { success: true, message: 'تم إدراج البيانات التجريبية بنجاح' };

  } catch (error) {
    console.error('خطأ عام في إدراج البيانات:', error);
    return { success: false, message: 'حدث خطأ في إدراج البيانات', error };
  }
};

// دالة لحذف جميع البيانات التجريبية
export const clearSampleData = async () => {
  try {
    console.log('بدء حذف البيانات التجريبية...');

    // حذف العقود أولاً (لأنها مرتبطة بالعملاء والمركبات)
    await supabase.from('rental_contracts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // حذف المركبات
    await supabase.from('vehicles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // حذف العملاء
    await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // حذف ملاك المركبات
    await supabase.from('vehicle_owners').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // حذف الميكانيكيين
    await supabase.from('mechanics').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // حذف الموردين
    await supabase.from('suppliers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // حذف مواد المخزون
    await supabase.from('inventory_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('تم حذف جميع البيانات التجريبية بنجاح');
    return { success: true, message: 'تم حذف البيانات التجريبية بنجاح' };

  } catch (error) {
    console.error('خطأ في حذف البيانات:', error);
    return { success: false, message: 'حدث خطأ في حذف البيانات', error };
  }
};
