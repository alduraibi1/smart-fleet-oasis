
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const QualityControl = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock quality control data
  const qualityChecks = [
    {
      id: 1,
      itemName: "فلتر زيت محرك ACDelco",
      batchNumber: "AC2024001",
      supplier: "شركة قطع الغيار المتطورة",
      receiveDate: "2024-01-15",
      checkDate: "2024-01-16",
      status: "passed",
      inspector: "محمد أحمد",
      notes: "جودة ممتازة، مطابق للمواصفات"
    },
    {
      id: 2,
      itemName: "زيت محرك Mobil 1",
      batchNumber: "MB2024002",
      supplier: "مؤسسة الزيوت والفلاتر",
      receiveDate: "2024-01-14",
      checkDate: "2024-01-15",
      status: "failed",
      inspector: "فاطمة علي",
      notes: "لزوجة غير مطابقة للمواصفات"
    },
    {
      id: 3,
      itemName: "فرامل أقراص Brembo",
      batchNumber: "BR2024003",
      supplier: "شركة قطع الغيار المتطورة",
      receiveDate: "2024-01-13",
      checkDate: null,
      status: "pending",
      inspector: null,
      notes: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />مقبول</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />مرفوض</Badge>;
      case "pending":
        return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />قيد المراجعة</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredChecks = qualityChecks.filter(check => {
    const matchesSearch = check.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || check.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          مراقبة الجودة
        </h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          فحص جديد
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="البحث في الفحوص..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="فلترة حسب الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="pending">قيد المراجعة</SelectItem>
            <SelectItem value="passed">مقبول</SelectItem>
            <SelectItem value="failed">مرفوض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quality Control Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الفحوص</p>
                <p className="text-2xl font-bold">{qualityChecks.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مقبول</p>
                <p className="text-2xl font-bold text-green-600">
                  {qualityChecks.filter(c => c.status === "passed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مرفوض</p>
                <p className="text-2xl font-bold text-red-600">
                  {qualityChecks.filter(c => c.status === "failed").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيد المراجعة</p>
                <p className="text-2xl font-bold text-orange-600">
                  {qualityChecks.filter(c => c.status === "pending").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Control List */}
      <Card>
        <CardHeader>
          <CardTitle>سجل فحوص الجودة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredChecks.map((check) => (
              <div key={check.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="font-medium">{check.itemName}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">رقم الدفعة:</span> {check.batchNumber}
                      </div>
                      <div>
                        <span className="font-medium">المورد:</span> {check.supplier}
                      </div>
                      <div>
                        <span className="font-medium">تاريخ الاستلام:</span> {check.receiveDate}
                      </div>
                      <div>
                        <span className="font-medium">تاريخ الفحص:</span> {check.checkDate || "لم يفحص بعد"}
                      </div>
                    </div>
                    {check.inspector && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">المفتش:</span> {check.inspector}
                      </div>
                    )}
                    {check.notes && (
                      <div className="text-sm">
                        <span className="font-medium">ملاحظات:</span> {check.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(check.status)}
                    {check.status === "pending" && (
                      <Button size="sm" variant="outline">
                        بدء الفحص
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityControl;
