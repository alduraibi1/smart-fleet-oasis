import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Target, TrendingUp, Award, Users, 
  Star, FileText, Plus, Search, Filter
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const PerformanceManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [isAddReviewDialogOpen, setIsAddReviewDialogOpen] = useState(false);

  // Sample performance data
  const performanceData = [
    {
      id: "PER001",
      employeeId: "EMP001",
      employeeName: "أحمد محمد علي",
      position: "مدير تقني",
      department: "تقنية المعلومات",
      overallScore: 4.5,
      period: "Q4 2023",
      goals: 8,
      goalsAchieved: 7,
      status: "مكتمل",
      avatar: "/placeholder.svg",
      skills: {
        technical: 90,
        communication: 85,
        leadership: 95,
        teamwork: 88,
        problemSolving: 92
      }
    },
    {
      id: "PER002",
      employeeId: "EMP002",
      employeeName: "فاطمة أحمد خالد",
      position: "محاسبة رئيسية",
      department: "المحاسبة",
      overallScore: 4.2,
      period: "Q4 2023",
      goals: 6,
      goalsAchieved: 6,
      status: "مكتمل",
      avatar: "/placeholder.svg",
      skills: {
        technical: 88,
        communication: 92,
        leadership: 75,
        teamwork: 90,
        problemSolving: 85
      }
    },
    {
      id: "PER003",
      employeeId: "EMP003",
      employeeName: "محمد عبدالله السالم",
      position: "مطور واجهات",
      department: "تقنية المعلومات",
      overallScore: 3.8,
      period: "Q4 2023",
      goals: 5,
      goalsAchieved: 4,
      status: "قيد المراجعة",
      avatar: "/placeholder.svg",
      skills: {
        technical: 85,
        communication: 70,
        leadership: 60,
        teamwork: 80,
        problemSolving: 90
      }
    }
  ];

  const departmentPerformance = [
    { department: "تقنية المعلومات", avgScore: 4.2, employees: 45 },
    { department: "المحاسبة", avgScore: 4.0, employees: 25 },
    { department: "الموارد البشرية", avgScore: 4.3, employees: 15 },
    { department: "المبيعات", avgScore: 3.9, employees: 35 },
    { department: "التسويق", avgScore: 4.1, employees: 20 }
  ];

  const skillsData = [
    { skill: "المهارات التقنية", average: 87 },
    { skill: "التواصل", average: 82 },
    { skill: "القيادة", average: 77 },
    { skill: "العمل الجماعي", average: 86 },
    { skill: "حل المشكلات", average: 89 }
  ];

  const filteredPerformance = performanceData.filter(performance => {
    const matchesSearch = performance.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         performance.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriod = filterPeriod === "all" || performance.period === filterPeriod;
    return matchesSearch && matchesPeriod;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      "مكتمل": "default",
      "قيد المراجعة": "secondary",
      "متأخر": "destructive"
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return "text-green-600";
    if (score >= 4.0) return "text-blue-600";
    if (score >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const avgScore = performanceData.reduce((sum, item) => sum + item.overallScore, 0) / performanceData.length;
  const totalGoals = performanceData.reduce((sum, item) => sum + item.goals, 0);
  const achievedGoals = performanceData.reduce((sum, item) => sum + item.goalsAchieved, 0);
  const goalAchievementRate = (achievedGoals / totalGoals) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إدارة الأداء</h2>
          <p className="text-muted-foreground">تقييم ومتابعة أداء الموظفين وتطوير مهاراتهم</p>
        </div>
        <Dialog open={isAddReviewDialogOpen} onOpenChange={setIsAddReviewDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة تقييم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>إضافة تقييم أداء جديد</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employee">الموظف</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموظف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emp1">أحمد محمد علي</SelectItem>
                    <SelectItem value="emp2">فاطمة أحمد خالد</SelectItem>
                    <SelectItem value="emp3">محمد عبدالله السالم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">فترة التقييم</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفترة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q1-2024">الربع الأول 2024</SelectItem>
                    <SelectItem value="q2-2024">الربع الثاني 2024</SelectItem>
                    <SelectItem value="q3-2024">الربع الثالث 2024</SelectItem>
                    <SelectItem value="q4-2024">الربع الرابع 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="overallScore">التقييم العام</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التقييم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">ممتاز (5)</SelectItem>
                    <SelectItem value="4">جيد جداً (4)</SelectItem>
                    <SelectItem value="3">جيد (3)</SelectItem>
                    <SelectItem value="2">مقبول (2)</SelectItem>
                    <SelectItem value="1">ضعيف (1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goals">عدد الأهداف</Label>
                <Input id="goals" type="number" placeholder="5" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="strengths">نقاط القوة</Label>
                <Textarea id="strengths" placeholder="اذكر نقاط القوة للموظف..." />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="improvements">مجالات التحسين</Label>
                <Textarea id="improvements" placeholder="اذكر مجالات التحسين المطلوبة..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddReviewDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={() => setIsAddReviewDialogOpen(false)}>
                حفظ التقييم
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الأداء</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">التقييم العام</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إنجاز الأهداف</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goalAchievementRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{achievedGoals} من {totalGoals} هدف</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التقييمات المكتملة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">من أصل 3 تقييمات</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموظفون المتميزون</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">تقييم ممتاز (5/5)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reviews">التقييمات</TabsTrigger>
          <TabsTrigger value="skills">تحليل المهارات</TabsTrigger>
          <TabsTrigger value="departments">أداء الأقسام</TabsTrigger>
          <TabsTrigger value="goals">متابعة الأهداف</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>سجل التقييمات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث بالاسم أو رقم الموظف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="تصفية حسب الفترة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفترات</SelectItem>
                    <SelectItem value="Q4 2023">الربع الرابع 2023</SelectItem>
                    <SelectItem value="Q1 2024">الربع الأول 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>المنصب</TableHead>
                    <TableHead>فترة التقييم</TableHead>
                    <TableHead>التقييم العام</TableHead>
                    <TableHead>الأهداف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPerformance.map((performance) => (
                    <TableRow key={performance.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={performance.avatar} />
                            <AvatarFallback>{performance.employeeName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{performance.employeeName}</div>
                            <div className="text-sm text-muted-foreground">{performance.employeeId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{performance.position}</TableCell>
                      <TableCell>{performance.period}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getScoreColor(performance.overallScore)}`}>
                            {performance.overallScore}/5
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(performance.overallScore)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {performance.goalsAchieved}/{performance.goals} مكتمل
                          </div>
                          <Progress value={(performance.goalsAchieved / performance.goals) * 100} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(performance.status)}</TableCell>
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

        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>تحليل المهارات الشامل</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={skillsData.map(skill => ({
                    skill: skill.skill,
                    average: skill.average
                  }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="المتوسط" dataKey="average" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تفاصيل المهارات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillsData.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{skill.skill}</span>
                        <span className="text-sm text-muted-foreground">{skill.average}%</span>
                      </div>
                      <Progress value={skill.average} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أداء الأقسام</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={departmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>متابعة الأهداف</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {performanceData.map((performance) => (
                  <Card key={performance.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={performance.avatar} />
                          <AvatarFallback>{performance.employeeName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{performance.employeeName}</div>
                          <div className="text-xs text-muted-foreground">{performance.position}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">تقدم الأهداف</span>
                          <span className="text-sm font-medium">
                            {performance.goalsAchieved}/{performance.goals}
                          </span>
                        </div>
                        <Progress 
                          value={(performance.goalsAchieved / performance.goals) * 100} 
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground">
                          {((performance.goalsAchieved / performance.goals) * 100).toFixed(1)}% مكتمل
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceManagement;