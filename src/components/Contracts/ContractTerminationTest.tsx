
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ContractTerminationDialog } from './ContractTerminationDialog';
import { PendingTerminationRequests } from './PendingTerminationRequests';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface TestContract {
  id: string;
  contract_number: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  daily_rate: number;
  total_amount: number;
  status: string;
  customer?: { name: string };
  vehicle?: { brand: string; model: string; year: number; plate_number: string };
}

export const ContractTerminationTest = () => {
  const [contracts, setContracts] = useState<TestContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<TestContract | null>(null);
  const [terminationDialogOpen, setTerminationDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchActiveContracts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rental_contracts')
        .select(`
          *,
          customer:customers(name),
          vehicle:vehicles(brand, model, year, plate_number)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في جلب العقود",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveContracts();
  }, []);

  const handleTestTermination = (contract: TestContract) => {
    setSelectedContract(contract);
    setTerminationDialogOpen(true);
  };

  const getContractStatus = (contract: TestContract) => {
    const today = new Date();
    const endDate = new Date(contract.end_date);
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      return { type: 'expired', label: 'منتهي', icon: AlertTriangle, color: 'destructive' };
    } else if (daysUntilExpiry <= 7) {
      return { type: 'expiring', label: `ينتهي خلال ${daysUntilExpiry} أيام`, icon: Clock, color: 'outline' };
    } else {
      return { type: 'active', label: 'نشط', icon: CheckCircle, color: 'default' };
    }
  };

  const calculateEarlyTerminationPreview = (contract: TestContract) => {
    const today = new Date();
    const startDate = new Date(contract.start_date);
    const endDate = new Date(contract.end_date);
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const usedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = totalDays - usedDays;
    
    const usedAmount = usedDays * contract.daily_rate;
    const potentialSavings = remainingDays * contract.daily_rate;
    
    return {
      totalDays,
      usedDays,
      remainingDays,
      usedAmount,
      potentialSavings
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">اختبار إنهاء العقود</h2>
          <p className="text-muted-foreground">اختبار وظائف الإرجاع العادي والإلغاء المبكر</p>
        </div>
        <Button onClick={fetchActiveContracts} disabled={loading}>
          {loading ? "جاري التحديث..." : "تحديث القائمة"}
        </Button>
      </div>

      {/* Test Instructions */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>تعليمات الاختبار:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>اختر عقداً نشطاً لاختبار الإرجاع العادي أو الإلغاء المبكر</li>
            <li>العقود المنتهية تظهر خيار الإرجاع العادي فقط</li>
            <li>العقود النشطة تظهر كلا الخيارين</li>
            <li>اختبر السيناريوهات المختلفة مع رسوم إضافية</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Active Contracts for Testing */}
      <Card>
        <CardHeader>
          <CardTitle>العقود النشطة المتاحة للاختبار</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : contracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد عقود نشطة للاختبار
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => {
                const status = getContractStatus(contract);
                const preview = calculateEarlyTerminationPreview(contract);
                const StatusIcon = status.icon;

                return (
                  <div key={contract.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{contract.contract_number}</h3>
                          <Badge variant={status.color as any}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p><strong>العميل:</strong> {contract.customer?.name}</p>
                            <p><strong>المركبة:</strong> {contract.vehicle?.brand} {contract.vehicle?.model}</p>
                            <p><strong>اللوحة:</strong> {contract.vehicle?.plate_number}</p>
                          </div>
                          
                          <div>
                            <p><strong>تاريخ البداية:</strong> {contract.start_date}</p>
                            <p><strong>تاريخ النهاية:</strong> {contract.end_date}</p>
                            <p><strong>السعر اليومي:</strong> {contract.daily_rate} ر.س</p>
                          </div>
                          
                          <div>
                            <p><strong>الأيام المستخدمة:</strong> {preview.usedDays} يوم</p>
                            <p><strong>الأيام المتبقية:</strong> {preview.remainingDays} يوم</p>
                            <p><strong>التوفير المحتمل:</strong> {preview.potentialSavings.toLocaleString()} ر.س</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Button
                          onClick={() => handleTestTermination(contract)}
                          variant="outline"
                        >
                          اختبار الإنهاء
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Requests Section */}
      <PendingTerminationRequests />

      {/* Termination Dialog */}
      {selectedContract && (
        <ContractTerminationDialog
          open={terminationDialogOpen}
          onOpenChange={setTerminationDialogOpen}
          contract={selectedContract}
          onCompleted={() => {
            fetchActiveContracts();
            setSelectedContract(null);
          }}
        />
      )}
    </div>
  );
};
