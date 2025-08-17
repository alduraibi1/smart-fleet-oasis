
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, User } from "lucide-react";
import { MaintenanceFormData } from "../EnhancedAddMaintenanceDialog";

interface NotesTabProps {
  formData: MaintenanceFormData;
  setFormData: (data: MaintenanceFormData) => void;
}

export function NotesTab({ formData, setFormData }: NotesTabProps) {
  const handleNotesChange = (value: string) => {
    setFormData({ ...formData, notes: value });
  };

  return (
    <div className="space-y-4">
      {/* ملاحظات العمل */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            ملاحظات الصيانة
          </CardTitle>
          <CardDescription>
            أضف ملاحظات مفصلة حول الصيانة، الأعطال المكتشفة، والتوصيات
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maintenanceNotes">ملاحظات مفصلة</Label>
            <Textarea
              id="maintenanceNotes"
              value={formData.notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="اكتب ملاحظات مفصلة حول:
• الأعطال المكتشفة
• الإصلاحات المنجزة
• القطع المستبدلة
• التوصيات للصيانة القادمة
• أي ملاحظات مهمة أخرى..."
              className="min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* معلومات إضافية */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            معلومات الجلسة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">تم الإنشاء بواسطة</div>
                <div className="font-medium">المستخدم الحالي</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">تاريخ الإنشاء</div>
                <div className="font-medium">{new Date().toLocaleDateString('ar-SA')}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* نصائح */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-blue-900">نصائح لكتابة ملاحظات فعالة</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• اذكر تفاصيل الأعطال المكتشفة بوضوح</li>
                <li>• سجل رقم المقطع أو الجزء إذا كان متاحاً</li>
                <li>• أضف توصيات للصيانة القادمة</li>
                <li>• اذكر أي ملاحظات مهمة للفريق القادم</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
