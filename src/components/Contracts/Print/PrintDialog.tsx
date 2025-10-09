import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContractTemplate } from './ContractTemplate';
import { VehicleHandoverForm } from './VehicleHandoverForm';
import { VehicleReturnForm } from './VehicleReturnForm';
import { TaxInvoice } from './TaxInvoice';
import { FileText, Printer, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: any;
}

export const PrintDialog = ({ open, onOpenChange, contract }: PrintDialogProps) => {
  const [activeTab, setActiveTab] = useState('contract');
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (generating) return;
    
    try {
      setGenerating(true);
      
      const element = document.getElementById('print-content');
      if (!element) {
        throw new Error('لم يتم العثور على المحتوى للطباعة');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const pdfBlob = pdf.output('blob');
      const fileName = `${contract.contract_number}_${activeTab}_${Date.now()}.pdf`;
      const filePath = `${contract.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('فشل رفع الملف إلى التخزين');
      }

      const { data: urlData } = supabase.storage
        .from('contracts')
        .getPublicUrl(filePath);

      await supabase
        .from('rental_contracts')
        .update({ pdf_url: urlData.publicUrl })
        .eq('id', contract.id);

      pdf.save(fileName);

      toast({
        title: "تم الحفظ بنجاح",
        description: "تم حفظ PDF وتحميله",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "خطأ في التحميل",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء ملف PDF",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>طباعة المستندات</DialogTitle>
          <DialogDescription>
            اختر المستند الذي تريد طباعته أو تحميله
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* أزرار الإجراءات */}
          <div className="flex gap-2 justify-end print:hidden">
            <Button onClick={handlePrint} variant="default" disabled={generating}>
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
            <Button onClick={handleDownloadPDF} variant="outline" disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 ml-2" />
                  تحميل PDF
                </>
              )}
            </Button>
          </div>

          {/* التبويبات */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="print:hidden">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="contract">
                <FileText className="h-4 w-4 ml-2" />
                العقد
              </TabsTrigger>
              <TabsTrigger value="handover">
                <FileText className="h-4 w-4 ml-2" />
                استلام المركبة
              </TabsTrigger>
              <TabsTrigger value="return">
                <FileText className="h-4 w-4 ml-2" />
                إرجاع المركبة
              </TabsTrigger>
              <TabsTrigger value="invoice">
                <FileText className="h-4 w-4 ml-2" />
                الفاتورة
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* معاينة المستند */}
          <div id="print-content" className="border border-gray-300 rounded-lg bg-gray-50 p-4">
            {activeTab === 'contract' && <ContractTemplate contract={contract} />}
            {activeTab === 'handover' && <VehicleHandoverForm contract={contract} />}
            {activeTab === 'return' && <VehicleReturnForm contract={contract} />}
            {activeTab === 'invoice' && <TaxInvoice contract={contract} />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};