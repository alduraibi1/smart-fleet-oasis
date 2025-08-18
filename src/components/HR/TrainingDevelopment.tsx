
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, Search, BookOpen, Users, Calendar, 
  Clock, Award, TrendingUp, Target, 
  CheckCircle, XCircle, PlayCircle, PauseCircle
} from "lucide-react";

const TrainingDevelopment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddTrainingDialogOpen, setIsAddTrainingDialogOpen] = useState(false);

  // Mock data for training programs
  const trainingPrograms = [
    {
      id: "TRN001",
      title: "برنامج تطوير المهارات التقنية",
      category: "تقني",
      instructor: "د. أحمد محمد",
      duration: "40 ساعة",
      participants: 25,
      max_participants: 30,
      start_date: "2024-02-01",
      end_date: "2024-02-28",
      status: "جاري",
      completion_rate: 65,
      cost: 15000
    },
    {
      id: "TRN002",
      title: "دورة القيادة والإدارة",
      category: "إداري",
      instructor: "أ. فاطمة علي",
      duration: "24 ساعة",
      participants: 18,
      max_participants: 20,
      start_date: "2024-01-15",
      end_date: "2024-02-15",
      status: "مكتمل",
      completion_rate: 100,
      cost: 12000
    },
    {
      id: "TRN003",
      title: "برنامج السلامة المهنية",
      category: "سلامة",
      instructor: "م. خالد أحمد",
      duration: "16 ساعة",
      participants: 0,
      max_participants: 50,
      start_date: "2024-03-01",
      end_date: "2024-03-15",
      status: "مجدول",
      completion_rate: 0,
      cost: 8000
    }
  ];

  // Mock data for employee training records
  const employeeTraining = [
    {
      id: "ETR001",
      employee_name: "أحمد محمد علي",
      employee_id: "EMP001",
      program_title: "برنامج تطوير المهارات التقنية",
      status: "جاري",
      progress: 75,
      start_date: "2024-02-01",
      expected_completion: "2024-02-28",
      score: null,
      certificate: false
    },
    {
      id: "ETR002",
      employee_name: "فاطمة أحمد خالد",
      employee_id: "EMP002",
      program_title: "دورة القيادة والإدارة",
      status: "مكتمل",
      progress: 100,
      start_date: "2024-01-15",
      expected_completion: "2024-02-15",
      score: 92,
      certificate: true
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      "جاري": "default",
      "مكتمل": "default",
      "مجدول": "secondary",
      "ملغي": "destructive",
      "متأخر": "destructive"
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "جاري":
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case "مكتمل":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "مجدول":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "ملغي":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "متأخر":
        return <PauseCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">التدريب والتطوير</h2>
          <p className="text-muted-foreground">إدارة برامج التدريب وتطوير المهارات</p>
        </div>
        <Dialog open={isAddTrainingDialogOpen} onOpenChange={setIsAddTrainingDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة برنامج تدريبي
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>إضافة برنامج تدريبي جديد</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="programTitle">عنوان البرنامج</Label>
                <Input id="programTitle" placeholder="أدخل عنوان البرنامج" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">تقني</SelectItem>
                    <SelectItem value="management">إداري</SelectItem>
                    <SelectItem value="safety">سلامة</SelectItem>
                    <SelectItem value="soft-skills">مهارات شخصية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">المدرب</Label>
                <Input id="instructor" placeholder="اسم المدرب" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">المدة (بالساعات)</Label>
                <Input id="duration" type="number" placeholder="40" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">الحد الأقصى للمشاركين</Label>
                <Input id="maxParticipants" type="number" placeholder="30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">التكلفة</Label>
                <Input id="cost" type="number" placeholder="15000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البداية</Label>
                <Input id="startDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">تاريخ النهاية</Label>
                <Input id="endDate" type="date" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">وصف البرنامج</Label>
                <Textarea id="description" placeholder="أدخل وصف مفصل للبرنامج..." rows={4} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="objectives">أهداف البرنامج</Label>
                <Textarea id="objectives" placeholder="أدخل أهداف البرنامج..." rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddTrainingDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={() => setIsAddTrainingDialogOpen(false)}>
                إضافة البرنامج
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">البرامج النشطة</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+1 هذا الشهر</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المتدربين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">43</div>
            <p className="text-xs text-muted-foreground">في البرامج النشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الإنجاز</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">متوسط عام</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الشهادات الممنوحة</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">هذا العام</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="programs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="programs">البرامج التدريبية</TabsTrigger>
          <TabsTrigger value="employee-training">تدريب الموظفين</TabsTrigger>
          <TabsTrigger value="skills-matrix">مصفوفة المهارات</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>البرامج التدريبية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث في البرامج..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="تصفية حسب الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    <SelectItem value="technical">تقني</SelectItem>
                    <SelectItem value="management">إداري</SelectItem>
                    <SelectItem value="safety">سلامة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>البرنامج</TableHead>
                    <TableHead>المدرب</TableHead>
                    <TableHead>المشاركين</TableHead>
                    <TableHead>المدة</TableHead>
                    <TableHead>معدل الإنجاز</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainingPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{program.title}</div>
                          <div className="text-sm text-muted-foreground">{program.category}</div>
                          <div className="text-sm text-muted-foreground">
                            {program.start_date} - {program.end_date}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{program.instructor}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {program.participants}/{program.max_participants}
                        </div>
                      </TableCell>
                      <TableCell>{program.duration}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{program.completion_rate}%</span>
                          </div>
                          <Progress value={program.completion_rate} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(program.status)}
                          {getStatusBadge(program.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            عرض
                          </Button>
                          <Button variant="outline" size="sm">
                            تعديل
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employee-training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>سجل تدريب الموظفين</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>البرنامج</TableHead>
                    <TableHead>التقدم</TableHead>
                    <TableHead>تاريخ البداية</TableHead>
                    <TableHead>الإنجاز المتوقع</TableHead>
                    <TableHead>النتيجة</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeTraining.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{record.employee_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{record.employee_name}</div>
                            <div className="text-sm text-muted-foreground">{record.employee_id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{record.program_title}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{record.progress}%</span>
                          </div>
                          <Progress value={record.progress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{record.start_date}</TableCell>
                      <TableCell>{record.expected_completion}</TableCell>
                      <TableCell>
                        {record.score ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{record.score}%</span>
                            {record.certificate && <Award className="h-4 w-4 text-yellow-500" />}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          {getStatusBadge(record.status)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills-matrix" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مصفوفة المهارات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>مصفوفة المهارات قيد التطوير</p>
                <p className="text-sm">سيتم عرض مهارات الموظفين ومستوياتهم هنا</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">تقرير فعالية التدريب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>معدل الإكمال</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>متوسط الدرجات</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>رضا المتدربين</span>
                    <span className="font-medium">4.2/5</span>
                  </div>
                  <Button className="w-full mt-4">
                    عرض التقرير المفصل
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">تقرير التكاليف</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>إجمالي الاستثمار</span>
                    <span className="font-medium">35,000 ر.س</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>التكلفة لكل متدرب</span>
                    <span className="font-medium">814 ر.س</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>العائد المتوقع</span>
                    <span className="font-medium text-green-600">+15%</span>
                  </div>
                  <Button className="w-full mt-4">
                    عرض تحليل التكاليف
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">تقرير تطوير المهارات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>المهارات المكتسبة</span>
                    <span className="font-medium">127</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>الموظفون المتدربون</span>
                    <span className="font-medium">43</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>متوسط التحسن</span>
                    <span className="font-medium text-green-600">+23%</span>
                  </div>
                  <Button className="w-full mt-4">
                    عرض تقرير المهارات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingDevelopment;
