import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMaintenance } from "@/hooks/useMaintenance";
import { useMaintenanceInventory } from "@/hooks/useMaintenanceInventory";
import { 
  ClipboardList, 
  Package, 
  Droplets, 
  Calculator, 
  Camera, 
  Clock,
  Save,
  X,
  Plus,
  Minus,
  AlertTriangle
} from "lucide-react";

// Import tab components
import { BasicInfoTab } from "./tabs/BasicInfoTab";
import { PartsTab } from "./tabs/PartsTab";
import { OilsTab } from "./tabs/OilsTab";
import { CostsTab } from "./tabs/CostsTab";
import { ImagesTab } from "./tabs/ImagesTab";

interface EnhancedAddMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface MaintenanceFormData {
  // Basic Info
  vehicleId: string;
  mechanicId: string;
  type: string;
  description: string;
  date: Date | undefined;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  
  // Parts Used
  partsUsed: Array<{
    partId: string;
    partName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    stockBefore: number;
    stockAfter: number;
  }>;
  
  // Oils Used
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
  
  // Costs
  laborHours: number;
  hourlyRate: number;
  laborCost: number;
  partsCost: number;
  oilsCost: number;
  additionalCosts: number;
  discount: number;
  totalCost: number;
  
  // Vehicle Condition
  vehicleConditionBefore: string;
  vehicleConditionAfter: string;
  beforeImages: string[];
  afterImages: string[];
  
  // Additional
  notes: string;
  warranty: boolean;
  warrantyPeriod: number;
  workStartTime: Date | undefined;
  workEndTime: Date | undefined;
}

