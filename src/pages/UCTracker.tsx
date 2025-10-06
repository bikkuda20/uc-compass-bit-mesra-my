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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Sidebar />
        <SidebarInset>
          <div className="flex-1 ml-64 p-6">
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
              <UCList onEditUC={handleEditUC} onCreateUC={handleCreateUC} />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UCTracker;