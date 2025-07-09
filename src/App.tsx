
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import UCUpload from "./pages/UCUpload";
import UCTracker from "./pages/UCTracker";
import UCFileManager from "./pages/UCFileManager";
import UCReports from "./pages/UCReports";
import Agencies from "./pages/Agencies";
import Years from "./pages/Years";
import Investigators from "./pages/Investigators";
import UserManagement from "./pages/UserManagement";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/uc-upload" element={<UCUpload />} />
            <Route path="/uc-tracker" element={<UCTracker />} />
            <Route path="/uc-file-manager" element={<UCFileManager />} />
            <Route path="/uc-files" element={<UCFileManager />} />
            <Route path="/uc-reports" element={<UCReports />} />
            <Route path="/agencies" element={<Agencies />} />
            <Route path="/years" element={<Years />} />
            <Route path="/investigators" element={<Investigators />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
