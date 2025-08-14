
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download, Upload } from "lucide-react";
import AddContractDialog from "./AddContractDialog";
import VehicleReturnDialog from "./VehicleReturnDialog";

interface ContractsActionButtonsProps {
  onRefresh?: () => void;
}

export const ContractsActionButtons = ({ onRefresh }: ContractsActionButtonsProps) => {
  const handleExport = () => {
    // Export functionality can be implemented here
    console.log('Exporting contracts...');
  };

  const handleImport = () => {
    // Import functionality can be implemented here  
    console.log('Importing contracts...');
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <AddContractDialog />
      
      <VehicleReturnDialog />
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExport}
      >
        <Download className="h-4 w-4 mr-2" />
        تصدير
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleImport}
      >
        <Upload className="h-4 w-4 mr-2" />
        استيراد
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={onRefresh}
      >
        <FileText className="h-4 w-4 mr-2" />
        تحديث
      </Button>
    </div>
  );
};
