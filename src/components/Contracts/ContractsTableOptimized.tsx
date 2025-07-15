import React, { memo, useMemo, useCallback } from 'react';
import { Eye, Edit, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

// Configuration constants moved outside component to prevent recreation
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

interface ContractsTableOptimizedProps {
  contracts: Contract[];
  loading: boolean;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onSearch: (term: string) => void;
  onFilterChange: (status: string) => void;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}

// Memoized table row component
const ContractRow = memo(({ contract }: { contract: Contract }) => {
  const contractType = useMemo(() => {
    const start = new Date(contract.start_date);
    const end = new Date(contract.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30 ? 'monthly' : 'daily';
  }, [contract.start_date, contract.end_date]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  }, []);

  return (
    <TableRow>
      <TableCell className="font-medium">{contract.contract_number}</TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{contract.customer?.name || 'غير محدد'}</div>
          <div className="text-sm text-muted-foreground">{contract.customer?.phone}</div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">
            {contract.vehicle?.brand} {contract.vehicle?.model}
          </div>
          <div className="text-sm text-muted-foreground">{contract.vehicle?.plate_number}</div>
        </div>
      </TableCell>
      <TableCell>{formatDate(contract.start_date)}</TableCell>
      <TableCell>{formatDate(contract.end_date)}</TableCell>
      <TableCell>{contract.daily_rate.toLocaleString()} ر.س</TableCell>
      <TableCell>{contract.total_amount.toLocaleString()} ر.س</TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={CONTRACT_TYPE_CONFIG[contractType].color}
        >
          {CONTRACT_TYPE_CONFIG[contractType].label}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={STATUS_CONFIG[contract.status]?.color || STATUS_CONFIG.pending.color}
        >
          {STATUS_CONFIG[contract.status]?.label || 'غير محدد'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

ContractRow.displayName = 'ContractRow';

// Memoized loading skeleton
const TableSkeleton = memo(() => (
  <TableRow>
    <TableCell colSpan={10}>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </TableCell>
  </TableRow>
));

TableSkeleton.displayName = 'TableSkeleton';

// Memoized pagination component
const TablePagination = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  onNextPage, 
  onPrevPage 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
}) => {
  const visiblePages = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => currentPage > 1 && onPrevPage()}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        
        {visiblePages.map((page, index) => (
          <PaginationItem key={index}>
            {page === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                onClick={() => onPageChange(page as number)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => currentPage < totalPages && onNextPage()}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
});

TablePagination.displayName = 'TablePagination';

export const ContractsTableOptimized = memo(({
  contracts,
  loading,
  totalCount,
  currentPage,
  totalPages,
  onSearch,
  onFilterChange,
  onPageChange,
  onNextPage,
  onPrevPage
}: ContractsTableOptimizedProps) => {
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  }, [onSearch]);

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث في العقود (العميل، المركبة، رقم العقد...)"
                onChange={handleSearchChange}
                className="pr-10"
              />
            </div>
            
            <Select onValueChange={onFilterChange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="حالة العقد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="expired">منتهي الصلاحية</SelectItem>
                <SelectItem value="pending">في الانتظار</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قائمة العقود ({totalCount.toLocaleString()})</CardTitle>
            <div className="text-sm text-muted-foreground">
              صفحة {currentPage} من {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم العقد</TableHead>
                  <TableHead className="text-right">العميل</TableHead>
                  <TableHead className="text-right">المركبة</TableHead>
                  <TableHead className="text-right">تاريخ البداية</TableHead>
                  <TableHead className="text-right">تاريخ النهاية</TableHead>
                  <TableHead className="text-right">المبلغ الشهري</TableHead>
                  <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableSkeleton />
                ) : contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      لا توجد عقود مطابقة للبحث
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((contract) => (
                    <ContractRow key={contract.id} contract={contract} />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {!loading && contracts.length > 0 && (
            <div className="mt-4 flex justify-center">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                onNextPage={onNextPage}
                onPrevPage={onPrevPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

ContractsTableOptimized.displayName = 'ContractsTableOptimized';