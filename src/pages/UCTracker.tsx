
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import UCList from "@/components/uc/UCList";

const UCTracker = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 bg-gradient-to-br from-green-50 to-blue-100">
            <UCList />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UCTracker;
