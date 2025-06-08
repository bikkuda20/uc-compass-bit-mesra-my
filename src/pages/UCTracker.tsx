
import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import UCList from "@/components/uc/UCList";
import UCForm from "@/components/uc/UCForm";

const UCTracker = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingUC, setEditingUC] = useState<any>(null);

  const handleEdit = (uc: any) => {
    setEditingUC(uc);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingUC(null);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingUC(null);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 bg-gradient-to-br from-green-50 to-blue-100">
            {showForm ? (
              <UCForm uc={editingUC} onSave={handleClose} />
            ) : (
              <UCList onEdit={handleEdit} onNew={handleNew} />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UCTracker;
