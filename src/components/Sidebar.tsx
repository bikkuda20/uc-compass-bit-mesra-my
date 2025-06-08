
import { Home, FileText, Settings, Users, Building, Calendar, FolderOpen, Upload } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    iconColor: "text-blue-600",
    hoverColor: "hover:bg-blue-50 hover:text-blue-700",
  },
  {
    title: "UC Tracker",
    url: "/uc-tracker",
    icon: FileText,
    iconColor: "text-green-600",
    hoverColor: "hover:bg-green-50 hover:text-green-700",
  },
  {
    title: "UC Upload",
    url: "/uc-upload",
    icon: Upload,
    iconColor: "text-purple-600",
    hoverColor: "hover:bg-purple-50 hover:text-purple-700",
  },
  {
    title: "UC File Manager",
    url: "/uc-files",
    icon: FolderOpen,
    iconColor: "text-orange-600",
    hoverColor: "hover:bg-orange-50 hover:text-orange-700",
  },
  {
    title: "Principal Investigators",
    url: "/investigators",
    icon: Users,
    iconColor: "text-indigo-600",
    hoverColor: "hover:bg-indigo-50 hover:text-indigo-700",
  },
  {
    title: "Funding Agencies",
    url: "/agencies",
    icon: Building,
    iconColor: "text-cyan-600",
    hoverColor: "hover:bg-cyan-50 hover:text-cyan-700",
  },
  {
    title: "Financial Years",
    url: "/years",
    icon: Calendar,
    iconColor: "text-yellow-600",
    hoverColor: "hover:bg-yellow-50 hover:text-yellow-700",
  },
];

const adminItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    iconColor: "text-gray-600",
    hoverColor: "hover:bg-gray-50 hover:text-gray-700",
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-gray-200 bg-gradient-to-b from-white to-gray-50">
      <SidebarHeader>
        <div className="p-4">
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            UC Management
          </h2>
          <p className="text-sm text-slate-500">System</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 font-semibold">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className={`
                      ${location.pathname === item.url 
                        ? 'bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 border-r-2 border-blue-500' 
                        : 'text-gray-700'
                      } 
                      ${item.hoverColor} 
                      transition-all duration-200 ease-in-out rounded-lg mx-2 mb-1
                    `}
                  >
                    <Link to={item.url} className="flex items-center space-x-3 p-2">
                      <item.icon className={`w-5 h-5 ${location.pathname === item.url ? 'text-blue-600' : item.iconColor}`} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 font-semibold">Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className={`
                      ${location.pathname === item.url 
                        ? 'bg-gradient-to-r from-blue-100 to-green-100 text-blue-700 border-r-2 border-blue-500' 
                        : 'text-gray-700'
                      } 
                      ${item.hoverColor} 
                      transition-all duration-200 ease-in-out rounded-lg mx-2 mb-1
                    `}
                  >
                    <Link to={item.url} className="flex items-center space-x-3 p-2">
                      <item.icon className={`w-5 h-5 ${location.pathname === item.url ? 'text-blue-600' : item.iconColor}`} />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-sm text-slate-500 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg mx-2 mb-2">
          <p className="font-medium">Version 1.0.0</p>
          <p className="text-xs">R&D Cell Management</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
