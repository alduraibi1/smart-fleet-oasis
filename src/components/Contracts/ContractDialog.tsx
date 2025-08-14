
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ContractForm } from './ContractForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCustomers } from '@/hooks/useCustomers';
import { useVehicles } from '@/hooks/useVehicles';

interface ContractDialogProps {
  onContractCreated: () => void;
}

export const ContractDialog = ({ onContractCreated }: ContractDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { customers } = useCustomers();
  const { vehicles } = useVehicles();

  const generateContractNumber = () => {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `CR-${year}${month}-${random}`;
  };

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const contractNumber = generateContractNumber();
      
      const contractData = {
        contract_number: contractNumber,
        customer_id: formData.customer_id,
        vehicle_id: formData.vehicle_id,
        start_date: formData.start_date.toISOString().split('T')[0],
        end_date: formData.end_date.toISOString().split('T')[0],
        daily_rate: formData.daily_rate,
        total_amount: formData.total_amount,
        deposit_amount: formData.deposit_amount,
        insurance_amount: formData.insurance_amount,
        pickup_location: formData.pickup_location,
        return_location: formData.return_location,
        mileage_start: formData.mileage_start,
        fuel_level_start: formData.fuel_level_start,
        payment_method: formData.payment_method,
        notes: formData.notes,
        status: 'active',
        payment_status: 'pending',
        paid_amount: formData.deposit_amount,
        remaining_amount: formData.total_amount - formData.deposit_amount
      };

      const { error: contractError } = await supabase
        .from('rental_contracts')
        .insert([contractData]);

      if (contractError) throw contractError;

      // Update vehicle status to rented
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ status: 'rented' })
        .eq('id', formData.vehicle_id);

      if (vehicleError) throw vehicleError;

      toast({
        title: 'تم بنجاح',
        description: `تم إنشاء العقد ${contractNumber} بنجاح`,
      });

      setOpen(false);
      onContractCreated();
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إنشاء العقد',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 ml-1" />
          عقد جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء عقد جديد</DialogTitle>
        </DialogHeader>
        <ContractForm
          customers={customers}
          vehicles={vehicles}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};
