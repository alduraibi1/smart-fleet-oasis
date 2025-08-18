
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContractIntegration {
  handleContractCreated: (contractData: any) => Promise<void>;
  handleContractCompleted: (contractId: string) => Promise<void>;
  handlePaymentReceived: (contractId: string, amount: number, paymentMethod: string) => Promise<void>;
}

export const useContractIntegration = (): ContractIntegration => {
  const { toast } = useToast();

  const handleContractCreated = async (contractData: any) => {
    try {
      // تحديث حالة السيارة إلى "مؤجرة"
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ status: 'rented' })
        .eq('id', contractData.vehicle_id);

      if (vehicleError) throw vehicleError;

      // الحصول على بيانات العقد والعميل
      const { data: contract, error: contractError } = await supabase
        .from('rental_contracts')
        .select('*, customers(name, email, phone)')
        .eq('id', contractData.id)
        .single();

      if (contractError) throw contractError;

      // إنشاء فاتورة للعقد
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
          customer_name: contract.customers?.name || 'غير محدد',
          customer_email: contract.customers?.email,
          customer_phone: contract.customers?.phone,
          contract_id: contractData.id,
          vehicle_id: contractData.vehicle_id,
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: contractData.end_date,
          subtotal: contractData.total_amount,
          tax_amount: contractData.total_amount * 0.15,
          total_amount: contractData.total_amount * 1.15,
          status: 'pending',
          invoice_type: 'rental'
        });

      if (invoiceError) throw invoiceError;

      // إنشاء تنبيه للعقد الجديد
      await supabase.functions.invoke('create-smart-notification', {
        body: {
          title: 'عقد جديد تم إنشاؤه',
          message: `تم إنشاء عقد جديد للعميل ${contract.customers?.name || 'غير محدد'}`,
          type: 'info',
          category: 'contract',
          priority: 'medium',
          reference_type: 'contract',
          reference_id: contractData.id
        }
      });

      toast({
        title: "تم إنشاء العقد بنجاح",
        description: "تم تحديث حالة السيارة وإنشاء الفاتورة تلقائياً"
      });

    } catch (error: any) {
      console.error('Error in contract integration:', error);
      toast({
        title: "خطأ في معالجة العقد",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleContractCompleted = async (contractId: string) => {
    try {
      // الحصول على بيانات العقد
      const { data: contract, error: contractError } = await supabase
        .from('rental_contracts')
        .select('*, vehicles(*)')
        .eq('id', contractId)
        .single();

      if (contractError) throw contractError;

      // تحديث حالة السيارة إلى "متاحة"
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({ status: 'available' })
        .eq('id', contract.vehicle_id);

      if (vehicleError) throw vehicleError;

      // تحديث حالة العقد
      const { error: updateError } = await supabase
        .from('rental_contracts')
        .update({ status: 'completed' })
        .eq('id', contractId);

      if (updateError) throw updateError;

      // إنشاء تنبيه لإكمال العقد
      await supabase.functions.invoke('create-smart-notification', {
        body: {
          title: 'تم إكمال العقد',
          message: `تم إكمال العقد وإرجاع المركبة ${contract.vehicles?.plate_number}`,
          type: 'success',
          category: 'contract',
          priority: 'low',
          reference_type: 'contract',
          reference_id: contractId
        }
      });

      toast({
        title: "تم إكمال العقد",
        description: "تم تحديث حالة السيارة تلقائياً"
      });

    } catch (error: any) {
      console.error('Error completing contract:', error);
      toast({
        title: "خطأ في إكمال العقد",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handlePaymentReceived = async (contractId: string, amount: number, paymentMethod: string) => {
    try {
      // الحصول على بيانات العقد + اسم العميل من جدول العملاء
      const { data: contract, error: getError } = await supabase
        .from('rental_contracts')
        .select('id, customer_id, vehicle_id, total_amount, customers(name)')
        .eq('id', contractId)
        .single();

      if (getError) throw getError;

      // إنشاء سند قبض (التأكد من تمرير customer_id واسم العميل الصحيح)
      const { error: receiptError } = await supabase
        .from('payment_receipts')
        .insert({
          receipt_number: `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
          contract_id: contractId,
          customer_id: contract.customer_id,
          customer_name: contract?.customers?.name || 'غير محدد',
          vehicle_id: contract.vehicle_id,
          amount: amount,
          payment_method: paymentMethod,
          payment_date: new Date().toISOString().split('T')[0],
          receipt_type: 'rental_payment',
          status: 'confirmed'
        });

      if (receiptError) throw receiptError;

      // تحديث حالة الفاتورة بناءً على إجمالي العقد
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({ 
          paid_amount: amount,
          status: amount >= (contract.total_amount || 0) ? 'paid' : 'partial'
        })
        .eq('contract_id', contractId);

      if (invoiceError) throw invoiceError;

      toast({
        title: "تم تسجيل الدفعة",
        description: "تم إنشاء سند القبض وتحديث العقد تلقائياً"
      });

    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        title: "خطأ في معالجة الدفعة",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return {
    handleContractCreated,
    handleContractCompleted,
    handlePaymentReceived
  };
};
