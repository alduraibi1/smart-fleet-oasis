import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Upload, X, FileText, Image as ImageIcon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VehicleOwner, VehicleDocument, VehicleImage } from '@/types/vehicle';

const vehicleSchema = z.object({
  plateNumber: z.string().min(1, 'رقم اللوحة مطلوب'),
  brand: z.string().min(1, 'العلامة التجارية مطلوبة'),
  model: z.string().min(1, 'الموديل مطلوب'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().min(1, 'اللون مطلوب'),
  dailyRate: z.number().min(1, 'السعر اليومي مطلوب'),
  mileage: z.number().min(0, 'الكيلومترات لا يمكن أن تكون سالبة'),
  ownerId: z.string().min(1, 'المالك مطلوب'),
  engineNumber: z.string().min(1, 'رقم المحرك مطلوب'),
  chassisNumber: z.string().min(1, 'رقم الشاسيه مطلوب'),
  fuelType: z.enum(['gasoline', 'diesel', 'hybrid', 'electric']),
  transmission: z.enum(['manual', 'automatic']),
  seatingCapacity: z.number().min(1).max(50),
  notes: z.string().optional(),
});

interface AddVehicleDialogProps {
  onVehicleAdded: (vehicle: any) => void;
}

export default function AddVehicleDialog({ onVehicleAdded }: AddVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [images, setImages] = useState<VehicleImage[]>([]);

  // Mock owners data - في التطبيق الحقيقي يأتي من API
  const owners: VehicleOwner[] = [
    {
      id: '1',
      name: 'أحمد محمد علي',
      phone: '+970-599-123456',
      email: 'ahmed@example.com',
      nationalId: '123456789',
      address: 'غزة، الرمال',
      isActive: true
    },
    {
      id: '2',
      name: 'محمد أحمد سالم',
      phone: '+970-599-654321',
      email: 'mohammed@example.com',
      nationalId: '987654321',
      address: 'رام الله، البيرة',
      isActive: true
    },
    {
      id: '3',
      name: 'سارة خالد محمود',
      phone: '+970-599-111222',
      email: 'sara@example.com',
      nationalId: '456789123',
      address: 'نابلس، البلدة القديمة',
      isActive: true
    }
  ];

  const form = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      mileage: 0,
      seatingCapacity: 5,
      fuelType: 'gasoline',
      transmission: 'automatic',
    },
  });

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => {
      const newDoc: VehicleDocument = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: 'other',
        file: file,
        uploadDate: new Date().toISOString(),
      };
      setDocuments(prev => [...prev, newDoc]);
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage: VehicleImage = {
          id: Date.now().toString() + Math.random(),
          url: e.target?.result as string,
          type: 'exterior',
          uploadDate: new Date().toISOString(),
        };
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const onSubmit = (data: z.infer<typeof vehicleSchema>) => {
    const selectedOwner = owners.find(owner => owner.id === data.ownerId);
    
    const newVehicle = {
      id: Date.now().toString(),
      ...data,
      status: 'available' as const,
      owner: selectedOwner,
      documents,
      images,
      features: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onVehicleAdded(newVehicle);
    setOpen(false);
    form.reset();
    setDocuments([]);
    setImages([]);
  };

  const getDocumentTypeLabel = (type: string) => {
    const types = {
      license: 'رخصة القيادة',
      insurance: 'تأمين',
      inspection: 'فحص دوري',
      registration: 'تسجيل',
      other: 'أخرى'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة مركبة جديدة
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إضافة مركبة جديدة</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
            <TabsTrigger value="owner">المالك</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
            <TabsTrigger value="images">الصور</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="plateNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم اللوحة</FormLabel>
                        <FormControl>
                          <Input placeholder="أ ب ج 123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العلامة التجارية</FormLabel>
                        <FormControl>
                          <Input placeholder="تويوتا" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الموديل</FormLabel>
                        <FormControl>
                          <Input placeholder="كامري" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سنة الصنع</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اللون</FormLabel>
                        <FormControl>
                          <Input placeholder="أبيض" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dailyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السعر اليومي (₪)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الكيلومترات</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seatingCapacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عدد المقاعد</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="engineNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم المحرك</FormLabel>
                        <FormControl>
                          <Input placeholder="ENG123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chassisNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الشاسيه</FormLabel>
                        <FormControl>
                          <Input placeholder="CHS789012" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fuelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع الوقود</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر نوع الوقود" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="gasoline">بنزين</SelectItem>
                            <SelectItem value="diesel">ديزل</SelectItem>
                            <SelectItem value="hybrid">هجين</SelectItem>
                            <SelectItem value="electric">كهربائي</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transmission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ناقل الحركة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر ناقل الحركة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manual">يدوي</SelectItem>
                            <SelectItem value="automatic">أوتوماتيك</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="أي ملاحظات إضافية..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="owner" className="space-y-4">
                <FormField
                  control={form.control}
                  name="ownerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اختر المالك</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر مالك المركبة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {owners.map((owner) => (
                            <SelectItem key={owner.id} value={owner.id}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <div>
                                  <p className="font-medium">{owner.name}</p>
                                  <p className="text-sm text-muted-foreground">{owner.phone}</p>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {owners.map((owner) => (
                    <Card key={owner.id} className="cursor-pointer hover:bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {owner.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        <p className="text-sm text-muted-foreground">📞 {owner.phone}</p>
                        <p className="text-sm text-muted-foreground">📧 {owner.email}</p>
                        <p className="text-sm text-muted-foreground">🆔 {owner.nationalId}</p>
                        <p className="text-sm text-muted-foreground">📍 {owner.address}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="documents" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-muted-foreground rounded-lg hover:bg-muted/50 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>رفع مستندات</span>
                    </div>
                  </Label>
                  <Input
                    id="documents"
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleDocumentUpload}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {getDocumentTypeLabel(doc.type)}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(doc.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="images" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border border-dashed border-muted-foreground rounded-lg hover:bg-muted/50 transition-colors">
                      <ImageIcon className="h-4 w-4" />
                      <span>رفع صور</span>
                    </div>
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt="Vehicle"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(image.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit">
                  إضافة المركبة
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}