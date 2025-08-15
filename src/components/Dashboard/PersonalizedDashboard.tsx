
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Layout, Eye, EyeOff, GripVertical, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardWidget {
  id: string;
  name: string;
  type: 'kpi' | 'chart' | 'table' | 'map' | 'alerts';
  title: string;
  description: string;
  isVisible: boolean;
  order: number;
  size: 'small' | 'medium' | 'large';
  refreshInterval?: number;
}

export const PersonalizedDashboard: React.FC = () => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState('grid');
  const { toast } = useToast();

  useEffect(() => {
    // Load saved configuration or default widgets
    const defaultWidgets: DashboardWidget[] = [
      {
        id: '1',
        name: 'revenue-kpi',
        type: 'kpi',
        title: 'إجمالي الإيرادات',
        description: 'عرض إجمالي الإيرادات مع المقارنات',
        isVisible: true,
        order: 1,
        size: 'small',
        refreshInterval: 300000 // 5 minutes
      },
      {
        id: '2',
        name: 'contracts-kpi',
        type: 'kpi',
        title: 'العقود النشطة',
        description: 'عدد العقود النشطة الحالية',
        isVisible: true,
        order: 2,
        size: 'small'
      },
      {
        id: '3',
        name: 'revenue-chart',
        type: 'chart',
        title: 'مخطط الإيرادات',
        description: 'رسم بياني لاتجاه الإيرادات',
        isVisible: true,
        order: 3,
        size: 'large'
      },
      {
        id: '4',
        name: 'vehicle-map',
        type: 'map',
        title: 'خريطة المركبات',
        description: 'مواقع المركبات بالوقت الفعلي',
        isVisible: false,
        order: 4,
        size: 'large'
      },
      {
        id: '5',
        name: 'alerts-panel',
        type: 'alerts',
        title: 'التنبيهات',
        description: 'إنذارات النظام والتنبيهات المهمة',
        isVisible: true,
        order: 5,
        size: 'medium'
      },
      {
        id: '6',
        name: 'vehicles-table',
        type: 'table',
        title: 'جدول المركبات',
        description: 'قائمة تفصيلية بالمركبات',
        isVisible: false,
        order: 6,
        size: 'large'
      }
    ];

    // Try to load from localStorage
    const savedConfig = localStorage.getItem('dashboard-config');
    if (savedConfig) {
      try {
        setWidgets(JSON.parse(savedConfig));
      } catch {
        setWidgets(defaultWidgets);
      }
    } else {
      setWidgets(defaultWidgets);
    }
  }, []);

  const saveConfiguration = () => {
    localStorage.setItem('dashboard-config', JSON.stringify(widgets));
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم حفظ تخصيص لوحة التحكم بنجاح",
    });
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgets(prev =>
      prev.map(widget =>
        widget.id === widgetId
          ? { ...widget, isVisible: !widget.isVisible }
          : widget
      )
    );
  };

  const updateWidgetSize = (widgetId: string, size: 'small' | 'medium' | 'large') => {
    setWidgets(prev =>
      prev.map(widget =>
        widget.id === widgetId
          ? { ...widget, size }
          : widget
      )
    );
  };

  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    setWidgets(prev => {
      const currentIndex = prev.findIndex(w => w.id === widgetId);
      if (currentIndex === -1) return prev;

      const newIndex = direction === 'up' 
        ? Math.max(0, currentIndex - 1)
        : Math.min(prev.length - 1, currentIndex + 1);

      const newWidgets = [...prev];
      [newWidgets[currentIndex], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[currentIndex]];

      // Update order numbers
      return newWidgets.map((widget, index) => ({ ...widget, order: index + 1 }));
    });
  };

  const resetToDefault = () => {
    localStorage.removeItem('dashboard-config');
    window.location.reload();
  };

  const visibleWidgets = widgets.filter(w => w.isVisible).sort((a, b) => a.order - b.order);
  const hiddenWidgets = widgets.filter(w => !w.isVisible);

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'kpi':
        return '📊';
      case 'chart':
        return '📈';
      case 'table':
        return '📋';
      case 'map':
        return '🗺️';
      case 'alerts':
        return '🔔';
      default:
        return '📦';
    }
  };

  const getSizeText = (size: string) => {
    switch (size) {
      case 'small':
        return 'صغير';
      case 'medium':
        return 'متوسط';
      case 'large':
        return 'كبير';
      default:
        return 'متوسط';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              لوحة التحكم الشخصية
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    تخصيص
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>تخصيص لوحة التحكم</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Layout Selection */}
                    <div>
                      <h3 className="font-semibold mb-3">تخطيط العرض</h3>
                      <Select value={selectedLayout} onValueChange={setSelectedLayout}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="grid">شبكة</SelectItem>
                          <SelectItem value="list">قائمة</SelectItem>
                          <SelectItem value="masonry">متدرج</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Visible Widgets */}
                    <div>
                      <h3 className="font-semibold mb-3">الأدوات المعروضة</h3>
                      <div className="space-y-2">
                        {visibleWidgets.map((widget, index) => (
                          <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{getWidgetIcon(widget.type)}</span>
                              <div>
                                <p className="font-medium">{widget.title}</p>
                                <p className="text-sm text-muted-foreground">{widget.description}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Select 
                                value={widget.size} 
                                onValueChange={(size: 'small' | 'medium' | 'large') => 
                                  updateWidgetSize(widget.id, size)
                                }
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="small">صغير</SelectItem>
                                  <SelectItem value="medium">متوسط</SelectItem>
                                  <SelectItem value="large">كبير</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <div className="flex flex-col">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveWidget(widget.id, 'up')}
                                  disabled={index === 0}
                                >
                                  ↑
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveWidget(widget.id, 'down')}
                                  disabled={index === visibleWidgets.length - 1}
                                >
                                  ↓
                                </Button>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleWidgetVisibility(widget.id)}
                              >
                                <EyeOff className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hidden Widgets */}
                    {hiddenWidgets.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">الأدوات المخفية</h3>
                        <div className="space-y-2">
                          {hiddenWidgets.map((widget) => (
                            <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                              <div className="flex items-center gap-3">
                                <span className="text-lg opacity-50">{getWidgetIcon(widget.type)}</span>
                                <div>
                                  <p className="font-medium text-muted-foreground">{widget.title}</p>
                                  <p className="text-sm text-muted-foreground">{widget.description}</p>
                                </div>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleWidgetVisibility(widget.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between pt-4 border-t">
                      <Button variant="outline" onClick={resetToDefault}>
                        إعادة تعيين
                      </Button>
                      <Button onClick={saveConfiguration}>
                        حفظ التغييرات
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Badge variant="outline">
                {visibleWidgets.length} من {widgets.length} أداة
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="text-center py-8">
            <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">لوحة التحكم المخصصة</h3>
            <p className="text-muted-foreground mb-4">
              يمكنك تخصيص لوحة التحكم حسب احتياجاتك من خلال إضافة أو إزالة الأدوات وتغيير ترتيبها
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {visibleWidgets.map((widget) => (
                <div key={widget.id} className={`
                  p-4 border rounded-lg bg-card transition-colors hover:bg-muted/50
                  ${widget.size === 'small' ? 'col-span-1' : 
                    widget.size === 'medium' ? 'md:col-span-2' : 'lg:col-span-3'}
                `}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{getWidgetIcon(widget.type)}</span>
                    <Badge variant="outline" className="text-xs">
                      {getSizeText(widget.size)}
                    </Badge>
                  </div>
                  <h4 className="font-medium mb-1">{widget.title}</h4>
                  <p className="text-sm text-muted-foreground">{widget.description}</p>
                </div>
              ))}
            </div>
            
            {visibleWidgets.length === 0 && (
              <div className="py-8">
                <p className="text-muted-foreground">
                  لا توجد أدوات معروضة. استخدم زر "تخصيص" لإضافة أدوات إلى لوحة التحكم.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
