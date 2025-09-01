
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInventory } from "@/hooks/useInventory";

type InventoryHook = ReturnType<typeof useInventory>;

const InventoryCategoriesManager = ({ inventory }: { inventory: InventoryHook }) => {
  const { categories, items } = inventory;

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
              <div key={cat.id} className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-medium">{cat.name}</div>
                  {cat.description && (
                    <div className="text-xs text-muted-foreground mt-1">{cat.description}</div>
                  )}
                </div>
                <Badge variant="outline">
                  {counts.get(cat.id) || 0} عنصر
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryCategoriesManager;
