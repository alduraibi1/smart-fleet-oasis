
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNationalities } from '@/hooks/useNationalities';
import { AddNationalityDialog } from './AddNationalityDialog';
import { EditNationalityDialog } from './EditNationalityDialog';
import { DeleteNationalityDialog } from './DeleteNationalityDialog';

export const NationalitiesManagement = () => {
  const { nationalities, loading, refetch } = useNationalities();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingNationality, setEditingNationality] = useState(null);
  const [deletingNationality, setDeletingNationality] = useState(null);

  const filteredNationalities = nationalities.filter(nationality =>
    nationality.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nationality.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (nationality.name_en && nationality.name_en.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الجنسيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إدارة الجنسيات
              </CardTitle>
              <CardDescription>
                إضافة وتعديل الجنسيات المتاحة في النظام
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة جنسية جديدة
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="البحث في الجنسيات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم بالعربية</TableHead>
                  <TableHead>الاسم بالإنجليزية</TableHead>
                  <TableHead>الكود</TableHead>
                  <TableHead>بادئة الهوية</TableHead>
                  <TableHead>طول الهوية</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNationalities.map((nationality) => (
                  <TableRow key={nationality.id}>
                    <TableCell className="font-medium">
                      {nationality.name_ar}
                    </TableCell>
                    <TableCell>
                      {nationality.name_en || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{nationality.code}</Badge>
                    </TableCell>
                    <TableCell>
                      {nationality.id_prefix || '-'}
                    </TableCell>
                    <TableCell>
                      {nationality.id_length} أرقام
                    </TableCell>
                    <TableCell>
                      {nationality.priority}
                    </TableCell>
                    <TableCell>
                      <Badge variant={nationality.is_active ? "default" : "secondary"}>
                        {nationality.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingNationality(nationality)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingNationality(nationality)}
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

            {filteredNationalities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد جنسيات مضافة'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AddNationalityDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          setShowAddDialog(false);
          refetch();
        }}
      />

      {editingNationality && (
        <EditNationalityDialog
          open={!!editingNationality}
          onOpenChange={(open) => !open && setEditingNationality(null)}
          nationality={editingNationality}
          onSuccess={() => {
            setEditingNationality(null);
            refetch();
          }}
        />
      )}

      {deletingNationality && (
        <DeleteNationalityDialog
          open={!!deletingNationality}
          onOpenChange={(open) => !open && setDeletingNationality(null)}
          nationality={deletingNationality}
          onSuccess={() => {
            setDeletingNationality(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};
