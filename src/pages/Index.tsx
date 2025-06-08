
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Users, Calendar, Building, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { useUCEntries, usePrincipalInvestigators, useFundingAgencies, useFinancialYears } from "@/hooks/useSupabaseData";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { ucs, loading: ucsLoading } = useUCEntries();
  const { pis, loading: pisLoading } = usePrincipalInvestigators();
  const { agencies, loading: agenciesLoading } = useFundingAgencies();
  const { years, loading: yearsLoading } = useFinancialYears();
  const navigate = useNavigate();

  const pendingUCs = ucs.filter(uc => uc.status === 'Pending').length;
  const submittedUCs = ucs.filter(uc => uc.status === 'Submitted').length;
  const verifiedUCs = ucs.filter(uc => uc.status === 'Verified').length;
  const activeYear = years.find(year => year.is_active)?.year || "Not Set";

  const stats = [
    {
      title: "Total UCs",
      value: ucsLoading ? "..." : ucs.length.toString(),
      description: "All UC entries",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Pending UCs",
      value: ucsLoading ? "..." : pendingUCs.toString(),
      description: "Awaiting submission",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      title: "Verified UCs",
      value: ucsLoading ? "..." : verifiedUCs.toString(),
      description: "Completed UCs",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Active PIs",
      value: pisLoading ? "..." : pis.length.toString(),
      description: "Principal Investigators",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6 space-y-6">
            <SidebarTrigger className="mb-4" />
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <h1 className="text-3xl font-bold mb-2">UC Management Dashboard</h1>
              <p className="text-blue-100">
                Birla Institute of Technology, Mesra - R&D Cell
              </p>
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Current FY: {activeYear}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title} className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-700">
                        {stat.title}
                      </CardTitle>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-3xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 border-2">
                <CardHeader>
                  <CardTitle className="text-green-700">Quick Actions</CardTitle>
                  <CardDescription className="text-green-600">
                    Common tasks for UC management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => navigate('/uc-tracker')}
                    className="w-full justify-start h-12 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New UC Entry
                  </Button>
                  <Button 
                    onClick={() => navigate('/uc-tracker')}
                    className="w-full justify-start h-12 bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View All UC Entries
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 border-2">
                <CardHeader>
                  <CardTitle className="text-purple-700">Manage Data</CardTitle>
                  <CardDescription className="text-purple-600">
                    Manage investigators, agencies, and financial years
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => navigate('/investigators')}
                    className="w-full justify-start h-12 bg-purple-600 hover:bg-purple-700"
                    variant="outline"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Investigators
                  </Button>
                  <Button 
                    onClick={() => navigate('/agencies')}
                    className="w-full justify-start h-12 bg-indigo-600 hover:bg-indigo-700"
                    variant="outline"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Manage Agencies
                  </Button>
                  <Button 
                    onClick={() => navigate('/years')}
                    className="w-full justify-start h-12 bg-cyan-600 hover:bg-cyan-700"
                    variant="outline"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Manage Financial Years
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 border-2">
              <CardHeader>
                <CardTitle className="text-amber-700 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Recent UC Entries
                </CardTitle>
                <CardDescription className="text-amber-600">
                  Latest submissions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ucsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                    <p className="text-amber-600 mt-2">Loading recent entries...</p>
                  </div>
                ) : ucs.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                    <p className="text-amber-600">No UC entries found.</p>
                    <Button 
                      onClick={() => navigate('/uc-tracker')}
                      className="mt-3 bg-amber-600 hover:bg-amber-700"
                    >
                      Add Your First UC Entry
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ucs.slice(0, 5).map((uc) => (
                      <div key={uc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-200">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{uc.project_code}</p>
                          <p className="text-sm text-slate-600">{uc.principal_investigator.name}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            uc.status === 'Verified' ? 'bg-green-100 text-green-800' :
                            uc.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {uc.status}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(uc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {ucs.length > 5 && (
                      <Button 
                        onClick={() => navigate('/uc-tracker')}
                        variant="outline" 
                        className="w-full mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
                      >
                        View All {ucs.length} Entries
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
