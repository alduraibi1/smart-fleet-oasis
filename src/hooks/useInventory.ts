import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  supplier_id?: string;
  sku?: string;
  barcode?: string;
  unit_of_measure: string;
  unit_cost: number;
  selling_price?: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  reorder_point?: number;
  location?: string;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  inventory_categories?: {
    name: string;
  };
  suppliers?: {
    name: string;
  };
}

export interface StockTransaction {
  id: string;
  item_id: string;
  transaction_type: string;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  performed_by?: string;
  transaction_date: string;
  created_at: string;
  inventory_items?: {
    name: string;
    sku?: string;
  };
}

export const useInventory = () => {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // جلب فئات المخزون
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('خطأ في جلب فئات المخزون:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب فئات المخزون",
        variant: "destructive",
      });
    }
  };

  // جلب عناصر المخزون
  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          inventory_categories (name),
          suppliers (name)
        `)
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('خطأ في جلب عناصر المخزون:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب عناصر المخزون",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // جلب حركات المخزون
  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_transactions')
        .select(`
          *,
          inventory_items (name, sku)
        `)
        .order('transaction_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('خطأ في جلب حركات المخزون:', error);
    }
  };

  // إضافة فئة جديدة
  const addCategory = async (categoryData: Partial<InventoryCategory>) => {
    try {
      const { data, error } = await supabase
        .from('inventory_categories')
        .insert([{
          name: categoryData.name!,
          description: categoryData.description
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة الفئة بنجاح",
      });

      await fetchCategories();
      return data;
    } catch (error) {
      console.error('خطأ في إضافة الفئة:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة الفئة",
        variant: "destructive",
      });
      throw error;
    }
  };

  // إضافة عنصر مخزون جديد
  const addItem = async (itemData: Partial<InventoryItem>) => {
    try {
      const insertData = {
        name: itemData.name!,
        description: itemData.description,
        category_id: itemData.category_id,
        supplier_id: itemData.supplier_id,
        sku: itemData.sku,
        barcode: itemData.barcode,
        unit_of_measure: itemData.unit_of_measure || 'piece',
        unit_cost: itemData.unit_cost || 0,
        selling_price: itemData.selling_price,
        current_stock: itemData.current_stock || 0,
        minimum_stock: itemData.minimum_stock || 0,
        maximum_stock: itemData.maximum_stock,
        reorder_point: itemData.reorder_point,
        location: itemData.location,
        expiry_date: itemData.expiry_date,
        is_active: itemData.is_active !== false
      };

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة العنصر بنجاح",
      });

      await fetchItems();
      return data;
    } catch (error) {
      console.error('خطأ في إضافة العنصر:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة العنصر",
        variant: "destructive",
      });
      throw error;
    }
  };

  // تحديث عنصر مخزون
  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تحديث العنصر بنجاح",
      });

      await fetchItems();
    } catch (error) {
      console.error('خطأ في تحديث العنصر:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث العنصر",
        variant: "destructive",
      });
      throw error;
    }
  };

  // حذف عنصر مخزون
  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف العنصر بنجاح",
      });

      await fetchItems();
    } catch (error) {
      console.error('خطأ في حذف العنصر:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف العنصر",
        variant: "destructive",
      });
      throw error;
    }
  };

  // إضافة حركة مخزون
  const addStockTransaction = async (transactionData: Partial<StockTransaction>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const insertData = {
        item_id: transactionData.item_id!,
        transaction_type: transactionData.transaction_type!,
        quantity: transactionData.quantity!,
        unit_cost: transactionData.unit_cost,
        total_cost: transactionData.total_cost,
        reference_type: transactionData.reference_type,
        reference_id: transactionData.reference_id,
        notes: transactionData.notes,
        performed_by: user?.id,
        transaction_date: transactionData.transaction_date || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('stock_transactions')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      // تحديث رصيد المخزون
      const item = items.find(item => item.id === transactionData.item_id);
      if (item) {
        let newStock = item.current_stock;
        if (transactionData.transaction_type === 'in') {
          newStock += transactionData.quantity!;
        } else if (transactionData.transaction_type === 'out') {
          newStock -= transactionData.quantity!;
        } else if (transactionData.transaction_type === 'adjustment') {
          newStock = transactionData.quantity!;
        }

        await supabase
          .from('inventory_items')
          .update({ current_stock: newStock })
          .eq('id', transactionData.item_id);
      }

      toast({
        title: "تم بنجاح",
        description: "تم إضافة حركة المخزون بنجاح",
      });

      await fetchItems();
      await fetchTransactions();
      return data;
    } catch (error) {
      console.error('خطأ في إضافة حركة المخزون:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة حركة المخزون",
        variant: "destructive",
      });
      throw error;
    }
  };

  // الحصول على العناصر المنخفضة المخزون
  const getLowStockItems = () => {
    return items.filter(item => 
      item.current_stock <= item.minimum_stock && item.is_active
    );
  };

  // الحصول على العناصر منتهية الصلاحية
  const getExpiredItems = () => {
    const today = new Date();
    return items.filter(item => 
      item.expiry_date && new Date(item.expiry_date) <= today && item.is_active
    );
  };

  // حساب إحصائيات المخزون
  const getInventoryStats = () => {
    const totalItems = items.length;
    const activeItems = items.filter(item => item.is_active).length;
    const lowStockCount = getLowStockItems().length;
    const expiredCount = getExpiredItems().length;
    const totalValue = items.reduce((sum, item) => sum + (item.current_stock * item.unit_cost), 0);

    return {
      totalItems,
      activeItems,
      lowStockCount,
      expiredCount,
      totalValue
    };
  };

  // البحث في المخزون
  const searchItems = (searchTerm: string) => {
    if (!searchTerm.trim()) return items;
    
    const term = searchTerm.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.sku?.toLowerCase().includes(term) ||
      item.barcode?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    );
  };

  // تصفية حسب الفئة
  const filterByCategory = (categoryId: string) => {
    if (!categoryId) return items;
    return items.filter(item => item.category_id === categoryId);
  };

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchCategories();
    fetchItems();
    fetchTransactions();
  }, []);

  return {
    categories,
    items,
    transactions,
    loading,
    fetchCategories,
    fetchItems,
    fetchTransactions,
    addCategory,
    addItem,
    updateItem,
    deleteItem,
    addStockTransaction,
    getLowStockItems,
    getExpiredItems,
    getInventoryStats,
    searchItems,
    filterByCategory
  };
};