
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import UCList from "@/components/uc/UCList";
import UCForm from "@/components/uc/UCForm";

const Index = () => {
  const [currentView, setCurrentView] = useState<'list' | 'form'>('list');
  const [selectedUC, setSelectedUC] = useState<any>(null);

  const handleNewUC = () => {
    setSelectedUC(null);
    setCurrentView('form');
  };

  const handleEditUC = (uc: any) => {
    setSelectedUC(uc);
    setCurrentView('form');
  };

  const handleFormComplete = () => {
    setCurrentView('list');
    setSelectedUC(null);
  };

  const handleFormCancel = () => {
    setCurrentView('list');
    setSelectedUC(null);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <SidebarTrigger className="mb-4" />
            {currentView === 'list' ? (
              <UCList onEdit={handleEditUC} onNew={handleNewUC} />
            ) : (
              <UCForm 
                uc={selectedUC} 
                onComplete={handleFormComplete} 
                onCancel={handleFormCancel} 
              />
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
