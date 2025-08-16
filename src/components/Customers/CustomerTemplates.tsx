
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, User, Building, Crown } from "lucide-react";

interface CustomerTemplate {
  id: string;
  name: string;
  description: string;
  category: 'individual' | 'corporate' | 'vip';
  icon: any;
  fields: {
    name: string;
    nationality: string;
    gender?: 'male' | 'female';
    marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
    customer_source: string;
    preferred_language: string;
    marketing_consent: boolean;
    sms_notifications: boolean;
    email_notifications: boolean;
    credit_limit: number;
    payment_terms: string;
    preferred_payment_method: string;
    [key: string]: any;
  };
}

interface CustomerTemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTemplate: (template: CustomerTemplate) => void;
}

const predefinedTemplates: CustomerTemplate[] = [
  {
    id: 'individual-basic',
    name: 'عميل فردي - أساسي',
    description: 'قالب للعملاء الأفراد العاديين',
    category: 'individual',
    icon: User,
    fields: {
      name: '',
      nationality: 'سعودي',
      gender: 'male',
      marital_status: 'single',
      customer_source: 'walk_in',
      preferred_language: 'ar',
      marketing_consent: true,
      sms_notifications: true,
      email_notifications: false,
      credit_limit: 0,
      payment_terms: 'immediate',
      preferred_payment_method: 'cash'
    }
  },
  {
    id: 'corporate-basic',
    name: 'عميل مؤسسي - أساسي',
    description: 'قالب للشركات والمؤسسات',
    category: 'corporate',
    icon: Building,
    fields: {
      name: '',
      nationality: 'سعودي',
      customer_source: 'referral',
      preferred_language: 'ar',
      marketing_consent: true,
      sms_notifications: true,
      email_notifications: true,
      credit_limit: 10000,
      payment_terms: 'net_30',
      preferred_payment_method: 'bank_transfer'
    }
  },
  {
    id: 'vip-customer',
    name: 'عميل مميز - VIP',
    description: 'قالب للعملاء المميزين والكبار',
    category: 'vip',
    icon: Crown,
    fields: {
      name: '',
      nationality: 'سعودي',
      customer_source: 'referral',
      preferred_language: 'ar',
      marketing_consent: true,
      sms_notifications: true,
      email_notifications: true,
      credit_limit: 50000,
      payment_terms: 'net_60',
      preferred_payment_method: 'bank_transfer'
    }
  }
];

export const CustomerTemplates = ({
  open,
  onOpenChange,
  onApplyTemplate
}: CustomerTemplatesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = selectedCategory === 'all' 
    ? predefinedTemplates 
    : predefinedTemplates.filter(t => t.category === selectedCategory);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'individual': return 'فردي';
      case 'corporate': return 'مؤسسي';
      case 'vip': return 'مميز';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'individual': return 'bg-blue-100 text-blue-800';
      case 'corporate': return 'bg-green-100 text-green-800';
      case 'vip': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            قوالب العملاء
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* فلاتر الفئات */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              جميع القوالب
            </Button>
            <Button
              variant={selectedCategory === 'individual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('individual')}
            >
              <User className="h-4 w-4 ml-2" />
              أفراد
            </Button>
            <Button
              variant={selectedCategory === 'corporate' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('corporate')}
            >
              <Building className="h-4 w-4 ml-2" />
              مؤسسات
            </Button>
            <Button
              variant={selectedCategory === 'vip' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('vip')}
            >
              <Crown className="h-4 w-4 ml-2" />
              عملاء مميزين
            </Button>
          </div>

          {/* عرض القوالب */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">{template.name}</CardTitle>
                      </div>
                      <Badge className={getCategoryColor(template.category)}>
                        {getCategoryLabel(template.category)}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-muted-foreground">الإعدادات المسبقة:</div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {template.fields.nationality}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.fields.preferred_payment_method === 'cash' ? 'نقداً' : 'تحويل بنكي'}
                        </Badge>
                        {template.fields.credit_limit > 0 && (
                          <Badge variant="outline" className="text-xs">
                            حد ائتمان: {template.fields.credit_limit.toLocaleString()} ريال
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => onApplyTemplate(template)}
                      className="w-full"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      تطبيق القالب
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد قوالب متاحة في هذه الفئة
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
