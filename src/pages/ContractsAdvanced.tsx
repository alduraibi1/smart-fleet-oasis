
import React, { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { ContractsDashboard } from '@/components/Contracts/ContractsDashboard';
import { EnhancedAddContractDialog } from '@/components/Contracts/EnhancedAddContractDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useContracts } from '@/hooks/useContracts';

const ContractsAdvanced = () => {
  const [addContractOpen, setAddContractOpen] = useState(false);
  const [viewContractId, setViewContractId] = useState<string | null>(null);
  const { contracts, fetchContracts } = useContracts();

  const handleAddContract = () => {
    setAddContractOpen(true);
  };

  const handleViewContract = (contractId: string) => {
    setViewContractId(contractId);
  };

  const handleContractAdded = () => {
    fetchContracts();
    setAddContractOpen(false);
  };

  const selectedContract = viewContractId 
    ? contracts.find(c => c.id === viewContractId)
    : null;

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <ContractsDashboard
          onAddContract={handleAddContract}
          onViewContract={handleViewContract}
        />

        {/* Add Contract Dialog */}
        <EnhancedAddContractDialog 
          onContractAdded={handleContractAdded}
        />

        {/* View Contract Details Dialog */}
        <Dialog open={!!viewContractId} onOpenChange={() => setViewContractId(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>تفاصيل العقد</DialogTitle>
            </DialogHeader>
            {selectedContract && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">معلومات العقد</h3>
                    <div className="space-y-2 text-sm">
                      <div>رقم العقد: {selectedContract.contract_number}</div>
                      <div>الحالة: {selectedContract.status}</div>
                      <div>تاريخ البداية: {selectedContract.start_date}</div>
                      <div>تاريخ النهاية: {selectedContract.end_date}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">المعلومات المالية</h3>
                    <div className="space-y-2 text-sm">
                      <div>المبلغ الإجمالي: {selectedContract.total_amount?.toLocaleString()} ريال</div>
                      <div>المبلغ المدفوع: {selectedContract.paid_amount?.toLocaleString()} ريال</div>
                      <div>المبلغ المتبقي: {selectedContract.remaining_amount?.toLocaleString()} ريال</div>
                      <div>السعر اليومي: {selectedContract.daily_rate?.toLocaleString()} ريال</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">معلومات العميل</h3>
                    <div className="space-y-2 text-sm">
                      <div>الاسم: {selectedContract.customer?.name}</div>
                      <div>الهاتف: {selectedContract.customer?.phone}</div>
                      <div>البريد الإلكتروني: {selectedContract.customer?.email}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">معلومات المركبة</h3>
                    <div className="space-y-2 text-sm">
                      <div>الماركة والموديل: {selectedContract.vehicle?.brand} {selectedContract.vehicle?.model}</div>
                      <div>رقم اللوحة: {selectedContract.vehicle?.plate_number}</div>
                      <div>السنة: {selectedContract.vehicle?.year}</div>
                      <div>اللون: {selectedContract.vehicle?.color}</div>
                    </div>
                  </div>
                </div>

                {selectedContract.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">الملاحظات</h3>
                    <p className="text-sm text-muted-foreground">{selectedContract.notes}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default ContractsAdvanced;
