
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EarlyTerminationDialog } from './EarlyTerminationDialog';
import { VehicleReturnForm } from './VehicleReturnForm';
import { MinimalContractForEarlyTermination } from '@/utils/earlyTerminationUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Contract extends MinimalContractForEarlyTermination {
  contract_number?: string;
  customer?: { id?: string; name?: string };
  vehicle?: { brand: string; model: string; year: number; plate_number: string };
  status: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract;
  onCompleted?: () => void;
}

export const ContractTerminationDialog = ({ open, onOpenChange, contract, onCompleted }: Props) => {
  const [activeTab, setActiveTab] = useState('normal');
  const { toast } = useToast();

  const handleNormalReturn = async (returnData: any) => {
    try {
      const { error } = await supabase
        .from('rental_contracts')
        .update(returnData)
        .eq('id', contract.id);

      if (error) throw error;

      // Update vehicle status to available
      if (contract.vehicle_id) {
        await supabase
          .from('vehicles')
          .update({ status: 'available' })
          .eq('id', contract.vehicle_id);
      }

      onOpenChange(false);
      if (onCompleted) onCompleted();
    } catch (error) {
      console.error('Error completing contract:', error);
      throw error;
    }
  };

  const isEarlyTermination = () => {
    const today = new Date();
    const endDate = new Date(contract.end_date);
    return today < endDate;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنهاء العقد - {contract.contract_number}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="normal">إرجاع طبيعي</TabsTrigger>
            <TabsTrigger value="early" disabled={!isEarlyTermination()}>
              إلغاء مبكر
              {!isEarlyTermination() && <span className="text-xs ml-1">(منتهي)</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="normal" className="mt-6">
            <VehicleReturnForm
              contract={contract}
              onReturn={handleNormalReturn}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>

          <TabsContent value="early" className="mt-6">
            {isEarlyTermination() ? (
              <EarlyTerminationDialog
                open={true}
                onOpenChange={() => {}}
                contract={contract}
                onCreated={() => {
                  onOpenChange(false);
                  if (onCompleted) onCompleted();
                }}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                العقد منتهي بالفعل - لا يمكن تقديم طلب إلغاء مبكر
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
