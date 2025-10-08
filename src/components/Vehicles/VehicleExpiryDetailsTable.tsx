import { useState } from 'react';
import { Vehicle } from '@/types/vehicle';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown, ChevronUp, Search, FileSpreadsheet, Filter } from 'lucide-react';
import { VehicleInsuranceExpiry } from './VehicleInsuranceExpiry';
import { VehicleInspectionExpiry } from './VehicleInspectionExpiry';
import { VehicleRegistrationExpiry } from './VehicleRegistrationExpiry';
import * as XLSX from 'xlsx';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

interface VehicleExpiryDetailsTableProps {
  vehicles: Vehicle[];
}

type SortField = 'plate' | 'insurance' | 'inspection' | 'registration';
type SortOrder = 'asc' | 'desc';

export const VehicleExpiryDetailsTable = ({ vehicles }: VehicleExpiryDetailsTableProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('plate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'expired' | 'expiring' | 'valid'>('all');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getExpiryStatus = (dateStr?: string) => {
    if (!dateStr) return 'valid';
    try {
      const date = parseISO(dateStr);
      const today = new Date();
      const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'expired';
      if (diffDays <= 30) return 'expiring';
      return 'valid';
    } catch {
      return 'valid';
    }
  };

  const filteredVehicles = vehicles
    .filter(vehicle => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      if (searchTerm && !vehicle.plate_number?.toLowerCase().includes(searchLower) &&
          !vehicle.brand?.toLowerCase().includes(searchLower) &&
          !vehicle.model?.toLowerCase().includes(searchLower)) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const insuranceStatus = getExpiryStatus(vehicle.insurance_expiry);
        const inspectionStatus = getExpiryStatus(vehicle.inspection_expiry);
        const registrationStatus = getExpiryStatus(vehicle.registration_expiry);
        
        if (statusFilter === 'expired') {
          return insuranceStatus === 'expired' || inspectionStatus === 'expired' || registrationStatus === 'expired';
        } else if (statusFilter === 'expiring') {
          return insuranceStatus === 'expiring' || inspectionStatus === 'expiring' || registrationStatus === 'expiring';
        } else if (statusFilter === 'valid') {
          return insuranceStatus === 'valid' && inspectionStatus === 'valid' && registrationStatus === 'valid';
        }
      }

      return true;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'plate':
          aValue = a.plate_number || '';
          bValue = b.plate_number || '';
          break;
        case 'insurance':
          aValue = a.insurance_expiry || '9999-12-31';
          bValue = b.insurance_expiry || '9999-12-31';
          break;
        case 'inspection':
          aValue = a.inspection_expiry || '9999-12-31';
          bValue = b.inspection_expiry || '9999-12-31';
          break;
        case 'registration':
          aValue = a.registration_expiry || '9999-12-31';
          bValue = b.registration_expiry || '9999-12-31';
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const exportToExcel = () => {
    const data = filteredVehicles.map(vehicle => ({
      'رقم اللوحة': vehicle.plate_number,
      'العلامة التجارية': vehicle.brand,
      'الموديل': vehicle.model,
      'تاريخ انتهاء التأمين': vehicle.insurance_expiry ? format(parseISO(vehicle.insurance_expiry), 'dd/MM/yyyy', { locale: ar }) : 'غير محدد',
      'حالة التأمين': getExpiryStatus(vehicle.insurance_expiry) === 'expired' ? 'منتهي' : getExpiryStatus(vehicle.insurance_expiry) === 'expiring' ? 'قريب الانتهاء' : 'ساري',
      'تاريخ انتهاء الفحص': vehicle.inspection_expiry ? format(parseISO(vehicle.inspection_expiry), 'dd/MM/yyyy', { locale: ar }) : 'غير محدد',
      'حالة الفحص': getExpiryStatus(vehicle.inspection_expiry) === 'expired' ? 'منتهي' : getExpiryStatus(vehicle.inspection_expiry) === 'expiring' ? 'قريب الانتهاء' : 'ساري',
      'تاريخ انتهاء الاستمارة': vehicle.registration_expiry ? format(parseISO(vehicle.registration_expiry), 'dd/MM/yyyy', { locale: ar }) : 'غير محدد',
      'حالة الاستمارة': getExpiryStatus(vehicle.registration_expiry) === 'expired' ? 'منتهي' : getExpiryStatus(vehicle.registration_expiry) === 'expiring' ? 'قريب الانتهاء' : 'ساري',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'تواريخ الصلاحية');
    XLSX.writeFile(wb, `تواريخ_صلاحية_المركبات_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div className="text-right">
              <h3 className="text-lg font-bold">جدول تواريخ الصلاحية التفصيلي</h3>
              <p className="text-sm text-muted-foreground">
                عرض وتصدير جميع تواريخ انتهاء المركبات
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-primary" />
          ) : (
            <ChevronDown className="h-5 w-5 text-primary" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث برقم اللوحة، العلامة، أو الموديل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 rounded-md border bg-background"
              >
                <option value="all">جميع الحالات</option>
                <option value="expired">منتهي فقط</option>
                <option value="expiring">قريب الانتهاء فقط</option>
                <option value="valid">ساري فقط</option>
              </select>
              <Button onClick={exportToExcel} variant="outline" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                تصدير Excel
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('plate')}
                  >
                    <div className="flex items-center gap-2">
                      رقم اللوحة
                      {sortField === 'plate' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>المركبة</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('insurance')}
                  >
                    <div className="flex items-center gap-2">
                      التأمين
                      {sortField === 'insurance' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('inspection')}
                  >
                    <div className="flex items-center gap-2">
                      الفحص الدوري
                      {sortField === 'inspection' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('registration')}
                  >
                    <div className="flex items-center gap-2">
                      رخصة السير
                      {sortField === 'registration' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      لا توجد مركبات تطابق معايير البحث
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.plate_number}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                          <div className="text-sm text-muted-foreground">{vehicle.year}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <VehicleInsuranceExpiry expiryDate={vehicle.insurance_expiry} />
                      </TableCell>
                      <TableCell>
                        <VehicleInspectionExpiry expiryDate={vehicle.inspection_expiry} />
                      </TableCell>
                      <TableCell>
                        <VehicleRegistrationExpiry expiryDate={vehicle.registration_expiry} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>إجمالي المركبات: {filteredVehicles.length}</span>
            <span>تم التصفية من: {vehicles.length}</span>
          </div>
        </div>
      )}
    </Card>
  );
};
