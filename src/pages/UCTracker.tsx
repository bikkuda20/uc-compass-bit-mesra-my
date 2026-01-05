import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";
import UCList from "@/components/uc/UCList";
import UCEditForm from "@/components/uc/UCEditForm";
import UCForm from "@/components/uc/UCForm";

const UCTracker = () => {
  const [editingUCId, setEditingUCId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleEditUC = (ucId: string) => {
    setEditingUCId(ucId);
  };

  const handleCreateUC = () => {
    setShowCreateForm(true);
  };

  const handleEditComplete = () => {
    setEditingUCId(null);
    setShowCreateForm(false);
  };

  const handleEditCancel = () => {
    setEditingUCId(null);
    setShowCreateForm(false);
  };

  return (
    <SidebarProvider>
      {/* Page background */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <SidebarInset>
          {/* 
            IMPORTANT:
            Sidebar width ≈ 16rem (64).
            This padding ensures content never goes under sidebar.
          */}
          <div className="pl-64 p-6 w-full max-w-full overflow-x-hidden">
            {editingUCId ? (
              <UCEditForm
                ucId={editingUCId}
                onComplete={handleEditComplete}
                onCancel={handleEditCancel}
              />
            ) : showCreateForm ? (
              <UCForm
                onComplete={handleEditComplete}
                onCancel={handleEditCancel}
              />
            ) : (
              <UCList
                onEditUC={handleEditUC}
                onCreateUC={handleCreateUC}
              />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UCTracker;
