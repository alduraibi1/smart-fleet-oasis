import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Image as ImageIcon,
  Folder,
  Calendar,
  User,
  FileCheck,
  AlertTriangle,
  Plus,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'id_copy' | 'license_copy' | 'insurance' | 'invoice' | 'receipt' | 'image' | 'other';
  file_url: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: string;
  status: 'valid' | 'expired' | 'pending_review';
  expiry_date?: string;
  notes?: string;
  version: number;
}

interface DocumentManagementProps {
  contractId: string;
  documents: Document[];
  onDocumentUpload: (document: Omit<Document, 'id' | 'uploaded_at' | 'version'>) => void;
  onDocumentDelete: (documentId: string) => void;
}

export const DocumentManagement = ({ 
  contractId, 
  documents, 
  onDocumentUpload,
  onDocumentDelete
}: DocumentManagementProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'other' as const,
    file_url: '',
    file_size: 0,
    uploaded_by: 'current-user',
    status: 'valid' as const,
    expiry_date: '',
    notes: ''
  });
  const { toast } = useToast();

  const documentTypes = {
    contract: { name: 'عقد', icon: FileText, color: 'bg-blue-100 text-blue-800' },
    id_copy: { name: 'صورة الهوية', icon: FileText, color: 'bg-green-100 text-green-800' },
    license_copy: { name: 'صورة الرخصة', icon: FileText, color: 'bg-purple-100 text-purple-800' },
    insurance: { name: 'وثيقة التأمين', icon: FileCheck, color: 'bg-orange-100 text-orange-800' },
    invoice: { name: 'فاتورة', icon: FileText, color: 'bg-yellow-100 text-yellow-800' },
    receipt: { name: 'إيصال', icon: FileText, color: 'bg-pink-100 text-pink-800' },
    image: { name: 'صورة', icon: ImageIcon, color: 'bg-gray-100 text-gray-800' },
    other: { name: 'أخرى', icon: FileText, color: 'bg-gray-100 text-gray-800' }
  };

  const getStatusBadge = (status: string, expiryDate?: string) => {
    if (expiryDate && new Date(expiryDate) < new Date()) {
      return <Badge className="bg-red-100 text-red-800">منتهية الصلاحية</Badge>;
    }
    
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800">صالحة</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">منتهية الصلاحية</Badge>;
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-800">قيد المراجعة</Badge>;
      default:
        return <Badge variant="secondary">غير محدد</Badge>;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // محاكاة رفع الملف
      const fileUrl = URL.createObjectURL(file);
      setNewDocument({
        ...newDocument,
        name: file.name,
        file_url: fileUrl,
        file_size: file.size
      });
    }
  };

  const handleDocumentUpload = () => {
    if (!newDocument.name || !newDocument.file_url) {
      toast({
        title: "خطأ في البيانات",
        description: "يجب اختيار ملف وإدخال اسم المستند",
        variant: "destructive"
      });
      return;
    }

    onDocumentUpload(newDocument);

    setNewDocument({
      name: '',
      type: 'other',
      file_url: '',
      file_size: 0,
      uploaded_by: 'current-user',
      status: 'valid',
      expiry_date: '',
      notes: ''
    });

    setIsUploading(false);

    toast({
      title: "تم رفع المستند بنجاح",
      description: `تم رفع ${newDocument.name} بنجاح`
    });
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentsByType = () => {
    const grouped = documents.reduce((acc, doc) => {
      if (!acc[doc.type]) acc[doc.type] = [];
      acc[doc.type].push(doc);
      return acc;
    }, {} as Record<string, Document[]>);
    return grouped;
  };

  const groupedDocuments = getDocumentsByType();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            إدارة المستندات والصور
          </div>
          <Dialog open={isUploading} onOpenChange={setIsUploading}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-1" />
                رفع مستند
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>رفع مستند جديد</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">اختيار الملف</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    الصيغ المدعومة: PDF, DOC, DOCX, JPG, PNG, GIF
                  </p>
                </div>

                <div>
                  <Label htmlFor="name">اسم المستند</Label>
                  <Input
                    id="name"
                    value={newDocument.name}
                    onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                    placeholder="أدخل اسم المستند"
                  />
                </div>

                <div>
                  <Label htmlFor="type">نوع المستند</Label>
                  <Select 
                    value={newDocument.type} 
                    onValueChange={(value) => setNewDocument({ ...newDocument, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(documentTypes).map(([key, type]) => (
                        <SelectItem key={key} value={key}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expiry_date">تاريخ انتهاء الصلاحية (اختياري)</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={newDocument.expiry_date}
                    onChange={(e) => setNewDocument({ ...newDocument, expiry_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={newDocument.notes}
                    onChange={(e) => setNewDocument({ ...newDocument, notes: e.target.value })}
                    placeholder="أدخل أي ملاحظات إضافية..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleDocumentUpload} className="flex-1">
                    رفع المستند
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsUploading(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في المستندات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="نوع المستند" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              {Object.entries(documentTypes).map(([key, type]) => (
                <SelectItem key={key} value={key}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Documents Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">إجمالي المستندات</p>
            <p className="text-xl font-bold">{documents.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">صالحة</p>
            <p className="text-xl font-bold text-green-600">
              {documents.filter(d => d.status === 'valid').length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">منتهية الصلاحية</p>
            <p className="text-xl font-bold text-red-600">
              {documents.filter(d => d.expiry_date && new Date(d.expiry_date) < new Date()).length}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">المراجعة</p>
            <p className="text-xl font-bold text-yellow-600">
              {documents.filter(d => d.status === 'pending_review').length}
            </p>
          </div>
        </div>

        {/* Documents by Category */}
        <div className="space-y-4">
          <h4 className="font-medium">المستندات حسب النوع</h4>
          {Object.keys(documentTypes).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>لا توجد مستندات مرفوعة</p>
            </div>
          ) : (
            Object.entries(groupedDocuments).map(([type, docs]) => {
              const typeInfo = documentTypes[type as keyof typeof documentTypes];
              const Icon = typeInfo.icon;
              
              return (
                <Card key={type} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {typeInfo.name} ({docs.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {docs.map((doc) => (
                        <div 
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-full">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{doc.name}</span>
                                {getStatusBadge(doc.status, doc.expiry_date)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatFileSize(doc.file_size)} • 
                                رُفع في {format(new Date(doc.uploaded_at), 'PPP', { locale: ar })}
                                {doc.expiry_date && (
                                  <span> • ينتهي في {format(new Date(doc.expiry_date), 'PPP', { locale: ar })}</span>
                                )}
                              </div>
                              {doc.notes && (
                                <p className="text-xs text-muted-foreground mt-1">{doc.notes}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" title="عرض">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="تحميل">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="حذف"
                              onClick={() => onDocumentDelete(doc.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Expiry Alerts */}
        {documents.some(d => d.expiry_date && new Date(d.expiry_date) < new Date()) && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-900">تنبيه: مستندات منتهية الصلاحية</span>
            </div>
            <p className="text-sm text-red-800">
              هناك {documents.filter(d => d.expiry_date && new Date(d.expiry_date) < new Date()).length} مستند منتهي الصلاحية يحتاج إلى تجديد.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};