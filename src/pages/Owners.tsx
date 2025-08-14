
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useOwners, OwnerFilters } from "@/hooks/useOwners";
import { AddOwnerDialog } from "@/components/Owners/AddOwnerDialog";
import { OwnerStats } from "@/components/Owners/OwnerStats";
import { OwnerFilters as OwnerFiltersComponent } from "@/components/Owners/OwnerFilters";
import { OwnerTable } from "@/components/Owners/OwnerTable";
import { AppLayout } from "@/components/Layout/AppLayout";

const Owners = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [filters, setFilters] = useState<OwnerFilters>({});

  const {
    owners,
    loading,
    stats,
    fetchOwners,
    addOwner,
    updateOwner,
    deleteOwner,
  } = useOwners();

  const handleFiltersChange = (newFilters: OwnerFilters) => {
    setFilters(newFilters);
    fetchOwners(newFilters);
  };

  const handleOwnerAdded = async (ownerData: any) => {
    try {
      await addOwner(ownerData);
      fetchOwners(filters);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إدارة الملاك</h1>
            <p className="text-muted-foreground">
              إدارة ملاك المركبات ومعلوماتهم
            </p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            إضافة مالك جديد
          </Button>
        </div>

        <OwnerStats stats={stats} loading={loading} />
        <OwnerFiltersComponent onFiltersChange={handleFiltersChange} />
        <OwnerTable
          owners={owners}
          loading={loading}
          onUpdate={updateOwner}
          onDelete={deleteOwner}
        />

        <AddOwnerDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onAdd={handleOwnerAdded}
        />
      </div>
    </AppLayout>
  );
};

export default Owners;
