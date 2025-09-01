
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useInventory, InventoryCategory } from "@/hooks/useInventory";
import EditInventoryCategoryDialog from "./dialogs/EditInventoryCategoryDialog";
import DeleteInventoryCategoryDialog from "./dialogs/DeleteInventoryCategoryDialog";

type InventoryHook = ReturnType<typeof useInventory>;

const InventoryCategoriesManager = ({ inventory }: { inventory: InventoryHook }) => {
  const { categories, items } = inventory;
  
  const [editCategory, setEditCategory] = useState<InventoryCategory | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<InventoryCategory | null>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of items) {
      if (i.category_id) {
        map.set(i.category_id, (map.get(i.category_id) || 0) + 1);
      }
    }
    return map;
  }, [items]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>فئات المخزون</CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            لا توجد فئات بعد. استخدم زر "إضافة فئة" بالأعلى.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(cat => (
              <div key={cat.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{cat.name}</div>
                    {cat.description && (
                      <div className="text-xs text-muted-foreground mt-1">{cat.description}</div>
                    )}
                    <Badge variant="outline" className="mt-2">
                      {counts.get(cat.id) || 0} عنصر
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditCategory(cat)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteCategory(cat)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dialog للتعديل */}
        <EditInventoryCategoryDialog
          open={!!editCategory}
          onOpenChange={(open) => !open && setEditCategory(null)}
          inventory={inventory}
          category={editCategory}
        />

        {/* Dialog للحذف */}
        <DeleteInventoryCategoryDialog
          open={!!deleteCategory}
          onOpenChange={(open) => !open && setDeleteCategory(null)}
          inventory={inventory}
          category={deleteCategory}
        />
      </CardContent>
    </Card>
  );
};

export default InventoryCategoriesManager;
