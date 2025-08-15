
import { AppLayout } from "@/components/Layout/AppLayout";
import { CompleteCustomerManagement } from "@/components/Customers/CompleteCustomerManagement";

const EnhancedCustomers = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">إدارة العملاء الشاملة</h1>
          <p className="text-muted-foreground mt-2">
            نظام متكامل لإدارة قاعدة بيانات العملاء
          </p>
        </div>
        <CompleteCustomerManagement />
      </div>
    </AppLayout>
  );
};

export default EnhancedCustomers;
