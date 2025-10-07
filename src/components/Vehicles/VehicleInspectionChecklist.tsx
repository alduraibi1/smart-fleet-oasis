import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck, ChevronDown, ChevronUp } from "lucide-react";
import { VehicleInspectionPoints } from "@/types/vehicle";

interface VehicleInspectionChecklistProps {
  onInspectionChange: (data: Partial<VehicleInspectionPoints>) => void;
  initialData?: Partial<VehicleInspectionPoints>;
}

export const VehicleInspectionChecklist = ({
  onInspectionChange,
  initialData,
}: VehicleInspectionChecklistProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inspectionData, setInspectionData] = useState<Partial<VehicleInspectionPoints>>(
    initialData || {}
  );

  const handleCheckChange = (field: keyof VehicleInspectionPoints, value: boolean) => {
    const newData = { ...inspectionData, [field]: value };
    setInspectionData(newData);
    onInspectionChange(newData);
  };

  const handleFieldChange = (field: keyof VehicleInspectionPoints, value: string) => {
    const newData = { ...inspectionData, [field]: value };
    setInspectionData(newData);
    onInspectionChange(newData);
  };

  const CheckboxItem = ({ field, label }: { field: keyof VehicleInspectionPoints; label: string }) => (
    <div className="flex items-center space-x-2 space-x-reverse">
      <Checkbox
        id={field}
        checked={inspectionData[field] as boolean || false}
        onCheckedChange={(checked) => handleCheckChange(field, checked as boolean)}
      />
      <Label htmlFor={field} className="text-sm cursor-pointer">
        {label}
      </Label>
    </div>
  );

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold">فحص المركبة الشامل (اختياري)</span>
        </div>
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </Button>

      {isExpanded && (
        <div className="space-y-6 pt-4">
          {/* الهيكل الخارجي */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-primary">الهيكل الخارجي</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <CheckboxItem field="body_front" label="الواجهة الأمامية" />
              <CheckboxItem field="body_rear" label="الواجهة الخلفية" />
              <CheckboxItem field="body_right_side" label="الجانب الأيمن" />
              <CheckboxItem field="body_left_side" label="الجانب الأيسر" />
              <CheckboxItem field="body_roof" label="السقف" />
              <CheckboxItem field="body_hood" label="الكبوت" />
              <CheckboxItem field="body_trunk" label="صندوق الأمتعة" />
            </div>
          </div>

          {/* الإطارات والجنوط */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-primary">الإطارات والجنوط</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <CheckboxItem field="tires_front_right" label="الإطار الأمامي الأيمن" />
              <CheckboxItem field="tires_front_left" label="الإطار الأمامي الأيسر" />
              <CheckboxItem field="tires_rear_right" label="الإطار الخلفي الأيمن" />
              <CheckboxItem field="tires_rear_left" label="الإطار الخلفي الأيسر" />
              <CheckboxItem field="spare_tire" label="الإطار الاحتياطي" />
            </div>
          </div>

          {/* الأضواء */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-primary">الأضواء</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <CheckboxItem field="lights_headlights" label="الأضواء الأمامية" />
              <CheckboxItem field="lights_tail_lights" label="الأضواء الخلفية" />
              <CheckboxItem field="lights_brake_lights" label="أضواء الفرامل" />
              <CheckboxItem field="lights_turn_signals" label="أضواء الإشارة" />
              <CheckboxItem field="lights_fog_lights" label="أضواء الضباب" />
              <CheckboxItem field="lights_interior" label="الإضاءة الداخلية" />
            </div>
          </div>

          {/* الزجاج والمرايا */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-primary">الزجاج والمرايا</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <CheckboxItem field="glass_windshield" label="الزجاج الأمامي" />
              <CheckboxItem field="glass_rear_window" label="الزجاج الخلفي" />
              <CheckboxItem field="glass_side_windows" label="زجاج النوافذ الجانبية" />
              <CheckboxItem field="mirrors" label="المرايا" />
            </div>
          </div>

          {/* المحرك والميكانيك */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-primary">المحرك والميكانيك</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <CheckboxItem field="engine_condition" label="حالة المحرك" />
              <CheckboxItem field="oil_level" label="مستوى الزيت" />
              <CheckboxItem field="coolant_level" label="مستوى سائل التبريد" />
              <CheckboxItem field="battery_condition" label="حالة البطارية" />
            </div>
          </div>

          {/* الداخلية */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-primary">المقصورة الداخلية</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <CheckboxItem field="interior_seats" label="المقاعد" />
              <CheckboxItem field="interior_dashboard" label="لوحة القيادة" />
              <CheckboxItem field="interior_controls" label="عناصر التحكم" />
              <CheckboxItem field="interior_cleanliness" label="النظافة العامة" />
            </div>
          </div>

          {/* معلومات الفحص */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inspector_name">اسم الفاحص</Label>
              <Input
                id="inspector_name"
                value={inspectionData.inspector_name || ""}
                onChange={(e) => handleFieldChange("inspector_name", e.target.value)}
                placeholder="اسم الشخص الذي قام بالفحص"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overall_condition">الحالة العامة</Label>
              <Select
                value={inspectionData.overall_condition || "good"}
                onValueChange={(value) => handleFieldChange("overall_condition", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">ممتازة</SelectItem>
                  <SelectItem value="good">جيدة</SelectItem>
                  <SelectItem value="fair">مقبولة</SelectItem>
                  <SelectItem value="poor">ضعيفة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inspection_notes">ملاحظات الفحص</Label>
            <Textarea
              id="inspection_notes"
              value={inspectionData.notes || ""}
              onChange={(e) => handleFieldChange("notes", e.target.value)}
              placeholder="أي ملاحظات إضافية حول حالة المركبة..."
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  );
};
