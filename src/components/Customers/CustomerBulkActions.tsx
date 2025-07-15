import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
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
  ChevronDown, 
  Download, 
  Mail, 
  MessageSquare, 
  Ban, 
  Shield,
  Trash,
  Users
} from "lucide-react";

interface CustomerBulkActionsProps {
  selectedCustomers: string[];
  customers: any[];
  onClearSelection: () => void;
  onBulkBlacklist: (customerIds: string[], reason: string) => Promise<void>;
  onBulkRemoveBlacklist: (customerIds: string[]) => Promise<void>;
  onBulkDelete: (customerIds: string[]) => Promise<void>;
  onBulkExport: (customerIds: string[]) => void;
  onBulkEmail: (customerIds: string[]) => void;
  onBulkSMS: (customerIds: string[]) => void;
}

export const CustomerBulkActions = ({
  selectedCustomers,
  customers,
  onClearSelection,
  onBulkBlacklist,
  onBulkRemoveBlacklist,
  onBulkDelete,
  onBulkExport,
  onBulkEmail,
  onBulkSMS
}: CustomerBulkActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlacklistDialog, setShowBlacklistDialog] = useState(false);

  if (selectedCustomers.length === 0) return null;

  const selectedCustomerData = customers.filter(c => selectedCustomers.includes(c.id));
  const blacklistedCount = selectedCustomerData.filter(c => c.blacklisted).length;
  const normalCount = selectedCustomers.length - blacklistedCount;

  const handleBulkBlacklist = async () => {
    if (normalCount > 0) {
      await onBulkBlacklist(
        selectedCustomerData.filter(c => !c.blacklisted).map(c => c.id),
        "إضافة جماعية للقائمة السوداء"
      );
    }
    onClearSelection();
  };

  const handleBulkRemoveBlacklist = async () => {
    if (blacklistedCount > 0) {
      await onBulkRemoveBlacklist(
        selectedCustomerData.filter(c => c.blacklisted).map(c => c.id)
      );
    }
    onClearSelection();
  };

  const handleBulkDelete = async () => {
    await onBulkDelete(selectedCustomers);
    onClearSelection();
    setShowDeleteDialog(false);
  };

  const handleBulkExport = () => {
    onBulkExport(selectedCustomers);
    onClearSelection();
  };

  const handleBulkEmail = () => {
    const customersWithEmail = selectedCustomerData.filter(c => c.email);
    onBulkEmail(customersWithEmail.map(c => c.id));
    onClearSelection();
  };

  const handleBulkSMS = () => {
    onBulkSMS(selectedCustomers);
    onClearSelection();
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-primary/5 border rounded-lg mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-medium">تم تحديد</span>
            <Badge variant="secondary">{selectedCustomers.length}</Badge>
            <span>عميل</span>
          </div>
          
          {blacklistedCount > 0 && (
            <Badge variant="destructive">{blacklistedCount} في القائمة السوداء</Badge>
          )}
          
          {normalCount > 0 && (
            <Badge variant="default">{normalCount} عميل عادي</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                الإجراءات الجماعية
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleBulkExport}>
                <Download className="ml-2 h-4 w-4" />
                تصدير البيانات
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleBulkEmail}
                disabled={selectedCustomerData.filter(c => c.email).length === 0}
              >
                <Mail className="ml-2 h-4 w-4" />
                إرسال بريد إلكتروني
                {selectedCustomerData.filter(c => c.email).length > 0 && (
                  <Badge variant="secondary" className="mr-2">
                    {selectedCustomerData.filter(c => c.email).length}
                  </Badge>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleBulkSMS}>
                <MessageSquare className="ml-2 h-4 w-4" />
                إرسال رسالة نصية
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {normalCount > 0 && (
                <DropdownMenuItem onClick={handleBulkBlacklist} className="text-red-600">
                  <Ban className="ml-2 h-4 w-4" />
                  إضافة للقائمة السوداء ({normalCount})
                </DropdownMenuItem>
              )}
              
              {blacklistedCount > 0 && (
                <DropdownMenuItem onClick={handleBulkRemoveBlacklist} className="text-green-600">
                  <Shield className="ml-2 h-4 w-4" />
                  إزالة من القائمة السوداء ({blacklistedCount})
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                <Trash className="ml-2 h-4 w-4" />
                حذف نهائي
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={onClearSelection}>
            إلغاء التحديد
          </Button>
        </div>
      </div>

      {/* حوار تأكيد الحذف */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف {selectedCustomers.length} عميل نهائياً؟ 
              هذا الإجراء لا يمكن التراجع عنه وسيؤثر على جميع البيانات المرتبطة بهؤلاء العملاء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};