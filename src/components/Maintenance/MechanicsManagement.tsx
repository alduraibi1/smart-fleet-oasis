import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMaintenance } from "@/hooks/useMaintenance";
import { Plus, Users, Wrench, Phone, Mail, Star } from "lucide-react";
import { AddMechanicDialog } from "./AddMechanicDialog";

export const MechanicsManagement = () => {
  const { mechanics } = useMaintenance();
  const [showAddDialog, setShowAddDialog] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الميكانيكيين</h2>
          <p className="text-muted-foreground">إدارة فريق الميكانيكيين والفنيين</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة ميكانيكي
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mechanics.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا يوجد ميكانيكيين</p>
            </CardContent>
          </Card>
        ) : (
          mechanics.map((mechanic) => (
            <Card key={mechanic.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{mechanic.name}</CardTitle>
                    {mechanic.employee_id && (
                      <CardDescription>كود الموظف: {mechanic.employee_id}</CardDescription>
                    )}
                  </div>
                  <Badge variant={mechanic.is_active ? "default" : "secondary"}>
                    {mechanic.is_active ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {mechanic.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{mechanic.phone}</span>
                  </div>
                )}
                
                {mechanic.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{mechanic.email}</span>
                  </div>
                )}

                {mechanic.hourly_rate && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">الأجر بالساعة:</span>
                    <span>{mechanic.hourly_rate} ريال</span>
                  </div>
                )}

                {mechanic.specializations && mechanic.specializations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">التخصصات:</p>
                    <div className="flex flex-wrap gap-1">
                      {mechanic.specializations.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {mechanic.hire_date && (
                  <div className="text-sm text-muted-foreground">
                    تاريخ التوظيف: {new Date(mechanic.hire_date).toLocaleDateString('ar-SA')}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    ميكانيكي معتمد
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AddMechanicDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};