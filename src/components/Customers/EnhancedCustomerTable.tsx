
import { memo } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { Customer } from "@/types";
import { CustomerLoadingSkeleton } from "./CustomerLoadingSkeleton";
import { CustomerTableHeader } from "./CustomerTableHeader";
import { CustomerRow } from "./CustomerRow";
import { useCustomerSorting } from "@/hooks/useCustomerSorting";

interface EnhancedCustomerTableProps {
  customers: Customer[];
  loading: boolean;
  onEdit: (customer: Customer) => void;
  onView: (customer: Customer) => void;
  onBlacklist: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  selectedCustomers: string[];
  onSelectCustomer: (customerId: string) => void;
  onSelectAll: (checked: boolean) => void;
}

export const EnhancedCustomerTable = memo(({
  customers,
  loading,
  onEdit,
  onView,
  onBlacklist,
  onDelete,
  selectedCustomers,
  onSelectCustomer,
  onSelectAll
}: EnhancedCustomerTableProps) => {
  const { sortField, sortDirection, sortedCustomers, handleSort } = useCustomerSorting(customers);

  if (loading) {
    return <CustomerLoadingSkeleton viewMode="table" />;
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <p className="text-muted-foreground">لا توجد عملاء مطابقة للفلاتر المحددة</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-background animate-fade-in">
      <Table>
        <CustomerTableHeader
          selectedCustomers={selectedCustomers}
          customers={customers}
          onSelectAll={onSelectAll}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <TableBody>
          {sortedCustomers.map((customer, index) => (
            <CustomerRow
              key={customer.id}
              customer={customer}
              isSelected={selectedCustomers.includes(customer.id)}
              onSelect={onSelectCustomer}
              onEdit={onEdit}
              onView={onView}
              onBlacklist={onBlacklist}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

EnhancedCustomerTable.displayName = "EnhancedCustomerTable";
