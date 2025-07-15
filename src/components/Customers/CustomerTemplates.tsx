import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Edit, Trash2, Copy, Users, Bookmark, FileText } from 'lucide-react';
import { Customer } from '@/types/index';

interface CustomerTemplate {
  id: string;
  name: string;
  description: string;
  category: 'individual' | 'corporate' | 'government';
  fields: Partial<Customer>;
  usage_count: number;
  created_at: string;
}

interface CustomerTemplatesProps {
  onApplyTemplate: (template: CustomerTemplate) => void;
}

export function CustomerTemplates({ onApplyTemplate }: CustomerTemplatesProps) {
  const [templates, setTemplates] = useState<CustomerTemplate[]>([
    {
      id: '1',
      name: 'عميل فردي - سعودي',
      description: 'قالب للعملاء الأفراد السعوديين',
      category: 'individual',
      fields: {
        nationality: 'سعودي',
        country: 'السعودية',
        gender: 'male',
        marital_status: 'single',
        license_type: 'private',
        preferred_language: 'ar',
        customer_source: 'walk-in',
        preferred_payment_method: 'cash',
        marketing_consent: true,
        sms_notifications: true,
        email_notifications: true,
      },
      usage_count: 45,
      created_at: '2024-01-15',
    },
    {
      id: '2',
      name: 'عميل مؤسسي',
      description: 'قالب للشركات والمؤسسات',
      category: 'corporate',
      fields: {
        nationality: 'سعودي',
        country: 'السعودية',
        license_type: 'commercial',
        preferred_language: 'ar',
        customer_source: 'website',
        preferred_payment_method: 'bank_transfer',
        payment_terms: 'net_30',
        credit_limit: 50000,
        marketing_consent: false,
        sms_notifications: false,
        email_notifications: true,
      },
      usage_count: 12,
      created_at: '2024-01-20',
    },
    {
      id: '3',
      name: 'عميل حكومي',
      description: 'قالب للجهات الحكومية',
      category: 'government',
      fields: {
        nationality: 'سعودي',
        country: 'السعودية',
        license_type: 'government',
        preferred_language: 'ar',
        customer_source: 'referral',
        preferred_payment_method: 'bank_transfer',
        payment_terms: 'net_45',
        credit_limit: 100000,
        marketing_consent: false,
        sms_notifications: false,
        email_notifications: true,
      },
      usage_count: 8,
      created_at: '2024-02-01',
    },
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomerTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<CustomerTemplate>>({
    name: '',
    description: '',
    category: 'individual',
    fields: {},
  });

  const { toast } = useToast();

  const handleCreateTemplate = () => {
    if (!newTemplate.name) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم القالب',
        variant: 'destructive',
      });
      return;
    }

    const template: CustomerTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description || '',
      category: newTemplate.category as any,
      fields: newTemplate.fields || {},
      usage_count: 0,
      created_at: new Date().toISOString(),
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({ name: '', description: '', category: 'individual', fields: {} });
    setShowCreateDialog(false);

    toast({
      title: 'تم بنجاح',
      description: 'تم إنشاء القالب بنجاح',
    });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({
      title: 'تم بنجاح',
      description: 'تم حذف القالب بنجاح',
    });
  };

  const handleApplyTemplate = (template: CustomerTemplate) => {
    // تحديث عداد الاستخدام
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usage_count: t.usage_count + 1 }
        : t
    ));

    onApplyTemplate(template);
    
    toast({
      title: 'تم تطبيق القالب',
      description: `تم تطبيق قالب "${template.name}" بنجاح`,
    });
  };

  const handleDuplicateTemplate = (template: CustomerTemplate) => {
    const duplicated: CustomerTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} - نسخة`,
      usage_count: 0,
      created_at: new Date().toISOString(),
    };

    setTemplates(prev => [...prev, duplicated]);
    
    toast({
      title: 'تم بنجاح',
      description: 'تم نسخ القالب بنجاح',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'individual':
        return <Users className="h-4 w-4" />;
      case 'corporate':
        return <FileText className="h-4 w-4" />;
      case 'government':
        return <Bookmark className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'individual':
        return 'فردي';
      case 'corporate':
        return 'مؤسسي';
      case 'government':
        return 'حكومي';
      default:
        return 'غير محدد';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'individual':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'corporate':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'government':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">قوالب العملاء</h3>
          <p className="text-sm text-muted-foreground">
            استخدم القوالب المحفوظة لإنشاء عملاء جدد بسرعة
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              قالب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إنشاء قالب جديد</DialogTitle>
              <DialogDescription>
                أنشئ قالباً جديداً لتسريع عملية إضافة العملاء
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">اسم القالب</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: عميل فردي - مقيم"
                />
              </div>

              <div>
                <Label htmlFor="template-description">الوصف</Label>
                <Textarea
                  id="template-description"
                  value={newTemplate.description || ''}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف مختصر للقالب..."
                />
              </div>

              <div>
                <Label>فئة القالب</Label>
                <Select
                  value={newTemplate.category || 'individual'}
                  onValueChange={(value) => setNewTemplate(prev => ({ 
                    ...prev, 
                    category: value as any 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">فردي</SelectItem>
                    <SelectItem value="corporate">مؤسسي</SelectItem>
                    <SelectItem value="government">حكومي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  إلغاء
                </Button>
                <Button onClick={handleCreateTemplate}>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ القالب
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">الكل ({templates.length})</TabsTrigger>
          <TabsTrigger value="individual">
            فردي ({templates.filter(t => t.category === 'individual').length})
          </TabsTrigger>
          <TabsTrigger value="corporate">
            مؤسسي ({templates.filter(t => t.category === 'corporate').length})
          </TabsTrigger>
          <TabsTrigger value="government">
            حكومي ({templates.filter(t => t.category === 'government').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="relative group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getCategoryColor(template.category)}`}>
                      {getCategoryLabel(template.category)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-xs text-muted-foreground">
                      استُخدم {template.usage_count} مرة
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <Button
                        size="sm"
                        onClick={() => handleApplyTemplate(template)}
                        className="flex-1"
                      >
                        تطبيق القالب
                      </Button>

                      <div className="flex gap-1 mr-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicateTemplate(template)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingTemplate(template)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {['individual', 'corporate', 'government'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates
                .filter(t => t.category === category)
                .map((template) => (
                  <Card key={template.id} className="relative group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(template.category)}
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="text-xs text-muted-foreground">
                          استُخدم {template.usage_count} مرة
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center">
                          <Button
                            size="sm"
                            onClick={() => handleApplyTemplate(template)}
                            className="flex-1"
                          >
                            تطبيق القالب
                          </Button>

                          <div className="flex gap-1 mr-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDuplicateTemplate(template)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingTemplate(template)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {templates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>لا توجد قوالب محفوظة</p>
          <p className="text-sm">أنشئ قالبك الأول لتسريع عملية إضافة العملاء</p>
        </div>
      )}
    </div>
  );
}