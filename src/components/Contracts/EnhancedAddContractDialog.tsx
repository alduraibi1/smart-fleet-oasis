
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SmartContractForm } from './SmartContractForm';
import { useContracts } from '@/hooks/useContracts';
import { useToast } from '@/hooks/use-toast';

interface EnhancedAddContractDialogProps {
  onContractAdded?: (contract: any) => void;
  trigger?: React.ReactNode;
}

export const EnhancedAddContractDialog: React.FC<EnhancedAddContractDialogProps> = ({
  onContractAdded,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const { createContract } = useContracts();
  const { toast } = useToast();

  const handleSubmit = async (contractData: any) => {
    try {
      const newContract = await createContract(contractData);
      onContractAdded?.(newContract);
      setOpen(false);
      toast({
        title: 'تم بنجاح',
        description: 'تم إنشاء العقد بنجاح',
      });
    } catch (error) {
      console.error('Failed to create contract:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء العقد',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            عقد جديد
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء عقد إيجار جديد</DialogTitle>
        </DialogHeader>
        <SmartContractForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};
