import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_number?: string;
  payment_terms?: string;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  created_by?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
  suppliers?: {
    name: string;
    contact_person?: string;
  };
  purchase_order_items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  item_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  received_quantity: number;
  created_at: string;
  inventory_items?: {
    name: string;
    sku?: string;
    unit_of_measure: string;
  };
}

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // جلب الموردين
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('خطأ في جلب الموردين:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب الموردين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // جلب أوامر الشراء
  const fetchPurchaseOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          suppliers (name, contact_person),
          purchase_order_items (
            *,
            inventory_items (name, sku, unit_of_measure)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchaseOrders(data || []);
    } catch (error) {
      console.error('خطأ في جلب أوامر الشراء:', error);
    }
  };

  // إضافة مورد جديد
  const addSupplier = async (supplierData: Partial<Supplier>) => {
    try {
      const insertData = {
        name: supplierData.name!,
        contact_person: supplierData.contact_person,
        email: supplierData.email,
        phone: supplierData.phone,
        address: supplierData.address,
        tax_number: supplierData.tax_number,
        payment_terms: supplierData.payment_terms,
        rating: supplierData.rating || 0,
        is_active: supplierData.is_active !== false
      };

      const { data, error } = await supabase
        .from('suppliers')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم إضافة المورد بنجاح",
      });

      await fetchSuppliers();
      return data;
    } catch (error) {
      console.error('خطأ في إضافة المورد:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة المورد",
        variant: "destructive",
      });
      throw error;
    }
  };

  // تحديث مورد
  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تحديث المورد بنجاح",
      });

      await fetchSuppliers();
    } catch (error) {
      console.error('خطأ في تحديث المورد:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث المورد",
        variant: "destructive",
      });
      throw error;
    }
  };

  // حذف مورد
  const deleteSupplier = async (id: string) => {
    try {
      // التحقق من وجود أوامر شراء مرتبطة
      const { data: orders } = await supabase
        .from('purchase_orders')
        .select('id')
        .eq('supplier_id', id)
        .limit(1);

      if (orders && orders.length > 0) {
        toast({
          title: "تعذر الحذف",
          description: "لا يمكن حذف المورد لوجود أوامر شراء مرتبطة به",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف المورد بنجاح",
      });

      await fetchSuppliers();
    } catch (error) {
      console.error('خطأ في حذف المورد:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المورد",
        variant: "destructive",
      });
      throw error;
    }
  };

  // إنشاء أمر شراء جديد
  const createPurchaseOrder = async (orderData: Partial<PurchaseOrder>, items: Partial<PurchaseOrderItem>[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // إنشاء رقم أمر الشراء
      const orderNumber = `PO-${Date.now()}`;

      // حساب المجاميع
      const subtotal = items.reduce((sum, item) => sum + (item.quantity! * item.unit_cost!), 0);
      const taxAmount = orderData.tax_amount || 0;
      const discountAmount = orderData.discount_amount || 0;
      const totalAmount = subtotal + taxAmount - discountAmount;

      const insertData = {
        order_number: orderNumber,
        supplier_id: orderData.supplier_id!,
        order_date: orderData.order_date || new Date().toISOString().split('T')[0],
        expected_delivery_date: orderData.expected_delivery_date,
        status: orderData.status || 'draft',
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        notes: orderData.notes,
        created_by: user?.id
      };

      const { data: order, error: orderError } = await supabase
        .from('purchase_orders')
        .insert([insertData])
        .select()
        .single();

      if (orderError) throw orderError;

      // إضافة عناصر أمر الشراء
      const orderItems = items.map(item => ({
        purchase_order_id: order.id,
        item_id: item.item_id!,
        quantity: item.quantity!,
        unit_cost: item.unit_cost!,
        total_cost: item.quantity! * item.unit_cost!,
        received_quantity: 0
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء أمر الشراء بنجاح",
      });

      await fetchPurchaseOrders();
      return order;
    } catch (error) {
      console.error('خطأ في إنشاء أمر الشراء:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء أمر الشراء",
        variant: "destructive",
      });
      throw error;
    }
  };

  // تحديث حالة أمر الشراء
  const updatePurchaseOrderStatus = async (id: string, status: string, actualDeliveryDate?: string) => {
    try {
      const updates: any = { status };
      if (actualDeliveryDate) {
        updates.actual_delivery_date = actualDeliveryDate;
      }

      const { error } = await supabase
        .from('purchase_orders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تحديث حالة أمر الشراء بنجاح",
      });

      await fetchPurchaseOrders();
    } catch (error) {
      console.error('خطأ في تحديث حالة أمر الشراء:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة أمر الشراء",
        variant: "destructive",
      });
      throw error;
    }
  };

  // تحديث تقييم المورد
  const updateSupplierRating = async (id: string, rating: number) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ rating })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تحديث تقييم المورد بنجاح",
      });

      await fetchSuppliers();
    } catch (error) {
      console.error('خطأ في تحديث تقييم المورد:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث تقييم المورد",
        variant: "destructive",
      });
      throw error;
    }
  };

  // الحصول على إحصائيات الموردين
  const getSupplierStats = () => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(supplier => supplier.is_active).length;
    const topRatedSuppliers = suppliers.filter(supplier => supplier.rating >= 4).length;
    const totalOrders = purchaseOrders.length;
    const pendingOrders = purchaseOrders.filter(order => order.status === 'sent' || order.status === 'confirmed').length;
    const totalOrderValue = purchaseOrders.reduce((sum, order) => sum + order.total_amount, 0);

    return {
      totalSuppliers,
      activeSuppliers,
      topRatedSuppliers,
      totalOrders,
      pendingOrders,
      totalOrderValue
    };
  };

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchSuppliers();
    fetchPurchaseOrders();
  }, []);

  return {
    suppliers,
    purchaseOrders,
    loading,
    fetchSuppliers,
    fetchPurchaseOrders,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    createPurchaseOrder,
    updatePurchaseOrderStatus,
    updateSupplierRating,
    getSupplierStats
  };
};