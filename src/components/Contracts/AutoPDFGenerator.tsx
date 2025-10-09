import { useEffect, useState } from 'react';
import { Contract } from '@/hooks/useContracts';
import { ContractTemplate } from './Print/ContractTemplate';
import { TaxInvoice } from './Print/TaxInvoice';
import { VehicleHandoverForm } from './Print/VehicleHandoverForm';
import { generateAllContractDocuments } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface AutoPDFGeneratorProps {
  contract: Contract;
  onComplete?: () => void;
}

/**
 * مكون خفي يقوم بتوليد مستندات PDF تلقائياً
 * يتم استخدامه بعد إنشاء العقد مباشرة
 */
export const AutoPDFGenerator = ({ contract, onComplete }: AutoPDFGeneratorProps) => {
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
          contract.contract_number
        );

        const successCount = Object.values(results).filter(r => r !== null).length;
        
        if (successCount > 0) {
          toast({
            title: 'تم توليد المستندات',
            description: `تم توليد ${successCount} مستند بنجاح`,
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
    </div>
  );
};
