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
import { FileText, Printer, Download, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAndUploadPDF } from '@/utils/pdfGenerator';

interface PrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: any;
}

export const PrintDialog = ({ open, onOpenChange, contract }: PrintDialogProps) => {
  const [activeTab, setActiveTab] = useState('contract');
  const [generating, setGenerating] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const getDocumentType = (tab: string): 'contract' | 'invoice' | 'handover' | 'return' => {
    const typeMap: {[key: string]: 'contract' | 'invoice' | 'handover' | 'return'} = {
      'contract': 'contract',
      'invoice': 'invoice',
      'handover': 'handover',
      'return': 'return'
    };
    return typeMap[tab] || 'contract';
  };

  const handleGeneratePDF = async () => {
    if (generating) return;
    
    try {
      setGenerating(true);
      
      const elementId = 'print-content';
      const docType = getDocumentType(activeTab);
      const fileName = `${contract.contract_number}_${activeTab}_${Date.now()}`;

      toast({
        title: "جاري إنشاء المستند...",
        description: "يرجى الانتظار",
      });

      const pdfUrl = await generateAndUploadPDF(
        elementId,
        fileName,
        contract.id,
        docType
      );

      if (pdfUrl) {
        // Mark as generated
        setGeneratedDocs(prev => ({ ...prev, [activeTab]: true }));
        
        // Download the PDF
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${fileName}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "✅ تم إنشاء المستند بنجاح",
          description: `تم حفظ ${activeTab === 'contract' ? 'العقد' : activeTab === 'invoice' ? 'الفاتورة' : activeTab === 'handover' ? 'نموذج الاستلام' : 'نموذج الإرجاع'} وحفظه في قاعدة البيانات`,
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "خطأ في الإنشاء",
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
          <DialogTitle>طباعة وإنشاء المستندات</DialogTitle>
          <DialogDescription>
            اختر المستند المطلوب ثم قم بطباعته أو إنشاء نسخة PDF محفوظة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* أزرار الإجراءات */}
          <div className="flex gap-2 justify-end print:hidden">
            <Button onClick={handlePrint} variant="outline" disabled={generating}>
              <Printer className="h-4 w-4 ml-2" />
              طباعة مباشرة
            </Button>
            <Button onClick={handleGeneratePDF} variant="default" disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  {generatedDocs[activeTab] ? (
                    <CheckCircle className="h-4 w-4 ml-2 text-green-600" />
                  ) : (
                    <Download className="h-4 w-4 ml-2" />
                  )}
                  {generatedDocs[activeTab] ? 'تم الحفظ - إعادة إنشاء' : 'إنشاء وحفظ PDF'}
                </>
              )}
            </Button>
          </div>
          
          {/* ملاحظة للمستخدم */}
          {Object.keys(generatedDocs).length > 0 && (
            <div className="text-xs text-muted-foreground bg-green-50 dark:bg-green-950 p-2 rounded border border-green-200 dark:border-green-800">
              ✅ تم حفظ المستندات في قاعدة البيانات ويمكنك الوصول إليها من قائمة العقود
            </div>
          )}

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