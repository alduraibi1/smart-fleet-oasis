import { ClipboardCheck, CheckCircle, XCircle, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Vehicle } from '@/types/vehicle';

interface InspectionTabProps {
  vehicle: Vehicle;
}

export default function InspectionTab({ vehicle }: InspectionTabProps) {
  const inspection = vehicle.inspectionPoints;

  if (!inspection) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">لا توجد بيانات فحص</p>
          <p className="text-muted-foreground">لم يتم إجراء فحص شامل لهذه المركبة بعد</p>
        </CardContent>
      </Card>
    );
  }

  const getConditionBadge = (condition?: string) => {
    const badges = {
      excellent: { label: 'ممتازة', variant: 'default' as const },
      good: { label: 'جيدة', variant: 'secondary' as const },
      fair: { label: 'مقبولة', variant: 'outline' as const },
      poor: { label: 'ضعيفة', variant: 'destructive' as const },
    };
    return badges[condition as keyof typeof badges] || badges.good;
  };

  const conditionBadge = getConditionBadge(inspection.overall_condition);

  const InspectionSection = ({ 
    title, 
    items 
  }: { 
    title: string; 
    items: { label: string; checked: boolean }[] 
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {item.checked ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${item.checked ? 'text-foreground' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Inspection Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              ملخص الفحص
            </span>
            <Badge variant={conditionBadge.variant} className="text-sm">
              {conditionBadge.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inspection.inspector_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">الفاحص</p>
                  <p className="font-medium">{inspection.inspector_name}</p>
                </div>
              </div>
            )}
            {inspection.inspection_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الفحص</p>
                  <p className="font-medium">
                    {new Date(inspection.inspection_date).toLocaleDateString('ar')}
                  </p>
                </div>
              </div>
            )}
          </div>
          {inspection.notes && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">ملاحظات الفحص</p>
                <p className="text-sm">{inspection.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Inspection Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InspectionSection
          title="الهيكل الخارجي"
          items={[
            { label: 'الواجهة الأمامية', checked: inspection.body_front },
            { label: 'الواجهة الخلفية', checked: inspection.body_rear },
            { label: 'الجانب الأيمن', checked: inspection.body_right_side },
            { label: 'الجانب الأيسر', checked: inspection.body_left_side },
            { label: 'السقف', checked: inspection.body_roof },
            { label: 'الكبوت', checked: inspection.body_hood },
            { label: 'صندوق الأمتعة', checked: inspection.body_trunk },
          ]}
        />

        <InspectionSection
          title="الإطارات والجنوط"
          items={[
            { label: 'الإطار الأمامي الأيمن', checked: inspection.tires_front_right },
            { label: 'الإطار الأمامي الأيسر', checked: inspection.tires_front_left },
            { label: 'الإطار الخلفي الأيمن', checked: inspection.tires_rear_right },
            { label: 'الإطار الخلفي الأيسر', checked: inspection.tires_rear_left },
            { label: 'الإطار الاحتياطي', checked: inspection.spare_tire },
          ]}
        />

        <InspectionSection
          title="الأضواء"
          items={[
            { label: 'الأضواء الأمامية', checked: inspection.lights_headlights },
            { label: 'الأضواء الخلفية', checked: inspection.lights_tail_lights },
            { label: 'أضواء الفرامل', checked: inspection.lights_brake_lights },
            { label: 'أضواء الإشارة', checked: inspection.lights_turn_signals },
            { label: 'أضواء الضباب', checked: inspection.lights_fog_lights },
            { label: 'الإضاءة الداخلية', checked: inspection.lights_interior },
          ]}
        />

        <InspectionSection
          title="الزجاج والمرايا"
          items={[
            { label: 'الزجاج الأمامي', checked: inspection.glass_windshield },
            { label: 'الزجاج الخلفي', checked: inspection.glass_rear_window },
            { label: 'زجاج النوافذ الجانبية', checked: inspection.glass_side_windows },
            { label: 'المرايا', checked: inspection.mirrors },
          ]}
        />

        <InspectionSection
          title="المحرك والميكانيك"
          items={[
            { label: 'حالة المحرك', checked: inspection.engine_condition },
            { label: 'مستوى الزيت', checked: inspection.oil_level },
            { label: 'مستوى سائل التبريد', checked: inspection.coolant_level },
            { label: 'حالة البطارية', checked: inspection.battery_condition },
          ]}
        />

        <InspectionSection
          title="المقصورة الداخلية"
          items={[
            { label: 'المقاعد', checked: inspection.interior_seats },
            { label: 'لوحة القيادة', checked: inspection.interior_dashboard },
            { label: 'عناصر التحكم', checked: inspection.interior_controls },
            { label: 'النظافة العامة', checked: inspection.interior_cleanliness },
          ]}
        />
      </div>
    </div>
  );
}
