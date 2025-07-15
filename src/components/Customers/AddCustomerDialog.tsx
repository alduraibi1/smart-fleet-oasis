import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Customer } from "@/types";
import { 
  CalendarIcon, 
  Upload, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  FileText,
  Shield,
  Camera,
  Plus,
  X
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (customer: Omit<Customer, 'id'>) => void;
}

export const AddCustomerDialog = ({ open, onOpenChange, onAdd }: AddCustomerDialogProps) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [requiresGuarantor, setRequiresGuarantor] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    name: "",
    nameEnglish: "",
    phone: "",
    phoneSecondary: "",
    email: "",
    emailSecondary: "",
    nationalId: "",
    nationality: "سعودي",
    dateOfBirth: undefined as Date | undefined,
    gender: "male",
    maritalStatus: "single",
    
    // License Information
    licenseNumber: "",
    licenseExpiry: undefined as Date | undefined,
    licenseType: "private",
    licenseIssueDate: undefined as Date | undefined,
    licenseIssuePlace: "",
    internationalLicense: false,
    internationalLicenseNumber: "",
    internationalLicenseExpiry: undefined as Date | undefined,
    
    // Address Information
    address: "",
    city: "",
    district: "",
    postalCode: "",
    country: "السعودية",
    addressType: "residential",
    
    // Work Information
    jobTitle: "",
    company: "",
    workAddress: "",
    workPhone: "",
    monthlyIncome: "",
    
    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    
    // Preferences & Settings
    preferredLanguage: "ar",
    marketingConsent: false,
    smsNotifications: true,
    emailNotifications: true,
    
    // Rating & Additional Info
    rating: 5,
    notes: "",
    customerSource: "website",
    referredBy: "",
    
    // Credit Information
    creditLimit: 0,
    paymentTerms: "immediate",
    preferredPaymentMethod: "cash",
    bankAccountNumber: "",
    bankName: "",
    
    // Insurance Information
    hasInsurance: false,
    insuranceCompany: "",
    insurancePolicyNumber: "",
    insuranceExpiry: undefined as Date | undefined,
    
    // Guarantor Information
    requiresGuarantor: false,
    guarantorName: "",
    guarantorNameEnglish: "",
    guarantorPhone: "",
    guarantorPhoneSecondary: "",
    guarantorEmail: "",
    guarantorNationalId: "",
    guarantorNationality: "سعودي",
    guarantorDateOfBirth: undefined as Date | undefined,
    guarantorRelation: "",
    guarantorJobTitle: "",
    guarantorCompany: "",
    guarantorWorkPhone: "",
    guarantorMonthlyIncome: "",
    guarantorAddress: "",
    guarantorCity: "",
    guarantorDistrict: "",
    guarantorPostalCode: "",
    guarantorCountry: "السعودية",
    guarantorLicenseNumber: "",
    guarantorLicenseExpiry: undefined as Date | undefined,
    guarantorBankName: "",
    guarantorAccountNumber: "",
    guarantorNotes: "",
  });

  const [documents, setDocuments] = useState<File[]>([]);
  const [uploadeFileTypes, setUploadedFileTypes] = useState<string[]>([]);

  const documentTypes = [
    { id: "national_id", name: "صورة الهوية الوطنية", required: true },
    { id: "license_front", name: "صورة رخصة القيادة (الوجه الأمامي)", required: true },
    { id: "license_back", name: "صورة رخصة القيادة (الوجه الخلفي)", required: true },
    { id: "work_certificate", name: "شهادة راتب أو عمل", required: false },
    { id: "bank_statement", name: "كشف حساب بنكي", required: false },
    { id: "insurance_policy", name: "وثيقة تأمين", required: false },
    { id: "international_license", name: "رخصة قيادة دولية", required: false },
    { id: "guarantor_id", name: "صورة هوية الكفيل", required: false },
    { id: "guarantor_salary", name: "شهادة راتب الكفيل", required: false },
    { id: "guarantor_bank_statement", name: "كشف حساب بنكي للكفيل", required: false },
    { id: "guarantor_commitment", name: "تعهد الكفالة", required: false },
    { id: "additional_docs", name: "مستندات إضافية", required: false },
  ];

  const handleFileUpload = (fileType: string, files: FileList | null) => {
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map(file => {
        const renamedFile = new File([file], `${fileType}_${file.name}`, { type: file.type });
        return renamedFile;
      });
      
      setDocuments(prev => [...prev.filter(doc => !doc.name.startsWith(fileType)), ...newFiles]);
      setUploadedFileTypes(prev => [...new Set([...prev, fileType])]);
    }
  };

  const removeDocument = (fileName: string) => {
    setDocuments(prev => prev.filter(doc => doc.name !== fileName));
    const fileType = fileName.split('_')[0];
    setUploadedFileTypes(prev => prev.filter(type => type !== fileType));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = [
      'name', 'phone', 'nationalId', 'licenseNumber', 'licenseExpiry',
      'address', 'city', 'emergencyContactName', 'emergencyContactPhone'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = formData[field as keyof typeof formData];
      return !value || (value instanceof Date && isNaN(value.getTime()));
    });

    if (missingFields.length > 0) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    // Check for required documents
    const requiredDocs = documentTypes.filter(doc => doc.required);
    const missingDocs = requiredDocs.filter(doc => !uploadeFileTypes.includes(doc.id));
    
    if (missingDocs.length > 0) {
      toast({
        title: "مستندات ناقصة",
        description: `يرجى رفع المستندات المطلوبة: ${missingDocs.map(doc => doc.name).join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const newCustomer: Omit<Customer, 'id'> = {
      name: formData.name,
      name_english: formData.nameEnglish,
      phone: formData.phone,
      phone_secondary: formData.phoneSecondary,
      email: formData.email,
      email_secondary: formData.emailSecondary,
      national_id: formData.nationalId,
      nationality: formData.nationality,
      date_of_birth: formData.dateOfBirth?.toISOString().split('T')[0],
      gender: formData.gender,
      marital_status: formData.maritalStatus,
      
      // معلومات الرخصة
      license_number: formData.licenseNumber,
      license_expiry: formData.licenseExpiry!.toISOString().split('T')[0],
      license_type: formData.licenseType,
      license_issue_date: formData.licenseIssueDate?.toISOString().split('T')[0],
      license_issue_place: formData.licenseIssuePlace,
      international_license: formData.internationalLicense,
      international_license_number: formData.internationalLicenseNumber,
      international_license_expiry: formData.internationalLicenseExpiry?.toISOString().split('T')[0],
      
      // معلومات العنوان
      address: formData.address,
      city: formData.city,
      district: formData.district,
      postal_code: formData.postalCode,
      country: formData.country,
      address_type: formData.addressType,
      
      // معلومات العمل
      job_title: formData.jobTitle,
      company: formData.company,
      work_address: formData.workAddress,
      work_phone: formData.workPhone,
      monthly_income: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : undefined,
      
      // جهة الاتصال في الطوارئ
      emergency_contact_name: formData.emergencyContactName,
      emergency_contact_phone: formData.emergencyContactPhone,
      emergency_contact_relation: formData.emergencyContactRelation,
      
      // التفضيلات والإعدادات
      preferred_language: formData.preferredLanguage,
      marketing_consent: formData.marketingConsent,
      sms_notifications: formData.smsNotifications,
      email_notifications: formData.emailNotifications,
      
      // التقييم والمعلومات الإضافية
      rating: formData.rating,
      notes: formData.notes,
      customer_source: formData.customerSource,
      referred_by: formData.referredBy,
      
      // معلومات الائتمان
      credit_limit: formData.creditLimit,
      payment_terms: formData.paymentTerms,
      preferred_payment_method: formData.preferredPaymentMethod,
      bank_account_number: formData.bankAccountNumber,
      bank_name: formData.bankName,
      
      // معلومات التأمين
      has_insurance: formData.hasInsurance,
      insurance_company: formData.insuranceCompany,
      insurance_policy_number: formData.insurancePolicyNumber,
      insurance_expiry: formData.insuranceExpiry?.toISOString().split('T')[0],
      
      // معلومات الحالة
      is_active: true,
      blacklisted: false,
      blacklist_reason: undefined,
      blacklist_date: undefined,
      total_rentals: 0,
      last_rental_date: undefined,
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: undefined,
      
      // الحقول للتوافق مع المكونات الحالية
      nationalId: formData.nationalId,
      licenseNumber: formData.licenseNumber,
      licenseExpiry: formData.licenseExpiry!,
      totalRentals: 0,
      blacklistReason: undefined,
      blacklistDate: undefined,
      documents: documents.map(doc => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: doc.name,
        type: doc.type,
        url: URL.createObjectURL(doc),
        uploadDate: new Date(),
      })),
    };

    onAdd(newCustomer);
    onOpenChange(false);
    resetForm();

    toast({
      title: "تم بنجاح",
      description: "تم إضافة العميل بنجاح مع جميع البيانات والمستندات",
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nameEnglish: "",
      phone: "",
      phoneSecondary: "",
      email: "",
      emailSecondary: "",
      nationalId: "",
      nationality: "سعودي",
      dateOfBirth: undefined,
      gender: "male",
      maritalStatus: "single",
      licenseNumber: "",
      licenseExpiry: undefined,
      licenseType: "private",
      licenseIssueDate: undefined,
      licenseIssuePlace: "",
      internationalLicense: false,
      internationalLicenseNumber: "",
      internationalLicenseExpiry: undefined,
      address: "",
      city: "",
      district: "",
      postalCode: "",
      country: "السعودية",
      addressType: "residential",
      jobTitle: "",
      company: "",
      workAddress: "",
      workPhone: "",
      monthlyIncome: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      preferredLanguage: "ar",
      marketingConsent: false,
      smsNotifications: true,
      emailNotifications: true,
      rating: 5,
      notes: "",
      customerSource: "website",
      referredBy: "",
      creditLimit: 0,
      paymentTerms: "immediate",
      preferredPaymentMethod: "cash",
      bankAccountNumber: "",
      bankName: "",
      hasInsurance: false,
      insuranceCompany: "",
      insurancePolicyNumber: "",
      insuranceExpiry: undefined,
      requiresGuarantor: false,
      guarantorName: "",
      guarantorNameEnglish: "",
      guarantorPhone: "",
      guarantorPhoneSecondary: "",
      guarantorEmail: "",
      guarantorNationalId: "",
      guarantorNationality: "سعودي",
      guarantorDateOfBirth: undefined,
      guarantorRelation: "",
      guarantorJobTitle: "",
      guarantorCompany: "",
      guarantorWorkPhone: "",
      guarantorMonthlyIncome: "",
      guarantorAddress: "",
      guarantorCity: "",
      guarantorDistrict: "",
      guarantorPostalCode: "",
      guarantorCountry: "السعودية",
      guarantorLicenseNumber: "",
      guarantorLicenseExpiry: undefined,
      guarantorBankName: "",
      guarantorAccountNumber: "",
      guarantorNotes: "",
    });
    setDocuments([]);
    setUploadedFileTypes([]);
    setActiveTab("personal");
    setRequiresGuarantor(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">إضافة عميل جديد</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal">شخصية</TabsTrigger>
            <TabsTrigger value="license">الرخصة</TabsTrigger>
            <TabsTrigger value="address">العنوان</TabsTrigger>
            <TabsTrigger value="work">العمل</TabsTrigger>
            <TabsTrigger value="guarantor">الكفيل</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    المعلومات الشخصية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم الكامل بالعربية *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="أدخل الاسم الكامل"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nameEnglish">الاسم بالإنجليزية</Label>
                      <Input
                        id="nameEnglish"
                        value={formData.nameEnglish}
                        onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                        placeholder="Full Name in English"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nationalId">رقم الهوية/الإقامة *</Label>
                      <Input
                        id="nationalId"
                        value={formData.nationalId}
                        onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                        placeholder="1xxxxxxxxx"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nationality">الجنسية</Label>
                      <Select value={formData.nationality} onValueChange={(value) => setFormData({ ...formData, nationality: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="سعودي">سعودي</SelectItem>
                          <SelectItem value="مصري">مصري</SelectItem>
                          <SelectItem value="سوري">سوري</SelectItem>
                          <SelectItem value="لبناني">لبناني</SelectItem>
                          <SelectItem value="أردني">أردني</SelectItem>
                          <SelectItem value="فلسطيني">فلسطيني</SelectItem>
                          <SelectItem value="يمني">يمني</SelectItem>
                          <SelectItem value="أخرى">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>تاريخ الميلاد</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.dateOfBirth && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {formData.dateOfBirth ? (
                              format(formData.dateOfBirth, "dd/MM/yyyy", { locale: ar })
                            ) : (
                              <span>اختر التاريخ</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.dateOfBirth}
                            onSelect={(date) => setFormData({ ...formData, dateOfBirth: date })}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">الجنس</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">ذكر</SelectItem>
                          <SelectItem value="female">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus">الحالة الاجتماعية</Label>
                      <Select value={formData.maritalStatus} onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">أعزب</SelectItem>
                          <SelectItem value="married">متزوج</SelectItem>
                          <SelectItem value="divorced">مطلق</SelectItem>
                          <SelectItem value="widowed">أرمل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    معلومات التواصل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">رقم الهاتف الأساسي *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="05xxxxxxxx"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneSecondary">رقم هاتف ثانوي</Label>
                      <Input
                        id="phoneSecondary"
                        value={formData.phoneSecondary}
                        onChange={(e) => setFormData({ ...formData, phoneSecondary: e.target.value })}
                        placeholder="05xxxxxxxx"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني الأساسي</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="example@email.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emailSecondary">بريد إلكتروني ثانوي</Label>
                      <Input
                        id="emailSecondary"
                        type="email"
                        value={formData.emailSecondary}
                        onChange={(e) => setFormData({ ...formData, emailSecondary: e.target.value })}
                        placeholder="alternate@email.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* License Information Tab */}
            <TabsContent value="license" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    رخصة القيادة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">رقم رخصة القيادة *</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        placeholder="أدخل رقم الرخصة"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseType">نوع الرخصة</Label>
                      <Select value={formData.licenseType} onValueChange={(value) => setFormData({ ...formData, licenseType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">خاصة</SelectItem>
                          <SelectItem value="commercial">تجارية</SelectItem>
                          <SelectItem value="motorcycle">دراجة نارية</SelectItem>
                          <SelectItem value="heavy">مركبات ثقيلة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>تاريخ إصدار الرخصة</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.licenseIssueDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {formData.licenseIssueDate ? (
                              format(formData.licenseIssueDate, "dd/MM/yyyy", { locale: ar })
                            ) : (
                              <span>اختر التاريخ</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.licenseIssueDate}
                            onSelect={(date) => setFormData({ ...formData, licenseIssueDate: date })}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>تاريخ انتهاء الرخصة *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.licenseExpiry && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {formData.licenseExpiry ? (
                              format(formData.licenseExpiry, "dd/MM/yyyy", { locale: ar })
                            ) : (
                              <span>اختر التاريخ</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.licenseExpiry}
                            onSelect={(date) => setFormData({ ...formData, licenseExpiry: date })}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseIssuePlace">مكان إصدار الرخصة</Label>
                      <Input
                        id="licenseIssuePlace"
                        value={formData.licenseIssuePlace}
                        onChange={(e) => setFormData({ ...formData, licenseIssuePlace: e.target.value })}
                        placeholder="إدارة المرور - الرياض"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="internationalLicense"
                      checked={formData.internationalLicense}
                      onCheckedChange={(checked) => setFormData({ ...formData, internationalLicense: checked as boolean })}
                    />
                    <Label htmlFor="internationalLicense">لديه رخصة قيادة دولية</Label>
                  </div>

                  {formData.internationalLicense && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="internationalLicenseNumber">رقم الرخصة الدولية</Label>
                        <Input
                          id="internationalLicenseNumber"
                          value={formData.internationalLicenseNumber}
                          onChange={(e) => setFormData({ ...formData, internationalLicenseNumber: e.target.value })}
                          placeholder="رقم الرخصة الدولية"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>تاريخ انتهاء الرخصة الدولية</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.internationalLicenseExpiry && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="ml-2 h-4 w-4" />
                              {formData.internationalLicenseExpiry ? (
                                format(formData.internationalLicenseExpiry, "dd/MM/yyyy", { locale: ar })
                              ) : (
                                <span>اختر التاريخ</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.internationalLicenseExpiry}
                              onSelect={(date) => setFormData({ ...formData, internationalLicenseExpiry: date })}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Address Information Tab */}
            <TabsContent value="address" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    معلومات العنوان
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">الدولة</Label>
                      <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="السعودية">السعودية</SelectItem>
                          <SelectItem value="الإمارات">الإمارات</SelectItem>
                          <SelectItem value="الكويت">الكويت</SelectItem>
                          <SelectItem value="قطر">قطر</SelectItem>
                          <SelectItem value="البحرين">البحرين</SelectItem>
                          <SelectItem value="عمان">عمان</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">المدينة *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="الرياض، جدة، الدمام..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="district">الحي</Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="النزهة، الملز، السليمانية..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">الرمز البريدي</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        placeholder="12345"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressType">نوع العنوان</Label>
                      <Select value={formData.addressType} onValueChange={(value) => setFormData({ ...formData, addressType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">سكني</SelectItem>
                          <SelectItem value="commercial">تجاري</SelectItem>
                          <SelectItem value="office">مكتب</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">العنوان التفصيلي *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="أدخل العنوان التفصيلي مع رقم المبنى والشارع"
                      className="min-h-[80px]"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    جهة اتصال طوارئ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">اسم جهة الاتصال *</Label>
                      <Input
                        id="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                        placeholder="الاسم الكامل"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">رقم الهاتف *</Label>
                      <Input
                        id="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                        placeholder="05xxxxxxxx"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactRelation">صلة القرابة</Label>
                      <Select value={formData.emergencyContactRelation} onValueChange={(value) => setFormData({ ...formData, emergencyContactRelation: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر صلة القرابة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="father">والد</SelectItem>
                          <SelectItem value="mother">والدة</SelectItem>
                          <SelectItem value="spouse">زوج/زوجة</SelectItem>
                          <SelectItem value="brother">أخ</SelectItem>
                          <SelectItem value="sister">أخت</SelectItem>
                          <SelectItem value="son">ابن</SelectItem>
                          <SelectItem value="daughter">ابنة</SelectItem>
                          <SelectItem value="friend">صديق</SelectItem>
                          <SelectItem value="other">أخرى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Work Information Tab */}
            <TabsContent value="work" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    معلومات العمل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">المسمى الوظيفي</Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        placeholder="مهندس، طبيب، معلم..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">جهة العمل</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="اسم الشركة أو المؤسسة"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workPhone">هاتف العمل</Label>
                      <Input
                        id="workPhone"
                        value={formData.workPhone}
                        onChange={(e) => setFormData({ ...formData, workPhone: e.target.value })}
                        placeholder="011xxxxxxx"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="monthlyIncome">الراتب الشهري</Label>
                      <Input
                        id="monthlyIncome"
                        value={formData.monthlyIncome}
                        onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                        placeholder="مثال: 5000 - 10000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workAddress">عنوان العمل</Label>
                    <Textarea
                      id="workAddress"
                      value={formData.workAddress}
                      onChange={(e) => setFormData({ ...formData, workAddress: e.target.value })}
                      placeholder="العنوان التفصيلي لمكان العمل"
                      className="min-h-[60px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    المعلومات المالية والائتمانية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="creditLimit">الحد الائتماني (ر.س)</Label>
                      <Input
                        id="creditLimit"
                        type="number"
                        value={formData.creditLimit}
                        onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                        placeholder="5000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentTerms">شروط الدفع</Label>
                      <Select value={formData.paymentTerms} onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">فوري</SelectItem>
                          <SelectItem value="7_days">7 أيام</SelectItem>
                          <SelectItem value="15_days">15 يوم</SelectItem>
                          <SelectItem value="30_days">30 يوم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredPaymentMethod">طريقة الدفع المفضلة</Label>
                      <Select value={formData.preferredPaymentMethod} onValueChange={(value) => setFormData({ ...formData, preferredPaymentMethod: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">نقداً</SelectItem>
                          <SelectItem value="transfer">تحويل بنكي</SelectItem>
                          <SelectItem value="credit_card">بطاقة ائتمانية</SelectItem>
                          <SelectItem value="check">شيك</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankName">البنك</Label>
                      <Input
                        id="bankName"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="الأهلي، الراجحي، سامبا..."
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bankAccountNumber">رقم الحساب البنكي</Label>
                      <Input
                        id="bankAccountNumber"
                        value={formData.bankAccountNumber}
                        onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                        placeholder="SA00 0000 0000 0000 0000 0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smsNotifications"
                        checked={formData.smsNotifications}
                        onCheckedChange={(checked) => setFormData({ ...formData, smsNotifications: checked as boolean })}
                      />
                      <Label htmlFor="smsNotifications">إشعارات SMS</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailNotifications"
                        checked={formData.emailNotifications}
                        onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked as boolean })}
                      />
                      <Label htmlFor="emailNotifications">إشعارات البريد الإلكتروني</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="marketingConsent"
                        checked={formData.marketingConsent}
                        onCheckedChange={(checked) => setFormData({ ...formData, marketingConsent: checked as boolean })}
                      />
                      <Label htmlFor="marketingConsent">الموافقة على الرسائل التسويقية</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات إضافية</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="أي ملاحظات مهمة عن العميل..."
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Guarantor Information Tab */}
            <TabsContent value="guarantor" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    تحديد الحاجة للكفيل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresGuarantor"
                      checked={formData.requiresGuarantor}
                      onCheckedChange={(checked) => {
                        setFormData({ ...formData, requiresGuarantor: checked as boolean });
                        setRequiresGuarantor(checked as boolean);
                      }}
                    />
                    <Label htmlFor="requiresGuarantor">يحتاج هذا العميل إلى كفيل/ضامن</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    يُطلب الكفيل في حالات معينة مثل: عدم وجود راتب ثابت، عميل جديد، أو مبلغ الإيجار مرتفع
                  </p>
                </CardContent>
              </Card>

              {formData.requiresGuarantor && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        المعلومات الشخصية للكفيل
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="guarantorName">اسم الكفيل بالعربية *</Label>
                          <Input
                            id="guarantorName"
                            value={formData.guarantorName}
                            onChange={(e) => setFormData({ ...formData, guarantorName: e.target.value })}
                            placeholder="الاسم الكامل للكفيل"
                            required={formData.requiresGuarantor}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="guarantorNameEnglish">اسم الكفيل بالإنجليزية</Label>
                          <Input
                            id="guarantorNameEnglish"
                            value={formData.guarantorNameEnglish}
                            onChange={(e) => setFormData({ ...formData, guarantorNameEnglish: e.target.value })}
                            placeholder="Guarantor Full Name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="guarantorNationalId">رقم هوية الكفيل *</Label>
                          <Input
                            id="guarantorNationalId"
                            value={formData.guarantorNationalId}
                            onChange={(e) => setFormData({ ...formData, guarantorNationalId: e.target.value })}
                            placeholder="1xxxxxxxxx"
                            required={formData.requiresGuarantor}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="guarantorRelation">صلة القرابة بالعميل *</Label>
                          <Select value={formData.guarantorRelation} onValueChange={(value) => setFormData({ ...formData, guarantorRelation: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر صلة القرابة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="father">والد</SelectItem>
                              <SelectItem value="mother">والدة</SelectItem>
                              <SelectItem value="spouse">زوج/زوجة</SelectItem>
                              <SelectItem value="brother">أخ</SelectItem>
                              <SelectItem value="sister">أخت</SelectItem>
                              <SelectItem value="uncle">عم/خال</SelectItem>
                              <SelectItem value="friend">صديق</SelectItem>
                              <SelectItem value="other">أخرى</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="guarantorPhone">رقم هاتف الكفيل *</Label>
                          <Input
                            id="guarantorPhone"
                            value={formData.guarantorPhone}
                            onChange={(e) => setFormData({ ...formData, guarantorPhone: e.target.value })}
                            placeholder="05xxxxxxxx"
                            required={formData.requiresGuarantor}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="guarantorJobTitle">المسمى الوظيفي للكفيل *</Label>
                          <Input
                            id="guarantorJobTitle"
                            value={formData.guarantorJobTitle}
                            onChange={(e) => setFormData({ ...formData, guarantorJobTitle: e.target.value })}
                            placeholder="مهندس، طبيب، معلم..."
                            required={formData.requiresGuarantor}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="guarantorCompany">جهة عمل الكفيل *</Label>
                          <Input
                            id="guarantorCompany"
                            value={formData.guarantorCompany}
                            onChange={(e) => setFormData({ ...formData, guarantorCompany: e.target.value })}
                            placeholder="اسم الشركة أو المؤسسة"
                            required={formData.requiresGuarantor}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="guarantorCity">مدينة الكفيل *</Label>
                          <Input
                            id="guarantorCity"
                            value={formData.guarantorCity}
                            onChange={(e) => setFormData({ ...formData, guarantorCity: e.target.value })}
                            placeholder="الرياض، جدة، الدمام..."
                            required={formData.requiresGuarantor}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="guarantorAddress">العنوان التفصيلي للكفيل *</Label>
                        <Textarea
                          id="guarantorAddress"
                          value={formData.guarantorAddress}
                          onChange={(e) => setFormData({ ...formData, guarantorAddress: e.target.value })}
                          placeholder="العنوان التفصيلي للكفيل مع رقم المبنى والشارع"
                          className="min-h-[80px]"
                          required={formData.requiresGuarantor}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    المستندات المطلوبة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {documentTypes.map((docType) => (
                      <div key={docType.id} className="space-y-2">
                        <Label className="flex items-center gap-2">
                          {docType.name}
                          {docType.required && <Badge variant="destructive">مطلوب</Badge>}
                        </Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                          <div className="text-center">
                            {uploadeFileTypes.includes(docType.id) ? (
                              <div className="space-y-2">
                                <Badge variant="default" className="w-full">
                                  تم الرفع بنجاح
                                </Badge>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.multiple = true;
                                    input.accept = 'image/*,.pdf';
                                    input.onchange = (e) => handleFileUpload(docType.id, (e.target as HTMLInputElement).files);
                                    input.click();
                                  }}
                                >
                                  استبدال الملف
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.multiple = true;
                                    input.accept = 'image/*,.pdf';
                                    input.onchange = (e) => handleFileUpload(docType.id, (e.target as HTMLInputElement).files);
                                    input.click();
                                  }}
                                >
                                  رفع الملف
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {documents.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">المستندات المرفقة:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm truncate" title={doc.name}>
                                {doc.name.length > 20 ? `${doc.name.substring(0, 20)}...` : doc.name}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(doc.name)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-between gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    toast({
                      title: "تم حفظ المسودة",
                      description: "تم حفظ بيانات العميل كمسودة",
                    });
                  }}
                >
                  حفظ كمسودة
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary-hover">
                  إضافة العميل
                </Button>
              </div>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};