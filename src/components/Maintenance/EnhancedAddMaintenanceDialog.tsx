
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Wrench, Package, Droplets, DollarSign, FileText, Image } from "lucide-react";
import { useMaintenance } from "@/hooks/useMaintenance";
import { BasicInfoTab } from "./tabs/BasicInfoTab";
import { PartsTab } from "./tabs/PartsTab";
import { OilsTab } from "./tabs/OilsTab";
import { CostsTab } from "./tabs/CostsTab";
import { NotesTab } from "./tabs/NotesTab";
import { ImagesTab } from "./tabs/ImagesTab";

export interface MaintenanceFormData {
  vehicleId: string;
  mechanicId: string;
  type: string;
  priority: string;
  description: string;
  date: Date | undefined;
  odometerIn: number | undefined;
  odometerOut: number | undefined;
  estimatedHours: number;
  workStartTime: Date | undefined;
  workEndTime: Date | undefined;
  laborHours: number;
  hourlyRate: number;
  laborCost: number;
  partsCost: number;
  oilsCost: number;
  additionalCosts: number;
  discount: number;
  warranty: boolean;
  warrantyPeriod: number;
  notes: string;
  images: File[];
  partsUsed: Array<{
    partId: string;
    partName: string;
    partNumber: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    stockBefore: number;
    stockAfter: number;
  }>;
  oilsUsed: Array<{
    oilId: string;
    oilName: string;
    viscosity: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    stockBefore: number;
    stockAfter: number;
  }>;
}

export const EnhancedAddMaintenanceDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const { addMaintenanceRecord } = useMaintenance();

  const [formData, setFormData] = useState<MaintenanceFormData>({
    vehicleId: '',
    mechanicId: '',
    type: '',
    priority: 'medium',
    description: '',
    date: undefined,
    odometerIn: undefined,
    odometerOut: undefined,
    estimatedHours: 0,
    workStartTime: undefined,
    workEndTime: undefined,
    laborHours: 0,
    hourlyRate: 0,
    laborCost: 0,
    partsCost: 0,
    oilsCost: 0,
    additionalCosts: 0,
    discount: 0,
    warranty: false,
    warrantyPeriod: 30,
    notes: '',
    images: [],
    partsUsed: [],
    oilsUsed: []
  });

  const calculateCosts = () => {
    const laborCost = formData.laborHours * formData.hourlyRate;
    const partsCost = formData.partsUsed.reduce((sum, part) => sum + part.totalCost, 0);
    const oilsCost = formData.oilsUsed.reduce((sum, oil) => sum + oil.totalCost, 0);

    setFormData(prev => ({
      ...prev,
      laborCost,
      partsCost,
      oilsCost
    }));
  };

  const handleSubmit = async () => {
    if (!formData.vehicleId || !formData.mechanicId || !formData.type || !formData.description) {
      return;
    }

    setLoading(true);
    try {
      const maintenanceData = {
        vehicle_id: formData.vehicleId,
        mechanic_id: formData.mechanicId,
        assigned_mechanic_id: formData.mechanicId,
        maintenance_type: formData.type,
        description: formData.description,
        reported_issue: formData.description,
        priority: formData.priority,
        scheduled_date: formData.date?.toISOString(),
        odometer_in: formData.odometerIn,
        odometer_out: formData.odometerOut,
        labor_hours: formData.laborHours,
        labor_cost: formData.laborCost,
        parts_cost: formData.partsCost,
        cost: formData.laborCost + formData.partsCost + formData.oilsCost + formData.additionalCosts - formData.discount,
        notes: formData.notes,
        warranty_until: formData.warranty ? 
          new Date(Date.now() + formData.warrantyPeriod * 24 * 60 * 60 * 1000).toISOString() : 
          undefined,
        status: 'scheduled'
      };

      await addMaintenanceRecord(maintenanceData);
      setOpen(false);
      
      // إعادة تعيين النموذج
      setFormData({
        vehicleId: '',
        mechanicId: '',
        type: '',
        priority: 'medium',
        description: '',
        date: undefined,
        odometerIn: undefined,
        odometerOut: undefined,
        estimatedHours: 0,
        workStartTime: undefined,
        workEndTime: undefined,
        laborHours: 0,
        hourlyRate: 0,
        laborCost: 0,
        partsCost: 0,
        oilsCost: 0,
        additionalCosts: 0,
        discount: 0,
        warranty: false,
        warrantyPeriod: 30,
        notes: '',
        images: [],
        partsUsed: [],
        oilsUsed: []
      });
      setActiveTab("basic");
    } catch (error) {
      console.error('Error adding maintenance record:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.vehicleId && formData.mechanicId && formData.type && formData.description;
  const totalCost = formData.laborCost + formData.partsCost + formData.oilsCost + formData.additionalCosts - formData.discount;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          إضافة صيانة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            إضافة سجل صيانة جديد
          </DialogTitle>
          <DialogDescription>
            أضف سجل صيانة شامل مع تفاصيل القطع والزيوت والتكاليف
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic" className="flex items-center gap-1">
                <Wrench className="h-3 w-3" />
                أساسي
              </TabsTrigger>
              <TabsTrigger value="parts" className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                قطع الغيار
                {formData.partsUsed.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {formData.partsUsed.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="oils" className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                الزيوت
                {formData.oilsUsed.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {formData.oilsUsed.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="costs" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                التكاليف
                {totalCost > 0 && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    {totalCost.toFixed(0)} ر.س
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-1">
                <Image className="h-3 w-3" />
                الصور
                {formData.images.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {formData.images.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                الملاحظات
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="basic" className="mt-0">
                <BasicInfoTab 
                  formData={formData} 
                  setFormData={setFormData}
                  onCalculateCosts={calculateCosts}
                />
              </TabsContent>

              <TabsContent value="parts" className="mt-0">
                <PartsTab 
                  formData={formData} 
                  setFormData={setFormData}
                  onCalculateCosts={calculateCosts}
                />
              </TabsContent>

              <TabsContent value="oils" className="mt-0">
                <OilsTab 
                  formData={formData} 
                  setFormData={setFormData}
                  onCalculateCosts={calculateCosts}
                />
              </TabsContent>

              <TabsContent value="costs" className="mt-0">
                <CostsTab 
                  formData={formData} 
                  setFormData={setFormData}
                  onCalculateCosts={calculateCosts}
                />
              </TabsContent>

              <TabsContent value="images" className="mt-0">
                <ImagesTab 
                  formData={formData} 
                  setFormData={setFormData}
                />
              </TabsContent>

              <TabsContent value="notes" className="mt-0">
                <NotesTab 
                  formData={formData} 
                  setFormData={setFormData}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {totalCost > 0 && (
              <Badge variant="outline" className="text-sm">
                الإجمالي: {totalCost.toFixed(2)} ر.س
              </Badge>
            )}
            <Badge variant={isFormValid ? "default" : "secondary"}>
              {isFormValid ? "مكتمل" : "غير مكتمل"}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSubmit} disabled={!isFormValid || loading}>
              {loading ? "جاري الحفظ..." : "حفظ الصيانة"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
