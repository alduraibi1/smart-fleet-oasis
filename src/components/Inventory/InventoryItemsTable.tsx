
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Edit, Trash2 } from "lucide-react";
import { useInventory, InventoryItem } from "@/hooks/useInventory";
import EditInventoryItemDialog from "./dialogs/EditInventoryItemDialog";
import DeleteInventoryItemDialog from "./dialogs/DeleteInventoryItemDialog";
import { formatQuantityWithUnit } from "@/utils/unitTranslations";

type InventoryHook = ReturnType<typeof useInventory>;

const InventoryItemsTable = ({ inventory }: { inventory: InventoryHook }) => {
  const { items, categories } = inventory;

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);

  const filtered = useMemo(() => {
    let data: InventoryItem[] = items;
    if (categoryId && categoryId !== "all") data = data.filter(i => i.category_id === categoryId);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter(i =>
        i.name.toLowerCase().includes(term) ||
        i.sku?.toLowerCase().includes(term) ||
        i.barcode?.toLowerCase().includes(term) ||
        i.description?.toLowerCase().includes(term)
      );
    }
    return data;
  }, [items, categoryId, searchTerm]);

  const getStatusBadge = (item: InventoryItem) => {
    if (item.current_stock === 0) {
      return <Badge variant="destructive">نفد</Badge>;
    } else if (item.current_stock <= item.minimum_stock) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">منخفض</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">متوفر</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>عناصر المخزون</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="ابحث بالاسم أو الكود..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="تصفية حسب الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفئات</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنتج</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>الرصيد</TableHead>
                <TableHead>الحد الأدنى</TableHead>
                <TableHead>التكلفة</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    لا توجد عناصر مطابقة
                  </TableCell>
                </TableRow>
              ) : filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.sku || "-"}</div>
                    </div>
                  </TableCell>
                   <TableCell>{item.inventory_categories?.name || "-"}</TableCell>
                   <TableCell className="font-medium">
                     {formatQuantityWithUnit(item.current_stock, item.unit_of_measure)}
                   </TableCell>
                   <TableCell>
                     {formatQuantityWithUnit(item.minimum_stock, item.unit_of_measure)}
                   </TableCell>
                  <TableCell>{typeof item.unit_cost === "number" ? `${item.unit_cost}` : "-"}</TableCell>
                  <TableCell>{typeof item.selling_price === "number" ? `${item.selling_price}` : "-"}</TableCell>
                  <TableCell>{getStatusBadge(item)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditItem(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteItem(item)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Dialog للتعديل */}
        <EditInventoryItemDialog
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          inventory={inventory}
          item={editItem}
        />

        {/* Dialog للحذف */}
        <DeleteInventoryItemDialog
          open={!!deleteItem}
          onOpenChange={(open) => !open && setDeleteItem(null)}
          inventory={inventory}
          item={deleteItem}
        />
      </CardContent>
    </Card>
  );
};

export default InventoryItemsTable;
