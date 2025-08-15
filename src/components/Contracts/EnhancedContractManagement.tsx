import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Edit, Trash2, FileText, Calendar as CalendarIcon, Printer } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EarlyTerminationDialog } from "./EarlyTerminationDialog";

interface Contract {
  id: string;
  contract_number: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  daily_rate: number;
  total_amount: number;
  deposit_amount: number;
  status: string;
  customer?: any;
  vehicle?: any;
}

interface ContractFormData {
  customer_id: string;
  vehicle_id: string;
  start_date: Date;
  end_date: Date;
  daily_rate: number;
  deposit_amount: number;
  notes?: string;
}

export const EnhancedContractManagement = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<ContractFormData>({
    customer_id: '',
    vehicle_id: '',
    start_date: new Date(),
    end_date: new Date(),
    daily_rate: 0,
    deposit_amount: 0,
    notes: ''
  });
  const { toast } = useToast();

  const [earlyDialogOpen, setEarlyDialogOpen] = useState(false);
  const [selectedForEarly, setSelectedForEarly] = useState<Contract | null>(null);

  useEffect(() => {
    fetchContracts();
    fetchCustomers();
    fetchVehicles();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rental_contracts')
        .select(`
          *,
          customer:customers(*),
          vehicle:vehicles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب العقود",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, make, model, year, license_plate')
        .eq('status', 'available')
        .order('make');

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const calculateTotalAmount = () => {
    if (formData.start_date && formData.end_date && formData.daily_rate) {
      const days = Math.ceil(
        (formData.end_date.getTime() - formData.start_date.getTime()) / (1000 * 60 * 60 * 24)
      );
      return days * formData.daily_rate;
    }
    return 0;
  };

  const generateContractNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CON-${year}${month}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const contractData = {
        ...formData,
        contract_number: editingContract?.contract_number || generateContractNumber(),
        start_date: formData.start_date.toISOString().split('T')[0],
        end_date: formData.end_date.toISOString().split('T')[0],
        total_amount: calculateTotalAmount(),
        payment_status: 'pending',
        status: 'draft'
      };

      if (editingContract) {
        const { error } = await supabase
          .from('rental_contracts')
          .update(contractData)
          .eq('id', editingContract.id);

        if (error) throw error;
        toast({
          title: "تم التحديث",
          description: "تم تحديث العقد بنجاح"
        });
      } else {
        const { error } = await supabase
          .from('rental_contracts')
          .insert([contractData]);

        if (error) throw error;
        toast({
          title: "تم الإنشاء",
          description: "تم إنشاء العقد بنجاح"
        });
      }

      setDialogOpen(false);
      setEditingContract(null);
      resetForm();
      fetchContracts();
    } catch (error) {
      console.error('Error saving contract:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ العقد",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setFormData({
      customer_id: contract.customer_id,
      vehicle_id: contract.vehicle_id,
      start_date: new Date(contract.start_date),
      end_date: new Date(contract.end_date),
      daily_rate: contract.daily_rate,
      deposit_amount: contract.deposit_amount,
      notes: ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (contractId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العقد؟')) return;

    try {
      const { error } = await supabase
        .from('rental_contracts')
        .delete()
        .eq('id', contractId);

      if (error) throw error;
      
      toast({
        title: "تم الحذف",
        description: "تم حذف العقد بنجاح"
      });
      fetchContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف العقد",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      vehicle_id: '',
      start_date: new Date(),
      end_date: new Date(),
      daily_rate: 0,
      deposit_amount: 0,
      notes: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'draft': { label: 'مسودة', variant: 'secondary' as const },
      'active': { label: 'نشط', variant: 'default' as const },
      'completed': { label: 'مكتمل', variant: 'outline' as const },
      'cancelled': { label: 'ملغي', variant: 'destructive' as const }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  const printContract = (contract: Contract) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>عقد إيجار - ${contract.contract_number}</title>
            <style>
              body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .contract-details { margin: 20px 0; }
              .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>عقد إيجار مركبة</h1>
              <h2>رقم العقد: ${contract.contract_number}</h2>
            </div>
            
            <div class="contract-details">
              <p><strong>العميل:</strong> ${contract.customer?.name || 'غير محدد'}</p>
              <p><strong>المركبة:</strong> ${contract.vehicle?.make} ${contract.vehicle?.model} - ${contract.vehicle?.license_plate}</p>
              <p><strong>تاريخ البداية:</strong> ${format(new Date(contract.start_date), 'dd/MM/yyyy', { locale: ar })}</p>
              <p><strong>تاريخ النهاية:</strong> ${format(new Date(contract.end_date), 'dd/MM/yyyy', { locale: ar })}</p>
              <p><strong>الأجرة اليومية:</strong> ${contract.daily_rate} ريال</p>
              <p><strong>المبلغ الإجمالي:</strong> ${contract.total_amount} ريال</p>
              <p><strong>مبلغ التأمين:</strong> ${contract.deposit_amount} ريال</p>
            </div>
            
            <div class="signature-section">
              <div>
                <p>توقيع المستأجر: ________________</p>
              </div>
              <div>
                <p>توقيع المؤجر: ________________</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">إدارة العقود المتقدمة</h2>
          <p className="text-muted-foreground">إدارة شاملة لعقود الإيجار</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingContract(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              عقد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingContract ? 'تعديل العقد' : 'إضافة عقد جديد'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer">العميل</Label>
                  <Select 
                    value={formData.customer_id} 
                    onValueChange={(value) => setFormData({...formData, customer_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="vehicle">المركبة</Label>
                  <Select 
                    value={formData.vehicle_id} 
                    onValueChange={(value) => setFormData({...formData, vehicle_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المركبة" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} - {vehicle.license_plate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>تاريخ البداية</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.start_date, 'dd/MM/yyyy', { locale: ar })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.start_date}
                        onSelect={(date) => date && setFormData({...formData, start_date: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>تاريخ النهاية</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.end_date, 'dd/MM/yyyy', { locale: ar })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.end_date}
                        onSelect={(date) => date && setFormData({...formData, end_date: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="daily_rate">الأجرة اليومية (ريال)</Label>
                  <Input
                    id="daily_rate"
                    type="number"
                    value={formData.daily_rate}
                    onChange={(e) => setFormData({...formData, daily_rate: Number(e.target.value)})}
                  />
                </div>

                <div>
                  <Label htmlFor="deposit">مبلغ التأمين (ريال)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    value={formData.deposit_amount}
                    onChange={(e) => setFormData({...formData, deposit_amount: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label>المبلغ الإجمالي المتوقع</Label>
                <div className="text-2xl font-bold text-green-600">
                  {calculateTotalAmount().toLocaleString()} ريال
                </div>
              </div>

              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="ملاحظات إضافية..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingContract ? 'تحديث' : 'إنشاء'} العقد
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة العقود</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم العقد</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المركبة</TableHead>
                  <TableHead>تاريخ البداية</TableHead>
                  <TableHead>تاريخ النهاية</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.contract_number}</TableCell>
                    <TableCell>{contract.customer?.name || 'غير محدد'}</TableCell>
                    <TableCell>
                      {contract.vehicle ? 
                        `${contract.vehicle.make} ${contract.vehicle.model}` : 
                        'غير محدد'
                      }
                    </TableCell>
                    <TableCell>
                      {format(new Date(contract.start_date), 'dd/MM/yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(contract.end_date), 'dd/MM/yyyy', { locale: ar })}
                    </TableCell>
                    <TableCell>{contract.total_amount?.toLocaleString()} ريال</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(contract.status).variant}>
                        {getStatusBadge(contract.status).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => printContract(contract)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(contract)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(contract.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedForEarly(contract);
                            setEarlyDialogOpen(true);
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedForEarly && (
        <EarlyTerminationDialog
          open={earlyDialogOpen}
          onOpenChange={setEarlyDialogOpen}
          contract={{
            id: selectedForEarly.id,
            customer_id: selectedForEarly.customer_id,
            vehicle_id: selectedForEarly.vehicle_id,
            start_date: selectedForEarly.start_date,
            end_date: selectedForEarly.end_date,
            daily_rate: selectedForEarly.daily_rate,
            total_amount: selectedForEarly.total_amount,
            minimum_rental_period: (selectedForEarly as any).minimum_rental_period ?? null,
            early_termination_fee: (selectedForEarly as any).early_termination_fee ?? null,
            termination_policy: (selectedForEarly as any).termination_policy ?? null,
            contract_number: selectedForEarly.contract_number,
            customer: { name: selectedForEarly.customer?.name }
          }}
          onCreated={fetchContracts}
        />
      )}
    </div>
  );
};
