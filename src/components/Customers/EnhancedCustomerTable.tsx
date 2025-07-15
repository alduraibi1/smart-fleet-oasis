import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Customer } from "@/types";
import { CustomerLoadingSkeleton } from "./CustomerLoadingSkeleton";
import { 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Ban, 
  Shield, 
  Star,
  ArrowUpDown,
  Phone,
  Mail
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface EnhancedCustomerTableProps {
  customers: Customer[];
  loading: boolean;
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  onBlacklist: (customer: Customer) => void;
  selectedCustomers: string[];
  onSelectCustomer: (customerId: string) => void;
  onSelectAll: (checked: boolean) => void;
}

type SortField = 'name' | 'created_at' | 'rating' | 'total_rentals' | 'license_expiry';
type SortDirection = 'asc' | 'desc';

export const EnhancedCustomerTable = ({
  customers,
  loading,
  onEdit,
  onView,
  onBlacklist,
  selectedCustomers,
  onSelectCustomer,
  onSelectAll
}: EnhancedCustomerTableProps) => {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'total_rentals':
          aValue = a.total_rentals || 0;
          bValue = b.total_rentals || 0;
          break;
        case 'license_expiry':
          aValue = new Date(a.license_expiry).getTime();
          bValue = new Date(b.license_expiry).getTime();
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue as string, 'ar')
          : (bValue as string).localeCompare(aValue, 'ar');
      }
      
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [customers, sortField, sortDirection]);

  const getDocumentStatus = (licenseExpiry: Date) => {
    const today = new Date();
    const daysUntilExpiry = Math.ceil((licenseExpiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { text: 'منتهية', variant: 'destructive' as const };
    if (daysUntilExpiry <= 30) return { text: 'قريبة الانتهاء', variant: 'secondary' as const };
    return { text: 'صالحة', variant: 'default' as const };
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground mr-1">({rating})</span>
      </div>
    );
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => handleSort(field)}
        className="h-auto p-0 font-semibold hover:bg-transparent"
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  if (loading) {
    return <CustomerLoadingSkeleton viewMode="table" />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedCustomers.length === customers.length && customers.length > 0}
                onCheckedChange={onSelectAll}
                aria-label="تحديد جميع العملاء"
              />
            </TableHead>
            <TableHead>العميل</TableHead>
            <SortableHeader field="rating">التقييم</SortableHeader>
            <TableHead>التواصل</TableHead>
            <SortableHeader field="total_rentals">الإيجارات</SortableHeader>
            <SortableHeader field="license_expiry">انتهاء الرخصة</SortableHeader>
            <TableHead>الحالة</TableHead>
            <SortableHeader field="created_at">تاريخ التسجيل</SortableHeader>
            <TableHead className="text-center">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCustomers.map((customer) => {
            const documentStatus = getDocumentStatus(new Date(customer.license_expiry));
            
            return (
              <TableRow key={customer.id} className={customer.blacklisted ? 'bg-red-50/50' : ''}>
                <TableCell>
                  <Checkbox
                    checked={selectedCustomers.includes(customer.id)}
                    onCheckedChange={() => onSelectCustomer(customer.id)}
                    aria-label={`تحديد ${customer.name}`}
                  />
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} 
                      />
                      <AvatarFallback>
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {customer.national_id}
                      </div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  {renderStars(customer.rating)}
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3" />
                      <span dir="ltr">{customer.phone}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="text-center">
                  <Badge variant="outline">{customer.total_rentals || 0}</Badge>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant={documentStatus.variant}>
                      {documentStatus.text}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(customer.license_expiry), 'dd/MM/yyyy', { locale: ar })}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant={customer.is_active ? "default" : "secondary"}>
                      {customer.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                    {customer.blacklisted && (
                      <Badge variant="destructive">قائمة سوداء</Badge>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    {format(new Date(customer.created_at), 'dd/MM/yyyy', { locale: ar })}
                  </div>
                </TableCell>
                
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(customer)}>
                        <Eye className="ml-2 h-4 w-4" />
                        عرض التفاصيل
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(customer)}>
                        <Edit className="ml-2 h-4 w-4" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onBlacklist(customer)}
                        className={customer.blacklisted ? "text-green-600" : "text-red-600"}
                      >
                        {customer.blacklisted ? (
                          <>
                            <Shield className="ml-2 h-4 w-4" />
                            إزالة من القائمة السوداء
                          </>
                        ) : (
                          <>
                            <Ban className="ml-2 h-4 w-4" />
                            إضافة للقائمة السوداء
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {sortedCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">لا توجد عملاء لعرضها</p>
        </div>
      )}
    </div>
  );
};