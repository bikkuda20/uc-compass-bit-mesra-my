import { useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";
import UCList from "@/components/uc/UCList";
import UCTrackerEditForm from "@/components/uc/UCTrackerEditForm";
import UCEditForm from "@/components/uc/UCEditForm";
import UCForm from "@/components/uc/UCForm";

const UCTracker = () => {
  const [editingUCId, setEditingUCId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<"tracker" | "uc" | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleEditTracker = (ucId: string) => {
    setEditingUCId(ucId);
    setEditMode("tracker");
  };

  const handleEditUC = (ucId: string) => {
    setEditingUCId(ucId);
    setEditMode("uc");
  };

  const handleEditComplete = () => {
    setEditingUCId(null);
    setEditMode(null);
    setShowCreateForm(false);
  };

  const handleEditCancel = handleEditComplete;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Sidebar />

        <SidebarInset>
          <div className="pl-64 p-6">

            {editingUCId && editMode === "tracker" ? (
              <UCTrackerEditForm
                ucId={editingUCId}
                onComplete={handleEditComplete}
                onCancel={handleEditCancel}
              />
            ) : editingUCId && editMode === "uc" ? (
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
                onEditTracker={handleEditTracker}
                onEditUC={handleEditUC}
                onCreateUC={() => setShowCreateForm(true)}
              />
            )}

          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UCTracker;
