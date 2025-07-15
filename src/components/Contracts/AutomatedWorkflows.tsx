import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Zap,
  Play,
  Pause,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  FileText,
  User,
  Car,
  DollarSign,
  Mail,
  Phone,
  Calendar,
  Workflow,
  Bot,
  Target,
  TrendingUp
} from 'lucide-react';

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: string;
  actions: string[];
  conditions: string[];
  executionCount: number;
  successRate: number;
  category: 'approval' | 'notification' | 'validation' | 'payment' | 'maintenance';
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  contractId: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startTime: Date;
  endTime?: Date;
  steps: {
    name: string;
    status: 'completed' | 'running' | 'pending' | 'failed';
    timestamp?: Date;
    message?: string;
  }[];
}

export const AutomatedWorkflows: React.FC = () => {
  const [activeTab, setActiveTab] = useState('rules');
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([
    {
      id: 'wf-001',
      name: 'موافقة العقود التلقائية',
      description: 'موافقة تلقائية للعقود التي تحقق معايير محددة',
      isActive: true,
      trigger: 'عند إنشاء عقد جديد',
      actions: ['فحص المعايير', 'الموافقة التلقائية', 'إرسال إشعار'],
      conditions: ['مبلغ العقد < 10,000 ر.س', 'عميل موثق', 'لا توجد مخالفات سابقة'],
      executionCount: 245,
      successRate: 95,
      category: 'approval'
    },
    {
      id: 'wf-002',
      name: 'تذكيرات الدفع التلقائية',
      description: 'إرسال تذكيرات الدفع قبل موعد الاستحقاق',
      isActive: true,
      trigger: 'قبل 3 أيام من موعد الدفع',
      actions: ['إرسال رسالة نصية', 'إرسال إيميل', 'تحديث حالة العقد'],
      conditions: ['العقد نشط', 'لم يتم الدفع بعد'],
      executionCount: 1240,
      successRate: 88,
      category: 'notification'
    },
    {
      id: 'wf-003',
      name: 'فحص حالة المركبات',
      description: 'فحص دوري لحالة المركبات وجدولة الصيانة',
      isActive: true,
      trigger: 'كل أسبوع',
      actions: ['فحص المسافة المقطوعة', 'تقييم الحالة', 'جدولة الصيانة'],
      conditions: ['المركبة متاحة', 'تجاوز حد المسافة'],
      executionCount: 52,
      successRate: 92,
      category: 'maintenance'
    },
    {
      id: 'wf-004',
      name: 'معالجة المدفوعات المتأخرة',
      description: 'إجراءات تلقائية للمدفوعات المتأخرة',
      isActive: false,
      trigger: 'عند تأخر الدفع 7 أيام',
      actions: ['تعليق العقد', 'إرسال إنذار', 'تحديد موعد مقابلة'],
      conditions: ['تأخر الدفع', 'لم يتم التواصل'],
      executionCount: 28,
      successRate: 75,
      category: 'payment'
    }
  ]);

  const [executions, setExecutions] = useState<WorkflowExecution[]>([
    {
      id: 'exec-001',
      workflowId: 'wf-001',
      contractId: 'CR-2024-001',
      status: 'completed',
      startTime: new Date('2024-01-15T10:30:00'),
      endTime: new Date('2024-01-15T10:32:00'),
      steps: [
        { name: 'فحص المعايير', status: 'completed', timestamp: new Date('2024-01-15T10:30:30'), message: 'جميع المعايير محققة' },
        { name: 'الموافقة التلقائية', status: 'completed', timestamp: new Date('2024-01-15T10:31:00'), message: 'تمت الموافقة' },
        { name: 'إرسال إشعار', status: 'completed', timestamp: new Date('2024-01-15T10:32:00'), message: 'تم إرسال الإشعار للعميل' }
      ]
    },
    {
      id: 'exec-002',
      workflowId: 'wf-002',
      contractId: 'CR-2024-002',
      status: 'running',
      startTime: new Date('2024-01-15T11:00:00'),
      steps: [
        { name: 'إرسال رسالة نصية', status: 'completed', timestamp: new Date('2024-01-15T11:00:30') },
        { name: 'إرسال إيميل', status: 'running' },
        { name: 'تحديث حالة العقد', status: 'pending' }
      ]
    }
  ]);

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === id 
          ? { ...workflow, isActive: !workflow.isActive }
          : workflow
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'approval': return CheckCircle;
      case 'notification': return Mail;
      case 'validation': return FileText;
      case 'payment': return DollarSign;
      case 'maintenance': return Settings;
      default: return Workflow;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'approval': return 'text-success';
      case 'notification': return 'text-info';
      case 'validation': return 'text-warning';
      case 'payment': return 'text-primary';
      case 'maintenance': return 'text-orange-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'running': return Play;
      case 'failed': return AlertCircle;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'running': return 'text-primary';
      case 'failed': return 'text-destructive';
      case 'pending': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>أتمتة سير العمل</CardTitle>
                <p className="text-sm text-muted-foreground">
                  إدارة وتشغيل العمليات التلقائية للعقود
                </p>
              </div>
            </div>
            <Button className="gap-2">
              <Settings className="h-4 w-4" />
              إعدادات الأتمتة
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">العمليات النشطة</span>
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary">
              {workflows.filter(w => w.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">معدل النجاح</span>
              <Target className="h-4 w-4 text-success" />
            </div>
            <div className="text-2xl font-bold text-success">
              {Math.round(workflows.reduce((sum, w) => sum + w.successRate, 0) / workflows.length)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">التنفيذ اليوم</span>
              <TrendingUp className="h-4 w-4 text-info" />
            </div>
            <div className="text-2xl font-bold text-info">24</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">الوقت المُوفر</span>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-500">12 ساعة</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">قواعد الأتمتة</TabsTrigger>
          <TabsTrigger value="executions">سجل التنفيذ</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {workflows.map((workflow) => {
              const CategoryIcon = getCategoryIcon(workflow.category);
              return (
                <Card key={workflow.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg bg-secondary ${getCategoryColor(workflow.category)}`}>
                          <CategoryIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{workflow.name}</h3>
                            <Badge variant={workflow.isActive ? "default" : "secondary"}>
                              {workflow.isActive ? 'نشط' : 'متوقف'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {workflow.description}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-muted-foreground">المشغل:</span>
                              <p>{workflow.trigger}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">الإجراءات:</span>
                              <ul className="list-disc list-inside">
                                {workflow.actions.map((action, index) => (
                                  <li key={index}>{action}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">الشروط:</span>
                              <ul className="list-disc list-inside">
                                {workflow.conditions.map((condition, index) => (
                                  <li key={index}>{condition}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                            <div className="text-sm">
                              <span className="text-muted-foreground">التنفيذ: </span>
                              <span className="font-medium">{workflow.executionCount} مرة</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">معدل النجاح: </span>
                              <span className="font-medium text-success">{workflow.successRate}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={workflow.isActive}
                          onCheckedChange={() => toggleWorkflow(workflow.id)}
                        />
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <div className="space-y-4">
            {executions.map((execution) => {
              const StatusIcon = getStatusIcon(execution.status);
              const workflow = workflows.find(w => w.id === execution.workflowId);
              
              return (
                <Card key={execution.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(execution.status)}`} />
                        <div>
                          <h3 className="font-semibold">{workflow?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            العقد: {execution.contractId} • بدأ في {execution.startTime.toLocaleTimeString('ar-SA')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={execution.status === 'completed' ? 'default' : 
                                   execution.status === 'running' ? 'secondary' : 
                                   execution.status === 'failed' ? 'destructive' : 'outline'}>
                        {execution.status === 'completed' ? 'مكتمل' :
                         execution.status === 'running' ? 'قيد التنفيذ' :
                         execution.status === 'failed' ? 'فشل' : 'في الانتظار'}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {execution.steps.map((step, index) => {
                        const StepIcon = getStatusIcon(step.status);
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                            <StepIcon className={`h-4 w-4 ${getStatusColor(step.status)}`} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{step.name}</span>
                                {step.timestamp && (
                                  <span className="text-xs text-muted-foreground">
                                    {step.timestamp.toLocaleTimeString('ar-SA')}
                                  </span>
                                )}
                              </div>
                              {step.message && (
                                <p className="text-xs text-muted-foreground mt-1">{step.message}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  أداء العمليات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{workflow.name}</span>
                        <span className="text-sm text-muted-foreground">{workflow.successRate}%</span>
                      </div>
                      <Progress value={workflow.successRate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  الإحصائيات العامة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg">
                    <span className="text-sm">إجمالي العمليات</span>
                    <span className="font-bold text-primary">
                      {workflows.reduce((sum, w) => sum + w.executionCount, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-success/5 rounded-lg">
                    <span className="text-sm">العمليات الناجحة</span>
                    <span className="font-bold text-success">
                      {Math.round(workflows.reduce((sum, w) => sum + (w.executionCount * w.successRate / 100), 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-500/5 rounded-lg">
                    <span className="text-sm">الوقت المُوفر (ساعات)</span>
                    <span className="font-bold text-orange-500">156</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomatedWorkflows;