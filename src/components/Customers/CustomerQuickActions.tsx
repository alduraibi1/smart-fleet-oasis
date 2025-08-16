
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  Upload, 
  RefreshCw,
  Search,
  FileText,
  Trash2,
  AlertTriangle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CustomerQuickActionsProps {
  onAddCustomer: () => void;
  onExport: () => void;
  onImport: () => void;
  onRefresh: () => void;
  onAdvancedSearch: () => void;
  onShowTemplates: () => void;
  onBulkDelete?: () => void;
  selectedCount: number;
  totalCount: number;
  loading: boolean;
}

export const CustomerQuickActions = ({
  onAddCustomer,
  onExport,
  onImport,
  onRefresh,
  onAdvancedSearch,
  onShowTemplates,
  onBulkDelete,
  selectedCount,
  totalCount,
  loading
}: CustomerQuickActionsProps) => {
  console.log('🎯 CustomerQuickActions rendered with:', { selectedCount, totalCount, loading });

  const handleAddClick = () => {
    console.log('➕ Add customer button clicked');
    onAddCustomer();
  };

  const handleRefreshClick = () => {
    console.log('🔄 Refresh button clicked');
    onRefresh();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="px-3 py-1">
          المجموع: {totalCount}
        </Badge>
        {selectedCount > 0 && (
          <Badge variant="default" className="px-3 py-1">
            محدد: {selectedCount}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleAddClick} className="flex items-center gap-2" disabled={loading}>
          <Plus className="h-4 w-4" />
          عميل جديد
        </Button>

        <Button variant="outline" onClick={onExport} disabled={loading}>
          <Download className="h-4 w-4 ml-2" />
          تصدير
        </Button>

        <Button variant="outline" onClick={onImport} disabled={loading}>
          <Upload className="h-4 w-4 ml-2" />
          استيراد
        </Button>

        <Button variant="outline" onClick={onShowTemplates} disabled={loading}>
          <FileText className="h-4 w-4 ml-2" />
          القوالب
        </Button>

        <Button variant="outline" onClick={onAdvancedSearch} disabled={loading}>
          <Search className="h-4 w-4 ml-2" />
          بحث متقدم
        </Button>

        {selectedCount > 0 && onBulkDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 ml-2" />
                حذف المحدد ({selectedCount})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  تأكيد الحذف الجماعي
                </AlertDialogTitle>
                <AlertDialogDescription>
                  هل أنت متأكد من حذف {selectedCount} عميل؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات المرتبطة نهائياً.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={onBulkDelete} className="bg-destructive hover:bg-destructive/90">
                  تأكيد الحذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefreshClick}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};
