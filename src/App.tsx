
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import UCTracker from "./pages/UCTracker";
import UCUpload from "./pages/UCUpload";
import UCFileManager from "./pages/UCFileManager";
import Investigators from "./pages/Investigators";
import Agencies from "./pages/Agencies";
import Years from "./pages/Years";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/uc-tracker" element={<UCTracker />} />
          <Route path="/uc-upload" element={<UCUpload />} />
          <Route path="/uc-files" element={<UCFileManager />} />
          <Route path="/investigators" element={<Investigators />} />
          <Route path="/agencies" element={<Agencies />} />
          <Route path="/years" element={<Years />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
