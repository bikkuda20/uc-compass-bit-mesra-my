
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <Dashboard />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
