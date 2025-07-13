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
import { Calendar } from "@/components/ui/calendar";
import { 
  Clock, LogIn, LogOut, Calendar as CalendarIcon, 
  TrendingUp, Users, AlertTriangle, CheckCircle, Search, Plus
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const AttendanceTracking = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);

  // Sample attendance data
  const attendanceData = [
    {
      id: "ATT001",
      employeeId: "EMP001",
      employeeName: "أحمد محمد علي",
      date: "2024-01-15",
      checkIn: "08:00",
      checkOut: "17:30",
      workingHours: 9.5,
      overtime: 1.5,
      status: "حاضر",
      avatar: "/placeholder.svg"
    },
    {
      id: "ATT002",
      employeeId: "EMP002",
      employeeName: "فاطمة أحمد خالد",
      date: "2024-01-15",
      checkIn: "08:15",
      checkOut: "17:00",
      workingHours: 8.75,
      overtime: 0,
      status: "حاضر",
      avatar: "/placeholder.svg"
    },
    {
      id: "ATT003",
      employeeId: "EMP003",
      employeeName: "محمد عبدالله السالم",
      date: "2024-01-15",
      checkIn: "-",
      checkOut: "-",
      workingHours: 0,
      overtime: 0,
      status: "غائب",
      avatar: "/placeholder.svg"
    }
  ];

  const weeklyAttendance = [
    { day: "السبت", present: 245, absent: 12, late: 8 },
    { day: "الأحد", present: 238, absent: 15, late: 12 },
    { day: "الاثنين", present: 242, absent: 10, late: 6 },
    { day: "الثلاثاء", present: 240, absent: 13, late: 9 },
    { day: "الأربعاء", present: 235, absent: 18, late: 11 },
    { day: "الخميس", present: 248, absent: 8, late: 5 },
    { day: "الجمعة", present: 0, absent: 0, late: 0 }
  ];

  const monthlyTrends = [
    { month: "يناير", attendanceRate: 94.2, avgHours: 8.5 },
    { month: "فبراير", attendanceRate: 92.8, avgHours: 8.3 },
    { month: "مارس", attendanceRate: 95.1, avgHours: 8.7 },
    { month: "أبريل", attendanceRate: 93.5, avgHours: 8.4 },
    { month: "مايو", attendanceRate: 96.2, avgHours: 8.8 },
    { month: "يونيو", attendanceRate: 94.7, avgHours: 8.6 }
  ];

  const filteredAttendance = attendanceData.filter(record =>
    record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      "حاضر": "default",
      "متأخر": "secondary",
      "غائب": "destructive",
      "إجازة": "outline"
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const presentCount = attendanceData.filter(record => record.status === "حاضر").length;
  const absentCount = attendanceData.filter(record => record.status === "غائب").length;
  const attendanceRate = (presentCount / attendanceData.length) * 100;
  const avgWorkingHours = attendanceData.reduce((sum, record) => sum + record.workingHours, 0) / attendanceData.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">تتبع الحضور والغياب</h2>
          <p className="text-muted-foreground">إدارة ومراقبة حضور الموظفين وساعات العمل</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <LogIn className="h-4 w-4" />
            تسجيل دخول
          </Button>
          <Button variant="outline" className="gap-2">
            <LogOut className="h-4 w-4" />
            تسجيل خروج
          </Button>
          <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                إدخال يدوي
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إدخال حضور يدوي</DialogTitle>
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
                  <Label htmlFor="date">التاريخ</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkIn">وقت الدخول</Label>
                  <Input id="checkIn" type="time" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">وقت الخروج</Label>
                  <Input id="checkOut" type="time" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsManualEntryOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={() => setIsManualEntryOpen(false)}>
                  حفظ
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الحضور</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">اليوم</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموظفون الحاضرون</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentCount}</div>
            <p className="text-xs text-muted-foreground">من أصل {attendanceData.length} موظف</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط ساعات العمل</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgWorkingHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">ساعة يومياً</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموظفون الغائبون</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absentCount}</div>
            <p className="text-xs text-muted-foreground">غائب اليوم</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily">الحضور اليومي</TabsTrigger>
          <TabsTrigger value="weekly">التقرير الأسبوعي</TabsTrigger>
          <TabsTrigger value="monthly">الاتجاهات الشهرية</TabsTrigger>
          <TabsTrigger value="calendar">التقويم</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>سجل الحضور اليومي</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('ar-SA')}
                </div>
              </div>
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
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>وقت الدخول</TableHead>
                    <TableHead>وقت الخروج</TableHead>
                    <TableHead>ساعات العمل</TableHead>
                    <TableHead>العمل الإضافي</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={record.avatar} />
                            <AvatarFallback>{record.employeeName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{record.employeeName}</div>
                            <div className="text-sm text-muted-foreground">{record.employeeId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{record.checkIn}</TableCell>
                      <TableCell>{record.checkOut}</TableCell>
                      <TableCell>{record.workingHours} ساعة</TableCell>
                      <TableCell className={record.overtime > 0 ? "text-green-600" : ""}>
                        {record.overtime > 0 ? `+${record.overtime} ساعة` : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          تعديل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>التقرير الأسبوعي</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={weeklyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="present" fill="#22c55e" name="حاضر" />
                  <Bar dataKey="absent" fill="#ef4444" name="غائب" />
                  <Bar dataKey="late" fill="#f59e0b" name="متأخر" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>معدل الحضور الشهري</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="attendanceRate" stroke="#8884d8" name="معدل الحضور %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>متوسط ساعات العمل الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgHours" fill="#82ca9d" name="متوسط الساعات" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>التقويم</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>حضور اليوم المحدد</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {selectedDate.toLocaleDateString('ar-SA')}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">242</div>
                      <div className="text-sm text-green-600">حاضر</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">8</div>
                      <div className="text-sm text-red-600">غائب</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">12</div>
                      <div className="text-sm text-yellow-600">متأخر</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceTracking;