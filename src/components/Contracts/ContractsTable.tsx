
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, ArrowLeft, FileText } from 'lucide-react';
import VehicleReturnDialog from './VehicleReturnDialog';
import DetailedReturnReport from './DetailedReturnReport';

interface Contract {
  id: string;
  customer?: { name: string };
  vehicle?: { brand: string; model: string; plate_number: string };
  start_date: string;
  end_date: string;
  daily_rate: number;
  total_amount: number;
  status: string;
  actual_return_date?: string;
  additional_charges?: number;
}

interface ContractsTableProps {
  contracts: Contract[];
  loading: boolean;
}

export function ContractsTable({ contracts, loading }: ContractsTableProps) {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'نشط', variant: 'default' as const },
      completed: { label: 'مكتمل', variant: 'secondary' as const },
      cancelled: { label: 'ملغي', variant: 'destructive' as const },
      draft: { label: 'مسودة', variant: 'outline' as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.draft;
  };

  if (loading) {
    return <div className="text-center py-4">جاري التحميل...</div>;
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">لا توجد عقود متاحة</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>العميل</TableHead>
            <TableHead>المركبة</TableHead>
            <TableHead>تاريخ البداية</TableHead>
            <TableHead>تاريخ النهاية</TableHead>
            <TableHead>المبلغ اليومي</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => {
            const statusBadge = getStatusBadge(contract.status);
            return (
              <TableRow key={contract.id}>
                <TableCell>
                  <div className="font-medium">
                    {contract.customer?.name || 'غير محدد'}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {contract.vehicle?.brand} {contract.vehicle?.model}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {contract.vehicle?.plate_number}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(contract.start_date).toLocaleDateString('ar-SA')}
                </TableCell>
                <TableCell>
                  {new Date(contract.end_date).toLocaleDateString('ar-SA')}
                </TableCell>
                <TableCell>
                  {contract.daily_rate.toLocaleString()} ر.س
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadge.variant}>
                    {statusBadge.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {contract.status === 'active' && (
                      <VehicleReturnDialog 
                        contractId={contract.id}
                        trigger={
                          <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 ml-1" />
                            إرجاع المركبة
                          </Button>
                        }
                      />
                    )}
                    
                    {contract.status === 'completed' && (
                      <DetailedReturnReport contractId={contract.id} />
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">فتح القائمة</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          تعديل
                        </DropdownMenuItem>
                        {contract.status === 'completed' && (
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            تقرير الإرجاع
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
