import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckIcon, XIcon, UserIcon, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface PendingUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  user_type: string;
  created_at: string;
}

export const PendingUsersManagement = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, user_type, created_at')
        .eq('approval_status', 'pending');
      
      if (error) throw error;
      
      // Get email from auth metadata
      const usersWithEmails = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
          return {
            ...profile,
            email: authUser.user?.email || ''
          };
        })
      );
      
      setPendingUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل طلبات التسجيل المعلقة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('approve_user_registration', {
        p_user_id: userId,
        p_approved_by: (await supabase.auth.getUser()).data.user?.id
      });

      if (error) throw error;

      if (data && typeof data === 'object' && 'success' in data && data.success) {
        toast({
          title: "تمت الموافقة",
          description: "تم قبول المستخدم بنجاح",
        });
        fetchPendingUsers();
      } else {
        throw new Error((data && typeof data === 'object' && 'message' in data ? data.message as string : undefined) || 'فشل في الموافقة');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "خطأ",
        description: "فشل في الموافقة على المستخدم",
        variant: "destructive",
      });
    }
  };

  const rejectUser = async (userId: string, reason: string) => {
    if (!reason.trim()) {
      toast({
        title: "خطأ",
        description: "يجب إدخال سبب الرفض",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.rpc('reject_user_registration', {
        p_user_id: userId,
        p_rejection_reason: reason
      });

      if (error) throw error;

      if (data && typeof data === 'object' && 'success' in data && data.success) {
        toast({
          title: "تم الرفض",
          description: "تم رفض المستخدم",
        });
        fetchPendingUsers();
        setRejectionReason('');
        setSelectedUser(null);
      } else {
        throw new Error((data && typeof data === 'object' && 'message' in data ? data.message as string : undefined) || 'فشل في الرفض');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: "خطأ",
        description: "فشل في رفض المستخدم",
        variant: "destructive",
      });
    }
  };

  const getUserTypeDisplay = (type: string) => {
    const types = {
      employee: 'موظف',
      owner: 'مالك مركبة',
      partner: 'شريك'
    };
    return types[type as keyof typeof types] || type;
  };

  const getUserTypeBadgeVariant = (type: string) => {
    const variants = {
      employee: 'default',
      owner: 'secondary',
      partner: 'outline'
    };
    return variants[type as keyof typeof variants] || 'default';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            طلبات التسجيل المعلقة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          طلبات التسجيل المعلقة ({pendingUsers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد طلبات تسجيل معلقة</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>نوع المستخدم</TableHead>
                <TableHead>تاريخ الطلب</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                      <Badge variant={getUserTypeBadgeVariant(user.user_type) as "default" | "destructive" | "secondary" | "outline"}>
                        {getUserTypeDisplay(user.user_type)}
                      </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveUser(user.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckIcon className="h-4 w-4" />
                        موافقة
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setSelectedUser(user)}
                          >
                            <XIcon className="h-4 w-4" />
                            رفض
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>رفض طلب التسجيل</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                المستخدم: {selectedUser?.full_name}
                              </p>
                              <p className="text-sm text-muted-foreground mb-4">
                                البريد الإلكتروني: {selectedUser?.email}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">سبب الرفض *</label>
                              <Textarea
                                placeholder="أدخل سبب رفض طلب التسجيل..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setRejectionReason('');
                                  setSelectedUser(null);
                                }}
                              >
                                إلغاء
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => selectedUser && rejectUser(selectedUser.id, rejectionReason)}
                              >
                                تأكيد الرفض
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};