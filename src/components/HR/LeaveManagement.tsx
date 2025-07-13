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
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon, Plane, Stethoscope, Clock, 
  CheckCircle, XCircle, Plus, Search, Filter, AlertCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const LeaveManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddLeaveDialogOpen, setIsAddLeaveDialogOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date>();
  const [selectedEndDate, setSelectedEndDate] = useState<Date>();

  // Sample leave data
  const leaveData = [
    {
      id: "LEV001",
      employeeId: "EMP001",
      employeeName: "أحمد محمد علي",
      leaveType: "إجازة سنوية",
      startDate: "2024-02-15",
      endDate: "2024-02-22",
      days: 7,
      reason: "سفر عائلي",
      status: "موافق عليها",
      submittedDate: "2024-01-20",
      avatar: "/placeholder.svg"
    },
    {
      id: "LEV002",
      employeeId: "EMP002",
      employeeName: "فاطمة أحمد خالد",
      leaveType: "إجازة مرضية",
      startDate: "2024-01-25",
      endDate: "2024-01-27",
      days: 3,
      reason: "مراجعة طبية",
      status: "قيد المراجعة",
      submittedDate: "2024-01-24",
      avatar: "/placeholder.svg"
    },
    {
      id: "LEV003",
      employeeId: "EMP003",
      employeeName: "محمد عبدالله السالم",
      leaveType: "إجازة طارئة",
      startDate: "2024-01-30",
      endDate: "2024-01-30",
      days: 1,
      reason: "ظروف طارئة",
      status: "مرفوضة",
      submittedDate: "2024-01-29",
      avatar: "/placeholder.svg"
    }
  ];

  const leaveTypes = [
    { name: "إجازة سنوية", balance: 21, used: 5, pending: 0 },
    { name: "إجازة مرضية", balance: 15, used: 2, pending: 3 },
    { name: "إجازة طارئة", balance: 5, used: 1, pending: 0 },
    { name: "إجازة أمومة", balance: 60, used: 0, pending: 0 }
  ];

  const monthlyLeaves = [
    { month: "يناير", approved: 45, pending: 8, rejected: 3 },
    { month: "فبراير", approved: 38, pending: 12, rejected: 5 },
    { month: "مارس", approved: 52, pending: 6, rejected: 2 },
    { month: "أبريل", approved: 41, pending: 9, rejected: 4 },
    { month: "مايو", approved: 47, pending: 7, rejected: 1 },
    { month: "يونيو", approved: 39, pending: 11, rejected: 6 }
  ];

  const leaveDistribution = [
    { name: "إجازة سنوية", value: 120, color: "#8884d8" },
    { name: "إجازة مرضية", value: 45, color: "#82ca9d" },
    { name: "إجازة طارئة", value: 25, color: "#ffc658" },
    { name: "إجازة أمومة", value: 15, color: "#ff7300" }
  ];

  const filteredLeaves = leaveData.filter(leave => {
    const matchesSearch = leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leave.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || leave.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      "موافق عليها": "default",
      "قيد المراجعة": "secondary",
      "مرفوضة": "destructive"
    };
    const icons = {
      "موافق عليها": CheckCircle,
      "قيد المراجعة": Clock,
      "مرفوضة": XCircle
    };
    const Icon = icons[status as keyof typeof icons];
    return (
      <Badge variant={variants[status as keyof typeof variants] as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getLeaveTypeIcon = (type: string) => {
    const icons = {
      "إجازة سنوية": Plane,
      "إجازة مرضية": Stethoscope,
      "إجازة طارئة": AlertCircle,
      "إجازة أمومة": CalendarIcon
    };
    return icons[type as keyof typeof icons] || CalendarIcon;
  };

  const totalDays = leaveData.reduce((sum, leave) => sum + leave.days, 0);
  const approvedLeaves = leaveData.filter(leave => leave.status === "موافق عليها").length;
  const pendingLeaves = leaveData.filter(leave => leave.status === "قيد المراجعة").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">إدارة الإجازات</h2>
          <p className="text-muted-foreground">إدارة طلبات الإجازات وأرصدة الموظفين</p>
        </div>
        <Dialog open={isAddLeaveDialogOpen} onOpenChange={setIsAddLeaveDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              طلب إجازة جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>طلب إجازة جديد</DialogTitle>
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
                <Label htmlFor="leaveType">نوع الإجازة</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الإجازة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">إجازة سنوية</SelectItem>
                    <SelectItem value="sick">إجازة مرضية</SelectItem>
                    <SelectItem value="emergency">إجازة طارئة</SelectItem>
                    <SelectItem value="maternity">إجازة أمومة</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="reason">سبب الإجازة</Label>
                <Textarea id="reason" placeholder="اذكر سبب طلب الإجازة..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddLeaveDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={() => setIsAddLeaveDialogOpen(false)}>
                تقديم الطلب
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي أيام الإجازة</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDays}</div>
            <p className="text-xs text-muted-foreground">هذا الشهر</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطلبات المعتمدة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedLeaves}</div>
            <p className="text-xs text-muted-foreground">من أصل {leaveData.length} طلب</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطلبات المعلقة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingLeaves}</div>
            <p className="text-xs text-muted-foreground">تحتاج موافقة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط أيام الإجازة</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalDays / leaveData.length).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">يوم لكل طلب</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests">طلبات الإجازة</TabsTrigger>
          <TabsTrigger value="balances">أرصدة الإجازات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="calendar">التقويم</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>طلبات الإجازة</CardTitle>
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
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="تصفية حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="موافق عليها">موافق عليها</SelectItem>
                    <SelectItem value="قيد المراجعة">قيد المراجعة</SelectItem>
                    <SelectItem value="مرفوضة">مرفوضة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>نوع الإجازة</TableHead>
                    <TableHead>تاريخ البداية</TableHead>
                    <TableHead>تاريخ النهاية</TableHead>
                    <TableHead>عدد الأيام</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={leave.avatar} />
                            <AvatarFallback>{leave.employeeName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{leave.employeeName}</div>
                            <div className="text-sm text-muted-foreground">{leave.employeeId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = getLeaveTypeIcon(leave.leaveType);
                            return <Icon className="h-4 w-4" />;
                          })()}
                          {leave.leaveType}
                        </div>
                      </TableCell>
                      <TableCell>{leave.startDate}</TableCell>
                      <TableCell>{leave.endDate}</TableCell>
                      <TableCell>{leave.days} يوم</TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {leave.status === "قيد المراجعة" && (
                            <>
                              <Button variant="outline" size="sm" className="text-green-600">
                                موافقة
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                رفض
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            عرض
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

        <TabsContent value="balances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أرصدة الإجازات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {leaveTypes.map((type, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = getLeaveTypeIcon(type.name);
                          return <Icon className="h-5 w-5" />;
                        })()}
                        <CardTitle className="text-lg">{type.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">الرصيد الكامل</span>
                          <span className="font-medium">{type.balance} يوم</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">المستخدم</span>
                          <span className="font-medium text-red-600">{type.used} يوم</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">قيد المراجعة</span>
                          <span className="font-medium text-yellow-600">{type.pending} يوم</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm font-medium">المتبقي</span>
                          <span className="font-bold text-green-600">
                            {type.balance - type.used - type.pending} يوم
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الإجازات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyLeaves}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="approved" fill="#22c55e" name="معتمدة" />
                    <Bar dataKey="pending" fill="#f59e0b" name="معلقة" />
                    <Bar dataKey="rejected" fill="#ef4444" name="مرفوضة" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع أنواع الإجازات</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leaveDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leaveDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>تقويم الإجازات</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>الإجازات القادمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaveData
                    .filter(leave => leave.status === "موافق عليها")
                    .map((leave) => (
                    <div key={leave.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={leave.avatar} />
                        <AvatarFallback>{leave.employeeName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{leave.employeeName}</div>
                        <div className="text-sm text-muted-foreground">{leave.leaveType}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{leave.startDate} - {leave.endDate}</div>
                        <div className="text-sm text-muted-foreground">{leave.days} أيام</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaveManagement;