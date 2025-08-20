
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  FileText, 
  DollarSign, 
  RotateCcw,
  CheckCircle,
  Printer,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContracts } from '@/hooks/useContracts';

interface ContractActionsProps {
  contract: {
    id: string;
    contract_number: string;
    status: string;
    customer?: {
      name: string;
    };
  };
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onPayment?: (id: string) => void;
}

export const ContractActions: React.FC<ContractActionsProps> = ({
  contract,
  onEdit,
  onView,
  onPayment
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const { toast } = useToast();
  const { updateContract, cancelContract } = useContracts();

  const handleCompleteContract = async () => {
    try {
      await updateContract(contract.id, { 
        status: 'completed',
        actual_return_date: new Date().toISOString().split('T')[0]
      });
      toast({
        title: 'تم إكمال العقد',
        description: `تم إكمال العقد ${contract.contract_number} بنجاح`,
      });
      setShowCompleteDialog(false);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إكمال العقد',
        variant: 'destructive',
      });
    }
  };

  const handleCancelContract = async () => {
    try {
      await cancelContract(contract.id, 'إلغاء بناء على طلب المستخدم');
      toast({
        title: 'تم إلغاء العقد',
        description: `تم إلغاء العقد ${contract.contract_number} بنجاح`,
      });
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إلغاء العقد',
        variant: 'destructive',
      });
    }
  };

  const handlePrintContract = () => {
    toast({
      title: 'طباعة العقد',
      description: 'جاري تحضير العقد للطباعة...',
    });
    // هنا يمكن إضافة منطق الطباعة الفعلي
  };

  const handleSendContract = () => {
    toast({
      title: 'إرسال العقد',
      description: 'تم إرسال العقد للعميل بنجاح',
    });
  };

  const canEdit = contract.status === 'pending' || contract.status === 'active';
  const canComplete = contract.status === 'active';
  const canCancel = contract.status === 'pending' || contract.status === 'active';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">فتح القائمة</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onView?.(contract.id)}>
            <FileText className="mr-2 h-4 w-4" />
            عرض التفاصيل
          </DropdownMenuItem>
          
          {canEdit && (
            <DropdownMenuItem onClick={() => onEdit?.(contract.id)}>
              <Edit className="mr-2 h-4 w-4" />
              تعديل العقد
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={() => onPayment?.(contract.id)}>
            <DollarSign className="mr-2 h-4 w-4" />
            إدارة المدفوعات
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handlePrintContract}>
            <Printer className="mr-2 h-4 w-4" />
            طباعة العقد
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleSendContract}>
            <Send className="mr-2 h-4 w-4" />
            إرسال للعميل
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {canComplete && (
            <DropdownMenuItem 
              onClick={() => setShowCompleteDialog(true)}
              className="text-green-600"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              إكمال العقد
            </DropdownMenuItem>
          )}
          
          {contract.status === 'completed' && (
            <DropdownMenuItem>
              <RotateCcw className="mr-2 h-4 w-4" />
              تجديد العقد
            </DropdownMenuItem>
          )}
          
          {canCancel && (
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              إلغاء العقد
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Complete Contract Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إكمال العقد</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إكمال العقد {contract.contract_number}؟
              سيتم تحديث حالة العقد إلى "مكتمل" وحالة المركبة إلى "متاحة".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteContract}>
              تأكيد الإكمال
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Contract Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إلغاء العقد</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إلغاء العقد {contract.contract_number} للعميل {contract.customer?.name}؟
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelContract}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              تأكيد الإلغاء
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
