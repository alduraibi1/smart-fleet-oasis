
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
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Star, Calendar as CalendarIcon, Shield, ShieldAlert, Eye, FileText } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  national_id: string;
  license_number: string;
  license_expiry: string;
  address?: string;
  city?: string;
  nationality: string;
  rating: number;
  is_active: boolean;
  blacklisted: boolean;
  blacklist_reason?: string;
  total_rentals: number;
  created_at: string;
}

interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  national_id: string;
  license_number: string;
  license_expiry: Date;
  address: string;
  city: string;
  nationality: string;
  is_active: boolean;
}

export const CompleteCustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [blacklistDialogOpen, setBlacklistDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [blacklistReason, setBlacklistReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    national_id: '',
    license_number: '',
    license_expiry: new Date(),
    address: '',
    city: '',
    nationality: 'سعودي',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب العملاء",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const customerData = {
        ...formData,
        license_expiry: formData.license_expiry.toISOString().split('T')[0],
      };

      if (editingCustomer) {
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', editingCustomer.id);

        if (error) throw error;
        toast({
          title: "تم التحديث",
          description: "تم تحديث بيانات العميل بنجاح"
        });
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([{
            ...customerData,
            rating: 5,
            total_rentals: 0,
            blacklisted: false
          }]);

        if (error) throw error;
        toast({
          title: "تم الإضافة",
          description: "تم إضافة العميل بنجاح"
        });
      }

      setDialogOpen(false);
      setEditingCustomer(null);
      resetForm();
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ بيانات العميل",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      national_id: customer.national_id,
      license_number: customer.license_number,
      license_expiry: new Date(customer.license_expiry),
      address: customer.address || '',
      city: customer.city || '',
      nationality: customer.nationality,
      is_active: customer.is_active
    });
    setDialogOpen(true);
  };

  const handleDelete = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;
      
      toast({
        title: "تم الحذف",
        description: "تم حذف العميل بنجاح"
      });
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف العميل",
        variant: "destructive"
      });
    }
  };

  const handleBlacklist = async () => {
    if (!selectedCustomer || !blacklistReason.trim()) return;

    try {
      const { error } = await supabase
        .from('customers')
        .update({
          blacklisted: true,
          blacklist_reason: blacklistReason,
          is_active: false
        })
        .eq('id', selectedCustomer.id);

      if (error) throw error;
      
      toast({
        title: "تم إضافة للقائمة السوداء",
        description: "تم إضافة العميل للقائمة السوداء بنجاح"
      });
      
      setBlacklistDialogOpen(false);
      setBlacklistReason('');
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error('Error blacklisting customer:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة العميل للقائمة السوداء",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFromBlacklist = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          blacklisted: false,
          blacklist_reason: null,
          is_active: true
        })
        .eq('id', customerId);

      if (error) throw error;
      
      toast({
        title: "تم الإزالة من القائمة السوداء",
        description: "تم إزالة العميل من القائمة السوداء بنجاح"
      });
      fetchCustomers();
    } catch (error) {
      console.error('Error removing from blacklist:', error);
      toast({
        title: "خطأ",
        description: "فشل في إزالة العميل من القائمة السوداء",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      national_id: '',
      license_number: '',
      license_expiry: new Date(),
      address: '',
      city: '',
      nationality: 'سعودي',
      is_active: true
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getLicenseStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', text: 'منتهية', color: 'destructive' };
    if (daysUntilExpiry <= 30) return { status: 'expiring', text: 'تنتهي قريباً', color: 'secondary' };
    return { status: 'valid', text: 'صالحة', color: 'default' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">إدارة العملاء الشاملة</h2>
          <p className="text-muted-foreground">إدارة كاملة لقاعدة بيانات العملاء</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCustomer(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'تعديل العميل' : 'إضافة عميل جديد'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">الاسم *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="national_id">رقم الهوية *</Label>
                  <Input
                    id="national_id"
                    value={formData.national_id}
                    onChange={(e) => setFormData({...formData, national_id: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license_number">رقم رخصة القيادة *</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label>تاريخ انتهاء الرخصة *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.license_expiry, 'dd/MM/yyyy', { locale: ar })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.license_expiry}
                        onSelect={(date) => date && setFormData({...formData, license_expiry: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">المدينة</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="nationality">الجنسية</Label>
                  <Select 
                    value={formData.nationality} 
                    onValueChange={(value) => setFormData({...formData, nationality: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="سعودي">سعودي</SelectItem>
                      <SelectItem value="مصري">مصري</SelectItem>
                      <SelectItem value="أردني">أردني</SelectItem>
                      <SelectItem value="سوري">سوري</SelectItem>
                      <SelectItem value="لبناني">لبناني</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="العنوان التفصيلي..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">عميل نشط</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  {editingCustomer ? 'تحديث' : 'إضافة'} العميل
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>قائمة العملاء</CardTitle>
            <div className="w-72">
              <Input
                placeholder="البحث بالاسم أو الهاتف أو البريد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>حالة الرخصة</TableHead>
                  <TableHead>التقييم</TableHead>
                  <TableHead>العقود</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const licenseStatus = getLicenseStatus(customer.license_expiry);
                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.email || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={licenseStatus.color as any}>
                          {licenseStatus.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {renderStars(customer.rating)}
                        </div>
                      </TableCell>
                      <TableCell>{customer.total_rentals}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {customer.blacklisted && (
                            <Badge variant="destructive">قائمة سوداء</Badge>
                          )}
                          <Badge variant={customer.is_active ? "default" : "secondary"}>
                            {customer.is_active ? "نشط" : "غير نشط"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewingCustomer(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {customer.blacklisted ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveFromBlacklist(customer.id)}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setBlacklistDialogOpen(true);
                              }}
                            >
                              <ShieldAlert className="h-4 w-4" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  سيتم حذف العميل نهائياً. لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(customer.id)}>
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Blacklist Dialog */}
      <Dialog open={blacklistDialogOpen} onOpenChange={setBlacklistDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة للقائمة السوداء</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>سيتم إضافة العميل: <strong>{selectedCustomer?.name}</strong> للقائمة السوداء</p>
            <div>
              <Label htmlFor="blacklist_reason">سبب الإضافة للقائمة السوداء *</Label>
              <Textarea
                id="blacklist_reason"
                value={blacklistReason}
                onChange={(e) => setBlacklistReason(e.target.value)}
                placeholder="اذكر السبب..."
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBlacklistDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleBlacklist} disabled={!blacklistReason.trim()}>
                إضافة للقائمة السوداء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Details Dialog */}
      <Dialog open={!!viewingCustomer} onOpenChange={() => setViewingCustomer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل العميل</DialogTitle>
          </DialogHeader>
          {viewingCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الاسم</Label>
                  <p className="font-medium">{viewingCustomer.name}</p>
                </div>
                <div>
                  <Label>رقم الهاتف</Label>
                  <p className="font-medium">{viewingCustomer.phone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <p className="font-medium">{viewingCustomer.email || 'غير محدد'}</p>
                </div>
                <div>
                  <Label>رقم الهوية</Label>
                  <p className="font-medium">{viewingCustomer.national_id}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>رقم رخصة القيادة</Label>
                  <p className="font-medium">{viewingCustomer.license_number}</p>
                </div>
                <div>
                  <Label>تاريخ انتهاء الرخصة</Label>
                  <p className="font-medium">
                    {format(new Date(viewingCustomer.license_expiry), 'dd/MM/yyyy', { locale: ar })}
                  </p>
                </div>
              </div>
              {viewingCustomer.address && (
                <div>
                  <Label>العنوان</Label>
                  <p className="font-medium">{viewingCustomer.address}</p>
                </div>
              )}
              <div className="flex items-center gap-4">
                <div>
                  <Label>التقييم</Label>
                  <div className="flex items-center gap-1">
                    {renderStars(viewingCustomer.rating)}
                  </div>
                </div>
                <div>
                  <Label>عدد العقود</Label>
                  <p className="font-medium">{viewingCustomer.total_rentals}</p>
                </div>
              </div>
              {viewingCustomer.blacklisted && (
                <div>
                  <Label>سبب القائمة السوداء</Label>
                  <p className="font-medium text-red-600">
                    {viewingCustomer.blacklist_reason || 'غير محدد'}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
