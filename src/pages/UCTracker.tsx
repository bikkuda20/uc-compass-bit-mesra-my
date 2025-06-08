
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import UCList from "@/components/uc/UCList";

const UCTracker = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-green-50">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1">
            <UCList />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UCTracker;
