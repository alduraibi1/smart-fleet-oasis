
import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Calendar,
  ArrowRight,
  FileText,
  User,
  Car
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useContracts } from '@/hooks/useContracts';
import { ContractRenewalDialog } from './ContractRenewalDialog';

const statusConfig = {
  active: { 
    label: 'نشط', 
    color: 'bg-success text-success-foreground',
    icon: CheckCircle,
    actions: ['complete', 'cancel']
  },
  pending: { 
    label: 'في الانتظار', 
    color: 'bg-warning text-warning-foreground',
    icon: Clock,
    actions: ['activate', 'cancel']
  },
  completed: { 
    label: 'مكتمل', 
    color: 'bg-secondary text-secondary-foreground',
    icon: CheckCircle,
    actions: ['renew']
  },
  cancelled: { 
    label: 'ملغي', 
    color: 'bg-muted text-muted-foreground',
    icon: XCircle,
    actions: []
  },
  expired: { 
    label: 'منتهي الصلاحية', 
    color: 'bg-destructive text-destructive-foreground',
    icon: AlertTriangle,
    actions: ['renew', 'extend']
  }
};

interface ContractStatusManagerProps {
  contract: {
    id: string;
    contract_number: string;
    status: string;
    start_date: string;
    end_date: string;
    daily_rate: number;
    total_amount: number;
    customer?: {
      id?: string;
      name: string;
      phone: string;
    };
    vehicle?: {
      id?: string;
      brand: string;
      model: string;
      plate_number: string;
    };
  };
  onStatusChange?: () => void;
}

export const ContractStatusManager: React.FC<ContractStatusManagerProps> = ({ 
  contract, 
  onStatusChange 
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<string>('');
  const [renewalDialogOpen, setRenewalDialogOpen] = useState(false);
  const [renewalType, setRenewalType] = useState<'renewal' | 'extension'>('renewal');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const { updateContract, cancelContract } = useContracts();

  const currentStatus = statusConfig[contract.status as keyof typeof statusConfig];
  const StatusIcon = currentStatus?.icon || FileText;

  const handleStatusAction = async (action: string) => {
    if (action === 'renew') {
      setRenewalType('renewal');
      setRenewalDialogOpen(true);
      return;
    }
    
    if (action === 'extend') {
      setRenewalType('extension');
      setRenewalDialogOpen(true);
      return;
    }

    setActionType(action);
    setDialogOpen(true);
  };

  const executeAction = async () => {
    try {
      switch (actionType) {
        case 'activate':
          await updateContract(contract.id, { status: 'active' });
          toast({
            title: 'تم تفعيل العقد',
            description: `تم تفعيل العقد ${contract.contract_number} بنجاح`,
          });
          break;
          
        case 'cancel':
          await cancelContract(contract.id, notes || 'إلغاء بناء على طلب المستخدم');
          toast({
            title: 'تم إلغاء العقد',
            description: `تم إلغاء العقد ${contract.contract_number} بنجاح`,
          });
          break;
          
        case 'complete':
          await updateContract(contract.id, { 
            status: 'completed',
            actual_return_date: new Date().toISOString().split('T')[0]
          });
          toast({
            title: 'تم إكمال العقد',
            description: `تم إكمال العقد ${contract.contract_number} بنجاح`,
          });
          break;
          
        default:
          toast({
            variant: 'destructive',
            title: 'خطأ',
            description: 'العملية غير مدعومة حاليًا',
          });
      }
      
      setDialogOpen(false);
      setNotes('');
      onStatusChange?.();
    } catch (error) {
      // Error is already handled in the hooks
    }
  };

  const getStatusActions = () => {
    const actions = currentStatus?.actions || [];
    
    return actions.map((action) => {
      const actionConfig = {
        activate: { label: 'تفعيل العقد', variant: 'default' as const },
        complete: { label: 'إكمال العقد', variant: 'default' as const },
        cancel: { label: 'إلغاء العقد', variant: 'destructive' as const },
        renew: { label: 'تجديد العقد', variant: 'secondary' as const },
        extend: { label: 'تمديد العقد', variant: 'outline' as const },
      };

      const config = actionConfig[action as keyof typeof actionConfig];
      if (!config) return null;

      return (
        <Button
          key={action}
          variant={config.variant}
          size="sm"
          onClick={() => handleStatusAction(action)}
          className="flex items-center gap-1"
        >
          <ArrowRight className="h-3 w-3" />
          {config.label}
        </Button>
      );
    });
  };

  const handleRenewalSuccess = () => {
    setRenewalDialogOpen(false);
    onStatusChange?.();
  };

  return (
    <>
      <Card className="border-l-4" style={{ borderLeftColor: currentStatus?.color.includes('success') ? '#22c55e' : currentStatus?.color.includes('warning') ? '#f59e0b' : currentStatus?.color.includes('destructive') ? '#ef4444' : '#6b7280' }}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              <span>حالة العقد</span>
            </div>
            <Badge className={currentStatus?.color}>
              {currentStatus?.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Contract Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{contract.contract_number}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{contract.customer?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span>{contract.vehicle?.brand} {contract.vehicle?.model}</span>
              </div>
            </div>

            {/* Contract Dates */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>من {new Date(contract.start_date).toLocaleDateString('ar-SA')}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div>
                <span>إلى {new Date(contract.end_date).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>

            {/* Actions */}
            {currentStatus?.actions && currentStatus.actions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {getStatusActions()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'cancel' && 'إلغاء العقد'}
              {actionType === 'activate' && 'تفعيل العقد'}
              {actionType === 'complete' && 'إكمال العقد'}
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من تنفيذ هذا الإجراء على العقد {contract.contract_number}؟
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {(actionType === 'cancel' || actionType === 'complete') && (
              <div>
                <Label htmlFor="notes">ملاحظات إضافية</Label>
                <Textarea
                  id="notes"
                  placeholder="أدخل أي ملاحظات حول هذا الإجراء..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={executeAction}
                variant={actionType === 'cancel' ? 'destructive' : 'default'}
              >
                تأكيد
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ContractRenewalDialog
        open={renewalDialogOpen}
        onOpenChange={setRenewalDialogOpen}
        contract={contract}
        renewalType={renewalType}
      />
    </>
  );
};
