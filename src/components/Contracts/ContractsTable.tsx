
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, FileText, Car, Edit, Trash2, Printer, Download, FileCheck } from 'lucide-react';
import { Contract } from '@/hooks/useContracts';
import VehicleReturnDialog from './VehicleReturnDialog';
import DetailedReturnReport from './DetailedReturnReport';
import { PrintDialog } from './Print/PrintDialog';

interface ContractsTableProps {
  contracts: Contract[];
  loading: boolean;
}

export const ContractsTable = ({ contracts, loading }: ContractsTableProps) => {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'نشط', variant: 'default' as const },
      completed: { label: 'مكتمل', variant: 'secondary' as const },
      expired: { label: 'منتهي', variant: 'destructive' as const },
      cancelled: { label: 'ملغي', variant: 'outline' as const },
      pending: { label: 'في الانتظار', variant: 'secondary' as const },
    };
    
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
  };

  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setShowDetailsDialog(true);
  };

  const handleReturnVehicle = (contract: Contract) => {
    setSelectedContract(contract);
    setShowReturnDialog(true);
  };

  const handleViewDetailedReport = (contract: Contract) => {
    setSelectedContract(contract);
    setShowDetailedReport(true);
  };

  const handlePrint = (contract: Contract) => {
    setSelectedContract(contract);
    setShowPrintDialog(true);
  };

  const handleDownloadPDF = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasPDFs = (contract: Contract) => {
    return contract.contract_pdf_url || contract.invoice_pdf_url || contract.handover_pdf_url;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {contracts.map((contract) => {
          const statusBadge = getStatusBadge(contract.status);
          
          return (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant={statusBadge.variant}>
                        {statusBadge.label}
                      </Badge>
                      <span className="font-semibold">
                        {contract.contract_number}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {contract.customer?.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {contract.vehicle?.brand} {contract.vehicle?.model} - {contract.vehicle?.plate_number}
                      </span>
                      <span>
                        من: {new Date(contract.start_date).toLocaleDateString('ar-SA')}
                      </span>
                      <span>
                        إلى: {new Date(contract.end_date).toLocaleDateString('ar-SA')}
                      </span>
                      <span className="font-medium">
                        {contract.total_amount.toLocaleString()} ر.س
                      </span>
                      {hasPDFs(contract) && (
                        <span className="flex items-center gap-1 text-green-600">
                          <FileCheck className="h-4 w-4" />
                          مستندات محفوظة
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(contract)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {hasPDFs(contract) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(contract)}
                        title="عرض المستندات المحفوظة"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint(contract)}
                        title="طباعة المستندات"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {contract.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReturnVehicle(contract)}
                      >
                        <Car className="h-4 w-4 ml-1" />
                        إرجاع
                      </Button>
                    )}

                    {contract.status === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetailedReport(contract)}
                      >
                        <FileText className="h-4 w-4 ml-1" />
                        تقرير مفصل
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {contracts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد عقود</h3>
            <p className="text-muted-foreground">
              لم يتم العثور على أي عقود. ابدأ بإضافة عقد جديد.
            </p>
          </div>
        )}
      </div>

      {/* Contract Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل العقد</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">رقم العقد</label>
                  <p>{selectedContract.contract_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">الحالة</label>
                  <Badge variant={getStatusBadge(selectedContract.status).variant}>
                    {getStatusBadge(selectedContract.status).label}
                  </Badge>
                </div>
              </div>

              {/* PDF Documents Section */}
              {hasPDFs(selectedContract) && (
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-green-600" />
                    المستندات المحفوظة
                  </h3>
                  <div className="space-y-2">
                    {selectedContract.contract_pdf_url && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleDownloadPDF(selectedContract.contract_pdf_url!, `contract-${selectedContract.contract_number}.pdf`)}
                      >
                        <FileText className="h-4 w-4 ml-2" />
                        عقد الإيجار
                      </Button>
                    )}
                    {selectedContract.invoice_pdf_url && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleDownloadPDF(selectedContract.invoice_pdf_url!, `invoice-${selectedContract.contract_number}.pdf`)}
                      >
                        <FileText className="h-4 w-4 ml-2" />
                        الفاتورة الضريبية
                      </Button>
                    )}
                    {selectedContract.handover_pdf_url && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleDownloadPDF(selectedContract.handover_pdf_url!, `handover-${selectedContract.contract_number}.pdf`)}
                      >
                        <FileText className="h-4 w-4 ml-2" />
                        نموذج الاستلام
                      </Button>
                    )}
                    {selectedContract.return_pdf_url && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleDownloadPDF(selectedContract.return_pdf_url!, `return-${selectedContract.contract_number}.pdf`)}
                      >
                        <FileText className="h-4 w-4 ml-2" />
                        نموذج الإرجاع
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Vehicle Return Dialog */}
      {selectedContract && (
        <VehicleReturnDialog
          contractId={selectedContract.id}
          open={showReturnDialog}
          onOpenChange={setShowReturnDialog}
        />
      )}

      {/* Detailed Return Report Dialog */}
      {selectedContract && (
        <DetailedReturnReport
          contractId={selectedContract.id}
          open={showDetailedReport}
          onOpenChange={setShowDetailedReport}
        />
      )}

      {/* Print Dialog */}
      {selectedContract && (
        <PrintDialog
          contract={selectedContract}
          open={showPrintDialog}
          onOpenChange={setShowPrintDialog}
        />
      )}
    </>
  );
};
