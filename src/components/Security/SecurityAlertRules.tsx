import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Plus, Edit, Trash2, Bell, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityAlertRule {
  id: string;
  rule_name: string;
  condition_type: string;
  threshold_value: number;
  time_window_minutes: number;
  severity_level: string;
  notification_channels: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function SecurityAlertRules() {
  const [rules, setRules] = useState<SecurityAlertRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<SecurityAlertRule | null>(null);
  const [formData, setFormData] = useState({
    rule_name: '',
    condition_type: '',
    threshold_value: 5,
    time_window_minutes: 60,
    severity_level: 'medium',
    notification_channels: ['in_app'],
    is_active: true
  });
  const { hasRole } = useAuth();
  const { toast } = useToast();

  // Check permissions
  if (!hasRole('admin')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">غير مخوّل</h3>
            <p className="text-sm text-muted-foreground">
              تحتاج صلاحيات مدير لإدارة قواعد التنبيهات الأمنية
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fetchRules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('security_alert_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل قواعد التنبيهات",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const resetForm = () => {
    setFormData({
      rule_name: '',
      condition_type: '',
      threshold_value: 5,
      time_window_minutes: 60,
      severity_level: 'medium',
      notification_channels: ['in_app'],
      is_active: true
    });
    setEditingRule(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRule) {
        // Update existing rule
        const { error } = await supabase
          .from('security_alert_rules')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRule.id);

        if (error) throw error;

        toast({
          title: "تم التحديث",
          description: "تم تحديث قاعدة التنبيه بنجاح",
        });
      } else {
        // Create new rule
        const { error } = await supabase
          .from('security_alert_rules')
          .insert(formData);

        if (error) throw error;

        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء قاعدة التنبيه بنجاح",
        });
      }

      fetchRules();
      setShowCreateDialog(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleRuleStatus = async (ruleId: string, newStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('security_alert_rules')
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: `تم ${newStatus ? 'تفعيل' : 'إيقاف'} القاعدة بنجاح`,
      });

      fetchRules();
    } catch (error: any) {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('security_alert_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف قاعدة التنبيه بنجاح",
      });

      fetchRules();
    } catch (error: any) {
      toast({
        title: "خطأ في الحذف",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getConditionTypeLabel = (type: string) => {
    const labels = {
      failed_logins: 'محاولات دخول فاشلة',
      data_access: 'وصول للبيانات',
      delete_operations: 'عمليات حذف',
      user_modifications: 'تعديل المستخدمين',
      unusual_activity: 'نشاط غير عادي'
    };
    
    return labels[type as keyof typeof labels] || type;
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    } as const;
    
    const labels = {
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض'
    };
    
    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'outline'}>
        {labels[severity as keyof typeof labels] || severity}
      </Badge>
    );
  };

  const openEditDialog = (rule: SecurityAlertRule) => {
    setFormData({
      rule_name: rule.rule_name,
      condition_type: rule.condition_type,
      threshold_value: rule.threshold_value,
      time_window_minutes: rule.time_window_minutes,
      severity_level: rule.severity_level,
      notification_channels: rule.notification_channels,
      is_active: rule.is_active
    });
    setEditingRule(rule);
    setShowCreateDialog(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                قواعد التنبيهات الأمنية
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                إدارة قواعد اكتشاف التهديدات الأمنية والتنبيهات التلقائية
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة قاعدة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingRule ? 'تعديل قاعدة التنبيه' : 'إضافة قاعدة تنبيه جديدة'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="rule_name">اسم القاعدة</Label>
                    <Input
                      id="rule_name"
                      value={formData.rule_name}
                      onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                      placeholder="مثال: محاولات دخول فاشلة متكررة"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="condition_type">نوع الشرط</Label>
                    <Select 
                      value={formData.condition_type} 
                      onValueChange={(value) => setFormData({ ...formData, condition_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الشرط" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="failed_logins">محاولات دخول فاشلة</SelectItem>
                        <SelectItem value="data_access">وصول للبيانات</SelectItem>
                        <SelectItem value="delete_operations">عمليات حذف</SelectItem>
                        <SelectItem value="user_modifications">تعديل المستخدمين</SelectItem>
                        <SelectItem value="unusual_activity">نشاط غير عادي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="threshold_value">الحد الأقصى</Label>
                      <Input
                        id="threshold_value"
                        type="number"
                        min="1"
                        value={formData.threshold_value}
                        onChange={(e) => setFormData({ ...formData, threshold_value: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="time_window_minutes">النافزة الزمنية (دقيقة)</Label>
                      <Input
                        id="time_window_minutes"
                        type="number"
                        min="1"
                        value={formData.time_window_minutes}
                        onChange={(e) => setFormData({ ...formData, time_window_minutes: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="severity_level">مستوى الأهمية</Label>
                    <Select 
                      value={formData.severity_level} 
                      onValueChange={(value) => setFormData({ ...formData, severity_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">عالي</SelectItem>
                        <SelectItem value="medium">متوسط</SelectItem>
                        <SelectItem value="low">منخفض</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">تفعيل القاعدة</Label>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingRule ? 'تحديث القاعدة' : 'إنشاء القاعدة'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateDialog(false)}
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم القاعدة</TableHead>
                  <TableHead>نوع الشرط</TableHead>
                  <TableHead>الحد الأقصى</TableHead>
                  <TableHead>النافزة الزمنية</TableHead>
                  <TableHead>الأهمية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <p>جاري تحميل القواعد...</p>
                    </TableCell>
                  </TableRow>
                ) : rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">لا توجد قواعد تنبيهات</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div className="font-medium">{rule.rule_name}</div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">
                          {getConditionTypeLabel(rule.condition_type)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <span className="font-mono">{rule.threshold_value}</span>
                      </TableCell>
                      
                      <TableCell>
                        <span className="font-mono">{rule.time_window_minutes} دقيقة</span>
                      </TableCell>
                      
                      <TableCell>
                        {getSeverityBadge(rule.severity_level)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={rule.is_active}
                            onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {rule.is_active ? 'مفعلة' : 'معطلة'}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(rule)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteRule(rule.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}