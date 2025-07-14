import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Shield, Users, Settings, Edit, Trash2, Plus } from 'lucide-react';

const RoleManagement = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'مدير النظام',
      description: 'صلاحية كاملة على جميع أجزاء النظام',
      users: 2,
      permissions: {
        dashboard: { read: true, write: true, delete: true },
        vehicles: { read: true, write: true, delete: true },
        contracts: { read: true, write: true, delete: true },
        customers: { read: true, write: true, delete: true },
        maintenance: { read: true, write: true, delete: true },
        inventory: { read: true, write: true, delete: true },
        accounting: { read: true, write: true, delete: true },
        hr: { read: true, write: true, delete: true },
        reports: { read: true, write: true, delete: true },
        system: { read: true, write: true, delete: true }
      }
    },
    {
      id: 2,
      name: 'مدير عام',
      description: 'صلاحية على جميع العمليات التشغيلية',
      users: 1,
      permissions: {
        dashboard: { read: true, write: true, delete: false },
        vehicles: { read: true, write: true, delete: true },
        contracts: { read: true, write: true, delete: true },
        customers: { read: true, write: true, delete: true },
        maintenance: { read: true, write: true, delete: false },
        inventory: { read: true, write: true, delete: false },
        accounting: { read: true, write: false, delete: false },
        hr: { read: true, write: true, delete: false },
        reports: { read: true, write: true, delete: false },
        system: { read: false, write: false, delete: false }
      }
    },
    {
      id: 3,
      name: 'مدير مالي',
      description: 'صلاحية على النظام المحاسبي والتقارير المالية',
      users: 2,
      permissions: {
        dashboard: { read: true, write: false, delete: false },
        vehicles: { read: true, write: false, delete: false },
        contracts: { read: true, write: true, delete: false },
        customers: { read: true, write: false, delete: false },
        maintenance: { read: true, write: false, delete: false },
        inventory: { read: true, write: false, delete: false },
        accounting: { read: true, write: true, delete: true },
        hr: { read: false, write: false, delete: false },
        reports: { read: true, write: true, delete: false },
        system: { read: false, write: false, delete: false }
      }
    },
    {
      id: 4,
      name: 'مدير أسطول',
      description: 'إدارة المركبات والصيانة والعقود',
      users: 3,
      permissions: {
        dashboard: { read: true, write: false, delete: false },
        vehicles: { read: true, write: true, delete: true },
        contracts: { read: true, write: true, delete: false },
        customers: { read: true, write: false, delete: false },
        maintenance: { read: true, write: true, delete: true },
        inventory: { read: true, write: true, delete: false },
        accounting: { read: false, write: false, delete: false },
        hr: { read: false, write: false, delete: false },
        reports: { read: true, write: false, delete: false },
        system: { read: false, write: false, delete: false }
      }
    }
  ]);

  const moduleNames = {
    dashboard: 'لوحة التحكم',
    vehicles: 'المركبات',
    contracts: 'العقود',
    customers: 'العملاء',
    maintenance: 'الصيانة',
    inventory: 'المخزون',
    accounting: 'المحاسبة',
    hr: 'الموارد البشرية',
    reports: 'التقارير',
    system: 'إدارة النظام'
  };

  const updatePermission = (roleId: number, module: string, action: string, value: boolean) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [module]: {
              ...role.permissions[module as keyof typeof role.permissions],
              [action]: value
            }
          }
        };
      }
      return role;
    }));
  };

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
            <div className="text-2xl font-bold text-foreground">{roles.length}</div>
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
            <div className="text-2xl font-bold text-foreground">
              {roles.reduce((sum, role) => sum + role.users, 0)}
            </div>
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
            <div className="text-2xl font-bold text-foreground">
              {Object.keys(moduleNames).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* إدارة الأدوار */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">إدارة الأدوار والصلاحيات</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            إضافة دور جديد
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {roles.map((role) => (
              <Card key={role.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{role.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {role.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {role.users} مستخدم
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        تعديل
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-1" />
                        حذف
                      </Button>
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
                        {Object.entries(moduleNames).map(([moduleKey, moduleName]) => {
                          const permissions = role.permissions[moduleKey as keyof typeof role.permissions];
                          return (
                            <TableRow key={moduleKey}>
                              <TableCell className="font-medium">{moduleName}</TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={permissions.read}
                                  onCheckedChange={(value) => 
                                    updatePermission(role.id, moduleKey, 'read', value)
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={permissions.write}
                                  onCheckedChange={(value) => 
                                    updatePermission(role.id, moduleKey, 'write', value)
                                  }
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={permissions.delete}
                                  onCheckedChange={(value) => 
                                    updatePermission(role.id, moduleKey, 'delete', value)
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
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