import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Image,
  Printer,
  Share2,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Customer } from '@/types/index';
import { useToast } from '@/hooks/use-toast';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExportUtilsProps {
  customers: Customer[];
  filteredCustomers: Customer[];
  selectedCustomers: string[];
  filters: any;
}

export function ExportUtils({ 
  customers, 
  filteredCustomers, 
  selectedCustomers, 
  filters 
}: ExportUtilsProps) {
  const [exportType, setExportType] = useState<'all' | 'filtered' | 'selected'>('filtered');
  const { toast } = useToast();

  const getExportData = () => {
    switch (exportType) {
      case 'all':
        return customers;
      case 'filtered':
        return filteredCustomers;
      case 'selected':
        return customers.filter(c => selectedCustomers.includes(c.id));
      default:
        return filteredCustomers;
    }
  };

  const exportToExcel = () => {
    const data = getExportData();
    
    const exportData = data.map((customer, index) => ({
      '#': index + 1,
      'الاسم': customer.name,
      'الاسم بالإنجليزية': customer.name_english || '',
      'رقم الهوية': customer.national_id,
      'الهاتف': customer.phone,
      'البريد الإلكتروني': customer.email || '',
      'المدينة': customer.city || '',
      'الحي': customer.district || '',
      'الجنسية': customer.nationality || '',
      'الجنس': customer.gender === 'male' ? 'ذكر' : 'أنثى',
      'الحالة الاجتماعية': customer.marital_status || '',
      'رقم الرخصة': customer.license_number,
      'انتهاء الرخصة': customer.license_expiry ? format(new Date(customer.license_expiry), 'yyyy-MM-dd') : '',
      'التقييم': customer.rating,
      'إجمالي الإيجارات': customer.total_rentals || 0,
      'الحالة': customer.is_active ? 'نشط' : 'غير نشط',
      'القائمة السوداء': customer.blacklisted ? 'نعم' : 'لا',
      'سبب القائمة السوداء': customer.blacklist_reason || '',
      'مصدر العميل': customer.customer_source || '',
      'طريقة الدفع المفضلة': customer.preferred_payment_method || '',
      'تاريخ التسجيل': customer.created_at ? format(new Date(customer.created_at), 'yyyy-MM-dd') : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'العملاء');

    // تحسين عرض الأعمدة
    const colWidths = [
      { wch: 5 },   // #
      { wch: 20 },  // الاسم
      { wch: 20 },  // الاسم بالإنجليزية
      { wch: 15 },  // رقم الهوية
      { wch: 15 },  // الهاتف
      { wch: 25 },  // البريد الإلكتروني
      { wch: 15 },  // المدينة
      { wch: 15 },  // الحي
      { wch: 12 },  // الجنسية
      { wch: 8 },   // الجنس
      { wch: 12 },  // الحالة الاجتماعية
      { wch: 15 },  // رقم الرخصة
      { wch: 12 },  // انتهاء الرخصة
      { wch: 8 },   // التقييم
      { wch: 10 },  // إجمالي الإيجارات
      { wch: 10 },  // الحالة
      { wch: 12 },  // القائمة السوداء
      { wch: 20 },  // سبب القائمة السوداء
      { wch: 15 },  // مصدر العميل
      { wch: 18 },  // طريقة الدفع المفضلة
      { wch: 12 },  // تاريخ التسجيل
    ];
    worksheet['!cols'] = colWidths;

    const fileName = `customers_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: 'تم التصدير بنجاح',
      description: `تم تصدير ${data.length} عميل إلى ملف Excel`,
    });
  };

  const exportToPDF = () => {
    const data = getExportData();
    
    const pdf = new jsPDF('l', 'mm', 'a4'); // landscape orientation
    
    // إضافة العنوان
    pdf.setFontSize(16);
    pdf.text('تقرير العملاء', 20, 20);
    
    // إضافة تاريخ التقرير
    pdf.setFontSize(10);
    pdf.text(`تاريخ التقرير: ${format(new Date(), 'yyyy-MM-dd HH:mm', { locale: ar })}`, 20, 30);
    pdf.text(`عدد العملاء: ${data.length}`, 20, 36);

    // إعداد البيانات للجدول
    const tableData = data.map((customer, index) => [
      index + 1,
      customer.name,
      customer.phone,
      customer.email || '',
      customer.city || '',
      customer.nationality || '',
      customer.rating,
      customer.total_rentals || 0,
      customer.is_active ? 'نشط' : 'غير نشط',
      customer.blacklisted ? 'نعم' : 'لا',
    ]);

    const tableHeaders = [
      '#',
      'الاسم',
      'الهاتف',
      'البريد الإلكتروني',
      'المدينة',
      'الجنسية',
      'التقييم',
      'الإيجارات',
      'الحالة',
      'ق.سوداء'
    ];

    // إنشاء الجدول
    pdf.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: 45,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: 255,
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { cellWidth: 10 }, // #
        1: { cellWidth: 40 }, // الاسم
        2: { cellWidth: 25 }, // الهاتف
        3: { cellWidth: 35 }, // البريد الإلكتروني
        4: { cellWidth: 20 }, // المدينة
        5: { cellWidth: 20 }, // الجنسية
        6: { cellWidth: 15 }, // التقييم
        7: { cellWidth: 15 }, // الإيجارات
        8: { cellWidth: 15 }, // الحالة
        9: { cellWidth: 15 }, // ق.سوداء
      },
    });

    const fileName = `customers_report_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
    pdf.save(fileName);

    toast({
      title: 'تم التصدير بنجاح',
      description: `تم تصدير ${data.length} عميل إلى ملف PDF`,
    });
  };

  const exportSummaryReport = () => {
    const data = getExportData();
    
    // حساب الإحصائيات
    const stats = {
      total: data.length,
      active: data.filter(c => c.is_active).length,
      inactive: data.filter(c => !c.is_active).length,
      blacklisted: data.filter(c => c.blacklisted).length,
      averageRating: data.reduce((sum, c) => sum + c.rating, 0) / data.length || 0,
      totalRentals: data.reduce((sum, c) => sum + (c.total_rentals || 0), 0),
      highRatedCustomers: data.filter(c => c.rating >= 4).length,
      repeatCustomers: data.filter(c => (c.total_rentals || 0) > 1).length,
    };

    // توزيع حسب المدن
    const cityDistribution = data.reduce((acc, customer) => {
      const city = customer.city || 'غير محدد';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // توزيع حسب الجنسية
    const nationalityDistribution = data.reduce((acc, customer) => {
      const nationality = customer.nationality || 'غير محدد';
      acc[nationality] = (acc[nationality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // العنوان الرئيسي
    pdf.setFontSize(18);
    pdf.text('تقرير ملخص العملاء', 20, 25);
    
    // تاريخ التقرير
    pdf.setFontSize(12);
    pdf.text(`تاريخ التقرير: ${format(new Date(), 'yyyy-MM-dd HH:mm', { locale: ar })}`, 20, 35);
    
    let yPosition = 50;
    
    // الإحصائيات العامة
    pdf.setFontSize(14);
    pdf.text('الإحصائيات العامة', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    const generalStats = [
      `إجمالي العملاء: ${stats.total}`,
      `العملاء النشطون: ${stats.active}`,
      `العملاء غير النشطين: ${stats.inactive}`,
      `العملاء في القائمة السوداء: ${stats.blacklisted}`,
      `متوسط التقييم: ${stats.averageRating.toFixed(1)}`,
      `إجمالي الإيجارات: ${stats.totalRentals}`,
      `العملاء عالي التقييم (4+ نجوم): ${stats.highRatedCustomers}`,
      `العملاء المتكررون: ${stats.repeatCustomers}`,
    ];
    
    generalStats.forEach(stat => {
      pdf.text(stat, 25, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
    
    // توزيع المدن
    pdf.setFontSize(14);
    pdf.text('توزيع العملاء حسب المدن', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    Object.entries(cityDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10) // أفضل 10 مدن
      .forEach(([city, count]) => {
        pdf.text(`${city}: ${count} عميل`, 25, yPosition);
        yPosition += 6;
      });
    
    yPosition += 10;
    
    // توزيع الجنسيات
    pdf.setFontSize(14);
    pdf.text('توزيع العملاء حسب الجنسية', 20, yPosition);
    yPosition += 10;
    
    pdf.setFontSize(10);
    Object.entries(nationalityDistribution)
      .sort(([,a], [,b]) => b - a)
      .forEach(([nationality, count]) => {
        pdf.text(`${nationality}: ${count} عميل`, 25, yPosition);
        yPosition += 6;
      });

    const fileName = `customers_summary_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
    pdf.save(fileName);

    toast({
      title: 'تم التصدير بنجاح',
      description: 'تم إنشاء التقرير الملخص بنجاح',
    });
  };

  const generateCustomReport = () => {
    // هذه ميزة للمستقبل - تقرير مخصص
    toast({
      title: 'ميزة قادمة',
      description: 'سيتم إضافة ميزة التقارير المخصصة قريباً',
    });
  };

  const getExportLabel = () => {
    switch (exportType) {
      case 'all':
        return `جميع العملاء (${customers.length})`;
      case 'filtered':
        return `العملاء المفلترة (${filteredCustomers.length})`;
      case 'selected':
        return `العملاء المحددة (${selectedCustomers.length})`;
      default:
        return 'العملاء';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">تصدير البيانات</h3>
        <p className="text-sm text-muted-foreground">
          صدّر بيانات العملاء بصيغ مختلفة وأنشئ تقارير مفصلة
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            خيارات التصدير
          </CardTitle>
          <CardDescription>
            اختر نوع البيانات المراد تصديرها والصيغة المطلوبة
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* اختيار نوع البيانات */}
          <div>
            <h4 className="font-medium mb-3">البيانات المراد تصديرها</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card 
                className={`cursor-pointer transition-colors ${
                  exportType === 'all' ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => setExportType('all')}
              >
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="font-medium">جميع العملاء</div>
                  <div className="text-sm text-muted-foreground">{customers.length} عميل</div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-colors ${
                  exportType === 'filtered' ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => setExportType('filtered')}
              >
                <CardContent className="p-4 text-center">
                  <Filter className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="font-medium">العملاء المفلترة</div>
                  <div className="text-sm text-muted-foreground">{filteredCustomers.length} عميل</div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-colors ${
                  exportType === 'selected' ? 'ring-2 ring-primary bg-primary/5' : ''
                } ${selectedCustomers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => selectedCustomers.length > 0 && setExportType('selected')}
              >
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="font-medium">العملاء المحددة</div>
                  <div className="text-sm text-muted-foreground">{selectedCustomers.length} عميل</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator />

          {/* أزرار التصدير */}
          <div>
            <h4 className="font-medium mb-3">صيغ التصدير</h4>
            <Tabs defaultValue="data" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="data">بيانات خام</TabsTrigger>
                <TabsTrigger value="reports">تقارير</TabsTrigger>
              </TabsList>

              <TabsContent value="data" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={exportToExcel}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    disabled={getExportData().length === 0}
                  >
                    <FileSpreadsheet className="h-8 w-8" />
                    <div>
                      <div className="font-medium">Excel</div>
                      <div className="text-xs opacity-80">جدول بيانات شامل</div>
                    </div>
                  </Button>

                  <Button
                    onClick={exportToPDF}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    disabled={getExportData().length === 0}
                  >
                    <FileText className="h-8 w-8" />
                    <div>
                      <div className="font-medium">PDF</div>
                      <div className="text-xs opacity-80">جدول للطباعة</div>
                    </div>
                  </Button>
                </div>

                <div className="text-center">
                  <Badge variant="secondary">
                    سيتم تصدير: {getExportLabel()}
                  </Badge>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={exportSummaryReport}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    disabled={getExportData().length === 0}
                  >
                    <BarChart3 className="h-8 w-8" />
                    <div>
                      <div className="font-medium">تقرير ملخص</div>
                      <div className="text-xs opacity-80">إحصائيات وتوزيعات</div>
                    </div>
                  </Button>

                  <Button
                    onClick={generateCustomReport}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    disabled={true}
                  >
                    <TrendingUp className="h-8 w-8" />
                    <div>
                      <div className="font-medium">تقرير مخصص</div>
                      <div className="text-xs opacity-80">قادم قريباً</div>
                    </div>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* إحصائيات سريعة */}
          {Object.keys(filters).length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3">الفلاتر المطبقة</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, value]) => (
                    value && (
                      <Badge key={key} variant="secondary">
                        {key}: {value.toString()}
                      </Badge>
                    )
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}