import { useState } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Damage {
  id: string;
  location: string;
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  estimatedCost: number;
}

interface DamageAssessmentProps {
  damages: Damage[];
  onChange: (damages: Damage[]) => void;
}

const severityLabels = {
  minor: { label: 'بسيط', color: 'text-yellow-600' },
  moderate: { label: 'متوسط', color: 'text-orange-600' },
  major: { label: 'كبير', color: 'text-red-600' },
};

const commonDamageLocations = [
  'الباب الأمامي الأيمن',
  'الباب الأمامي الأيسر',
  'الباب الخلفي الأيمن',
  'الباب الخلفي الأيسر',
  'الصادم الأمامي',
  'الصادم الخلفي',
  'غطاء المحرك',
  'صندوق الأمتعة',
  'المرآة الجانبية اليمنى',
  'المرآة الجانبية اليسرى',
  'الزجاج الأمامي',
  'الزجاج الخلفي',
  'الإطار الأمامي الأيمن',
  'الإطار الأمامي الأيسر',
  'الإطار الخلفي الأيمن',
  'الإطار الخلفي الأيسر',
  'المقاعد الأمامية',
  'المقاعد الخلفية',
  'لوحة القيادة',
  'السقف',
  'أخرى',
];

export default function DamageAssessment({ damages, onChange }: DamageAssessmentProps) {
  const addDamage = () => {
    const newDamage: Damage = {
      id: Date.now().toString(),
      location: '',
      severity: 'minor',
      description: '',
      estimatedCost: 0,
    };
    onChange([...damages, newDamage]);
  };

  const removeDamage = (id: string) => {
    onChange(damages.filter((d) => d.id !== id));
  };

  const updateDamage = (id: string, field: keyof Damage, value: any) => {
    onChange(
      damages.map((d) =>
        d.id === id ? { ...d, [field]: value } : d
      )
    );
  };

  const totalCost = damages.reduce((sum, d) => sum + d.estimatedCost, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            تقييم الأضرار
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDamage}
          >
            <Plus className="h-4 w-4 mr-2" />
            إضافة ضرر
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {damages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>لا توجد أضرار مسجلة</p>
            <p className="text-sm">انقر على "إضافة ضرر" لتسجيل أي أضرار</p>
          </div>
        ) : (
          <div className="space-y-4">
            {damages.map((damage, index) => (
              <div
                key={damage.id}
                className="border rounded-lg p-4 space-y-3 bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">ضرر #{index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDamage(damage.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`location-${damage.id}`}>الموقع</Label>
                    <Select
                      value={damage.location}
                      onValueChange={(value) =>
                        updateDamage(damage.id, 'location', value)
                      }
                    >
                      <SelectTrigger id={`location-${damage.id}`}>
                        <SelectValue placeholder="اختر موقع الضرر" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonDamageLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`severity-${damage.id}`}>الخطورة</Label>
                    <Select
                      value={damage.severity}
                      onValueChange={(value: 'minor' | 'moderate' | 'major') =>
                        updateDamage(damage.id, 'severity', value)
                      }
                    >
                      <SelectTrigger id={`severity-${damage.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(severityLabels).map(([key, { label, color }]) => (
                          <SelectItem key={key} value={key}>
                            <span className={color}>{label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`description-${damage.id}`}>
                    وصف الضرر
                  </Label>
                  <Textarea
                    id={`description-${damage.id}`}
                    placeholder="اكتب وصفاً تفصيلياً للضرر..."
                    value={damage.description}
                    onChange={(e) =>
                      updateDamage(damage.id, 'description', e.target.value)
                    }
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor={`cost-${damage.id}`}>
                    التكلفة المقدرة (ر.س)
                  </Label>
                  <Input
                    id={`cost-${damage.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={damage.estimatedCost}
                    onChange={(e) =>
                      updateDamage(
                        damage.id,
                        'estimatedCost',
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>
            ))}

            {damages.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>إجمالي تكلفة الأضرار:</span>
                  <span className="text-destructive">
                    {totalCost.toFixed(2)} ر.س
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
