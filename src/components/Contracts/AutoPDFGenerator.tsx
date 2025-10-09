import { useEffect, useState } from 'react';
import { Contract } from '@/hooks/useContracts';
import { ContractTemplate } from './Print/ContractTemplate';
import { TaxInvoice } from './Print/TaxInvoice';
import { VehicleHandoverForm } from './Print/VehicleHandoverForm';
import { VehicleReturnForm } from './Print/VehicleReturnForm';
import { generateAllContractDocuments } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

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
          toast({
            title: '✅ تم توليد المستندات',
            description: `تم توليد ${successCount} من ${totalDocs} مستند بنجاح`,
          });
        }

        onComplete?.();
      } catch (error) {
        console.error('خطأ في توليد المستندات:', error);
        toast({
          title: 'تنبيه',
          description: 'حدث خطأ أثناء توليد بعض المستندات',
          variant: 'destructive',
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <div className="text-center">
              <p className="font-semibold text-lg mb-1">جارٍ توليد المستندات...</p>
              <p className="text-sm text-muted-foreground">
                يتم إنشاء {includeReturn ? '4' : '3'} ملفات PDF وحفظها
              </p>
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
