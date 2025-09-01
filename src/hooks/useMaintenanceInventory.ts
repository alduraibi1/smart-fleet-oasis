import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useInventory, InventoryItem } from './useInventory';

export interface MaintenancePartUsed {
  id?: string;
  maintenance_id: string;
  inventory_item_id: string;
  quantity_used: number;
  unit_cost: number;
  total_cost: number;
  notes?: string;
}

export interface MaintenanceOilUsed {
  id?: string;
  maintenance_id: string;
  inventory_item_id: string;
  quantity_used: number;
  unit_cost: number;
  total_cost: number;
  notes?: string;
}

export const useMaintenanceInventory = () => {
  const { toast } = useToast();
  const { items, fetchItems } = useInventory();
  const [loading, setLoading] = useState(false);

  // Get parts (inventory items that are parts)
  const getPartsInventory = (): InventoryItem[] => {
    return items.filter(item => 
      item.is_active && 
      item.current_stock > 0 &&
      (item.inventory_categories?.name?.toLowerCase().includes('قطع') ||
       item.inventory_categories?.name?.toLowerCase().includes('parts') ||
       item.name.toLowerCase().includes('فلتر') ||
       item.name.toLowerCase().includes('فرامل') ||
       item.name.toLowerCase().includes('بطارية') ||
       item.name.toLowerCase().includes('شمعة') ||
       item.name.toLowerCase().includes('حزام') ||
       item.name.toLowerCase().includes('إطار'))
    );
  };

  // Get oils and fluids (inventory items that are oils/fluids)
  const getOilsInventory = (): InventoryItem[] => {
    return items.filter(item => 
      item.is_active && 
      item.current_stock > 0 &&
      (item.inventory_categories?.name?.toLowerCase().includes('زيت') ||
       item.inventory_categories?.name?.toLowerCase().includes('oil') ||
       item.inventory_categories?.name?.toLowerCase().includes('سائل') ||
       item.name.toLowerCase().includes('زيت') ||
       item.name.toLowerCase().includes('oil') ||
       item.name.toLowerCase().includes('سائل'))
    );
  };

  // Save maintenance parts used
  const saveMaintenancePartsUsed = async (maintenanceId: string, partsUsed: any[]) => {
    setLoading(true);
    try {
      const partsData = partsUsed.map(part => ({
        maintenance_id: maintenanceId,
        inventory_item_id: part.partId,
        quantity_used: part.quantity,
        unit_cost: part.unitCost,
        total_cost: part.totalCost,
        notes: `${part.partName} - المخزون قبل الاستخدام: ${part.stockBefore}`
      }));

      const { error } = await supabase
        .from('maintenance_parts_used')
        .insert(partsData);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: `تم حفظ ${partsUsed.length} قطعة غيار مستخدمة`,
      });

      // Refresh inventory to get updated stock
      await fetchItems();
    } catch (error) {
      console.error('خطأ في حفظ قطع الغيار المستخدمة:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ قطع الغيار المستخدمة",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Save maintenance oils used
  const saveMaintenanceOilsUsed = async (maintenanceId: string, oilsUsed: any[]) => {
    setLoading(true);
    try {
      const oilsData = oilsUsed.map(oil => ({
        maintenance_id: maintenanceId,
        inventory_item_id: oil.oilId,
        quantity_used: oil.quantity,
        unit_cost: oil.unitCost,
        total_cost: oil.totalCost,
        notes: `${oil.oilName} - اللزوجة: ${oil.viscosity} - المخزون قبل الاستخدام: ${oil.stockBefore}`
      }));

      const { error } = await supabase
        .from('maintenance_oils_used')
        .insert(oilsData);

      if (error) throw error;

      toast({
        title: "تم بنجاح", 
        description: `تم حفظ ${oilsUsed.length} نوع زيت/سائل مستخدم`,
      });

      // Refresh inventory to get updated stock
      await fetchItems();
    } catch (error) {
      console.error('خطأ في حفظ الزيوت المستخدمة:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الزيوت المستخدمة",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check if sufficient stock is available
  const checkStockAvailability = (itemId: string, requestedQuantity: number): boolean => {
    const item = items.find(i => i.id === itemId);
    return item ? item.current_stock >= requestedQuantity : false;
  };

  // Get item details by ID
  const getItemById = (itemId: string): InventoryItem | undefined => {
    return items.find(item => item.id === itemId);
  };

  // Search parts by name, SKU, or barcode
  const searchParts = (searchTerm: string): InventoryItem[] => {
    if (!searchTerm.trim()) return getPartsInventory();
    
    const term = searchTerm.toLowerCase();
    return getPartsInventory().filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.sku?.toLowerCase().includes(term) ||
      item.barcode?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    );
  };

  // Search oils by name, SKU, or barcode
  const searchOils = (searchTerm: string): InventoryItem[] => {
    if (!searchTerm.trim()) return getOilsInventory();
    
    const term = searchTerm.toLowerCase();
    return getOilsInventory().filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.sku?.toLowerCase().includes(term) ||
      item.barcode?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    );
  };

  return {
    loading,
    getPartsInventory,
    getOilsInventory,
    saveMaintenancePartsUsed,
    saveMaintenanceOilsUsed,
    checkStockAvailability,
    getItemById,
    searchParts,
    searchOils,
  };
};