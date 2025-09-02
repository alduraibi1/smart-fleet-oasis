import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Shield, Users, Settings, Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Permission {
  id: string;
  name: string;
  description: string | null;
  module: string;
  action: string;
}

interface RolePermission {
  role: string;
  permissions: Permission[];
}

interface RoleData {
  role: string;
  userCount: number;
  permissions: { [key: string]: Permission[] };
}

const RoleManagement = () => {
  const [roleData, setRoleData] = useState<RoleData[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const roleDisplayNames = {
    admin: 'مدير النظام',
    manager: 'مدير عام', 
    accountant: 'محاسب',
    employee: 'موظف'
  };

  const moduleDisplayNames = {
    dashboard: 'لوحة التحكم',
    vehicles: 'المركبات',
    contracts: 'العقود',
    customers: 'العملاء',
    maintenance: 'الصيانة',
    inventory: 'المخزون',
    accounting: 'المحاسبة',
    reports: 'التقارير',
    system: 'إدارة النظام',
    admin: 'صلاحيات إدارية'
  };

  const fetchRolesAndPermissions = async () => {
    try {
      setLoading(true);
      
      // جلب جميع الصلاحيات
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('permissions')
        .select('*')
        .order('module', { ascending: true })
        .order('action', { ascending: true });

      if (permissionsError) throw permissionsError;
      setAllPermissions(permissionsData || []);

      // جلب صلاحيات كل دور
      const { data: rolePermissionsData, error: rolePermissionsError } = await supabase
        .from('role_permissions')
        .select(`
          role,
          permissions!inner (
            id,
            name,
            description,
            module,
            action
          )
        `);

      if (rolePermissionsError) throw rolePermissionsError;

      // تجميع البيانات حسب الأدوار
      const rolesMap = new Map<string, RoleData>();
      
      // تهيئة الأدوار
      const roles = ['admin', 'manager', 'accountant', 'employee'];
      for (const role of roles) {
        rolesMap.set(role, {
          role,
          userCount: 0,
          permissions: {}
        });
      }

      // تجميع الصلاحيات حسب الأدوار والوحدات
      rolePermissionsData?.forEach((rp: any) => {
        const roleData = rolesMap.get(rp.role);
        if (roleData) {
          const module = rp.permissions.module;
          if (!roleData.permissions[module]) {
            roleData.permissions[module] = [];
          }
          roleData.permissions[module].push(rp.permissions);
        }
      });

      // جلب عدد المستخدمين لكل دور
      for (const role of roles) {
        const { count } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', role as any);
        
        const roleData = rolesMap.get(role);
        if (roleData) {
          roleData.userCount = count || 0;
        }
      }

      setRoleData(Array.from(rolesMap.values()));
    } catch (error) {
      console.error('Error fetching roles and permissions:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحميل بيانات الأدوار والصلاحيات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const hasPermission = (role: string, module: string, action: string) => {
    const roleObj = roleData.find(r => r.role === role);
    if (!roleObj) return false;
    
    const modulePermissions = roleObj.permissions[module] || [];
    return modulePermissions.some(p => p.action === action);
  };

  const togglePermission = async (role: string, module: string, action: string, hasCurrentPermission: boolean) => {
    try {
      const permission = allPermissions.find(p => p.module === module && p.action === action);
      if (!permission) return;

      if (hasCurrentPermission) {
        // إزالة الصلاحية
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('role', role as any)
          .eq('permission_id', permission.id);
        
        if (error) throw error;
      } else {
        // إضافة الصلاحية
        const { error } = await supabase
          .from('role_permissions')
          .insert({
            role: role as any,
            permission_id: permission.id
          });
        
        if (error) throw error;
      }

      toast({
        title: 'تم التحديث',
        description: `تم ${hasCurrentPermission ? 'إزالة' : 'إضافة'} الصلاحية بنجاح`
      });

      // إعادة تحميل البيانات
      fetchRolesAndPermissions();
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحديث الصلاحية',
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

  const totalUsers = roleData.reduce((sum, role) => sum + role.userCount, 0);
  const totalModules = Object.keys(moduleDisplayNames).length;

  return (
    <div className="space-y-6">
      {/* ملخص الأدوار */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الأدوار
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{roleData.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              المستخدمين المعينين
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              الوحدات المدعومة
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalModules}</div>
          </CardContent>
        </Card>
      </div>

      {/* إدارة الأدوار */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">إدارة الأدوار والصلاحيات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {roleData.map((role) => (
              <Card key={role.role} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">
                        {roleDisplayNames[role.role as keyof typeof roleDisplayNames] || role.role}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        إجمالي الصلاحيات: {Object.values(role.permissions).flat().length}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {role.userCount} مستخدم
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الوحدة</TableHead>
                          <TableHead className="text-center">قراءة</TableHead>
                          <TableHead className="text-center">كتابة</TableHead>
                          <TableHead className="text-center">حذف</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(moduleDisplayNames).map(([moduleKey, moduleName]) => (
                          <TableRow key={moduleKey}>
                            <TableCell className="font-medium">{moduleName}</TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={hasPermission(role.role, moduleKey, 'read')}
                                onCheckedChange={(value) => 
                                  togglePermission(
                                    role.role, 
                                    moduleKey, 
                                    'read', 
                                    hasPermission(role.role, moduleKey, 'read')
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={hasPermission(role.role, moduleKey, 'write')}
                                onCheckedChange={(value) => 
                                  togglePermission(
                                    role.role, 
                                    moduleKey, 
                                    'write', 
                                    hasPermission(role.role, moduleKey, 'write')
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={hasPermission(role.role, moduleKey, 'delete')}
                                onCheckedChange={(value) => 
                                  togglePermission(
                                    role.role, 
                                    moduleKey, 
                                    'delete', 
                                    hasPermission(role.role, moduleKey, 'delete')
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagement;