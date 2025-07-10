
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />
            <Route path="/" element={user ? <Index /> : <Navigate to="/auth" />} />
            <Route path="/uc-upload" element={user ? <UCUpload /> : <Navigate to="/auth" />} />
            <Route path="/uc-tracker" element={user ? <UCTracker /> : <Navigate to="/auth" />} />
            <Route path="/uc-file-manager" element={user ? <UCFileManager /> : <Navigate to="/auth" />} />
            <Route path="/uc-files" element={user ? <UCFileManager /> : <Navigate to="/auth" />} />
            <Route path="/uc-reports" element={user ? <UCReports /> : <Navigate to="/auth" />} />
            <Route path="/agencies" element={user ? <Agencies /> : <Navigate to="/auth" />} />
            <Route path="/years" element={user ? <Years /> : <Navigate to="/auth" />} />
            <Route path="/investigators" element={user ? <Investigators /> : <Navigate to="/auth" />} />
            <Route path="/user-management" element={user ? <UserManagement /> : <Navigate to="/auth" />} />
            <Route path="/users" element={user ? <UserManagement /> : <Navigate to="/auth" />} />
            <Route path="/settings" element={user ? <Settings /> : <Navigate to="/auth" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
