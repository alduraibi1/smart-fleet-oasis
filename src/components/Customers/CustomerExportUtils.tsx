
import * as XLSX from 'xlsx';
import { Customer } from '@/types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const exportCustomersToExcel = (customers: Customer[], filename?: string) => {
  try {
    const worksheetData = customers.map(customer => ({
      'الاسم': customer.name,
      'رقم الهاتف': customer.phone,
      'البريد الإلكتروني': customer.email || '',
      'رقم الهوية': customer.national_id || customer.nationalId || '',
      'الجنسية': customer.nationality || '',
      'المدينة': customer.city || '',
      'الحالة': customer.is_active ? 'نشط' : 'غير نشط',
      'القائمة السوداء': customer.blacklisted ? 'نعم' : 'لا',
      'التقييم': customer.rating || 0,
      'عدد الإيجارات': customer.total_rentals || 0,
      'تاريخ انتهاء الرخصة': customer.license_expiry 
        ? format(new Date(customer.license_expiry), 'dd/MM/yyyy', { locale: ar })
        : '',
      'تاريخ التسجيل': customer.created_at 
        ? format(new Date(customer.created_at), 'dd/MM/yyyy', { locale: ar })
        : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'العملاء');

    const fileName = filename || `customers_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return true;
  } catch (error) {
    console.error('Error exporting customers:', error);
    return false;
  }
};

export const exportCustomersPDF = async (customers: Customer[]) => {
  try {
    // استخدام dynamic import لتجنب مشاكل SSR
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    
    // إعداد الخط العربي (إذا كان متاحاً)
    doc.setFont('helvetica');
    
    // عنوان التقرير
    doc.setFontSize(16);
    doc.text('تقرير العملاء', 20, 20);
    
    // إعداد البيانات للجدول
    const tableData = customers.map(customer => [
      customer.name,
      customer.phone,
      customer.email || '',
      customer.is_active ? 'نشط' : 'غير نشط',
      customer.total_rentals || 0,
      customer.created_at 
        ? format(new Date(customer.created_at), 'dd/MM/yyyy')
        : ''
    ]);

    // إنشاء الجدول
    (doc as any).autoTable({
      head: [['الاسم', 'الهاتف', 'البريد', 'الحالة', 'الإيجارات', 'تاريخ التسجيل']],
      body: tableData,
      startY: 30,
      styles: {
        font: 'helvetica',
        fontSize: 10
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      }
    });

    const fileName = `customers_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);

    return true;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return false;
  }
};
