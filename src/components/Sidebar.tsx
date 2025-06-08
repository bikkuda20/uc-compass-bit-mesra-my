
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  FileText,
  Upload,
  Users,
  Building2,
  Calendar,
  Settings,
  FolderOpen,
  UserCog,
  LogOut,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "UC Tracker", href: "/uc-tracker", icon: FileText },
  { name: "UC Upload", href: "/uc-upload", icon: Upload },
  { name: "UC Files", href: "/uc-files", icon: FolderOpen },
  { name: "Principal Investigator", href: "/investigators", icon: Users },
  { name: "Agencies", href: "/agencies", icon: Building2 },
  { name: "Financial Year", href: "/years", icon: Calendar },
  { name: "User Management", href: "/users", icon: UserCog },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-full w-64 flex-col fixed inset-y-0 z-50 bg-white shadow-xl">
      <div className="flex flex-1 flex-col min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/e1d17591-b0a5-4e7c-8df4-2212c319f132.png" 
              alt="BIT Mesra Logo" 
              className="h-10 w-10 rounded-full bg-white p-1"
            />
            <div>
              <h1 className="text-white text-sm font-semibold">UC Management</h1>
              <p className="text-white text-xs opacity-90">R&D Cell</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    isActive
                      ? "bg-blue-100 border-r-2 border-blue-600 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500",
                      "mr-3 flex-shrink-0 h-5 w-5"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="px-2 pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors text-red-600 hover:bg-red-50 hover:text-red-700 w-full"
            >
              <LogOut
                className="mr-3 flex-shrink-0 h-5 w-5"
                aria-hidden="true"
              />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
