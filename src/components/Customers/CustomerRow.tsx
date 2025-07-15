import { memo } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
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
import { 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Ban, 
  Shield, 
  Star,
  Phone,
  Mail
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface CustomerRowProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (customerId: string) => void;
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  onBlacklist: (customer: Customer) => void;
}

export const CustomerRow = memo(({
  customer,
  isSelected,
  onSelect,
  onEdit,
  onView,
  onBlacklist
}: CustomerRowProps) => {
  const getStatusVariant = (status: boolean) => {
    return status ? 'default' : 'secondary';
  };

  const getStatusLabel = (status: boolean) => {
    return status ? 'نشط' : 'غير نشط';
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TableRow className={`hover:bg-muted/50 transition-colors ${customer.blacklisted ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(customer.id)}
          aria-label={`اختيار العميل ${customer.name}`}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={customer.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium flex items-center gap-2">
              {customer.name}
              {customer.blacklisted && (
                <Badge variant="destructive" className="text-xs">
                  قائمة سوداء
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {customer.national_id || customer.nationalId}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Phone className="h-3 w-3" />
            {customer.phone}
          </div>
          {customer.email && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              {customer.email}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusVariant(customer.is_active)}>
          {getStatusLabel(customer.is_active)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {getRatingStars(customer.rating || 5)}
          <span className="text-sm text-muted-foreground ml-1">
            ({customer.rating || 5})
          </span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        {customer.total_rentals || 0}
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {customer.license_expiry ? format(new Date(customer.license_expiry), 'dd/MM/yyyy', { locale: ar }) : 'غير محدد'}
        </div>
        {customer.license_expiry && new Date(customer.license_expiry) < new Date() && (
          <Badge variant="destructive" className="text-xs mt-1">
            منتهية
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="text-sm">
          {customer.created_at ? format(new Date(customer.created_at), 'dd/MM/yyyy', { locale: ar }) : 'غير محدد'}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">فتح القائمة</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background border shadow-lg">
            <DropdownMenuItem onClick={() => onView(customer)} className="cursor-pointer">
              <Eye className="ml-2 h-4 w-4" />
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(customer)} className="cursor-pointer">
              <Edit className="ml-2 h-4 w-4" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onBlacklist(customer)} 
              className="cursor-pointer text-destructive focus:text-destructive"
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
});

CustomerRow.displayName = "CustomerRow";