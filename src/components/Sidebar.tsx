
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "UC Tracker", href: "/uc-tracker", icon: FileText },
  { name: "UC Upload", href: "/uc-upload", icon: Upload },
  { name: "UC Files", href: "/uc-files", icon: FolderOpen },
  { name: "Investigators", href: "/investigators", icon: Users },
  { name: "Agencies", href: "/agencies", icon: Building2 },
  { name: "Years", href: "/years", icon: Calendar },
  { name: "User Management", href: "/users", icon: UserCog },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col fixed inset-y-0 z-50 bg-white shadow-xl">
      <div className="flex flex-1 flex-col min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="UC Management Logo" 
              className="h-8 w-auto"
            />
            <h1 className="text-white text-lg font-semibold">UC Management</h1>
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
        </div>
      </div>
    </div>
  );
};
