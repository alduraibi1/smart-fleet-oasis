import React, { memo, useState, useEffect, useRef, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Configuration constants
const STATUS_CONFIG = {
  active: { label: 'نشط', color: 'bg-success text-success-foreground' },
  expired: { label: 'منتهي الصلاحية', color: 'bg-destructive text-destructive-foreground' },
  pending: { label: 'في الانتظار', color: 'bg-warning text-warning-foreground' },
  completed: { label: 'مكتمل', color: 'bg-secondary text-secondary-foreground' },
  cancelled: { label: 'ملغي', color: 'bg-muted text-muted-foreground' }
} as const;

const CONTRACT_TYPE_CONFIG = {
  daily: { label: 'يومي', color: 'bg-blue-100 text-blue-800' },
  monthly: { label: 'شهري', color: 'bg-green-100 text-green-800' }
} as const;

interface Contract {
  id: string;
  contract_number: string;
  customer?: {
    name: string;
    phone: string;
  };
  vehicle?: {
    brand: string;
    model: string;
    plate_number: string;
  };
  start_date: string;
  end_date: string;
  daily_rate: number;
  total_amount: number;
  status: string;
}

interface VirtualTableRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    contracts: Contract[];
    columnWidths: number[];
  };
}

// Memoized virtual table row
const VirtualTableRow = memo(({ index, style, data }: VirtualTableRowProps) => {
  const { contracts, columnWidths } = data;
  const contract = contracts[index];

  const contractType = useMemo(() => {
    const start = new Date(contract.start_date);
    const end = new Date(contract.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30 ? 'monthly' : 'daily';
  }, [contract.start_date, contract.end_date]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  return (
    <div
      style={style}
      className="flex items-center border-b border-border hover:bg-muted/50 transition-colors"
    >
      {/* Contract Number */}
      <div className="px-4 font-medium" style={{ width: columnWidths[0] }}>
        {contract.contract_number}
      </div>
      
      {/* Customer */}
      <div className="px-4" style={{ width: columnWidths[1] }}>
        <div className="font-medium">{contract.customer?.name || 'غير محدد'}</div>
        <div className="text-xs text-muted-foreground">{contract.customer?.phone}</div>
      </div>
      
      {/* Vehicle */}
      <div className="px-4" style={{ width: columnWidths[2] }}>
        <div className="font-medium">
          {contract.vehicle?.brand} {contract.vehicle?.model}
        </div>
        <div className="text-xs text-muted-foreground">{contract.vehicle?.plate_number}</div>
      </div>
      
      {/* Start Date */}
      <div className="px-4" style={{ width: columnWidths[3] }}>
        {formatDate(contract.start_date)}
      </div>
      
      {/* End Date */}
      <div className="px-4" style={{ width: columnWidths[4] }}>
        {formatDate(contract.end_date)}
      </div>
      
      {/* Daily Rate */}
      <div className="px-4" style={{ width: columnWidths[5] }}>
        {contract.daily_rate.toLocaleString()} ر.س
      </div>
      
      {/* Total Amount */}
      <div className="px-4" style={{ width: columnWidths[6] }}>
        {contract.total_amount.toLocaleString()} ر.س
      </div>
      
      {/* Type */}
      <div className="px-4" style={{ width: columnWidths[7] }}>
        <Badge
          variant="secondary"
          className={CONTRACT_TYPE_CONFIG[contractType].color}
        >
          {CONTRACT_TYPE_CONFIG[contractType].label}
        </Badge>
      </div>
      
      {/* Status */}
      <div className="px-4" style={{ width: columnWidths[8] }}>
        <Badge
          variant="secondary"
          className={STATUS_CONFIG[contract.status]?.color || STATUS_CONFIG.pending.color}
        >
          {STATUS_CONFIG[contract.status]?.label || 'غير محدد'}
        </Badge>
      </div>
      
      {/* Actions */}
      <div className="px-4 flex gap-2" style={{ width: columnWidths[9] }}>
        <Button variant="outline" size="sm">
          <Eye className="h-3 w-3" />
        </Button>
        <Button variant="outline" size="sm">
          <Edit className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
});

VirtualTableRow.displayName = 'VirtualTableRow';

interface VirtualizedTableProps {
  contracts: Contract[];
  loading: boolean;
  height?: number;
}

export const VirtualizedTable = memo(({ 
  contracts, 
  loading, 
  height = 600 
}: VirtualizedTableProps) => {
  const listRef = useRef<List>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  
  // Calculate column widths based on container width
  const columnWidths = useMemo(() => {
    const totalWidth = containerWidth - 32; // Account for padding
    return [
      totalWidth * 0.12, // Contract Number
      totalWidth * 0.15, // Customer
      totalWidth * 0.15, // Vehicle
      totalWidth * 0.1,  // Start Date
      totalWidth * 0.1,  // End Date
      totalWidth * 0.1,  // Daily Rate
      totalWidth * 0.12, // Total Amount
      totalWidth * 0.08, // Type
      totalWidth * 0.08, // Status
      totalWidth * 0.1,  // Actions
    ];
  }, [containerWidth]);

  // Update container width on resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('virtual-table-container');
      if (container) {
        setContainerWidth(container.offsetWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا توجد عقود مطابقة للبحث
      </div>
    );
  }

  return (
    <div id="virtual-table-container" className="w-full">
      {/* Table Header */}
      <div className="flex items-center bg-muted/50 border-b-2 border-border font-medium">
        <div className="px-4 py-3" style={{ width: columnWidths[0] }}>
          رقم العقد
        </div>
        <div className="px-4 py-3" style={{ width: columnWidths[1] }}>
          العميل
        </div>
        <div className="px-4 py-3" style={{ width: columnWidths[2] }}>
          المركبة
        </div>
        <div className="px-4 py-3" style={{ width: columnWidths[3] }}>
          تاريخ البداية
        </div>
        <div className="px-4 py-3" style={{ width: columnWidths[4] }}>
          تاريخ النهاية
        </div>
        <div className="px-4 py-3" style={{ width: columnWidths[5] }}>
          المبلغ اليومي
        </div>
        <div className="px-4 py-3" style={{ width: columnWidths[6] }}>
          المبلغ الإجمالي
        </div>
        <div className="px-4 py-3" style={{ width: columnWidths[7] }}>
          النوع
        </div>
        <div className="px-4 py-3" style={{ width: columnWidths[8] }}>
          الحالة
        </div>
        <div className="px-4 py-3" style={{ width: columnWidths[9] }}>
          الإجراءات
        </div>
      </div>

      {/* Virtual Table Body */}
      <div className="border border-border rounded-b-md">
        <List
          ref={listRef}
          height={height}
          width={containerWidth}
          itemCount={contracts.length}
          itemSize={64}
          itemData={{
            contracts,
            columnWidths,
          }}
          overscanCount={5}
        >
          {VirtualTableRow}
        </List>
      </div>
      
      {/* Table Footer */}
      <div className="px-4 py-2 bg-muted/30 text-sm text-muted-foreground border-t">
        عرض {contracts.length.toLocaleString()} عقد
      </div>
    </div>
  );
});

VirtualizedTable.displayName = 'VirtualizedTable';