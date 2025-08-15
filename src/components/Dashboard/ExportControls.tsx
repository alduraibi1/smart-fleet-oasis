
import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, Image, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface ExportControlsProps {
  dashboardRef: React.RefObject<HTMLDivElement>;
  data: any;
  title?: string;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  dashboardRef,
  data,
  title = "تقرير لوحة التحكم"
}) => {
  const { toast } = useToast();

  const exportToPDF = async () => {
    try {
      if (!dashboardRef.current) return;

      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.setFontSize(16);
      pdf.text(title, 20, 20);
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      pdf.save(`${title}_${new Date().toISOString().slice(0, 10)}.pdf`);
      
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير التقرير بصيغة PDF",
      });
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير التقرير",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet([
        { 'المؤشر': 'إجمالي المركبات', 'القيمة': data.totalVehicles },
        { 'المؤشر': 'المركبات المتاحة', 'القيمة': data.availableVehicles },
        { 'المؤشر': 'العقود النشطة', 'القيمة': data.activeContracts },
        { 'المؤشر': 'إجمالي الإيرادات', 'القيمة': data.totalRevenue },
        { 'المؤشر': 'الإيرادات الشهرية', 'القيمة': data.monthlyRevenue },
        { 'المؤشر': 'الصيانة المعلقة', 'القيمة': data.pendingMaintenance },
        { 'المؤشر': 'العقود المتأخرة', 'القيمة': data.overdueContracts },
        { 'المؤشر': 'معدل الاستخدام (%)', 'القيمة': data.utilizationRate },
        { 'المؤشر': 'هامش الربح (%)', 'القيمة': data.profitMargin }
      ]);
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'مؤشرات الأداء');
      
      XLSX.writeFile(workbook, `${title}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير البيانات بصيغة Excel",
      });
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive",
      });
    }
  };

  const exportAsImage = async () => {
    try {
      if (!dashboardRef.current) return;

      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const link = document.createElement('a');
      link.download = `${title}_${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير لوحة التحكم كصورة",
      });
    } catch (error) {
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير الصورة",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          تصدير التقرير
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPDF} className="gap-2">
          <FileText className="h-4 w-4" />
          تصدير PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          تصدير Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsImage} className="gap-2">
          <Image className="h-4 w-4" />
          تصدير كصورة
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
