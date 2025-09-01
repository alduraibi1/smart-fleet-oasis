import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, MoreHorizontal, Edit, Trash2, Shield, UserCheck, UserX, UserPlus } from 'lucide-react';
import EnhancedAddUserDialog from './EnhancedAddUserDialog';
import { usePermissionToast } from '@/hooks/usePermissionToast';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { withPermissionHandling, showPermissionError } = usePermissionToast();

  const users = [
    {
      id: 1,
      name: 'أحمد محمد',
      email: 'ahmed@company.com',
      role: 'مدير النظام',
      status: 'نشط',
      lastLogin: 'منذ 5 دقائق',
      department: 'الإدارة'
    },
    {
      id: 2,
      name: 'فاطمة علي',
      email: 'fatma@company.com',
      role: 'مدير مالي',
      status: 'نشط',
      lastLogin: 'منذ ساعتين',
      department: 'المالية'
    },
    {
      id: 3,
      name: 'محمد حسن',
      email: 'mohamed@company.com',
      role: 'مدير أسطول',
      status: 'نشط',
      lastLogin: 'منذ 30 دقيقة',
      department: 'العمليات'
    },
    {
      id: 4,
      name: 'سارة أحمد',
      email: 'sara@company.com',
      role: 'محاسب',
      status: 'معطل',
      lastLogin: 'منذ 3 أيام',
      department: 'المالية'
    },
    {
      id: 5,
      name: 'خالد يوسف',
      email: 'khaled@company.com',
      role: 'فني صيانة',
      status: 'نشط',
      lastLogin: 'منذ ساعة',
      department: 'الصيانة'
    }
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'نشط':
        return 'default';
      case 'معطل':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">إدارة المستخدمين</CardTitle>
          <PermissionGuard permission="system.write">
            <Button onClick={() => setShowAddDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              إضافة مستخدم
            </Button>
          </PermissionGuard>
        </CardHeader>
        <CardContent>
          {/* شريط البحث */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث عن مستخدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* جدول المستخدمين */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المستخدم</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>آخر تسجيل دخول</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.department}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status === 'نشط' ? (
                          <UserCheck className="h-3 w-3 mr-1" />
                        ) : (
                          <UserX className="h-3 w-3 mr-1" />
                        )}
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.lastLogin}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <PermissionGuard permission="system.write">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              تغيير الصلاحيات
                            </DropdownMenuItem>
                            {user.status === 'نشط' ? (
                              <DropdownMenuItem>
                                <UserX className="mr-2 h-4 w-4" />
                                تعطيل الحساب
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>
                                <UserCheck className="mr-2 h-4 w-4" />
                                تفعيل الحساب
                              </DropdownMenuItem>
                            )}
                          </PermissionGuard>
                          <PermissionGuard permission="system.delete">
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => withPermissionHandling(
                                async () => {
                                  // Simulate delete operation that fails
                                  throw { status: 403, message: 'حذف المستخدم غير مسموح' };
                                },
                                'حذف المستخدم'
                              )}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              حذف
                            </DropdownMenuItem>
                          </PermissionGuard>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد نتائج مطابقة للبحث
            </div>
          )}
        </CardContent>
      </Card>

      <EnhancedAddUserDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
};

export default UserManagement;