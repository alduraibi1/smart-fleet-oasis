
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Customer } from "@/types";
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Ban, 
  Shield,
  Trash2,
  Star,
  Phone,
  Mail,
  Calendar
} from "lucide-react";
import { memo } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface CustomerRowProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (customerId: string) => void;
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  onBlacklist: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
}

export const CustomerRow = memo(({
  customer,
  isSelected,
  onSelect,
  onEdit,
  onView,
  onBlacklist,
  onDelete
}: CustomerRowProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ar });
    } catch {
      return '-';
    }
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(customer.id)}
          aria-label={`تحديد العميل ${customer.name}`}
        />
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
            {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p className="font-medium">{customer.name}</p>
            <p className="text-sm text-muted-foreground">{customer.nationalId || customer.national_id}</p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
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
        <div className="space-y-1">
          <p className="text-sm">{customer.nationality || 'غير محدد'}</p>
          <p className="text-sm text-muted-foreground">{customer.city || 'غير محدد'}</p>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < (customer.rating || 0)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            ({customer.rating || 0})
          </span>
        </div>
      </TableCell>

      <TableCell>
        <div className="space-y-1">
          <Badge variant={customer.is_active ? "default" : "secondary"} className="text-xs">
            {customer.is_active ? "نشط" : "غير نشط"}
          </Badge>
          {customer.blacklisted && (
            <Badge variant="destructive" className="text-xs">
              قائمة سوداء
            </Badge>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDate(customer.created_at)}
        </div>
      </TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onView(customer)}>
              <Eye className="h-4 w-4 ml-2" />
              عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(customer)}>
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onBlacklist(customer)}>
              {customer.blacklisted ? (
                <>
                  <Shield className="h-4 w-4 ml-2" />
                  إزالة من القائمة السوداء
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 ml-2" />
                  إضافة للقائمة السوداء
                </>
              )}
            </DropdownMenuItem>
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(customer)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف العميل
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

CustomerRow.displayName = "CustomerRow";
