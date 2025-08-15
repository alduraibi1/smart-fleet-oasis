
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, Table } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ExportControlsProps {
  data: any;
  reportType: 'vehicle' | 'owner' | 'customer';
  title: string;
}

export function ExportControls({ data, reportType, title }: ExportControlsProps) {
  const { toast } = useToast();

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // إضافة العنوان
      doc.setFontSize(16);
      doc.text(title, 20, 20);
      doc.setFontSize(12);
      doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}`, 20, 30);

      // إعداد البيانات للجدول
      let tableData = [];
      let headers = [];

      if (reportType === 'vehicle' && data) {
        headers = ['المؤشر', 'القيمة'];
        tableData = [
          ['إجمالي الإيرادات', `${data.total_revenue.toLocaleString()} ريال`],
          ['إجمالي المصروفات', `${data.total_expenses.toLocaleString()} ريال`],
          ['صافي الربح', `${data.net_profit.toLocaleString()} ريال`],
          ['هامش الربح', `${data.profit_margin?.toFixed(1)}%`],
          ['معدل الاستخدام', `${data.utilization_rate?.toFixed(1)}%`],
          ['أيام التأجير', `${data.total_rental_days} يوم`],
          ['المعدل اليومي', `${data.average_daily_rate?.toLocaleString()} ريال`]
        ];
      } else if (reportType === 'owner' && data) {
        headers = ['المؤشر', 'القيمة'];
        tableData = [
          ['عدد المركبات', `${data.vehicle_count}`],
          ['إجمالي الإيرادات', `${data.total_revenue.toLocaleString()} ريال`],
          ['حصة المالك', `${data.owner_share.toLocaleString()} ريال`],
          ['حصة الشركة', `${data.company_share.toLocaleString()} ريال`],
          ['صافي الربح', `${data.net_profit.toLocaleString()} ريال`],
          ['هامش الربح', `${data.profit_margin?.toFixed(1)}%`],
          ['متوسط الإيراد للمركبة', `${data.avg_revenue_per_vehicle?.toLocaleString()} ريال`]
        ];
      } else if (reportType === 'customer' && data) {
        headers = ['المؤشر', 'القيمة'];
        tableData = [
          ['عدد العقود', `${data.total_contracts}`],
          ['إجمالي الإيرادات', `${data.total_revenue.toLocaleString()} ريال`],
          ['إجمالي المدفوع', `${data.total_paid.toLocaleString()} ريال`],
          ['المبلغ المتبقي', `${data.outstanding_amount.toLocaleString()} ريال`],
          ['أيام التأجير', `${data.total_rental_days} يوم`],
          ['متوسط قيمة العقد', `${data.average_contract_value?.toLocaleString()} ريال`],
          ['نقاط السلوك المالي', `${data.payment_behavior_score?.toFixed(1)}`],
          ['تصنيف الربحية', data.profitability_rank]
        ];
      }

      // إضافة الجدول
      (doc as any).autoTable({
        head: [headers],
        body: tableData,
        startY: 40,
        styles: {
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 5
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255
        }
      });

      doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      toast({
        title: 'تم التصدير بنجاح',
        description: 'تم تصدير التقرير بصيغة PDF',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'خطأ في التصدير',
        description: 'حدث خطأ أثناء تصدير التقرير',
        variant: 'destructive',
      });
    }
  };

  const exportToExcel = () => {
    try {
      let worksheetData = [];
      
      if (reportType === 'vehicle' && data) {
        worksheetData = [
          { 'المؤشر': 'إجمالي الإيرادات', 'القيمة': data.total_revenue },
          { 'المؤشر': 'إجمالي المصروفات', 'القيمة': data.total_expenses },
          { 'المؤشر': 'صافي الربح', 'القيمة': data.net_profit },
          { 'المؤشر': 'هامش الربح (%)', 'القيمة': data.profit_margin },
          { 'المؤشر': 'معدل الاستخدام (%)', 'القيمة': data.utilization_rate },
          { 'المؤشر': 'أيام التأجير', 'القيمة': data.total_rental_days },
          { 'المؤشر': 'المعدل اليومي', 'القيمة': data.average_daily_rate },
          { 'المؤشر': 'تكاليف الصيانة', 'القيمة': data.maintenance_costs },
          { 'المؤشر': 'تكاليف HR موزعة', 'القيمة': data.distributed_hr_costs },
          { 'المؤشر': 'عمولة المالك', 'القيمة': data.owner_commission },
          { 'المؤشر': 'نقطة التعادل (أيام)', 'القيمة': data.break_even_days }
        ];
      } else if (reportType === 'owner' && data) {
        worksheetData = [
          { 'المؤشر': 'عدد المركبات', 'القيمة': data.vehicle_count },
          { 'المؤشر': 'إجمالي الإيرادات', 'القيمة': data.total_revenue },
          { 'المؤشر': 'حصة المالك', 'القيمة': data.owner_share },
          { 'المؤشر': 'حصة الشركة', 'القيمة': data.company_share },
          { 'المؤشر': 'إجمالي المصروفات', 'القيمة': data.total_expenses },
          { 'المؤشر': 'مصاريف الصيانة', 'القيمة': data.maintenance_expenses },
          { 'المؤشر': 'تكاليف HR موزعة', 'القيمة': data.distributed_hr_costs },
          { 'المؤشر': 'صافي الربح', 'القيمة': data.net_profit },
          { 'المؤشر': 'هامش الربح (%)', 'القيمة': data.profit_margin },
          { 'المؤشر': 'متوسط الإيراد للمركبة', 'القيمة': data.avg_revenue_per_vehicle }
        ];
      } else if (reportType === 'customer' && data) {
        worksheetData = [
          { 'المؤشر': 'عدد العقود', 'القيمة': data.total_contracts },
          { 'المؤشر': 'إجمالي الإيرادات', 'القيمة': data.total_revenue },
          { 'المؤشر': 'إجمالي المدفوع', 'القيمة': data.total_paid },
          { 'المؤشر': 'المبلغ المتبقي', 'القيمة': data.outstanding_amount },
          { 'المؤشر': 'أيام التأجير', 'القيمة': data.total_rental_days },
          { 'المؤشر': 'متوسط قيمة العقد', 'القيمة': data.average_contract_value },
          { 'المؤشر': 'المعدل اليومي', 'القيمة': data.average_daily_rate },
          { 'المؤشر': 'قيمة العميل مدى الحياة', 'القيمة': data.customer_lifetime_value },
          { 'المؤشر': 'نقاط السلوك المالي', 'القيمة': data.payment_behavior_score },
          { 'المؤشر': 'تصنيف الربحية', 'القيمة': data.profitability_rank }
        ];
      }

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير الربحية');
      
      XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
      toast({
        title: 'تم التصدير بنجاح',
        description: 'تم تصدير التقرير بصيغة Excel',
      });
    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: 'خطأ في التصدير',
        description: 'حدث خطأ أثناء تصدير التقرير',
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          تصدير
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF} className="gap-2">
          <FileText className="h-4 w-4" />
          تصدير PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel} className="gap-2">
          <Table className="h-4 w-4" />
          تصدير Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
