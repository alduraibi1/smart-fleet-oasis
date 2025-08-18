
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
import { 
  Plus, Search, Filter, Eye, Users, Briefcase, 
  Calendar, Clock, CheckCircle, XCircle, Star, 
  FileText, Mail, Phone, Download, UserPlus
} from "lucide-react";

const RecruitmentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isAddJobDialogOpen, setIsAddJobDialogOpen] = useState(false);

  // Mock data for job positions
  const jobPositions = [
    {
      id: "JOB001",
      title: "مطور واجهات أمامية",
      department: "تقنية المعلومات",
      location: "الرياض",
      type: "دوام كامل",
      status: "نشط",
      applicants: 45,
      posted_date: "2024-01-15",
      deadline: "2024-02-15",
      salary_range: "8000 - 12000 ر.س",
      requirements: ["React", "TypeScript", "3+ سنوات خبرة"]
    },
    {
      id: "JOB002", 
      title: "محاسب أول",
      department: "المالية",
      location: "الرياض",
      type: "دوام كامل",
      status: "نشط",
      applicants: 23,
      posted_date: "2024-01-20",
      deadline: "2024-02-20",
      salary_range: "6000 - 9000 ر.س",
      requirements: ["CPA", "خبرة 5+ سنوات", "إتقان Excel"]
    }
  ];

  // Mock data for applications
  const applications = [
    {
      id: "APP001",
      job_id: "JOB001",
      job_title: "مطور واجهات أمامية",
      candidate_name: "أحمد محمد",
      email: "ahmed@email.com",
      phone: "+966501234567",
      experience: "5 سنوات",
      status: "تحت المراجعة",
      applied_date: "2024-01-18",
      rating: 4.5,
      cv_url: "/cv/ahmed-mohamed.pdf"
    },
    {
      id: "APP002",
      job_id: "JOB001", 
      job_title: "مطور واجهات أمامية",
      candidate_name: "فاطمة علي",
      email: "fatima@email.com",
      phone: "+966507654321",
      experience: "3 سنوات",
      status: "مقبول",
      applied_date: "2024-01-16",
      rating: 4.8,
      cv_url: "/cv/fatima-ali.pdf"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      "نشط": "default",
      "مغلق": "secondary",
      "معلق": "outline",
      "تحت المراجعة": "secondary",
      "مقبول": "default", 
      "مرفوض": "destructive",
      "في الانتظار": "outline"
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إدارة التوظيف</h2>
          <p className="text-muted-foreground">إدارة الوظائف الشاغرة والمتقدمين</p>
        </div>
        <Dialog open={isAddJobDialogOpen} onOpenChange={setIsAddJobDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة وظيفة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>إضافة وظيفة جديدة</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">عنوان الوظيفة</Label>
                <Input id="jobTitle" placeholder="أدخل عنوان الوظيفة" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">القسم</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">تقنية المعلومات</SelectItem>
                    <SelectItem value="finance">المالية</SelectItem>
                    <SelectItem value="hr">الموارد البشرية</SelectItem>
                    <SelectItem value="operations">العمليات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">الموقع</Label>
                <Input id="location" placeholder="الرياض" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobType">نوع الوظيفة</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الوظيفة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">دوام كامل</SelectItem>
                    <SelectItem value="part-time">دوام جزئي</SelectItem>
                    <SelectItem value="contract">تعاقد</SelectItem>
                    <SelectItem value="internship">تدريب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryRange">المرتب المتوقع</Label>
                <Input id="salaryRange" placeholder="8000 - 12000 ر.س" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">آخر موعد للتقديم</Label>
                <Input id="deadline" type="date" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">وصف الوظيفة</Label>
                <Textarea id="description" placeholder="أدخل وصف مفصل للوظيفة..." rows={4} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="requirements">المتطلبات</Label>
                <Textarea id="requirements" placeholder="أدخل متطلبات الوظيفة..." rows={3} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddJobDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={() => setIsAddJobDialogOpen(false)}>
                إضافة الوظيفة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الوظائف النشطة</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 هذا الشهر</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المتقدمين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">+18 هذا الأسبوع</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المقابلات المجدولة</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">هذا الأسبوع</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التوظيفات الجديدة</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">هذا الشهر</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">الوظائف الشاغرة</TabsTrigger>
          <TabsTrigger value="applications">طلبات التوظيف</TabsTrigger>
          <TabsTrigger value="interviews">المقابلات</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الوظائف الشاغرة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث في الوظائف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="تصفية حسب القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأقسام</SelectItem>
                    <SelectItem value="it">تقنية المعلومات</SelectItem>
                    <SelectItem value="finance">المالية</SelectItem>
                    <SelectItem value="hr">الموارد البشرية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الوظيفة</TableHead>
                    <TableHead>القسم</TableHead>
                    <TableHead>المتقدمين</TableHead>
                    <TableHead>تاريخ النشر</TableHead>
                    <TableHead>آخر موعد</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobPositions.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{job.title}</div>
                          <div className="text-sm text-muted-foreground">{job.salary_range}</div>
                          <div className="text-sm text-muted-foreground">{job.location} • {job.type}</div>
                        </div>
                      </TableCell>
                      <TableCell>{job.department}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {job.applicants}
                        </div>
                      </TableCell>
                      <TableCell>{job.posted_date}</TableCell>
                      <TableCell>{job.deadline}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4" />
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

        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>طلبات التوظيف</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المتقدم</TableHead>
                    <TableHead>الوظيفة</TableHead>
                    <TableHead>الخبرة</TableHead>
                    <TableHead>تاريخ التقديم</TableHead>
                    <TableHead>التقييم</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{app.candidate_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{app.candidate_name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {app.email}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {app.phone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{app.job_title}</TableCell>
                      <TableCell>{app.experience}</TableCell>
                      <TableCell>{app.applied_date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {app.rating}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4" />
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

        <TabsContent value="interviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>جدول المقابلات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد مقابلات مجدولة حالياً</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  جدولة مقابلة
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecruitmentManagement;
