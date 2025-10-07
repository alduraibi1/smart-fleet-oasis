import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { Vehicle } from '@/types/vehicle';

// تصدير بتنسيق علم الأصلي
export const exportToElmFormat = (vehicles: Vehicle[], filename?: string) => {
  try {
    const worksheetData = vehicles.map(vehicle => ({
      'رقم اللوحة': vehicle.plate_number,
      'نوع التسجيل': vehicle.registration_type || '',
      'الماركة': vehicle.brand,
      'الطراز': vehicle.model,
      'سنة الصنع': vehicle.year,
      'اسم المالك': vehicle.owner?.name || '',
      'رقم الهوية': vehicle.owner?.national_id || '',
      'حالة الفحص': vehicle.inspection_status === 'valid' ? 'ساري' : 
                      vehicle.inspection_status === 'expired' ? 'منتهي' : 'قريب الانتهاء',
      'تاريخ انتهاء الفحص': vehicle.inspection_expiry 
        ? format(new Date(vehicle.inspection_expiry), 'dd/MM/yyyy', { locale: ar })
        : '',
      'حالة التأمين': vehicle.insurance_status === 'valid' ? 'ساري' : 
                       vehicle.insurance_status === 'expired' ? 'منتهي' : 'قريب الانتهاء',
      'تاريخ انتهاء التأمين': vehicle.insurance_expiry 
        ? format(new Date(vehicle.insurance_expiry), 'dd/MM/yyyy', { locale: ar })
        : '',
      'تاريخ انتهاء رخصة السير': vehicle.registration_expiry 
        ? format(new Date(vehicle.registration_expiry), 'dd/MM/yyyy', { locale: ar })
        : '',
      'رسوم التجديد': vehicle.renewal_fees || 0,
      'حالة التجديد': vehicle.renewal_status === 'active' ? 'نشط' : 
                       vehicle.renewal_status === 'pending' ? 'معلق' : 'متأخر',
      'الحالة': vehicle.status === 'available' ? 'متاح' :
                vehicle.status === 'rented' ? 'مؤجر' :
                vehicle.status === 'maintenance' ? 'صيانة' : 'خارج الخدمة',
      'السعر اليومي': vehicle.daily_rate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'المركبات');

    const fileName = filename || `elm_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return { success: true, count: vehicles.length };
  } catch (error) {
    console.error('Error exporting to Elm format:', error);
    return { success: false, error };
  }
};

// تصدير تقرير الانتهاءات القريبة
export const exportExpiringReport = (vehicles: Vehicle[], days: number = 30) => {
  try {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);

    const expiringVehicles = vehicles.filter(v => {
      const inspectionExpiry = v.inspection_expiry ? new Date(v.inspection_expiry) : null;
      const insuranceExpiry = v.insurance_expiry ? new Date(v.insurance_expiry) : null;
      const registrationExpiry = v.registration_expiry ? new Date(v.registration_expiry) : null;

      return (
        (inspectionExpiry && inspectionExpiry <= futureDate && inspectionExpiry >= today) ||
        (insuranceExpiry && insuranceExpiry <= futureDate && insuranceExpiry >= today) ||
        (registrationExpiry && registrationExpiry <= futureDate && registrationExpiry >= today)
      );
    });

    const worksheetData = expiringVehicles.map(vehicle => {
      const inspectionExpiry = vehicle.inspection_expiry ? new Date(vehicle.inspection_expiry) : null;
      const insuranceExpiry = vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry) : null;
      const registrationExpiry = vehicle.registration_expiry ? new Date(vehicle.registration_expiry) : null;

      const daysToInspection = inspectionExpiry 
        ? Math.ceil((inspectionExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const daysToInsurance = insuranceExpiry 
        ? Math.ceil((insuranceExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      const daysToRegistration = registrationExpiry 
        ? Math.ceil((registrationExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        'رقم اللوحة': vehicle.plate_number,
        'الماركة': vehicle.brand,
        'الطراز': vehicle.model,
        'تاريخ انتهاء الفحص': inspectionExpiry 
          ? format(inspectionExpiry, 'dd/MM/yyyy', { locale: ar })
          : '',
        'أيام متبقية للفحص': daysToInspection || '',
        'تاريخ انتهاء التأمين': insuranceExpiry 
          ? format(insuranceExpiry, 'dd/MM/yyyy', { locale: ar })
          : '',
        'أيام متبقية للتأمين': daysToInsurance || '',
        'تاريخ انتهاء رخصة السير': registrationExpiry 
          ? format(registrationExpiry, 'dd/MM/yyyy', { locale: ar })
          : '',
        'أيام متبقية لرخصة السير': daysToRegistration || '',
        'الحالة': vehicle.status === 'available' ? 'متاح' :
                  vehicle.status === 'rented' ? 'مؤجر' :
                  vehicle.status === 'maintenance' ? 'صيانة' : 'خارج الخدمة',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الانتهاءات القريبة');

    const fileName = `expiring_report_${days}_days_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return { success: true, count: expiringVehicles.length };
  } catch (error) {
    console.error('Error exporting expiring report:', error);
    return { success: false, error };
  }
};

// تصدير تقرير مخصص
export const exportCustomReport = (
  vehicles: Vehicle[], 
  selectedFields: string[],
  filename?: string
) => {
  try {
    const fieldMapping: Record<string, (v: Vehicle) => any> = {
      plate_number: (v) => v.plate_number,
      brand: (v) => v.brand,
      model: (v) => v.model,
      year: (v) => v.year,
      color: (v) => v.color,
      status: (v) => v.status === 'available' ? 'متاح' :
                     v.status === 'rented' ? 'مؤجر' :
                     v.status === 'maintenance' ? 'صيانة' : 'خارج الخدمة',
      daily_rate: (v) => v.daily_rate,
      mileage: (v) => v.mileage,
      vin: (v) => v.vin || '',
      owner_name: (v) => v.owner?.name || '',
      registration_type: (v) => v.registration_type || '',
      inspection_expiry: (v) => v.inspection_expiry 
        ? format(new Date(v.inspection_expiry), 'dd/MM/yyyy', { locale: ar })
        : '',
      insurance_expiry: (v) => v.insurance_expiry 
        ? format(new Date(v.insurance_expiry), 'dd/MM/yyyy', { locale: ar })
        : '',
      registration_expiry: (v) => v.registration_expiry 
        ? format(new Date(v.registration_expiry), 'dd/MM/yyyy', { locale: ar })
        : '',
      renewal_fees: (v) => v.renewal_fees || 0,
      fuel_type: (v) => v.fuel_type,
      transmission: (v) => v.transmission === 'automatic' ? 'أوتوماتيك' : 'يدوي',
      seating_capacity: (v) => v.seating_capacity,
    };

    const arabicHeaders: Record<string, string> = {
      plate_number: 'رقم اللوحة',
      brand: 'الماركة',
      model: 'الطراز',
      year: 'سنة الصنع',
      color: 'اللون',
      status: 'الحالة',
      daily_rate: 'السعر اليومي',
      mileage: 'الكيلومترات',
      vin: 'رقم الهيكل',
      owner_name: 'اسم المالك',
      registration_type: 'نوع التسجيل',
      inspection_expiry: 'تاريخ انتهاء الفحص',
      insurance_expiry: 'تاريخ انتهاء التأمين',
      registration_expiry: 'تاريخ انتهاء رخصة السير',
      renewal_fees: 'رسوم التجديد',
      fuel_type: 'نوع الوقود',
      transmission: 'ناقل الحركة',
      seating_capacity: 'عدد المقاعد',
    };

    const worksheetData = vehicles.map(vehicle => {
      const row: Record<string, any> = {};
      selectedFields.forEach(field => {
        const arabicHeader = arabicHeaders[field] || field;
        row[arabicHeader] = fieldMapping[field] ? fieldMapping[field](vehicle) : '';
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير مخصص');

    const fileName = filename || `custom_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return { success: true, count: vehicles.length };
  } catch (error) {
    console.error('Error exporting custom report:', error);
    return { success: false, error };
  }
};

// تصدير ملخص الأسطول
export const exportFleetSummary = (vehicles: Vehicle[]) => {
  try {
    // إحصائيات عامة
    const stats = {
      'إجمالي المركبات': vehicles.length,
      'متاح': vehicles.filter(v => v.status === 'available').length,
      'مؤجر': vehicles.filter(v => v.status === 'rented').length,
      'صيانة': vehicles.filter(v => v.status === 'maintenance').length,
      'خارج الخدمة': vehicles.filter(v => v.status === 'out_of_service').length,
      'متوسط السعر اليومي': Math.round(vehicles.reduce((sum, v) => sum + v.daily_rate, 0) / vehicles.length),
    };

    // إحصائيات حسب الماركة
    const brandStats = vehicles.reduce((acc, v) => {
      acc[v.brand] = (acc[v.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // الانتهاءات القريبة
    const today = new Date();
    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);

    const expiringInspections = vehicles.filter(v => {
      const expiry = v.inspection_expiry ? new Date(v.inspection_expiry) : null;
      return expiry && expiry <= next30Days && expiry >= today;
    }).length;

    const expiringInsurance = vehicles.filter(v => {
      const expiry = v.insurance_expiry ? new Date(v.insurance_expiry) : null;
      return expiry && expiry <= next30Days && expiry >= today;
    }).length;

    const expiringRegistration = vehicles.filter(v => {
      const expiry = v.registration_expiry ? new Date(v.registration_expiry) : null;
      return expiry && expiry <= next30Days && expiry >= today;
    }).length;

    // إنشاء ملف Excel متعدد الأوراق
    const workbook = XLSX.utils.book_new();

    // ورقة الإحصائيات العامة
    const statsData = Object.entries(stats).map(([key, value]) => ({
      'البيان': key,
      'العدد/القيمة': value
    }));
    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'الإحصائيات العامة');

    // ورقة التوزيع حسب الماركة
    const brandData = Object.entries(brandStats).map(([brand, count]) => ({
      'الماركة': brand,
      'العدد': count
    }));
    const brandSheet = XLSX.utils.json_to_sheet(brandData);
    XLSX.utils.book_append_sheet(workbook, brandSheet, 'حسب الماركة');

    // ورقة الانتهاءات القريبة
    const expiringData = [
      { 'النوع': 'فحوصات قريبة الانتهاء', 'العدد': expiringInspections },
      { 'النوع': 'تأمينات قريبة الانتهاء', 'العدد': expiringInsurance },
      { 'النوع': 'رخص سير قريبة الانتهاء', 'العدد': expiringRegistration },
    ];
    const expiringSheet = XLSX.utils.json_to_sheet(expiringData);
    XLSX.utils.book_append_sheet(workbook, expiringSheet, 'الانتهاءات القريبة');

    const fileName = `fleet_summary_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return { success: true, count: vehicles.length };
  } catch (error) {
    console.error('Error exporting fleet summary:', error);
    return { success: false, error };
  }
};
