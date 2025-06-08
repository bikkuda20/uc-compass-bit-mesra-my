
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, FileText, Users, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UCList from "@/components/uc/UCList";
import UCForm from "@/components/uc/UCForm";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "list" | "form">("dashboard");
  const [editingUC, setEditingUC] = useState<any>(null);
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.reload();
  };

  const handleNewUC = () => {
    setEditingUC(null);
    setCurrentView("form");
  };

  const handleEditUC = (uc: any) => {
    setEditingUC(uc);
    setCurrentView("form");
  };

  const handleFormComplete = () => {
    setCurrentView("list");
    setEditingUC(null);
    toast({
      title: "Success",
      description: editingUC ? "UC updated successfully" : "UC created successfully",
    });
  };

  const stats = [
    {
      title: "Total UCs",
      value: "24",
      description: "All UC entries",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Pending UCs",
      value: "8",
      description: "Awaiting submission",
      icon: TrendingUp,
      color: "text-orange-600",
    },
    {
      title: "Active PIs",
      value: "12",
      description: "Principal Investigators",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Current FY",
      value: "2024-25",
      description: "Financial Year",
      icon: Calendar,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              UC Management System
            </h1>
            <p className="text-sm text-slate-600">
              Birla Institute of Technology, Mesra - R&D Cell
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleNewUC}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New UC Entry
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-slate-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-2">
        <div className="flex space-x-6">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === "dashboard"
                ? "bg-blue-100 text-blue-700"
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setCurrentView("list")}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentView === "list"
                ? "bg-blue-100 text-blue-700"
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            UC Tracker
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {currentView === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-600">
                        {stat.title}
                      </CardTitle>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-800">
                        {stat.value}
                      </div>
                      <p className="text-xs text-slate-600">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks for UC management
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={handleNewUC}
                  className="justify-start h-12"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New UC Entry
                </Button>
                <Button 
                  onClick={() => setCurrentView("list")}
                  className="justify-start h-12"
                  variant="outline"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View All UCs
                </Button>
                <Button 
                  className="justify-start h-12"
                  variant="outline"
                  disabled
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Generate Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === "list" && (
          <UCList onEdit={handleEditUC} onNew={handleNewUC} />
        )}

        {currentView === "form" && (
          <UCForm 
            uc={editingUC} 
            onComplete={handleFormComplete}
            onCancel={() => setCurrentView("list")}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
