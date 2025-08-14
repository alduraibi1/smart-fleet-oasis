
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  Award,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hire_date: string;
  status: string;
  performance_rating: number;
  total_leaves: number;
  used_leaves: number;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in: string;
  check_out?: string;
  status: string;
  hours_worked?: number;
}

interface LeaveRequest {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  reason: string;
  status: string;
  approved_by?: string;
}

export const CompleteHRManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: 0,
    hire_date: new Date(),
    status: 'active'
  });

  const { toast } = useToast();

  useEffect(() => {
    initializeHRData();
  }, []);

  const initializeHRData = async () => {
    // Create sample data since we don't have HR tables yet
    const sampleEmployees: Employee[] = [
      {
        id: '1',
        name: 'أحمد محمد',
        email: 'ahmed@company.com',
        phone: '0501234567',
        position: 'مدير المبيعات',
        department: 'المبيعات',
        salary: 8000,
        hire_date: '2023-01-15',
        status: 'active',
        performance_rating: 4.5,
        total_leaves: 30,
        used_leaves: 12
      },
      {
        id: '2',
        name: 'فاطمة علي',
        email: 'fatima@company.com',
        phone: '0507654321',
        position: 'محاسبة',
        department: 'المالية',
        salary: 6000,
        hire_date: '2023-03-01',
        status: 'active',
        performance_rating: 4.8,
        total_leaves: 30,
        used_leaves: 8
      },
      {
        id: '3',
        name: 'خالد السالم',
        email: 'khalid@company.com',
        phone: '0509876543',
        position: 'فني صيانة',
        department: 'الصيانة',
        salary: 4500,
        hire_date: '2022-06-15',
        status: 'active',
        performance_rating: 4.2,
        total_leaves: 30,
        used_leaves: 15
      }
    ];

    const sampleAttendance: AttendanceRecord[] = [
      {
        id: '1',
        employee_id: '1',
        date: format(new Date(), 'yyyy-MM-dd'),
        check_in: '08:00',
        check_out: '17:00',
        status: 'present',
        hours_worked: 8
      },
      {
        id: '2',
        employee_id: '2',
        date: format(new Date(), 'yyyy-MM-dd'),
        check_in: '08:30',
        status: 'present'
      }
    ];

    const sampleLeaveRequests: LeaveRequest[] = [
      {
        id: '1',
        employee_id: '1',
        start_date: '2024-02-20',
        end_date: '2024-02-22',
        leave_type: 'سنوية',
        reason: 'إجازة عائلية',
        status: 'pending'
      },
      {
        id: '2',
        employee_id: '2',
        start_date: '2024-02-15',
        end_date: '2024-02-16',
        leave_type: 'مرضية',
        reason: 'إجازة مرضية',
        status: 'approved'
      }
    ];

    setEmployees(sampleEmployees);
    setAttendance(sampleAttendance);
    setLeaveRequests(sampleLeaveRequests);
  };

  const handleAddEmployee = () => {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      ...employeeForm,
      hire_date: employeeForm.hire_date.toISOString().split('T')[0],
      performance_rating: 5,
      total_leaves: 30,
      used_leaves: 0
    };

    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id ? { ...newEmployee, id: editingEmployee.id } : emp
      ));
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات الموظف بنجاح"
      });
    } else {
      setEmployees(prev => [newEmployee, ...prev]);
      toast({
        title: "تم الإضافة",
        description: "تم إضافة الموظف بنجاح"
      });
    }

    setEmployeeDialogOpen(false);
    setEditingEmployee(null);
    resetEmployeeForm();
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      salary: employee.salary,
      hire_date: new Date(employee.hire_date),
      status: employee.status
    });
    setEmployeeDialogOpen(true);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    toast({
      title: "تم الحذف",
      description: "تم حذف الموظف بنجاح"
    });
  };

  const resetEmployeeForm = () => {
    setEmployeeForm({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      salary: 0,
      hire_date: new Date(),
      status: 'active'
    });
  };

  const markAttendance = (employeeId: string, type: 'check_in' | 'check_out') => {
    const now = new Date();
    const timeString = format(now, 'HH:mm');
    const dateString = format(now, 'yyyy-MM-dd');

    if (type === 'check_in') {
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        employee_id: employeeId,
        date: dateString,
        check_in: timeString,
        status: 'present'
      };
      setAttendance(prev => [newRecord, ...prev]);
      toast({
        title: "تم تسجيل الحضور",
        description: `تم تسجيل الحضور في ${timeString}`
      });
    } else {
      setAttendance(prev => prev.map(record => {
        if (record.employee_id === employeeId && record.date === dateString && !record.check_out) {
          const checkIn = new Date(`2024-01-01 ${record.check_in}`);
          const checkOut = new Date(`2024-01-01 ${timeString}`);
          const hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
          
          return {
            ...record,
            check_out: timeString,
            hours_worked: Math.round(hoursWorked * 100) / 100
          };
        }
        return record;
      }));
      toast({
        title: "تم تسجيل الانصراف",
        description: `تم تسجيل الانصراف في ${timeString}`
      });
    }
  };

  const handleLeaveRequest = (requestId: string, action: 'approve' | 'reject') => {
    setLeaveRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { ...request, status: action === 'approve' ? 'approved' : 'rejected' }
        : request
    ));
    
    toast({
      title: action === 'approve' ? "تم الموافقة" : "تم الرفض",
      description: `تم ${action === 'approve' ? 'الموافقة على' : 'رفض'} طلب الإجازة`
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'active': { label: 'نشط', variant: 'default' as const },
      'inactive': { label: 'غير نشط', variant: 'secondary' as const },
      'terminated': { label: 'منتهي الخدمة', variant: 'destructive' as const },
      'present': { label: 'حاضر', variant: 'default' as const },
      'absent': { label: 'غائب', variant: 'destructive' as const },
      'late': { label: 'متأخر', variant: 'secondary' as const },
      'pending': { label: 'معلق', variant: 'secondary' as const },
      'approved': { label: 'موافق', variant: 'default' as const },
      'rejected': { label: 'مرفوض', variant: 'destructive' as const }
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
  };

  const calculateTotalSalaries = () => {
    return employees.filter(emp => emp.status === 'active').reduce((sum, emp) => sum + emp.salary, 0);
  };

  const getAveragePerformance = () => {
    const activeEmployees = employees.filter(emp => emp.status === 'active');
    if (activeEmployees.length === 0) return 0;
    
    const totalRating = activeEmployees.reduce((sum, emp) => sum + emp.performance_rating, 0);
    return Math.round((totalRating / activeEmployees.length) * 10) / 10;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">إدارة الموارد البشرية</h2>
          <p className="text-muted-foreground">نظام شامل لإدارة الموظفين والرواتب والحضور</p>
        </div>
      </div>

      {/* HR Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الموظفين</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الرواتب</p>
                <p className="text-2xl font-bold">{calculateTotalSalaries().toLocaleString()} ريال</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">متوسط الأداء</p>
                <p className="text-2xl font-bold">{getAveragePerformance()}/5</p>
              </div>
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">طلبات الإجازات</p>
                <p className="text-2xl font-bold">{leaveRequests.filter(req => req.status === 'pending').length}</p>
              </div>
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">إدارة الموظفين</TabsTrigger>
          <TabsTrigger value="attendance">الحضور والغياب</TabsTrigger>
          <TabsTrigger value="leaves">إدارة الإجازات</TabsTrigger>
          <TabsTrigger value="payroll">الرواتب</TabsTrigger>
          <TabsTrigger value="performance">تقييم الأداء</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>قائمة الموظفين</CardTitle>
                <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingEmployee(null);
                      resetEmployeeForm();
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      موظف جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingEmployee ? 'تعديل الموظف' : 'إضافة موظف جديد'}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>الاسم</Label>
                          <Input
                            value={employeeForm.name}
                            onChange={(e) => setEmployeeForm({...employeeForm, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>البريد الإلكتروني</Label>
                          <Input
                            type="email"
                            value={employeeForm.email}
                            onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>رقم الهاتف</Label>
                          <Input
                            value={employeeForm.phone}
                            onChange={(e) => setEmployeeForm({...employeeForm, phone: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>المنصب</Label>
                          <Input
                            value={employeeForm.position}
                            onChange={(e) => setEmployeeForm({...employeeForm, position: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>القسم</Label>
                          <Select 
                            value={employeeForm.department} 
                            onValueChange={(value) => setEmployeeForm({...employeeForm, department: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="المبيعات">المبيعات</SelectItem>
                              <SelectItem value="المالية">المالية</SelectItem>
                              <SelectItem value="الصيانة">الصيانة</SelectItem>
                              <SelectItem value="الإدارة">الإدارة</SelectItem>
                              <SelectItem value="خدمة العملاء">خدمة العملاء</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>الراتب</Label>
                          <Input
                            type="number"
                            value={employeeForm.salary}
                            onChange={(e) => setEmployeeForm({...employeeForm, salary: Number(e.target.value)})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>تاريخ التوظيف</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(employeeForm.hire_date, 'dd/MM/yyyy', { locale: ar })}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={employeeForm.hire_date}
                                onSelect={(date) => date && setEmployeeForm({...employeeForm, hire_date: date})}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label>الحالة</Label>
                          <Select 
                            value={employeeForm.status} 
                            onValueChange={(value) => setEmployeeForm({...employeeForm, status: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">نشط</SelectItem>
                              <SelectItem value="inactive">غير نشط</SelectItem>
                              <SelectItem value="terminated">منتهي الخدمة</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEmployeeDialogOpen(false)}>
                          إلغاء
                        </Button>
                        <Button onClick={handleAddEmployee}>
                          {editingEmployee ? 'تحديث' : 'إضافة'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>المنصب</TableHead>
                    <TableHead>القسم</TableHead>
                    <TableHead>الراتب</TableHead>
                    <TableHead>تاريخ التوظيف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.salary.toLocaleString()} ريال</TableCell>
                      <TableCell>
                        {format(new Date(employee.hire_date), 'dd/MM/yyyy', { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(employee.status).variant}>
                          {getStatusBadge(employee.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="attendance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>تسجيل الحضور</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {employees.filter(emp => emp.status === 'active').map((employee) => {
                    const todayAttendance = attendance.find(
                      a => a.employee_id === employee.id && 
                      a.date === format(new Date(), 'yyyy-MM-dd')
                    );
                    
                    return (
                      <div key={employee.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-muted-foreground">{employee.position}</p>
                        </div>
                        <div className="flex gap-2">
                          {!todayAttendance ? (
                            <Button
                              size="sm"
                              onClick={() => markAttendance(employee.id, 'check_in')}
                            >
                              تسجيل حضور
                            </Button>
                          ) : !todayAttendance.check_out ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAttendance(employee.id, 'check_out')}
                            >
                              تسجيل انصراف
                            </Button>
                          ) : (
                            <Badge variant="default">مكتمل</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>سجل الحضور اليوم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendance.filter(a => a.date === format(new Date(), 'yyyy-MM-dd')).map((record) => {
                    const employee = employees.find(emp => emp.id === record.employee_id);
                    return (
                      <div key={record.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{employee?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            حضور: {record.check_in}
                            {record.check_out && ` | انصراف: ${record.check_out}`}
                            {record.hours_worked && ` | ساعات العمل: ${record.hours_worked}`}
                          </p>
                        </div>
                        <Badge variant={getStatusBadge(record.status).variant}>
                          {getStatusBadge(record.status).label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaves">
          <Card>
            <CardHeader>
              <CardTitle>طلبات الإجازات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>نوع الإجازة</TableHead>
                    <TableHead>من تاريخ</TableHead>
                    <TableHead>إلى تاريخ</TableHead>
                    <TableHead>السبب</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.map((request) => {
                    const employee = employees.find(emp => emp.id === request.employee_id);
                    return (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{employee?.name}</TableCell>
                        <TableCell>{request.leave_type}</TableCell>
                        <TableCell>
                          {format(new Date(request.start_date), 'dd/MM/yyyy', { locale: ar })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.end_date), 'dd/MM/yyyy', { locale: ar })}
                        </TableCell>
                        <TableCell>{request.reason}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(request.status).variant}>
                            {getStatusBadge(request.status).label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleLeaveRequest(request.id, 'approve')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleLeaveRequest(request.id, 'reject')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>كشف الرواتب</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الموظف</TableHead>
                    <TableHead>الراتب الأساسي</TableHead>
                    <TableHead>البدلات</TableHead>
                    <TableHead>الخصوميات</TableHead>
                    <TableHead>صافي الراتب</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.filter(emp => emp.status === 'active').map((employee) => {
                    const allowances = 500; // بدل ثابت
                    const deductions = 200; // خصومات ثابتة
                    const netSalary = employee.salary + allowances - deductions;
                    
                    return (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.salary.toLocaleString()} ريال</TableCell>
                        <TableCell>{allowances.toLocaleString()} ريال</TableCell>
                        <TableCell>{deductions.toLocaleString()} ريال</TableCell>
                        <TableCell className="font-medium">{netSalary.toLocaleString()} ريال</TableCell>
                        <TableCell>
                          <Badge variant="default">مدفوع</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {employees.filter(emp => emp.status === 'active').map((employee) => (
              <Card key={employee.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{employee.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{employee.position} - {employee.department}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>تقييم الأداء العام</span>
                        <span className="font-medium">{employee.performance_rating}/5</span>
                      </div>
                      <Progress value={employee.performance_rating * 20} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>الإجازات المستخدمة</span>
                        <span>{employee.used_leaves}/{employee.total_leaves}</span>
                      </div>
                      <Progress value={(employee.used_leaves / employee.total_leaves) * 100} />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>تاريخ التوظيف:</span>
                      <span>{format(new Date(employee.hire_date), 'dd/MM/yyyy', { locale: ar })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
