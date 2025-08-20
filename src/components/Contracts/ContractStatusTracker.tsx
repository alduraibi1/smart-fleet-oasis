
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface ContractStatusTrackerProps {
  contract: {
    id: string;
    contract_number: string;
    status: string;
    start_date: string;
    end_date: string;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    customer?: {
      name: string;
      phone: string;
    };
    vehicle?: {
      brand: string;
      model: string;
      plate_number: string;
    };
  };
}

const getStatusConfig = (status: string) => {
  const configs = {
    active: {
      label: 'نشط',
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      icon: CheckCircle2,
      progress: 75
    },
    pending: {
      label: 'في الانتظار',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      icon: Clock,
      progress: 25
    },
    completed: {
      label: 'مكتمل',
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      icon: CheckCircle2,
      progress: 100
    },
    cancelled: {
      label: 'ملغي',
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      icon: XCircle,
      progress: 0
    },
    expired: {
      label: 'منتهي',
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      icon: AlertTriangle,
      progress: 100
    }
  };
  
  return configs[status as keyof typeof configs] || configs.pending;
};

export const ContractStatusTracker: React.FC<ContractStatusTrackerProps> = ({ 
  contract 
}) => {
  const statusConfig = getStatusConfig(contract.status);
  const StatusIcon = statusConfig.icon;
  
  const calculateProgress = () => {
    const start = new Date(contract.start_date);
    const end = new Date(contract.end_date);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  const calculateDaysRemaining = () => {
    const end = new Date(contract.end_date);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const paymentProgress = contract.total_amount > 0 
    ? (contract.paid_amount / contract.total_amount) * 100 
    : 0;

  const timeProgress = calculateProgress();
  const daysRemaining = calculateDaysRemaining();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${statusConfig.textColor}`} />
            عقد رقم {contract.contract_number}
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0`}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Contract Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">العميل:</span>
              <span>{contract.customer?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">المركبة:</span>
              <span>{contract.vehicle?.brand} {contract.vehicle?.model}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">اللوحة:</span>
              <span>{contract.vehicle?.plate_number}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>من {new Date(contract.start_date).toLocaleDateString('ar-SA')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>إلى {new Date(contract.end_date).toLocaleDateString('ar-SA')}</span>
            </div>
            {contract.status === 'active' && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{daysRemaining} يوم متبقي</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-4">
          {/* Time Progress */}
          {(contract.status === 'active' || contract.status === 'completed') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  تقدم العقد
                </span>
                <span>{timeProgress}%</span>
              </div>
              <Progress value={timeProgress} className="h-2" />
            </div>
          )}

          {/* Payment Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                حالة السداد
              </span>
              <span>{paymentProgress.toFixed(1)}%</span>
            </div>
            <Progress 
              value={paymentProgress} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>مدفوع: {contract.paid_amount} ر.س</span>
              <span>متبقي: {contract.remaining_amount} ر.س</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {contract.paid_amount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">مدفوع (ر.س)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {contract.remaining_amount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">متبقي (ر.س)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {contract.total_amount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">الإجمالي (ر.س)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
