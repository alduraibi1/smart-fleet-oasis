import { useState } from 'react';
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

const statusConfig = {
  active: { label: 'نشط', color: 'bg-success text-success-foreground' },
  expired: { label: 'منتهي الصلاحية', color: 'bg-destructive text-destructive-foreground' },
  pending: { label: 'في الانتظار', color: 'bg-warning text-warning-foreground' },
  completed: { label: 'مكتمل', color: 'bg-secondary text-secondary-foreground' },
  cancelled: { label: 'ملغي', color: 'bg-muted text-muted-foreground' }
};

const contractTypeConfig = {
  daily: { label: 'يومي', color: 'bg-blue-100 text-blue-800' },
  monthly: { label: 'شهري', color: 'bg-green-100 text-green-800' }
};

interface ContractsTableProps {
  contracts: any[];
  loading: boolean;
}

export const ContractsTable = ({ contracts, loading }: ContractsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter contracts based on search and filters
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.vehicle?.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.vehicle?.plate_number.includes(searchTerm) ||
      contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get contract type from duration
  const getContractType = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30 ? 'monthly' : 'daily';
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          <CardTitle>قائمة العقود ({filteredContracts.length})</CardTitle>
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
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      جاري تحميل العقود...
                    </TableCell>
                  </TableRow>
                ) : filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground">
                      لا توجد عقود مطابقة للبحث
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
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
                          className={contractTypeConfig[getContractType(contract.start_date, contract.end_date)].color}
                        >
                          {contractTypeConfig[getContractType(contract.start_date, contract.end_date)].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusConfig[contract.status]?.color || statusConfig.pending.color}
                        >
                          {statusConfig[contract.status]?.label || 'غير محدد'}
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};