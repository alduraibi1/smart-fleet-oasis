
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/hooks/useInventory";

type InventoryHook = ReturnType<typeof useInventory>;

const typeLabel: Record<string, string> = {
  in: "إدخال",
  out: "إخراج",
  adjustment: "تسوية",
};

const InventoryTransactionsTable = ({ inventory }: { inventory: InventoryHook }) => {
  const { transactions } = inventory;

  const typeBadge = (t: string) => {
    if (t === "in") return <Badge className="bg-green-100 text-green-800">إدخال</Badge>;
    if (t === "out") return <Badge className="bg-red-100 text-red-800" variant="secondary">إخراج</Badge>;
    return <Badge className="bg-blue-100 text-blue-800" variant="outline">تسوية</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>حركات المخزون الأخيرة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>العنصر</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>التكلفة</TableHead>
                <TableHead>مرجع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    لا توجد حركات حتى الآن
                  </TableCell>
                </TableRow>
              ) : transactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.transaction_date).toLocaleString()}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{tx.inventory_items?.name || "-"}</div>
                      <div className="text-xs text-muted-foreground">{tx.inventory_items?.sku || ""}</div>
                    </div>
                  </TableCell>
                  <TableCell>{typeBadge(tx.transaction_type)}</TableCell>
                  <TableCell className="font-medium">{tx.quantity}</TableCell>
                  <TableCell>{typeof tx.total_cost === "number" ? `${tx.total_cost}` : (typeof tx.unit_cost === "number" ? `${tx.unit_cost}` : "-")}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {tx.reference_type || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryTransactionsTable;
