import { useEffect, useState } from 'react';
import { Contract } from '@/hooks/useContracts';
import { ContractTemplate } from './Print/ContractTemplate';
import { TaxInvoice } from './Print/TaxInvoice';
import { VehicleHandoverForm } from './Print/VehicleHandoverForm';
import { VehicleReturnForm } from './Print/VehicleReturnForm';
import { generateAllContractDocuments } from '@/utils/pdfGenerator';
import { enhancedToast } from '@/components/ui/enhanced-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FileText } from 'lucide-react';

interface AutoPDFGeneratorProps {
  contract: Contract;
  onComplete?: () => void;
  includeReturn?: boolean; // إضافة نموذج الإرجاع (اختياري)
}

/**
 * مكون خفي يقوم بتوليد مستندات PDF تلقائياً
 * يتم استخدامه بعد إنشاء العقد مباشرة أو عند إتمام الإرجاع
 */
export const AutoPDFGenerator = ({ contract, onComplete, includeReturn = false }: AutoPDFGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const generateDocuments = async () => {
      if (isGenerating) return;
      
      setIsGenerating(true);

      try {
        // انتظار لضمان تحميل المكونات
        await new Promise(resolve => setTimeout(resolve, 1000));

        const results = await generateAllContractDocuments(
          contract.id,
          contract.contract_number,
          includeReturn
        );

        const successCount = Object.values(results).filter(r => r !== null).length;
        const totalDocs = includeReturn ? 4 : 3;
        
        if (successCount > 0) {
          if (successCount === totalDocs) {
            enhancedToast.success('تم توليد المستندات بنجاح', {
              description: `تم توليد وحفظ ${successCount} مستند PDF`,
              duration: 5000
            });
          } else {
            enhancedToast.warning('تم توليد المستندات جزئياً', {
              description: `تم توليد ${successCount} من ${totalDocs} مستند`,
              duration: 6000
            });
          }
        }

        onComplete?.();
      } catch (error) {
        console.error('خطأ في توليد المستندات:', error);
        enhancedToast.error('فشل توليد المستندات', {
          description: 'حدث خطأ أثناء توليد بعض المستندات',
          duration: 6000
        });
      } finally {
        setIsGenerating(false);
      }
    };

    generateDocuments();
  }, [contract.id]);

  return (
    <>
      {isGenerating && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-card p-8 rounded-xl shadow-2xl border-2 border-primary/20 flex flex-col items-center gap-6 max-w-md w-full mx-4">
            <div className="relative">
              <LoadingSpinner size="xl" variant="default" />
              <div className="absolute inset-0 animate-ping opacity-20">
                <LoadingSpinner size="xl" variant="default" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="font-bold text-xl mb-2">جارٍ توليد المستندات...</p>
              <p className="text-sm text-muted-foreground">
                يتم إنشاء وحفظ {includeReturn ? '4' : '3'} ملفات PDF
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span>يرجى الانتظار قليلاً</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>
      )}
      
      <div className="fixed -left-[9999px] top-0 w-[210mm] bg-white">
        <div id="contract-template">
          <ContractTemplate contract={contract} />
        </div>
        <div id="tax-invoice-template">
          <TaxInvoice contract={contract} />
        </div>
        <div id="handover-template">
          <VehicleHandoverForm contract={contract} />
        </div>
        {includeReturn && (
          <div id="return-template">
            <VehicleReturnForm contract={contract} />
          </div>
        )}
      </div>
    </>
  );
};
