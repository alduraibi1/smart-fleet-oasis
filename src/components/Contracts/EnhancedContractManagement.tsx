import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Edit,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContracts } from "@/hooks/useContracts";
import { ContractRenewalDialog } from './ContractRenewalDialog';
import { ContractViewDialog } from './ContractViewDialog';
import { ContractEditDialog } from './ContractEditDialog';
import { ContractTerminationDialog } from './ContractTerminationDialog';

const EnhancedContractManagement = () => {
  const {
    contracts,
    loading,
    stats,
    fetchContracts,
    searchContracts,
    totalPages,
    currentPage,
    nextPage,
    prevPage,
    goToPage,
  } = useContracts();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [renewalDialogOpen, setRenewalDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [terminationDialogOpen, setTerminationDialogOpen] = useState(false);
  const [selectedContractForTermination, setSelectedContractForTermination] = useState<any>(null);

  const handleRenewContract = (contract: any) => {
    setSelectedContract(contract);
    setRenewalDialogOpen(true);
  };

  const handleViewContract = (contract: any) => {
    setSelectedContract(contract);
    setViewDialogOpen(true);
  };

  const handleEditContract = (contract: any) => {
    setSelectedContract(contract);
    setEditDialogOpen(true);
  };

  const handleTerminateContract = (contract: any) => {
    setSelectedContractForTermination(contract);
    setTerminationDialogOpen(true);
  };

  const filteredContracts = contracts;

  const ActionButtons = ({ contract }: { contract: any }) => (
    <div className="flex gap-2">
      {contract.status === 'active' && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleTerminateContract(contract)}
            className="text-orange-600 hover:text-orange-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            إنهاء العقد
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditContract(contract)}
          >
            <Edit className="h-4 w-4 mr-1" />
            تعديل
          </Button>
        </>
      )}
      {contract.status === 'completed' && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleRenewContract(contract)}
          className="text-green-600 hover:text-green-700"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          تجديد
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleViewContract(contract)}
      >
        <Eye className="h-4 w-4 mr-1" />
        عرض
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>إجمالي العقود</CardTitle>
          </CardHeader>
          <CardContent>{stats?.total}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>العقود النشطة</CardTitle>
          </CardHeader>
          <CardContent>{stats?.active}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>إجمالي الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>{stats?.totalRevenue?.toLocaleString()} ر.س</CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Input
          type="search"
          placeholder="بحث عن عقد..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="كل الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="completed">مكتمل</SelectItem>
            <SelectItem value="expired">منتهي</SelectItem>
            <SelectItem value="pending">معلق</SelectItem>
            <SelectItem value="cancelled">ملغي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العقود</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : filteredContracts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد عقود تطابق المعايير المحددة
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">رقم العقد</th>
                    <th className="text-right p-2">العميل</th>
                    <th className="text-right p-2">المركبة</th>
                    <th className="text-right p-2">الفترة</th>
                    <th className="text-right p-2">المبلغ</th>
                    <th className="text-right p-2">الحالة</th>
                    <th className="text-right p-2">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((contract) => (
                    <tr key={contract.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{contract.contract_number}</td>
                      <td className="p-2">{contract.customer?.name}</td>
                      <td className="p-2">
                        {contract.vehicle?.brand} {contract.vehicle?.model}
                        <br />
                        <span className="text-sm text-muted-foreground">
                          {contract.vehicle?.plate_number}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          <div>{contract.start_date}</div>
                          <div>{contract.end_date}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          <div>{contract.total_amount?.toLocaleString()} ر.س</div>
                          <div className="text-muted-foreground">
                            مدفوع: {contract.paid_amount?.toLocaleString()} ر.س
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <Badge
                          variant={
                            contract.status === 'active' ? 'default' :
                            contract.status === 'completed' ? 'secondary' :
                            contract.status === 'expired' ? 'destructive' :
                            'outline'
                          }
                        >
                          {contract.status === 'active' && 'نشط'}
                          {contract.status === 'completed' && 'مكتمل'}
                          {contract.status === 'expired' && 'منتهي'}
                          {contract.status === 'pending' && 'معلق'}
                          {contract.status === 'cancelled' && 'ملغي'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <ActionButtons contract={contract} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedContract && (
        <>
          <ContractRenewalDialog
            open={renewalDialogOpen}
            onOpenChange={setRenewalDialogOpen}
            contract={selectedContract}
            onRenewed={() => {
              fetchContracts();
              setSelectedContract(null);
            }}
          />
          <ContractViewDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            contract={selectedContract}
          />
          <ContractEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            contract={selectedContract}
            onUpdated={() => {
              fetchContracts();
              setSelectedContract(null);
            }}
          />
        </>
      )}

      {/* Contract Termination Dialog */}
      {selectedContractForTermination && (
        <ContractTerminationDialog
          open={terminationDialogOpen}
          onOpenChange={setTerminationDialogOpen}
          contract={selectedContractForTermination}
          onCompleted={() => {
            fetchContracts();
            setSelectedContractForTermination(null);
          }}
        />
      )}
    </div>
  );
};

export default EnhancedContractManagement;
