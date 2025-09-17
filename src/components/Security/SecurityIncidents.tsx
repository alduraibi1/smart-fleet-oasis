import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Eye, Check, X, Clock, User, Search, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SecurityIncident {
  id: string;
  incident_type: string;
  severity: string;
  title: string;
  description: string;
  affected_user_id: string | null;
  source_ip: string | null;
  user_agent: string | null;
  metadata: any;
  status: string;
  assigned_to: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export function SecurityIncidents() {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const { hasRole, user } = useAuth();
  const { toast } = useToast();

  // Check permissions
  if (!hasRole('admin') && !hasRole('manager')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">غير مخوّل</h3>
            <p className="text-sm text-muted-foreground">
              تحتاج صلاحيات مدير أو مشرف لعرض الحوادث الأمنية
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('security_incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      if (severityFilter) {
        query = query.eq('severity', severityFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setIncidents((data || []) as any);
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل الحوادث الأمنية",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, severityFilter]);

  const filteredIncidents = incidents.filter(incident => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      incident.title.toLowerCase().includes(searchLower) ||
      incident.incident_type.toLowerCase().includes(searchLower) ||
      (incident.description && incident.description.toLowerCase().includes(searchLower))
    );
  });

  const updateIncidentStatus = async (incidentId: string, newStatus: string, notes?: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'resolved' || newStatus === 'false_positive') {
        updateData.resolved_by = user?.id;
        updateData.resolved_at = new Date().toISOString();
        if (notes) {
          updateData.resolution_notes = notes;
        }
      }

      if (newStatus === 'investigating') {
        updateData.assigned_to = user?.id;
      }

      const { error } = await supabase
        .from('security_incidents')
        .update(updateData)
        .eq('id', incidentId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الحادث بنجاح",
      });

      fetchIncidents();
      setShowDetailsDialog(false);
      setResolutionNotes('');
    } catch (error: any) {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    } as const;
    
    const labels = {
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض'
    };
    
    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'outline'}>
        {labels[severity as keyof typeof labels] || severity}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: { variant: 'destructive' as const, label: 'مفتوح', icon: AlertTriangle },
      investigating: { variant: 'secondary' as const, label: 'قيد التحقيق', icon: Eye },
      resolved: { variant: 'default' as const, label: 'محلول', icon: Check },
      false_positive: { variant: 'outline' as const, label: 'إنذار كاذب', icon: X }
    };
    
    const config = variants[status as keyof typeof variants] || { 
      variant: 'outline' as const, 
      label: status, 
      icon: Clock 
    };
    
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getIncidentTypeLabel = (type: string) => {
    const labels = {
      failed_logins: 'محاولات دخول فاشلة',
      data_access: 'وصول للبيانات',
      delete_operations: 'عمليات حذف',
      user_modifications: 'تعديل المستخدمين',
      unusual_activity: 'نشاط غير عادي'
    };
    
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                الحوادث الأمنية
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                مراقبة ومتابعة الحوادث الأمنية والتهديدات المكتشفة
              </p>
            </div>
            <Button onClick={fetchIncidents} disabled={loading} size="sm" variant="outline">
              <Clock className="h-4 w-4 mr-2" />
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
                  placeholder="البحث في الحوادث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الحالات</SelectItem>
                <SelectItem value="open">مفتوح</SelectItem>
                <SelectItem value="investigating">قيد التحقيق</SelectItem>
                <SelectItem value="resolved">محلول</SelectItem>
                <SelectItem value="false_positive">إنذار كاذب</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="الأهمية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع المستويات</SelectItem>
                <SelectItem value="high">عالي</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>عرض {filteredIncidents.length} من أصل {incidents.length} حادث</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-destructive"></div>
                مفتوح: {incidents.filter(i => i.status === 'open').length}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                قيد التحقيق: {incidents.filter(i => i.status === 'investigating').length}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                محلول: {incidents.filter(i => i.status === 'resolved').length}
              </span>
            </div>
          </div>

          {/* Incidents Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الأهمية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التوقيت</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <p>جاري تحميل الحوادث...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredIncidents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">لا توجد حوادث أمنية</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{incident.title}</div>
                          {incident.description && (
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {incident.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">
                          {getIncidentTypeLabel(incident.incident_type)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(incident.severity)}
                          {getSeverityBadge(incident.severity)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(incident.status)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {formatDistanceToNow(new Date(incident.created_at), { 
                              addSuffix: true, 
                              locale: ar 
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(incident.created_at).toLocaleDateString('ar-SA')}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          <Dialog 
                            open={showDetailsDialog && selectedIncident?.id === incident.id} 
                            onOpenChange={setShowDetailsDialog}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedIncident(incident)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>تفاصيل الحادث الأمني</DialogTitle>
                              </DialogHeader>
                              
                              {selectedIncident && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">العنوان</label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {selectedIncident.title}
                                      </p>
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm font-medium">النوع</label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {getIncidentTypeLabel(selectedIncident.incident_type)}
                                      </p>
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm font-medium">الأهمية</label>
                                      <div className="mt-1">
                                        {getSeverityBadge(selectedIncident.severity)}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm font-medium">الحالة الحالية</label>
                                      <div className="mt-1">
                                        {getStatusBadge(selectedIncident.status)}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {selectedIncident.description && (
                                    <div>
                                      <label className="text-sm font-medium">الوصف</label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {selectedIncident.description}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {selectedIncident.source_ip && (
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">عنوان IP</label>
                                        <code className="text-sm bg-muted px-2 py-1 rounded mt-1 block">
                                          {selectedIncident.source_ip}
                                        </code>
                                      </div>
                                      
                                      {selectedIncident.user_agent && (
                                        <div>
                                          <label className="text-sm font-medium">متصفح/جهاز</label>
                                          <p className="text-xs text-muted-foreground mt-1 break-all">
                                            {selectedIncident.user_agent}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {selectedIncident.resolution_notes && (
                                    <div>
                                      <label className="text-sm font-medium">ملاحظات الحل</label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {selectedIncident.resolution_notes}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {selectedIncident.status !== 'resolved' && selectedIncident.status !== 'false_positive' && (
                                    <div className="space-y-4 border-t pt-4">
                                      <h4 className="font-medium">إجراءات الحل</h4>
                                      
                                      <div>
                                        <label className="text-sm font-medium">ملاحظات الحل</label>
                                        <Textarea
                                          placeholder="أدخل ملاحظات حول كيفية حل هذا الحادث..."
                                          value={resolutionNotes}
                                          onChange={(e) => setResolutionNotes(e.target.value)}
                                          className="mt-1"
                                        />
                                      </div>
                                      
                                      <div className="flex gap-2">
                                        {selectedIncident.status === 'open' && (
                                          <Button
                                            onClick={() => updateIncidentStatus(
                                              selectedIncident.id, 
                                              'investigating'
                                            )}
                                            size="sm"
                                          >
                                            <Eye className="h-4 w-4 mr-2" />
                                            بدء التحقيق
                                          </Button>
                                        )}
                                        
                                        <Button
                                          onClick={() => updateIncidentStatus(
                                            selectedIncident.id, 
                                            'resolved',
                                            resolutionNotes
                                          )}
                                          size="sm"
                                          variant="default"
                                          disabled={!resolutionNotes}
                                        >
                                          <Check className="h-4 w-4 mr-2" />
                                          حل الحادث
                                        </Button>
                                        
                                        <Button
                                          onClick={() => updateIncidentStatus(
                                            selectedIncident.id, 
                                            'false_positive',
                                            resolutionNotes
                                          )}
                                          size="sm"
                                          variant="outline"
                                        >
                                          <X className="h-4 w-4 mr-2" />
                                          إنذار كاذب
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
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