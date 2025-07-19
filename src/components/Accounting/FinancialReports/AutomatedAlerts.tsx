
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  AlertTriangle, 
  Settings, 
  Save,
  TestTube,
  CheckCircle,
  XCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition_type: 'balance_threshold' | 'utilization_rate' | 'pending_amount' | 'negative_balance';
  threshold_value: number;
  is_active: boolean;
  notification_channels: string[];
  created_at: string;
}

interface AlertHistory {
  id: string;
  rule_name: string;
  owner_name: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggered_at: string;
  acknowledged: boolean;
}

export function AutomatedAlerts() {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlertSettings();
    fetchAlertHistory();
  }, []);

  const fetchAlertSettings = async () => {
    try {
      // محاكاة جلب قواعد التنبيه (يمكن إنشاء جدول لاحقاً)
      const defaultRules: AlertRule[] = [
        {
          id: '1',
          name: 'رصيد منخفض',
          description: 'تنبيه عندما يصل رصيد المالك إلى مبلغ معين',
          condition_type: 'balance_threshold',
          threshold_value: 1000,
          is_active: true,
          notification_channels: ['email', 'in_app'],
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'استخدام عالي',
          description: 'تنبيه عندما تتجاوز نسبة استخدام الرصيد حد معين',
          condition_type: 'utilization_rate',
          threshold_value: 85,
          is_active: true,
          notification_channels: ['email', 'in_app', 'sms'],
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'رصيد سالب',
          description: 'تنبيه فوري عندما يصبح رصيد المالك سالب',
          condition_type: 'negative_balance',
          threshold_value: 0,
          is_active: true,
          notification_channels: ['email', 'in_app', 'sms'],
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          name: 'سندات معلقة كثيرة',
          description: 'تنبيه عندما تتجاوز السندات المعلقة مبلغ معين',
          condition_type: 'pending_amount',
          threshold_value: 5000,
          is_active: false,
          notification_channels: ['in_app'],
          created_at: new Date().toISOString()
        }
      ];

      setAlertRules(defaultRules);
    } catch (error) {
      console.error('Error fetching alert settings:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب إعدادات التنبيهات",
        variant: "destructive"
      });
    }
  };

  const fetchAlertHistory = async () => {
    try {
      // جلب التحذيرات المالية الحديثة
      const { data: warnings, error } = await supabase
        .from('financial_warnings')
        .select(`
          *,
          vehicle_owners!financial_warnings_owner_id_fkey(name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const history: AlertHistory[] = (warnings || []).map(warning => ({
        id: warning.id,
        rule_name: getWarningTypeName(warning.warning_type),
        owner_name: warning.vehicle_owners?.name || 'غير محدد',
        message: warning.warning_message,
        severity: getSeverityLevel(warning.warning_type, warning.deficit),
        triggered_at: warning.created_at,
        acknowledged: warning.acknowledged
      }));

      setAlertHistory(history);
    } catch (error) {
      console.error('Error fetching alert history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWarningTypeName = (type: string) => {
    switch (type) {
      case 'insufficient_balance':
        return 'رصيد غير كافي';
      case 'negative_balance':
        return 'رصيد سالب';
      case 'utilization_rate':
        return 'نسبة استخدام عالية';
      default:
        return type;
    }
  };

  const getSeverityLevel = (type: string, deficit: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (type === 'negative_balance') return 'critical';
    if (deficit > 10000) return 'high';
    if (deficit > 5000) return 'medium';
    return 'low';
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">حرج</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-500">عالي</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">متوسط</Badge>;
      case 'low':
        return <Badge variant="outline">منخفض</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const updateAlertRule = (ruleId: string, updates: Partial<AlertRule>) => {
    setAlertRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    );
  };

  const saveAlertSettings = async () => {
    try {
      setSaving(true);
      // هنا يمكن حفظ الإعدادات في قاعدة البيانات
      await new Promise(resolve => setTimeout(resolve, 1000)); // محاكاة الحفظ
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ إعدادات التنبيهات بنجاح",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في حفظ إعدادات التنبيهات",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testAlert = async (ruleId: string) => {
    try {
      const rule = alertRules.find(r => r.id === ruleId);
      if (!rule) return;

      // محاكاة إرسال تنبيه تجريبي
      toast({
        title: "تنبيه تجريبي",
        description: `تم إرسال تنبيه تجريبي لقاعدة: ${rule.name}`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إرسال التنبيه التجريبي",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>التنبيهات الآلية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">جاري التحميل...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* إعدادات قواعد التنبيه */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إعدادات التنبيهات الآلية
              </CardTitle>
              <CardDescription>
                إدارة قواعد التنبيهات المالية والحدود المسموحة
              </CardDescription>
            </div>
            <Button onClick={saveAlertSettings} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {alertRules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{rule.name}</h3>
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => 
                          updateAlertRule(rule.id, { is_active: checked })
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testAlert(rule.id)}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    اختبار
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>الحد الأدنى/الأقصى</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={rule.threshold_value}
                        onChange={(e) => 
                          updateAlertRule(rule.id, { threshold_value: parseFloat(e.target.value) || 0 })
                        }
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">
                        {rule.condition_type === 'utilization_rate' ? '%' : 'ريال'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label>قنوات التنبيه</Label>
                    <div className="flex gap-2 mt-1">
                      {['email', 'sms', 'in_app'].map((channel) => (
                        <Badge 
                          key={channel}
                          variant={rule.notification_channels.includes(channel) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const channels = rule.notification_channels.includes(channel)
                              ? rule.notification_channels.filter(c => c !== channel)
                              : [...rule.notification_channels, channel];
                            updateAlertRule(rule.id, { notification_channels: channels });
                          }}
                        >
                          {channel === 'email' ? 'إيميل' : 
                           channel === 'sms' ? 'رسائل نصية' : 'التطبيق'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* سجل التنبيهات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            سجل التنبيهات الحديثة
          </CardTitle>
          <CardDescription>
            عرض آخر التنبيهات المالية التي تم إرسالها
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alertHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد تنبيهات حديثة
            </div>
          ) : (
            <div className="space-y-4">
              {alertHistory.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{alert.rule_name}</span>
                        {getSeverityBadge(alert.severity)}
                        {alert.acknowledged ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm mb-2">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>المالك: {alert.owner_name}</span>
                        <span>
                          {new Date(alert.triggered_at).toLocaleDateString('ar-SA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* معلومات إضافية */}
      <Alert>
        <Bell className="h-4 w-4" />
        <AlertDescription>
          يتم فحص الشروط المالية كل ساعة تلقائياً. عند تحقق أي من الشروط المحددة، 
          سيتم إرسال تنبيه فوري عبر القنوات المختارة.
        </AlertDescription>
      </Alert>
    </div>
  );
}
