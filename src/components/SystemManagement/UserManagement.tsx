import { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
  user_type?: string;
  approval_status?: string;
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { withPermissionHandling } = usePermissionToast();
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // جلب المستخدمين مع ملفاتهم الشخصية وأدوارهم
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          phone,
          is_active,
          created_at,
          user_type,
          approval_status
        `);

      if (profilesError) throw profilesError;

      // جلب بيانات المصادقة للمستخدمين
      const usersWithRoles = await Promise.all(
        (profilesData || []).map(async (profile) => {
          // جلب الأدوار
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          // جلب بيانات المصادقة
          const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);

          return {
            id: profile.id,
            full_name: profile.full_name,
            email: user?.email || 'غير محدد',
            phone: profile.phone,
            is_active: profile.is_active,
            created_at: profile.created_at,
            last_sign_in_at: user?.last_sign_in_at,
            roles: rolesData?.map(r => r.role) || [],
            user_type: profile.user_type,
            approval_status: profile.approval_status
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل بيانات المستخدمين',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'destructive';
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      admin: 'مدير النظام',
      manager: 'مدير عام',
      accountant: 'محاسب',
      employee: 'موظف'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const getUserTypeDisplay = (type?: string) => {
    const types = {
      employee: 'موظف',
      owner: 'مالك مركبة',
      partner: 'شريك'
    };
    return type ? types[type as keyof typeof types] || type : 'غير محدد';
  };

  const getApprovalStatusDisplay = (status?: string) => {
    const statuses = {
      pending: 'في الانتظار',
      approved: 'مُوافق عليه',
      rejected: 'مرفوض'
    };
    return status ? statuses[status as keyof typeof statuses] || status : 'غير محدد';
  };

  const getApprovalStatusBadgeVariant = (status?: string) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive'
    };
    return variants[status as keyof typeof variants] || 'outline';
  };

  const formatLastLogin = (lastSignIn: string | null) => {
    if (!lastSignIn) return 'لم يسجل دخول';
    
    const date = new Date(lastSignIn);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `منذ ${diffDays} يوم`;
    if (diffHours > 0) return `منذ ${diffHours} ساعة`;
    if (diffMinutes > 0) return `منذ ${diffMinutes} دقيقة`;
    return 'منذ قليل';
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'تم التحديث',
        description: `تم ${!currentStatus ? 'تفعيل' : 'تعطيل'} الحساب بنجاح`
      });

      fetchUsers(); // إعادة تحميل البيانات
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحديث حالة المستخدم',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">جاري التحميل...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                  <TableHead>نوع المستخدم</TableHead>
                  <TableHead>الأدوار</TableHead>
                  <TableHead>حالة الموافقة</TableHead>
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
                        <div className="font-medium text-foreground">
                          {user.full_name || 'غير محدد'}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {user.phone && (
                          <div className="text-sm text-muted-foreground">{user.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getUserTypeDisplay(user.user_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="outline">
                            <Shield className="h-3 w-3 mr-1" />
                            {getRoleDisplayName(role)}
                          </Badge>
                        ))}
                        {user.roles.length === 0 && (
                          <Badge variant="secondary">لا توجد أدوار</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getApprovalStatusBadgeVariant(user.approval_status) as "default" | "destructive" | "secondary" | "outline"}>
                        {getApprovalStatusDisplay(user.approval_status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.is_active)}>
                        {user.is_active ? (
                          <UserCheck className="h-3 w-3 mr-1" />
                        ) : (
                          <UserX className="h-3 w-3 mr-1" />
                        )}
                        {user.is_active ? 'نشط' : 'معطل'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatLastLogin(user.last_sign_in_at)}
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
                            <DropdownMenuItem 
                              onClick={() => toggleUserStatus(user.id, user.is_active)}
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  تعطيل الحساب
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  تفعيل الحساب
                                </>
                              )}
                            </DropdownMenuItem>
                          </PermissionGuard>
                          <PermissionGuard permission="system.delete">
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => withPermissionHandling(
                                async () => {
                                  // TODO: تنفيذ حذف المستخدم
                                  throw { status: 403, message: 'حذف المستخدم غير متاح حالياً' };
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

          {filteredUsers.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد نتائج مطابقة للبحث
            </div>
          )}
        </CardContent>
      </Card>

      <EnhancedAddUserDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};

export default UserManagement;