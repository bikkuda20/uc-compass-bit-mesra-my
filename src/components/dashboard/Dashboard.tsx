
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, TrendingUp, Settings, Users, Calendar, Building2, UserCheck, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "UC Upload",
      description: "Upload new UC files and sanction letters",
      icon: Upload,
      path: "/uc-upload",
      color: "bg-blue-500",
    },
    {
      title: "UC Tracker",
      description: "Track the progress of UC submissions",
      icon: TrendingUp,
      path: "/uc-tracker",
      color: "bg-green-500",
    },
    {
      title: "UC File Manager",
      description: "Manage and organize UC files",
      icon: FileText,
      path: "/uc-file-manager",
      color: "bg-purple-500",
    },
    {
      title: "UC Reports",
      description: "Generate and export UC reports",
      icon: BarChart3,
      path: "/uc-reports",
      color: "bg-orange-500",
    },
    {
      title: "Funding Agencies",
      description: "Manage funding agencies",
      icon: Building2,
      path: "/agencies",
      color: "bg-indigo-500",
    },
    {
      title: "Financial Years",
      description: "Manage financial years",
      icon: Calendar,
      path: "/years",
      color: "bg-teal-500",
    },
    {
      title: "Principal Investigators",
      description: "Manage PI information",
      icon: UserCheck,
      path: "/investigators",
      color: "bg-pink-500",
    },
    {
      title: "User Management",
      description: "Manage system users",
      icon: Users,
      path: "/user-management",
      color: "bg-red-500",
    },
    {
      title: "Settings",
      description: "System configuration and settings",
      icon: Settings,
      path: "/settings",
      color: "bg-gray-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            UC Management System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your Utilization Certificate management with our comprehensive tracking and reporting system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
              onClick={() => navigate(item.path)}
            >
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="ghost" 
                  className="w-full group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
                >
                  Access Module
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            Built for efficient UC management and compliance tracking
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
