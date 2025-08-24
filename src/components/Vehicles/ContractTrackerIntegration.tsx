
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  MapPin,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContractVehicleData {
  contractId: string;
  contractNumber: string;
  vehicleId: string;
  plateNumber: string;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'expiring_soon' | 'cancelled';
  monthlyAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currentLocation?: {
    address: string;
    latitude: number;
    longitude: number;
    lastUpdate: string;
  };
  dailyUsage: {
    date: string;
    distance: number;
    duration: number;
  }[];
  alerts: ContractAlert[];
}

interface ContractAlert {
  id: string;
  type: 'expiry_warning' | 'payment_overdue' | 'usage_violation' | 'location_alert';
  severity: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionRequired: boolean;
  createdAt: string;
}

const ContractTrackerIntegration: React.FC = () => {
  const [contractsData, setContractsData] = useState<ContractVehicleData[]>([]);
  const [selectedContract, setSelectedContract] = useState<ContractVehicleData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadContractsWithTracking();
  }, []);

  const loadContractsWithTracking = () => {
    const mockData: ContractVehicleData[] = [
      {
        contractId: '1',
        contractNumber: 'CT-2025-001',
        vehicleId: '1',
        plateNumber: 'أ ب ج 1234',
        customerName: 'أحمد محمد العلي',
        customerPhone: '0501234567',
        startDate: '2025-01-01',
        endDate: '2025-06-30',
        status: 'active',
        monthlyAmount: 2500,
        totalAmount: 15000,
        paidAmount: 7500,
        remainingAmount: 7500,
        currentLocation: {
          address: 'الرياض - حي الملك فهد',
          latitude: 24.7136,
          longitude: 46.6753,
          lastUpdate: '2025-01-24T10:30:00'
        },
        dailyUsage: [
          { date: '2025-01-24', distance: 145.6, duration: 480 },
          { date: '2025-01-23', distance: 234.2, duration: 620 },
          { date: '2025-01-22', distance: 178.9, duration: 520 }
        ],
        alerts: [
          {
            id: '1',
            type: 'payment_overdue',
            severity: 'urgent',
            title: 'دفعة متأخرة',
            message: 'دفعة شهر يناير متأخرة بـ 5 أيام',
            actionRequired: true,
            createdAt: '2025-01-24T08:00:00'
          }
        ]
      },
      {
        contractId: '2',
        contractNumber: 'CT-2025-002',
        vehicleId: '2',
        plateNumber: 'د ه و 5678',
        customerName: 'فاطمة عبد الله السالم',
        customerPhone: '0509876543',
        startDate: '2024-12-15',
        endDate: '2025-02-15',
        status: 'expiring_soon',
        monthlyAmount: 3200,
        totalAmount: 6400,
        paidAmount: 6400,
        remainingAmount: 0,
        currentLocation: {
          address: 'الرياض - حي العليا',
          latitude: 24.6877,
          longitude: 46.7219,
          lastUpdate: '2025-01-24T10:25:00'
        },
        dailyUsage: [
          { date: '2025-01-24', distance: 89.3, duration: 360 },
          { date: '2025-01-23', distance: 156.7, duration: 420 }
        ],
        alerts: [
          {
            id: '2',
            type: 'expiry_warning',
            severity: 'high',
            title: 'انتهاء العقد قريباً',
            message: 'العقد سينتهي خلال 3 أسابيع - يجب التجديد أو الإنهاء',
            actionRequired: true,
            createdAt: '2025-01-24T09:00:00'
          }
        ]
      }
    ];
    setContractsData(mockData);
  };

  const getStatusBadge = (status: ContractVehicleData['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">نشط</Badge>;
      case 'expiring_soon':
        return <Badge className="bg-yellow-100 text-yellow-800">ينتهي قريباً</Badge>;
      case 'expired':
        return <Badge variant="destructive">منتهي</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">ملغى</Badge>;
    }
  };

  const getSeverityColor = (severity: ContractAlert['severity']) => {
    switch (severity) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const handleRenewContract = (contractId: string) => {
    toast({
      title: "تجديد العقد",
      description: "تم بدء عملية تجديد العقد بنجاح",
      variant: "default"
    });
  };

  const handleContactCustomer = (phone: string) => {
    toast({
      title: "اتصال بالعميل",
      description: `جاري الاتصال بالعميل على الرقم ${phone}`,
      variant: "default"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { 
      style: 'currency', 
      currency: 'SAR',
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const totalActiveContracts = contractsData.filter(c => c.status === 'active').length;
  const totalExpiringContracts = contractsData.filter(c => c.status === 'expiring_soon').length;
  const totalMonthlyRevenue = contractsData.reduce((sum, contract) => 
    contract.status === 'active' ? sum + contract.monthlyAmount : sum, 0
  );
  const totalOutstandingAmount = contractsData.reduce((sum, contract) => sum + contract.remainingAmount, 0);

  return (
    <div className="space-y-6">
      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">العقود النشطة</p>
                <p className="text-2xl font-bold">{totalActiveContracts}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تنتهي قريباً</p>
                <p className="text-2xl font-bold text-yellow-600">{totalExpiringContracts}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الإيراد الشهري</p>
                <p className="text-2xl font-bold">{formatCurrency(totalMonthlyRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">المتأخرات</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutstandingAmount)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* قائمة العقود مع التتبع */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            العقود النشطة مع بيانات التتبع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contractsData.map((contract) => (
              <div key={contract.contractId} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{contract.contractNumber}</h4>
                      {getStatusBadge(contract.status)}
                      {contract.alerts.length > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {contract.alerts.length} تنبيه
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">العميل: </span>
                        <span className="font-medium">{contract.customerName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">المركبة: </span>
                        <span className="font-medium">{contract.plateNumber}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">انتهاء العقد: </span>
                        <span className="font-medium">
                          {new Date(contract.endDate).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleContactCustomer(contract.customerPhone)}
                      className="gap-1"
                    >
                      <Users className="h-3 w-3" />
                      اتصال
                    </Button>
                    {contract.status === 'expiring_soon' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRenewContract(contract.contractId)}
                        className="gap-1"
                      >
                        <Calendar className="h-3 w-3" />
                        تجديد
                      </Button>
                    )}
                  </div>
                </div>

                {/* الموقع الحالي */}
                {contract.currentLocation && (
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">الموقع الحالي</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {contract.currentLocation.address}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      آخر تحديث: {new Date(contract.currentLocation.lastUpdate).toLocaleString('ar-SA')}
                    </p>
                  </div>
                )}

                {/* التنبيهات */}
                {contract.alerts.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-sm mb-2">التنبيهات النشطة:</h5>
                    <div className="space-y-2">
                      {contract.alerts.map((alert) => (
                        <div key={alert.id} className={`p-2 border rounded text-sm ${getSeverityColor(alert.severity)}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{alert.title}</span>
                            {alert.actionRequired && (
                              <Badge variant="outline" className="text-xs">
                                يتطلب إجراء
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs mt-1">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* إحصائيات الدفع */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">المدفوع</span>
                      <span className="text-sm font-medium">{formatCurrency(contract.paidAmount)}</span>
                    </div>
                    <Progress 
                      value={(contract.paidAmount / contract.totalAmount) * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-muted-foreground">المبلغ الشهري: </span>
                    <span className="font-medium">{formatCurrency(contract.monthlyAmount)}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-muted-foreground">المتبقي: </span>
                    <span className={`font-medium ${contract.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(contract.remainingAmount)}
                    </span>
                  </div>
                </div>

                {/* الاستخدام اليومي */}
                <div className="mt-4">
                  <h5 className="font-medium text-sm mb-2">الاستخدام الأخير:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    {contract.dailyUsage.slice(0, 3).map((usage) => (
                      <div key={usage.date} className="flex justify-between p-2 bg-muted/20 rounded">
                        <span>{new Date(usage.date).toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric' })}</span>
                        <span>{usage.distance.toFixed(1)} كم</span>
                        <span>{Math.round(usage.duration / 60)} ساعة</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractTrackerIntegration;
