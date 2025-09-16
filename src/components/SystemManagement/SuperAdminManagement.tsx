import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, UserPlus, Users, ArrowRightLeft, UserMinus, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export function SuperAdminManagement() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const { toast } = useToast();
  const { userRoles } = useAuth();

  // Form states
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  const [transferForm, setTransferForm] = useState({
    fromUserId: '',
    toUserId: '',
    transferType: 'promote' as 'promote' | 'transfer' | 'revoke'
  });

  const isCurrentUserAdmin = userRoles.includes('admin');

  useEffect(() => {
    if (isCurrentUserAdmin) {
      fetchAdminUsers();
      fetchAllUsers();
    }
  }, [isCurrentUserAdmin]);

  const fetchAdminUsers = async () => {
    try {
      // Get admin users by joining with auth.users to get email
      const { data: adminProfiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          created_at,
          user_roles!inner (role)
        `)
        .eq('user_roles.role', 'admin')
        .eq('approval_status', 'approved');

      if (error) throw error;

      if (adminProfiles && adminProfiles.length > 0) {
        // Get emails from auth.users
        const { data: authData } = await supabase.auth.admin.listUsers();
        
        const adminUsersWithEmail: AdminUser[] = adminProfiles.map((profile: any) => {
          const authUser = authData?.users.find((u: any) => u.id === profile.id);
          return {
            id: profile.id,
            full_name: profile.full_name || '',
            email: authUser?.email || 'غير متوفر',
            created_at: profile.created_at
          };
        });
        
        setAdminUsers(adminUsersWithEmail);
      } else {
        setAdminUsers([]);
      }
    } catch (error: any) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات المستخدمين الإداريين",
        variant: "destructive"
      });
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, created_at')
        .eq('approval_status', 'approved');

      if (error) throw error;

      if (profiles && profiles.length > 0) {
        // Get emails from auth.users
        const { data: authData } = await supabase.auth.admin.listUsers();
        
        const usersWithEmail: AdminUser[] = profiles.map((profile: any) => {
          const authUser = authData?.users.find((u: any) => u.id === profile.id);
          return {
            id: profile.id,
            full_name: profile.full_name || '',
            email: authUser?.email || 'غير متوفر',
            created_at: profile.created_at
          };
        });
        
        setAllUsers(usersWithEmail);
      } else {
        setAllUsers([]);
      }
    } catch (error: any) {
      console.error('Error fetching all users:', error);
    }
  };

  const createSuperAdmin = async () => {
    if (!newAdminForm.email || !newAdminForm.password || !newAdminForm.fullName) {
      toast({
        title: "خطأ",
        description: "جميع الحقول المطلوبة يجب ملؤها",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-super-admin', {
        body: newAdminForm
      });

      if (error) throw error;

      toast({
        title: "نجح الإنشاء",
        description: "تم إنشاء المستخدم الإداري بنجاح",
        variant: "default"
      });

      setNewAdminForm({ email: '', password: '', fullName: '', phone: '' });
      setShowCreateDialog(false);
      fetchAdminUsers();
      fetchAllUsers();
    } catch (error: any) {
      console.error('Error creating super admin:', error);
      toast({
        title: "خطأ في الإنشاء",
        description: error.message || "فشل في إنشاء المستخدم الإداري",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrivilegeTransfer = async () => {
    if (!transferForm.fromUserId || !transferForm.toUserId) {
      toast({
        title: "خطأ",
        description: "يجب اختيار المستخدمين",
        variant: "destructive"
      });
      return;
    }

    if (transferForm.fromUserId === transferForm.toUserId) {
      toast({
        title: "خطأ",
        description: "لا يمكن نقل الصلاحيات للمستخدم نفسه",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('transfer-admin-privileges', {
        body: transferForm
      });

      if (error) throw error;

      toast({
        title: "نجحت العملية",
        description: data.message,
        variant: "default"
      });

      setTransferForm({ fromUserId: '', toUserId: '', transferType: 'promote' });
      setShowTransferDialog(false);
      fetchAdminUsers();
      fetchAllUsers();
    } catch (error: any) {
      console.error('Error transferring privileges:', error);
      toast({
        title: "خطأ في العملية",
        description: error.message || "فشل في تنفيذ العملية",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isCurrentUserAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          هذا القسم متاح للمستخدمين الإداريين فقط
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة المستخدمين الإداريين</h2>
          <p className="text-muted-foreground">
            إدارة وتعيين الصلاحيات الإدارية للمستخدمين
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                إنشاء مستخدم إداري
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إنشاء مستخدم إداري جديد</DialogTitle>
                <DialogDescription>
                  سيتم إنشاء حساب جديد بصلاحيات إدارية كاملة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">كلمة المرور *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="كلمة مرور قوية"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">الاسم الكامل *</Label>
                  <Input
                    id="fullName"
                    value={newAdminForm.fullName}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="الاسم الكامل"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={newAdminForm.phone}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="05xxxxxxxx"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={createSuperAdmin} disabled={loading} className="flex-1">
                    {loading ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                إدارة الصلاحيات
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إدارة الصلاحيات الإدارية</DialogTitle>
                <DialogDescription>
                  نقل أو منح أو إلغاء الصلاحيات الإدارية للمستخدمين
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>نوع العملية</Label>
                  <Select
                    value={transferForm.transferType}
                    onValueChange={(value: any) => setTransferForm(prev => ({ ...prev, transferType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="promote">ترقية مستخدم إلى إداري</SelectItem>
                      <SelectItem value="transfer">نقل الصلاحيات</SelectItem>
                      <SelectItem value="revoke">إلغاء الصلاحيات الإدارية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {transferForm.transferType !== 'revoke' && (
                  <div>
                    <Label>من المستخدم</Label>
                    <Select
                      value={transferForm.fromUserId}
                      onValueChange={(value) => setTransferForm(prev => ({ ...prev, fromUserId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المستخدم المصدر" />
                      </SelectTrigger>
                      <SelectContent>
                        {adminUsers.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>
                    {transferForm.transferType === 'revoke' ? 'المستخدم المراد إلغاء صلاحياته' : 'إلى المستخدم'}
                  </Label>
                  <Select
                    value={transferForm.toUserId}
                    onValueChange={(value) => setTransferForm(prev => ({ ...prev, toUserId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستخدم الهدف" />
                    </SelectTrigger>
                    <SelectContent>
                      {(transferForm.transferType === 'revoke' ? adminUsers : allUsers).map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handlePrivilegeTransfer} disabled={loading} className="flex-1">
                    {loading ? 'جاري التنفيذ...' : 'تنفيذ العملية'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين الإداريين</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allUsers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة الإداريين</CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allUsers.length > 0 ? Math.round((adminUsers.length / allUsers.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Users List */}
      <Card>
        <CardHeader>
          <CardTitle>المستخدمون الإداريون</CardTitle>
          <CardDescription>
            قائمة بجميع المستخدمين الذين يملكون صلاحيات إدارية
          </CardDescription>
        </CardHeader>
        <CardContent>
          {adminUsers.length > 0 ? (
            <div className="space-y-4">
              {adminUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>إداري</Badge>
                    <p className="text-sm text-muted-foreground">
                      منذ {new Date(user.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا يوجد مستخدمون إداريون حالياً</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}