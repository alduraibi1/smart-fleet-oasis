import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Play, 
  Square, 
  Clock, 
  Edit, 
  Trash2, 
  Plus,
  Timer,
  Coffee,
  Calculator
} from 'lucide-react';
import { useMaintenanceWorkHours } from '@/hooks/useMaintenanceWorkHours';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface WorkHoursTrackerProps {
  maintenanceId: string;
  mechanicId: string;
  mechanicName: string;
}

export function WorkHoursTracker({ maintenanceId, mechanicId, mechanicName }: WorkHoursTrackerProps) {
  const {
    workHours,
    loading,
    fetchWorkHours,
    startWorkSession,
    endWorkSession,
    updateWorkHours,
    deleteWorkHours
  } = useMaintenanceWorkHours();

  const [activeSession, setActiveSession] = useState<any>(null);
  const [breakHours, setBreakHours] = useState(0);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    start_time: '',
    end_time: '',
    break_hours: 0,
    hourly_rate: 50,
    notes: ''
  });

  useEffect(() => {
    if (maintenanceId) {
      fetchWorkHours(maintenanceId);
    }
  }, [maintenanceId]);

  useEffect(() => {
    // Find active session (no end time)
    const active = workHours.find(wh => !wh.end_time);
    setActiveSession(active);
  }, [workHours]);

  const handleStartWork = async () => {
    try {
      await startWorkSession(maintenanceId, mechanicId);
    } catch (error) {
      console.error('Error starting work:', error);
    }
  };

  const handleEndWork = async () => {
    if (activeSession) {
      try {
        await endWorkSession(activeSession.id, breakHours);
        setBreakHours(0);
      } catch (error) {
        console.error('Error ending work:', error);
      }
    }
  };

  const handleEditSession = (session: any) => {
    setEditingSession(session);
    setEditFormData({
      start_time: session.start_time ? new Date(session.start_time).toISOString().slice(0, 16) : '',
      end_time: session.end_time ? new Date(session.end_time).toISOString().slice(0, 16) : '',
      break_hours: session.break_hours || 0,
      hourly_rate: session.hourly_rate || 50,
      notes: session.notes || ''
    });
  };

  const handleSaveEdit = async () => {
    if (editingSession) {
      try {
        await updateWorkHours(editingSession.id, {
          start_time: editFormData.start_time,
          end_time: editFormData.end_time || null,
          break_hours: editFormData.break_hours,
          hourly_rate: editFormData.hourly_rate,
          notes: editFormData.notes
        });
        setEditingSession(null);
      } catch (error) {
        console.error('Error updating session:', error);
      }
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الجلسة؟')) {
      try {
        await deleteWorkHours(sessionId);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const getTotalHours = () => {
    return workHours.reduce((total, wh) => total + (wh.total_hours || 0), 0);
  };

  const getTotalCost = () => {
    return workHours.reduce((total, wh) => total + (wh.total_cost || 0), 0);
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Current Session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            تتبع ساعات العمل - {mechanicName}
          </CardTitle>
          <CardDescription>
            تسجيل وإدارة ساعات العمل لهذه المهمة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {activeSession ? (
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="animate-pulse">
                    جلسة نشطة
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    بدأت {formatDistanceToNow(new Date(activeSession.start_time), { 
                      addSuffix: true, 
                      locale: ar 
                    })}
                  </span>
                </div>
              ) : (
                <Badge variant="outline">
                  لا توجد جلسة نشطة
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {activeSession ? (
                <>
                  <div className="flex items-center gap-2">
                    <Coffee className="h-4 w-4" />
                    <Label className="text-sm">ساعات الاستراحة:</Label>
                    <Input
                      type="number"
                      value={breakHours}
                      onChange={(e) => setBreakHours(parseFloat(e.target.value) || 0)}
                      className="w-20"
                      step="0.5"
                      min="0"
                    />
                  </div>
                  <Button onClick={handleEndWork} disabled={loading}>
                    <Square className="h-4 w-4 mr-2" />
                    إنهاء العمل
                  </Button>
                </>
              ) : (
                <Button onClick={handleStartWork} disabled={loading}>
                  <Play className="h-4 w-4 mr-2" />
                  بدء العمل
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">إجمالي الساعات</p>
                <p className="text-2xl font-bold">{formatDuration(getTotalHours())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">إجمالي التكلفة</p>
                <p className="text-2xl font-bold">{getTotalCost().toFixed(2)} ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">عدد الجلسات</p>
                <p className="text-2xl font-bold">{workHours.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-amber-600" />
              <div>
                <p className="text-sm font-medium">ساعات الاستراحة</p>
                <p className="text-2xl font-bold">
                  {formatDuration(workHours.reduce((total, wh) => total + (wh.break_hours || 0), 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل جلسات العمل</CardTitle>
          <CardDescription>
            جميع جلسات العمل لهذه المهمة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>تاريخ البدء</TableHead>
                <TableHead>تاريخ الانتهاء</TableHead>
                <TableHead className="text-center">المدة الفعلية</TableHead>
                <TableHead className="text-center">الاستراحة</TableHead>
                <TableHead className="text-center">معدل الساعة</TableHead>
                <TableHead className="text-center">التكلفة</TableHead>
                <TableHead className="text-center">الحالة</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workHours.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(session.start_time).toLocaleDateString('ar-SA')}</div>
                      <div className="text-muted-foreground">
                        {new Date(session.start_time).toLocaleTimeString('ar-SA')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {session.end_time ? (
                      <div className="text-sm">
                        <div>{new Date(session.end_time).toLocaleDateString('ar-SA')}</div>
                        <div className="text-muted-foreground">
                          {new Date(session.end_time).toLocaleTimeString('ar-SA')}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="default" className="animate-pulse">
                        جاري العمل
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {session.total_hours ? formatDuration(session.total_hours) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatDuration(session.break_hours)}
                  </TableCell>
                  <TableCell className="text-center">
                    {session.hourly_rate} ر.س/ساعة
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium">
                      {session.total_cost ? `${session.total_cost.toFixed(2)} ر.س` : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {session.end_time ? (
                      <Badge variant="outline">مكتملة</Badge>
                    ) : (
                      <Badge variant="default">نشطة</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditSession(session)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>تعديل جلسة العمل</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>تاريخ البدء</Label>
                                <Input
                                  type="datetime-local"
                                  value={editFormData.start_time}
                                  onChange={(e) => setEditFormData(prev => ({
                                    ...prev, start_time: e.target.value
                                  }))}
                                />
                              </div>
                              <div>
                                <Label>تاريخ الانتهاء</Label>
                                <Input
                                  type="datetime-local"
                                  value={editFormData.end_time}
                                  onChange={(e) => setEditFormData(prev => ({
                                    ...prev, end_time: e.target.value
                                  }))}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>ساعات الاستراحة</Label>
                                <Input
                                  type="number"
                                  step="0.5"
                                  value={editFormData.break_hours}
                                  onChange={(e) => setEditFormData(prev => ({
                                    ...prev, break_hours: parseFloat(e.target.value) || 0
                                  }))}
                                />
                              </div>
                              <div>
                                <Label>معدل الساعة (ر.س)</Label>
                                <Input
                                  type="number"
                                  value={editFormData.hourly_rate}
                                  onChange={(e) => setEditFormData(prev => ({
                                    ...prev, hourly_rate: parseFloat(e.target.value) || 0
                                  }))}
                                />
                              </div>
                            </div>
                            <div>
                              <Label>ملاحظات</Label>
                              <Textarea
                                value={editFormData.notes}
                                onChange={(e) => setEditFormData(prev => ({
                                  ...prev, notes: e.target.value
                                }))}
                                placeholder="ملاحظات حول جلسة العمل..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleSaveEdit} disabled={loading}>
                                حفظ التغييرات
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => setEditingSession(null)}
                              >
                                إلغاء
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {workHours.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد جلسات عمل</h3>
              <p className="text-muted-foreground mb-4">
                لم يتم تسجيل أي جلسات عمل لهذه المهمة بعد
              </p>
              <Button onClick={handleStartWork} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                بدء أول جلسة عمل
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}