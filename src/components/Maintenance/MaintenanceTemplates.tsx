
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMaintenance } from "@/hooks/useMaintenance";
import { AddMaintenanceTemplateDialog } from "./AddMaintenanceTemplateDialog";
import { Plus, Settings, Clock, DollarSign, CheckSquare, Edit, Trash2 } from "lucide-react";

export const MaintenanceTemplates = () => {
  const { templates, fetchTemplates } = useMaintenance();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleTemplateSuccess = () => {
    fetchTemplates();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">قوالب الصيانة</h2>
          <p className="text-muted-foreground">قوالب جاهزة لأعمال الصيانة المختلفة</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إنشاء قالب جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">لا توجد قوالب صيانة</p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                إنشاء قالب جديد
              </Button>
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span>نوع الصيانة: {template.maintenance_type}</span>
                </div>

                {template.estimated_duration_hours && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>المدة المتوقعة: {template.estimated_duration_hours} ساعة</span>
                  </div>
                )}

                {template.estimated_cost && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>التكلفة المتوقعة: {template.estimated_cost.toLocaleString()} ريال</span>
                  </div>
                )}

                {template.checklist_items && template.checklist_items.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      قائمة المراجعة:
                    </p>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      {template.checklist_items.slice(0, 3).map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full"></span>
                          {item}
                        </li>
                      ))}
                      {template.checklist_items.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          +{template.checklist_items.length - 3} المزيد...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {template.required_parts && (
                  <div className="text-xs text-muted-foreground">
                    <strong>القطع المطلوبة:</strong> متوفرة في القالب
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  تم الإنشاء: {new Date(template.created_at).toLocaleDateString('ar-SA')}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="h-3 w-3" />
                    تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AddMaintenanceTemplateDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleTemplateSuccess}
      />
    </div>
  );
};
