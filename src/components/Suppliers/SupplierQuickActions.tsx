
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSuppliers, Supplier } from "@/hooks/useSuppliers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  MoreVertical, 
  Edit, 
  Eye, 
  Star,
  Power,
  PowerOff,
  Trash2,
  Phone,
  Mail,
  ShoppingCart
} from "lucide-react";

interface SupplierQuickActionsProps {
  supplier: Supplier;
  onCreateOrder?: (supplier: Supplier) => void;
  onEdit?: (supplier: Supplier) => void;
  onView?: (supplier: Supplier) => void;
}

export const SupplierQuickActions = ({ 
  supplier, 
  onCreateOrder, 
  onEdit, 
  onView 
}: SupplierQuickActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [newRating, setNewRating] = useState(supplier.rating);
  const { updateSupplier, deleteSupplier, updateSupplierRating } = useSuppliers();
  const { toast } = useToast();

  const handleToggleStatus = async () => {
    try {
      await updateSupplier(supplier.id, { is_active: !supplier.is_active });
      toast({
        title: "تم التحديث",
        description: `تم ${supplier.is_active ? 'إلغاء تفعيل' : 'تفعيل'} المورد بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة المورد",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSupplier(supplier.id);
      setShowDeleteDialog(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleUpdateRating = async () => {
    try {
      await updateSupplierRating(supplier.id, newRating);
      setShowRatingDialog(false);
      toast({
        title: "تم التحديث",
        description: "تم تحديث تقييم المورد بنجاح",
      });
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleContactAction = (type: 'phone' | 'email') => {
    if (type === 'phone' && supplier.phone) {
      window.open(`tel:${supplier.phone}`);
    } else if (type === 'email' && supplier.email) {
      window.open(`mailto:${supplier.email}`);
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setNewRating(i + 1)}
        className={`${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        } hover:text-yellow-400 transition-colors`}
      >
        <Star className="h-4 w-4 fill-current" />
      </button>
    ));
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Quick Contact Buttons */}
        {supplier.phone && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleContactAction('phone')}
            className="h-8 w-8 p-0"
          >
            <Phone className="h-4 w-4" />
          </Button>
        )}
        
        {supplier.email && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleContactAction('email')}
            className="h-8 w-8 p-0"
          >
            <Mail className="h-4 w-4" />
          </Button>
        )}

        {/* Create Order Button */}
        {supplier.is_active && onCreateOrder && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCreateOrder(supplier)}
            className="hidden sm:flex"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            أمر شراء
          </Button>
        )}

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {onView && (
              <DropdownMenuItem onClick={() => onView(supplier)}>
                <Eye className="h-4 w-4 mr-2" />
                عرض التفاصيل
              </DropdownMenuItem>
            )}
            
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(supplier)}>
                <Edit className="h-4 w-4 mr-2" />
                تعديل المورد
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => setShowRatingDialog(true)}>
              <Star className="h-4 w-4 mr-2" />
              تحديث التقييم
            </DropdownMenuItem>

            {onCreateOrder && supplier.is_active && (
              <DropdownMenuItem 
                onClick={() => onCreateOrder(supplier)}
                className="sm:hidden"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                إنشاء أمر شراء
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleToggleStatus}>
              {supplier.is_active ? (
                <>
                  <PowerOff className="h-4 w-4 mr-2" />
                  إلغاء التفعيل
                </>
              ) : (
                <>
                  <Power className="h-4 w-4 mr-2" />
                  تفعيل المورد
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              حذف المورد
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف المورد "{supplier.name}"؟ 
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rating Update Dialog */}
      <AlertDialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تحديث تقييم المورد</AlertDialogTitle>
            <AlertDialogDescription>
              تقييم المورد "{supplier.name}" حالياً هو {supplier.rating} نجوم.
              اختر التقييم الجديد:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center gap-1 py-4">
            {getRatingStars(newRating)}
          </div>
          <div className="text-center">
            <Badge variant="outline">التقييم: {newRating} نجوم</Badge>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewRating(supplier.rating)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateRating}>
              تحديث التقييم
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
