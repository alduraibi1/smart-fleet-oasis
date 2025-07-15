import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Download, 
  Upload, 
  Filter, 
  RefreshCw,
  Users,
  UserPlus,
  FileText,
  Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CustomerQuickActionsProps {
  onAddCustomer: () => void;
  onExport: () => void;
  onImport: () => void;
  onRefresh: () => void;
  onAdvancedSearch: () => void;
  onShowTemplates: () => void;
  selectedCount: number;
  totalCount: number;
  loading?: boolean;
}

export const CustomerQuickActions: React.FC<CustomerQuickActionsProps> = ({
  onAddCustomer,
  onExport,
  onImport,
  onRefresh,
  onAdvancedSearch,
  onShowTemplates,
  selectedCount,
  totalCount,
  loading = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card rounded-lg border">
      {/* الإجراءات الأساسية */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={onAddCustomer} 
          className="gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          إضافة عميل
        </Button>
        
        <Button 
          onClick={onRefresh} 
          variant="outline" 
          size="sm"
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
        
        <Button 
          onClick={onAdvancedSearch} 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <Search className="h-4 w-4" />
          بحث متقدم
        </Button>
      </div>

      {/* إجراءات الملفات */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={onExport} 
          variant="outline" 
          size="sm"
          className="gap-2"
          disabled={totalCount === 0}
        >
          <Download className="h-4 w-4" />
          تصدير ({totalCount})
        </Button>
        
        <Button 
          onClick={onImport} 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          استيراد
        </Button>
        
        <Button 
          onClick={onShowTemplates} 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          القوالب
        </Button>
      </div>

      {/* معلومات الاختيار */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {selectedCount} محدد
          </Badge>
        </div>
      )}
    </div>
  );
};