import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Car, 
  FileText, 
  CreditCard,
  PenTool,
  Archive
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ContractLifecycleTrackerProps {
  contract: any;
  onStageUpdate: (contractId: string, stage: string) => void;
}

const stages = [
  { id: 'draft', name: 'مسودة', icon: FileText, color: 'bg-gray-500' },
  { id: 'signed', name: 'موقع', icon: PenTool, color: 'bg-blue-500' },
  { id: 'active', name: 'نشط', icon: CheckCircle, color: 'bg-green-500' },
  { id: 'payment_due', name: 'استحقاق دفع', icon: CreditCard, color: 'bg-yellow-500' },
  { id: 'completed', name: 'مكتمل', icon: Archive, color: 'bg-purple-500' },
  { id: 'cancelled', name: 'ملغي', icon: AlertTriangle, color: 'bg-red-500' }
];

export const ContractLifecycleTracker = ({ contract, onStageUpdate }: ContractLifecycleTrackerProps) => {
  const [currentStage, setCurrentStage] = useState(contract?.status || 'draft');

  const getCurrentStageIndex = () => {
    return stages.findIndex(stage => stage.id === currentStage);
  };

  const getProgressPercentage = () => {
    const currentIndex = getCurrentStageIndex();
    return ((currentIndex + 1) / stages.length) * 100;
  };

  const handleStageChange = (newStage: string) => {
    setCurrentStage(newStage);
    onStageUpdate(contract.id, newStage);
  };

  const getDaysRemaining = () => {
    if (!contract?.end_date) return null;
    const endDate = new Date(contract.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          تتبع دورة حياة العقد - {contract?.contract_number}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>التقدم الإجمالي</span>
            <span>{Math.round(getProgressPercentage())}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Contract Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <span className="text-sm text-muted-foreground">تاريخ البداية</span>
            <p className="font-medium">
              {contract?.start_date ? format(new Date(contract.start_date), 'PPP', { locale: ar }) : 'غير محدد'}
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">تاريخ الانتهاء</span>
            <p className="font-medium">
              {contract?.end_date ? format(new Date(contract.end_date), 'PPP', { locale: ar }) : 'غير محدد'}
            </p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">المبلغ الإجمالي</span>
            <p className="font-medium">{contract?.total_amount?.toLocaleString()} ريال</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">الأيام المتبقية</span>
            <p className="font-medium flex items-center gap-1">
              {daysRemaining !== null ? (
                <>
                  <Clock className="h-4 w-4" />
                  {daysRemaining > 0 ? `${daysRemaining} يوم` : 'منتهي'}
                </>
              ) : 'غير محدد'}
            </p>
          </div>
        </div>

        {/* Stages Timeline */}
        <div className="space-y-4">
          <h4 className="font-medium">مراحل العقد</h4>
          <div className="space-y-3">
            {stages.map((stage, index) => {
              const isActive = stage.id === currentStage;
              const isCompleted = getCurrentStageIndex() > index;
              const Icon = stage.icon;

              return (
                <div key={stage.id} className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-full flex items-center justify-center
                    ${isActive ? stage.color + ' text-white' : isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}
                  `}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {stage.name}
                      </span>
                      {isActive && (
                        <Badge variant="default" className="text-xs">
                          مرحلة حالية
                        </Badge>
                      )}
                      {isCompleted && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                  </div>

                  {!isCompleted && !isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStageChange(stage.id)}
                      className="text-xs"
                    >
                      انتقال
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="text-xs">
            <Car className="h-4 w-4 mr-1" />
            تفاصيل المركبة
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <FileText className="h-4 w-4 mr-1" />
            المستندات
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};