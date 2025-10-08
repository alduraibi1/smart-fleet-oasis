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
import { FileText, Printer, Download } from 'lucide-react';

interface PrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: any;
}

export const PrintDialog = ({ open, onOpenChange, contract }: PrintDialogProps) => {
  const [activeTab, setActiveTab] = useState('contract');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    // سيتم تنفيذها لاحقاً مع jsPDF
    alert('سيتم إضافة ميزة التحميل قريباً');
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
            <Button onClick={handlePrint} variant="default">
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
            <Button onClick={handleDownloadPDF} variant="outline">
              <Download className="h-4 w-4 ml-2" />
              تحميل PDF
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
          <div className="border border-gray-300 rounded-lg bg-gray-50 p-4">
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