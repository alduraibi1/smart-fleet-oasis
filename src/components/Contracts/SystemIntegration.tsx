import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Plug, 
  Globe, 
  Database,
  CreditCard,
  MapPin,
  Mail,
  MessageSquare,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Link,
  Shield,
  RefreshCw
} from "lucide-react";

export const SystemIntegration = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 1,
      name: "نظام SAP المحاسبي",
      type: "accounting",
      status: "connected",
      lastSync: "2024-01-15 14:30",
      dataFlow: "bidirectional",
      health: 98,
      features: ["تزامن الفواتير", "تقارير مالية", "إدارة الحسابات"]
    },
    {
      id: 2,
      name: "بوابة الدفع - MADA",
      type: "payment",
      status: "connected",
      lastSync: "2024-01-15 15:45",
      dataFlow: "incoming",
      health: 95,
      features: ["الدفع الإلكتروني", "استرداد المبالغ", "تقارير المعاملات"]
    },
    {
      id: 3,
      name: "خرائط جوجل GPS",
      type: "maps",
      status: "connected",
      lastSync: "2024-01-15 16:12",
      dataFlow: "outgoing",
      health: 92,
      features: ["تتبع المركبات", "تحسين المسارات", "المناطق الجغرافية"]
    },
    {
      id: 4,
      name: "نظام CRM - Salesforce",
      type: "crm",
      status: "pending",
      lastSync: "قيد الإعداد",
      dataFlow: "bidirectional",
      health: 0,
      features: ["إدارة العملاء", "تتبع المبيعات", "تحليل السلوك"]
    },
    {
      id: 5,
      name: "خدمة الرسائل النصية",
      type: "sms",
      status: "connected",
      lastSync: "2024-01-15 16:00",
      dataFlow: "outgoing",
      health: 88,
      features: ["إشعارات تلقائية", "تذكيرات الدفع", "رسائل ترويجية"]
    },
    {
      id: 6,
      name: "بريد إلكتروني - Office 365",
      type: "email",
      status: "disconnected",
      lastSync: "2024-01-10 09:30",
      dataFlow: "outgoing",
      health: 0,
      features: ["إشعارات العقود", "تقارير دورية", "مراسلات العملاء"]
    }
  ]);

  const [apiEndpoints] = useState([
    {
      endpoint: "/api/contracts/sync",
      method: "POST",
      status: "active",
      calls: 1250,
      avgResponse: 180,
      success: 99.2
    },
    {
      endpoint: "/api/payments/webhook",
      method: "POST",
      status: "active",
      calls: 890,
      avgResponse: 95,
      success: 98.8
    },
    {
      endpoint: "/api/vehicles/location",
      method: "GET",
      status: "active",
      calls: 2150,
      avgResponse: 120,
      success: 97.5
    },
    {
      endpoint: "/api/customers/export",
      method: "GET",
      status: "maintenance",
      calls: 45,
      avgResponse: 850,
      success: 85.2
    }
  ]);

  const toggleIntegration = (id: number) => {
    setIntegrations(integrations.map(integration => 
      integration.id === id 
        ? { 
            ...integration, 
            status: integration.status === 'connected' ? 'disconnected' : 'connected' 
          }
        : integration
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'disconnected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'disconnected': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accounting': return <Database className="h-5 w-5 text-blue-600" />;
      case 'payment': return <CreditCard className="h-5 w-5 text-green-600" />;
      case 'maps': return <MapPin className="h-5 w-5 text-red-600" />;
      case 'crm': return <Globe className="h-5 w-5 text-purple-600" />;
      case 'sms': return <MessageSquare className="h-5 w-5 text-orange-600" />;
      case 'email': return <Mail className="h-5 w-5 text-blue-600" />;
      default: return <Plug className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Plug className="h-6 w-6 text-blue-600" />
            التكامل مع الأنظمة الخارجية
          </h2>
          <p className="text-muted-foreground">
            ربط وإدارة التكامل مع الأنظمة والخدمات الخارجية
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link className="h-4 w-4 ml-2" />
          إضافة تكامل جديد
        </Button>
      </div>

      {/* Integration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              متصل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {integrations.filter(i => i.status === 'connected').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              قيد الإعداد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {integrations.filter(i => i.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              استدعاءات API
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">4,335</div>
            <div className="text-xs text-muted-foreground">اليوم</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              معدل النجاح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">97.8%</div>
            <div className="text-xs text-muted-foreground">آخر 24 ساعة</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">التكاملات</TabsTrigger>
          <TabsTrigger value="api">API Management</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="monitoring">المراقبة</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="space-y-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className="hover-scale">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getTypeIcon(integration.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          آخر مزامنة: {integration.lastSync}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(integration.status)}>
                        {getStatusIcon(integration.status)}
                        <span className="ml-1">
                          {integration.status === 'connected' ? 'متصل' : 
                           integration.status === 'pending' ? 'قيد الإعداد' : 'منقطع'}
                        </span>
                      </Badge>
                      <Switch 
                        checked={integration.status === 'connected'}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                        disabled={integration.status === 'pending'}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">نوع البيانات</h4>
                      <Badge variant="outline">
                        {integration.dataFlow === 'bidirectional' ? 'ثنائي الاتجاه' :
                         integration.dataFlow === 'incoming' ? 'واردة' : 'صادرة'}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">حالة الصحة</h4>
                      <div className="flex items-center gap-2">
                        <Progress value={integration.health} className="flex-1" />
                        <span className="text-sm font-medium">{integration.health}%</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">الميزات</h4>
                      <div className="flex flex-wrap gap-1">
                        {integration.features.slice(0, 2).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {integration.features.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{integration.features.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3 ml-1" />
                      إعدادات
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-3 w-3 ml-1" />
                      مزامنة
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 ml-1" />
                      السجلات
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>نقاط الوصول للـ API</CardTitle>
              <p className="text-muted-foreground">
                مراقبة وإدارة نقاط الوصول للواجهات البرمجية
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{endpoint.method}</Badge>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {endpoint.endpoint}
                        </code>
                      </div>
                      <Badge className={
                        endpoint.status === 'active' ? 'bg-green-100 text-green-800' :
                        endpoint.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {endpoint.status === 'active' ? 'نشط' :
                         endpoint.status === 'maintenance' ? 'صيانة' : 'معطل'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          {endpoint.calls.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">الاستدعاءات</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {endpoint.avgResponse}ms
                        </div>
                        <div className="text-sm text-muted-foreground">متوسط الاستجابة</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">
                          {endpoint.success}%
                        </div>
                        <div className="text-sm text-muted-foreground">معدل النجاح</div>
                      </div>
                      <div>
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 ml-1" />
                          إدارة
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إدارة Webhooks</CardTitle>
              <p className="text-muted-foreground">
                تكوين ومراقبة الأحداث التلقائية
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">قريباً</h3>
                <p className="text-gray-400">
                  سيتم إضافة إدارة Webhooks في التحديث القادم
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أداء التكاملات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrations.filter(i => i.status === 'connected').map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(integration.type)}
                        <span className="font-medium">{integration.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={integration.health} className="w-20" />
                        <span className="text-sm font-medium">{integration.health}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تنبيهات النظام</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">نجح التزامن</span>
                    </div>
                    <div className="text-sm text-green-700">
                      تم تزامن البيانات مع نظام SAP بنجاح
                    </div>
                    <div className="text-xs text-green-600 mt-1">منذ 5 دقائق</div>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">بطء في الاستجابة</span>
                    </div>
                    <div className="text-sm text-yellow-700">
                      استجابة بطيئة من خدمة الرسائل النصية
                    </div>
                    <div className="text-xs text-yellow-600 mt-1">منذ 15 دقيقة</div>
                  </div>

                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">انقطاع الاتصال</span>
                    </div>
                    <div className="text-sm text-red-700">
                      فقدان الاتصال مع بريد Office 365
                    </div>
                    <div className="text-xs text-red-600 mt-1">منذ ساعتين</div>
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