export function EnhancedAddMaintenanceDialog({ open, onOpenChange }: EnhancedAddMaintenanceDialogProps) {
  const { toast } = useToast();
  const { addMaintenanceRecord } = useMaintenance();
  const { saveMaintenancePartsUsed, saveMaintenanceOilsUsed } = useMaintenanceInventory();
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<MaintenanceFormData>({
    vehicleId: "",
    mechanicId: "",
    type: "",
    description: "",
    date: undefined,
    priority: "medium",
    estimatedHours: 0,
    partsUsed: [],
    oilsUsed: [],
    laborHours: 0,
    hourlyRate: 50,
    laborCost: 0,
    partsCost: 0,
    oilsCost: 0,
    additionalCosts: 0,
    discount: 0,
    totalCost: 0,
    vehicleConditionBefore: "",
    vehicleConditionAfter: "",
    beforeImages: [],
    afterImages: [],
    notes: "",
    warranty: false,
    warrantyPeriod: 30,
    workStartTime: undefined,
    workEndTime: undefined,
  });

  // Calculate costs automatically
  const calculateCosts = () => {
    const partsCost = formData.partsUsed.reduce((sum, part) => sum + part.totalCost, 0);
    const oilsCost = formData.oilsUsed.reduce((sum, oil) => sum + oil.totalCost, 0);
    const laborCost = formData.laborHours * formData.hourlyRate;
    const subtotal = partsCost + oilsCost + laborCost + formData.additionalCosts;
    const totalCost = subtotal - formData.discount;
    
    setFormData(prev => ({
      ...prev,
      partsCost,
      oilsCost,
      laborCost,
      totalCost: Math.max(0, totalCost)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.vehicleId || !formData.mechanicId || !formData.type || !formData.description) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول الأساسية المطلوبة",
        variant: "destructive"
      });
      setActiveTab("basic");
      return false;
    }
    
    if (!formData.date) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى تحديد تاريخ الصيانة",
        variant: "destructive"
      });
      setActiveTab("basic");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Calculate final costs
      calculateCosts();
      
      // Save maintenance record
      const maintenanceData = {
        vehicle_id: formData.vehicleId,
        mechanic_id: formData.mechanicId,
        maintenance_type: formData.type,
        description: formData.description,
        scheduled_date: formData.date?.toISOString().split('T')[0],
        status: 'in_progress',
        priority: formData.priority,
        estimated_duration: formData.estimatedHours,
        labor_cost: formData.laborCost,
        parts_cost: formData.partsCost,
        total_cost: formData.totalCost,
        notes: formData.notes,
        warranty_applicable: formData.warranty,
        warranty_period_days: formData.warranty ? formData.warrantyPeriod : null
      };

      const maintenanceRecord = await addMaintenanceRecord(maintenanceData);
      
      // Save parts used if any
      if (formData.partsUsed.length > 0) {
        await saveMaintenancePartsUsed(maintenanceRecord.id, formData.partsUsed);
      }
      
      // Save oils used if any
      if (formData.oilsUsed.length > 0) {
        await saveMaintenanceOilsUsed(maintenanceRecord.id, formData.oilsUsed);
      }
      
      toast({
        title: "تم إضافة سجل الصيانة",
        description: "تم حفظ جميع البيانات وتحديث المخزون بنجاح"
      });
      
      // Reset form
      setFormData({
        vehicleId: "",
        mechanicId: "",
        type: "",
        description: "",
        date: undefined,
        priority: "medium",
        estimatedHours: 0,
        partsUsed: [],
        oilsUsed: [],
        laborHours: 0,
        hourlyRate: 50,
        laborCost: 0,
        partsCost: 0,
        oilsCost: 0,
        additionalCosts: 0,
        discount: 0,
        totalCost: 0,
        vehicleConditionBefore: "",
        vehicleConditionAfter: "",
        beforeImages: [],
        afterImages: [],
        notes: "",
        warranty: false,
        warrantyPeriod: 30,
        workStartTime: undefined,
        workEndTime: undefined,
      });
      
      setActiveTab("basic");
      onOpenChange(false);
      
    } catch (error) {
      console.error('خطأ في حفظ سجل الصيانة:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'basic': return ClipboardList;
      case 'parts': return Package;
      case 'oils': return Droplets;
      case 'costs': return Calculator;
      case 'images': return Camera;
      default: return ClipboardList;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0">
        <div className="flex-shrink-0 p-6 pb-3">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">إضافة سجل صيانة متقدم</DialogTitle>
                <p className="text-muted-foreground text-sm">إدارة شاملة لسجلات الصيانة والمخزون</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getPriorityColor(formData.priority)} className="text-xs">
                  {formData.priority === 'urgent' && 'عاجل'}
                  {formData.priority === 'high' && 'عالي'}
                  {formData.priority === 'medium' && 'متوسط'}
                  {formData.priority === 'low' && 'منخفض'}
                </Badge>
                {formData.totalCost > 0 && (
                  <Badge variant="secondary" className="text-sm font-bold">
                    {formData.totalCost.toFixed(2)} ر.س
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>
          <Separator className="mt-3" />
        </div>

        <div className="flex-1 overflow-hidden px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 mb-3 h-9 flex-shrink-0">
              {[
                { id: 'basic', label: 'أساسية', icon: ClipboardList },
                { id: 'parts', label: 'قطع غيار', icon: Package },
                { id: 'oils', label: 'زيوت', icon: Droplets },
                { id: 'costs', label: 'تكاليف', icon: Calculator },
                { id: 'images', label: 'صور', icon: Camera },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1 px-2 text-xs">
                    <Icon className="h-3 w-3" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <TabsContent value="basic" className="mt-0 mb-4">
                <BasicInfoTab 
                  formData={formData} 
                  setFormData={setFormData}
                  onCalculateCosts={calculateCosts}
                />
              </TabsContent>

              <TabsContent value="parts" className="mt-0 mb-4">
                <PartsTab 
                  formData={formData} 
                  setFormData={setFormData}
                  onCalculateCosts={calculateCosts}
                />
              </TabsContent>

              <TabsContent value="oils" className="mt-0 mb-4">
                <OilsTab 
                  formData={formData} 
                  setFormData={setFormData}
                  onCalculateCosts={calculateCosts}
                />
              </TabsContent>

              <TabsContent value="costs" className="mt-0 mb-4">
                <CostsTab 
                  formData={formData} 
                  setFormData={setFormData}
                  onCalculateCosts={calculateCosts}
                />
              </TabsContent>

              <TabsContent value="images" className="mt-0 mb-4">
                <ImagesTab 
                  formData={formData} 
                  setFormData={setFormData}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex-shrink-0 px-6 pb-4">
          <Separator className="mb-3" />
          
          {/* Summary and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">
                قطع: {formData.partsUsed.length} • 
                زيوت: {formData.oilsUsed.length} • 
                ساعات: {formData.laborHours}
              </div>
              {formData.totalCost > 1000 && (
                <div className="flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="text-xs">تكلفة عالية</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                <X className="h-3 w-3 mr-1" />
                إلغاء
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="h-3 w-3 mr-1" />
                {isSubmitting ? "جاري الحفظ..." : "حفظ السجل"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}