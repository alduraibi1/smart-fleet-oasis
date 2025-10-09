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
import { enhancedToast } from '@/components/ui/enhanced-toast';
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

  const getDocumentName = (type: string) => {
    const names: {[key: string]: string} = {
      'contract': 'العقد',
      'invoice': 'الفاتورة الضريبية',
      'handover': 'نموذج الاستلام',
      'return': 'نموذج الإرجاع'
    };
    return names[type] || 'المستند';
  };

  const handleGeneratePDF = async () => {
    if (generating) return;
    
    try {
      setGenerating(true);
      
      const elementId = `print-content-${activeTab}`;
      const docType = getDocumentType(activeTab);
      const fileName = `${contract.contract_number}_${activeTab}_${Date.now()}`;

      enhancedToast.loading(`جارٍ توليد ${getDocumentName(activeTab)}...`);

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

        enhancedToast.success('تم إنشاء المستند بنجاح', {
          description: `تم حفظ ${getDocumentName(activeTab)} وبدأ التنزيل`,
          duration: 5000
        });
      } else {
        enhancedToast.error('فشل توليد المستند', {
          description: 'لم يتم إنشاء الملف، يرجى المحاولة مرة أخرى',
          duration: 6000
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      enhancedToast.error('خطأ في توليد المستند', {
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء ملف PDF',
        duration: 6000
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
            <Button 
              onClick={handleGeneratePDF} 
              variant="default" 
              disabled={generating}
              className="relative overflow-hidden"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  <span className="mr-1">جاري الإنشاء...</span>
                  <span className="absolute inset-0 bg-primary/20 animate-pulse"></span>
                </>
              ) : (
                <>
                  {generatedDocs[activeTab] ? (
                    <CheckCircle className="h-4 w-4 ml-2 text-green-600 dark:text-green-400" />
                  ) : (
                    <Download className="h-4 w-4 ml-2" />
                  )}
                  {generatedDocs[activeTab] ? 'تم الحفظ - إعادة إنشاء' : 'إنشاء وحفظ PDF'}
                </>
              )}
            </Button>
          </div>
          
          {/* ملاحظة للمستخدم */}
          {generating && (
            <div className="text-sm bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">جارٍ المعالجة...</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                  يتم تحويل المستند إلى PDF وحفظه
                </p>
              </div>
            </div>
          )}
          
          {!generating && Object.keys(generatedDocs).length > 0 && (
            <div className="text-sm bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">تم الحفظ بنجاح</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                  المستندات محفوظة ويمكنك الوصول إليها من قائمة العقود
                </p>
              </div>
            </div>
          )}

          {/* التبويبات */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 print:hidden">
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

            {/* معاينة المستند - العقد */}
            <TabsContent value="contract">
              <div id="print-content-contract" className="border border-gray-300 rounded-lg bg-gray-50 p-4">
                <ContractTemplate contract={contract} />
              </div>
            </TabsContent>

            {/* معاينة المستند - استلام المركبة */}
            <TabsContent value="handover">
              <div id="print-content-handover" className="border border-gray-300 rounded-lg bg-gray-50 p-4">
                <VehicleHandoverForm contract={contract} />
              </div>
            </TabsContent>

            {/* معاينة المستند - إرجاع المركبة */}
            <TabsContent value="return">
              <div id="print-content-return" className="border border-gray-300 rounded-lg bg-gray-50 p-4">
                <VehicleReturnForm contract={contract} />
              </div>
            </TabsContent>

            {/* معاينة المستند - الفاتورة */}
            <TabsContent value="invoice">
              <div id="print-content-invoice" className="border border-gray-300 rounded-lg bg-gray-50 p-4">
                <TaxInvoice contract={contract} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};