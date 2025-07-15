import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  UserCheck, 
  Car, 
  Calendar,
  ArrowRight,
  MoreHorizontal,
  Bell,
  Eye,
  Edit,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContractStage {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'current' | 'pending' | 'warning';
  completedAt?: string;
  estimatedDuration: number;
  actualDuration?: number;
  responsible?: string;
  notes?: string;
  documents?: string[];
}

interface ContractLifecycleTrackerProps {
  contractId: string;
  contractNumber?: string;
  currentStage?: string;
  autoProgress?: boolean;
}

export function ContractLifecycleTracker({ 
  contractId, 
  contractNumber = "CR-2024-001", 
  currentStage = "active",
  autoProgress = true 
}: ContractLifecycleTrackerProps) {
  
  const [stages, setStages] = useState<ContractStage[]>([
    {
      id: 'request',
      name: 'طلب جديد',
      description: 'تم استلام طلب العقد وبدء المراجعة الأولية',
      status: 'completed',
      completedAt: '2024-01-15T10:00:00Z',
      estimatedDuration: 1,
      actualDuration: 0.5,
      responsible: 'أحمد محمد',
      documents: ['طلب_العقد.pdf', 'هوية_العميل.pdf']
    },
    {
      id: 'verification',
      name: 'التحقق والمراجعة',
      description: 'مراجعة بيانات العميل والتحقق من الوثائق المطلوبة',
      status: 'completed',
      completedAt: '2024-01-16T14:30:00Z',
      estimatedDuration: 2,
      actualDuration: 1.5,
      responsible: 'فاطمة علي',
      documents: ['تقرير_التحقق.pdf', 'الموافقة_المبدئية.pdf']
    },
    {
      id: 'approval',
      name: 'الموافقة',
      description: 'موافقة الإدارة على العقد وشروطه',
      status: 'completed',
      completedAt: '2024-01-17T09:15:00Z',
      estimatedDuration: 1,
      actualDuration: 0.8,
      responsible: 'محمد السالم',
      documents: ['موافقة_الإدارة.pdf']
    },
    {
      id: 'signing',
      name: 'التوقيع',
      description: 'توقيع العقد من جميع الأطراف',
      status: 'completed',
      completedAt: '2024-01-18T11:00:00Z',
      estimatedDuration: 1,
      actualDuration: 1.2,
      responsible: 'سارة أحمد',
      documents: ['العقد_الموقع.pdf', 'نسخة_العميل.pdf']
    },
    {
      id: 'active',
      name: 'عقد نشط',
      description: 'العقد ساري المفعول والمركبة قيد الاستخدام',
      status: 'current',
      estimatedDuration: 30,
      responsible: 'قسم المتابعة',
      notes: 'المتابعة الدورية للعقد والتأكد من سير العملية بسلاسة'
    },
    {
      id: 'reminder',
      name: 'تذكير بالانتهاء',
      description: 'إرسال تذكيرات للعميل قبل انتهاء العقد',
      status: 'pending',
      estimatedDuration: 3,
      responsible: 'قسم خدمة العملاء'
    },
    {
      id: 'return',
      name: 'إرجاع المركبة',
      description: 'استلام المركبة وفحصها وإنهاء الإجراءات',
      status: 'pending',
      estimatedDuration: 1,
      responsible: 'قسم الاستلام'
    },
    {
      id: 'completed',
      name: 'مكتمل',
      description: 'تم إنهاء العقد بنجاح وإغلاق الملف',
      status: 'pending',
      estimatedDuration: 0.5,
      responsible: 'الأرشيف'
    }
  ]);

  const [selectedStage, setSelectedStage] = useState<string>('active');
  const [showTimeline, setShowTimeline] = useState(true);

  const getStageProgress = () => {
    const completedStages = stages.filter(s => s.status === 'completed').length;
    const totalStages = stages.length;
    return (completedStages / totalStages) * 100;
  };

  const getCurrentStageIndex = () => {
    return stages.findIndex(s => s.status === 'current');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStageIcon = (stage: ContractStage) => {
    switch (stage.id) {
      case 'request':
        return <FileText className="h-4 w-4" />;
      case 'verification':
        return <UserCheck className="h-4 w-4" />;
      case 'approval':
        return <CheckCircle className="h-4 w-4" />;
      case 'signing':
        return <Edit className="h-4 w-4" />;
      case 'active':
        return <Car className="h-4 w-4" />;
      case 'reminder':
        return <Bell className="h-4 w-4" />;
      case 'return':
        return <Calendar className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'current':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">تتبع دورة حياة العقد</h2>
          <p className="text-muted-foreground mt-1">
            تتبع مفصل لجميع مراحل العقد {contractNumber}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowTimeline(!showTimeline)}>
            {showTimeline ? 'إخفاء' : 'عرض'} الجدول الزمني
          </Button>
          <Badge variant="outline" className="bg-primary/10">
            {Math.round(getStageProgress())}% مكتمل
          </Badge>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            نظرة عامة على التقدم
          </CardTitle>
          <CardDescription>
            المرحلة الحالية: {stages[getCurrentStageIndex()]?.name || 'غير محدد'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>التقدم الإجمالي</span>
              <span>{Math.round(getStageProgress())}%</span>
            </div>
            <Progress value={getStageProgress()} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stages.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">مراحل مكتملة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1</div>
                <div className="text-sm text-muted-foreground">مرحلة حالية</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {stages.filter(s => s.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">مراحل قادمة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stages.length}
                </div>
                <div className="text-sm text-muted-foreground">إجمالي المراحل</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline View */}
      {showTimeline && (
        <Card>
          <CardHeader>
            <CardTitle>الجدول الزمني للمراحل</CardTitle>
            <CardDescription>تسلسل زمني مفصل لجميع مراحل العقد</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute right-8 top-8 bottom-8 w-0.5 bg-border"></div>
              
              <div className="space-y-6">
                {stages.map((stage, index) => (
                  <div 
                    key={stage.id} 
                    className={cn(
                      "relative flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                      selectedStage === stage.id ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50",
                      stage.status === 'current' && "bg-blue-50 border-blue-200"
                    )}
                    onClick={() => setSelectedStage(stage.id)}
                  >
                    {/* Timeline Node */}
                    <div className={cn(
                      "absolute -right-2 w-4 h-4 rounded-full border-2 bg-background z-10",
                      getStageColor(stage.status).includes('green') && "border-green-500 bg-green-500",
                      getStageColor(stage.status).includes('blue') && "border-blue-500 bg-blue-500",
                      getStageColor(stage.status).includes('yellow') && "border-yellow-500 bg-yellow-500",
                      getStageColor(stage.status).includes('gray') && "border-gray-300 bg-gray-100"
                    )}></div>
                    
                    {/* Stage Icon */}
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full border",
                      getStageColor(stage.status)
                    )}>
                      {getStageIcon(stage)}
                    </div>

                    {/* Stage Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{stage.name}</h3>
                          <p className="text-muted-foreground text-sm mt-1">
                            {stage.description}
                          </p>
                          
                          {/* Stage Details */}
                          <div className="mt-3 space-y-2">
                            {stage.responsible && (
                              <div className="flex items-center gap-2 text-sm">
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                                <span>المسؤول: {stage.responsible}</span>
                              </div>
                            )}
                            
                            {stage.completedAt && (
                              <div className="flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>اكتمل في: {formatDate(stage.completedAt)}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>المدة المقدرة: {stage.estimatedDuration} يوم</span>
                              </div>
                              {stage.actualDuration && (
                                <div className="flex items-center gap-1">
                                  <span>المدة الفعلية: {stage.actualDuration} يوم</span>
                                </div>
                              )}
                            </div>
                            
                            {stage.documents && stage.documents.length > 0 && (
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>المستندات: {stage.documents.length}</span>
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            
                            {stage.notes && (
                              <div className="bg-muted/50 p-3 rounded text-sm mt-2">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <span>{stage.notes}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stage Status Badge */}
                        <Badge variant={
                          stage.status === 'completed' ? 'default' :
                          stage.status === 'current' ? 'default' :
                          stage.status === 'warning' ? 'destructive' : 'secondary'
                        }>
                          {stage.status === 'completed' ? 'مكتمل' :
                           stage.status === 'current' ? 'جاري' :
                           stage.status === 'warning' ? 'تحذير' : 'قادم'}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stage Actions */}
      <Card>
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
          <CardDescription>إجراءات متاحة للمرحلة الحالية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" className="gap-2">
              <Edit className="h-4 w-4" />
              تحديث المرحلة
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              إضافة ملاحظة
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              رفع مستند
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Bell className="h-4 w-4" />
              إرسال تذكير
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}