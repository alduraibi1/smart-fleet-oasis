
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AddContractDialog from './AddContractDialog';
import VehicleReturnDialog from './VehicleReturnDialog';

interface ContractsHeaderProps {
  title?: string;
  description?: string;
}

export const ContractsHeader = ({ 
  title = "إدارة العقود المتقدمة",
  description = "نظام شامل لإدارة العقود الذكية والتوقيع الإلكتروني وتتبع دورة الحياة"
}: ContractsHeaderProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {title}
        </h1>
        <p className="text-muted-foreground mt-2">
          {description}
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setShowReturnDialog(true)}>
          إرجاع مركبة
        </Button>
        <Button onClick={() => setShowAddDialog(true)}>
          إضافة عقد جديد
        </Button>
      </div>
      
      <VehicleReturnDialog 
        contractId=""
        open={showReturnDialog}
        onOpenChange={setShowReturnDialog}
      />
      <AddContractDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};
