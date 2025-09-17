import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, Shield, UserCheck, UserX, Search, Plus,  Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  user_type: string;
  approval_status: string;
  created_at: string;
  roles: string[];
}

export function UserAccessManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newRole, setNewRole] = useState('');
  const { hasRole } = useAuth();
  const { toast } = useToast();

  // Check permissions
  if (!hasRole('admin')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">غير مخوّل</h3>
            <p className="text-sm text-muted-foreground">
              تحتاج صلاحيات مدير لإدارة وصول المستخدمين
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          return {
            ...profile,
            roles: userRoles?.map(r => r.role) || []
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل المستخدمين",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, role: string, action: 'add' | 'remove') => {
    try {
      if (action === 'add') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: role as any });
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role as any);
        
        if (error) throw error;
      }

      toast({
        title: "تم التحديث",
        description: `تم ${action === 'add' ? 'إضافة' : 'إزالة'} الصلاحية بنجاح`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateApprovalStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: status })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: `تم تحديث حالة المستخدم إلى ${status === 'approved' ? 'معتمد' : 'مرفوض'}`,
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || user.approval_status === statusFilter;
    const matchesRole = !roleFilter || user.roles.includes(roleFilter);

    return matchesSearch && matchesStatus && matchesRole;
  });

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      employee: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      accountant: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'مدير',
      manager: 'مشرف',
      employee: 'موظف',
      accountant: 'محاسب'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: { variant: 'default' as const, label: 'معتمد' },
      pending: { variant: 'secondary' as const, label: 'في الانتظار' },
      rejected: { variant: 'destructive' as const, label: 'مرفوض' }
    };
    
    const config = variants[status as keyof typeof variants] || { variant: 'outline' as const, label: status };
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                إدارة وصول المستخدمين
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                إدارة المستخدمين وصلاحياتهم في النظام
              </p>
            </div>
            <Button onClick={fetchUsers} disabled={loading} size="sm" variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              تحديث القائمة
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في المستخدمين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="حالة الاعتماد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الحالات</SelectItem>
                <SelectItem value="approved">معتمد</SelectItem>
                <SelectItem value="pending">في الانتظار</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="الصلاحية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الصلاحيات</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
                <SelectItem value="manager">مشرف</SelectItem>
                <SelectItem value="employee">موظف</SelectItem>
                <SelectItem value="accountant">محاسب</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="text-sm text-muted-foreground">
            عرض {filteredUsers.length} من أصل {users.length} مستخدم
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الصلاحيات</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ التسجيل</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <p>جاري تحميل المستخدمين...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">لا توجد مستخدمين مطابقين للمرشحات</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.full_name || 'غير محدد'}</div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">{user.email}</div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">{user.phone || '-'}</div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">{user.user_type || 'موظف'}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Badge 
                                key={role} 
                                className={getRoleColor(role)}
                              >
                                {getRoleLabel(role)}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">لا توجد صلاحيات</span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(user.approval_status)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {new Date(user.created_at).toLocaleDateString('ar-SA')}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          {user.approval_status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateApprovalStatus(user.id, 'approved')}
                              >
                                <UserCheck className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateApprovalStatus(user.id, 'rejected')}
                              >
                                <UserX className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          
                          <Dialog open={showRoleDialog && selectedUser?.id === user.id} onOpenChange={setShowRoleDialog}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>إدارة صلاحيات المستخدم</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm font-medium mb-2">المستخدم: {user.full_name}</p>
                                  <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                                </div>
                                
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">الصلاحيات الحالية:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {user.roles.map((role) => (
                                      <div key={role} className="flex items-center gap-2">
                                        <Badge className={getRoleColor(role)}>
                                          {getRoleLabel(role)}
                                        </Badge>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => updateUserRole(user.id, role, 'remove')}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">إضافة صلاحية جديدة:</p>
                                  <div className="flex gap-2">
                                    <Select value={newRole} onValueChange={setNewRole}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="اختر الصلاحية" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">مدير</SelectItem>
                                        <SelectItem value="manager">مشرف</SelectItem>
                                        <SelectItem value="employee">موظف</SelectItem>
                                        <SelectItem value="accountant">محاسب</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      onClick={() => {
                                        if (newRole) {
                                          updateUserRole(user.id, newRole, 'add');
                                          setNewRole('');
                                        }
                                      }}
                                      disabled={!newRole}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}