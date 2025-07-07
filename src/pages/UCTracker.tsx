
import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";
import UCList from "@/components/uc/UCList";
import UCEditForm from "@/components/uc/UCEditForm";

const UCTracker = () => {
  const [editingUCId, setEditingUCId] = useState<string | null>(null);

  const handleEditUC = (ucId: string) => {
    setEditingUCId(ucId);
  };

  const handleEditComplete = () => {
    setEditingUCId(null);
  };

  const handleEditCancel = () => {
    setEditingUCId(null);
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
            ) : (
              <UCList onEditUC={handleEditUC} />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UCTracker;
