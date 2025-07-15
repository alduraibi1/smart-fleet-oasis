import { memo } from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";

type SortField = 'name' | 'created_at' | 'rating' | 'total_rentals' | 'license_expiry';
type SortDirection = 'asc' | 'desc';

interface CustomerTableHeaderProps {
  selectedCustomers: string[];
  customers: any[];
  onSelectAll: (checked: boolean) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export const CustomerTableHeader = memo(({
  selectedCustomers,
  customers,
  onSelectAll,
  sortField,
  sortDirection,
  onSort
}: CustomerTableHeaderProps) => {
  const getSortIcon = (field: SortField) => (
    <ArrowUpDown 
      className={`ml-2 h-4 w-4 ${
        sortField === field ? 'text-primary' : 'text-muted-foreground'
      }`} 
    />
  );

  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <Checkbox
            checked={selectedCustomers.length === customers.length && customers.length > 0}
            onCheckedChange={onSelectAll}
            aria-label="اختيار جميع العملاء"
          />
        </TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            onClick={() => onSort('name')}
            className="font-semibold p-0 h-auto hover:bg-transparent"
          >
            العميل
            {getSortIcon('name')}
          </Button>
        </TableHead>
        <TableHead>معلومات الاتصال</TableHead>
        <TableHead>الحالة</TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            onClick={() => onSort('rating')}
            className="font-semibold p-0 h-auto hover:bg-transparent"
          >
            التقييم
            {getSortIcon('rating')}
          </Button>
        </TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            onClick={() => onSort('total_rentals')}
            className="font-semibold p-0 h-auto hover:bg-transparent"
          >
            الإيجارات
            {getSortIcon('total_rentals')}
          </Button>
        </TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            onClick={() => onSort('license_expiry')}
            className="font-semibold p-0 h-auto hover:bg-transparent"
          >
            انتهاء الرخصة
            {getSortIcon('license_expiry')}
          </Button>
        </TableHead>
        <TableHead>
          <Button 
            variant="ghost" 
            onClick={() => onSort('created_at')}
            className="font-semibold p-0 h-auto hover:bg-transparent"
          >
            تاريخ التسجيل
            {getSortIcon('created_at')}
          </Button>
        </TableHead>
        <TableHead className="w-12">الإجراءات</TableHead>
      </TableRow>
    </TableHeader>
  );
});

CustomerTableHeader.displayName = "CustomerTableHeader";