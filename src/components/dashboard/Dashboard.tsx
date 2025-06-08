
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building, Calendar, FileText, TrendingUp, Clock, CheckCircle, Upload } from "lucide-react";
import { useFundingAgencies, useFinancialYears, usePrincipalInvestigators } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [ucs, setUcs] = useState<any[]>([]);
  const [recentUploadedUCs, setRecentUploadedUCs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { agencies } = useFundingAgencies();
  const { years } = useFinancialYears();
  const { pis } = usePrincipalInvestigators();
  const { toast } = useToast();

  const [stats, setStats] = useState({
    totalUCs: 0,
    pendingUCs: 0,
    verifiedUCs: 0,
    submittedUCs: 0,
  });

  // Fetch all UC entries for dashboard (not filtered by tracking status)
  const fetchAllUCEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('uc_entries')
        .select(`
          *,
          funding_agency:funding_agencies(id, name),
          financial_year:financial_years(id, year),
          principal_investigator:principal_investigators(id, name, email, department),
          scheme:schemes(id, name, description)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching UC entries:', error);
        toast({
          title: "Error",
          description: "Failed to fetch UC entries",
          variant: "destructive",
        });
        return;
      }

      setUcs(data || []);
      
      // Filter recently uploaded UCs (those without uc_received_date)
      const uploadedUCs = (data || []).filter(uc => !uc.uc_received_date).slice(0, 5);
      setRecentUploadedUCs(uploadedUCs);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUCEntries();
  }, []);

  useEffect(() => {
    if (ucs.length > 0) {
      const totalUCs = ucs.length;
      const pendingUCs = ucs.filter(uc => uc.status === 'Pending').length;
      const verifiedUCs = ucs.filter(uc => uc.status === 'Verified').length;
      const submittedUCs = ucs.filter(uc => uc.status === 'Submitted').length;

      setStats({
        totalUCs,
        pendingUCs,
        verifiedUCs,
        submittedUCs,
      });
    }
  }, [ucs]);

  const getActiveYear = () => {
    return years.find(year => year.is_active)?.year || 'N/A';
  };

  const getRecentUCs = () => {
    return ucs
      .filter(uc => uc.uc_received_date) // Only show received UCs in tracking
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Pending: { variant: "secondary" as const, className: "bg-orange-100 text-orange-800" },
      Submitted: { variant: "secondary" as const, className: "bg-blue-100 text-blue-800" },
      Verified: { variant: "secondary" as const, className: "bg-green-100 text-green-800" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to the UC Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total UCs</p>
                <p className="text-3xl font-bold">{stats.totalUCs}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pending UCs</p>
                <p className="text-3xl font-bold">{stats.pendingUCs}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Verified UCs</p>
                <p className="text-3xl font-bold">{stats.verifiedUCs}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Submitted UCs</p>
                <p className="text-3xl font-bold">{stats.submittedUCs}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-gray-900">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Principal Investigators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">{pis.length}</div>
            <p className="text-gray-600 text-sm">Total registered PIs</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-gray-900">
              <Building className="h-5 w-5 mr-2 text-green-600" />
              Funding Agencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">{agencies.length}</div>
            <p className="text-gray-600 text-sm">Active agencies</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-gray-900">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Active Financial Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">{getActiveYear()}</div>
            <p className="text-gray-600 text-sm">Current fiscal year</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent UCs and Recently Uploaded UCs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent UC Submissions (tracking) */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-gray-900">Recent UC Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {getRecentUCs().length > 0 ? (
              <div className="space-y-4">
                {getRecentUCs().map((uc) => (
                  <div key={uc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{uc.project_code}</p>
                      <p className="text-sm text-gray-600">{uc.principal_investigator.name}</p>
                      <p className="text-xs text-gray-500">{uc.funding_agency.name} • {uc.financial_year.year}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(uc.status)}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(uc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No UC submissions found</p>
            )}
          </CardContent>
        </Card>

        {/* Recently Uploaded UCs */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Upload className="h-5 w-5 mr-2 text-indigo-600" />
              Recently Uploaded UCs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentUploadedUCs.length > 0 ? (
              <div className="space-y-4">
                {recentUploadedUCs.map((uc) => (
                  <div key={uc.id} className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{uc.project_code}</p>
                      <p className="text-sm text-gray-600">{uc.principal_investigator.name}</p>
                      <p className="text-xs text-gray-500">{uc.funding_agency.name} • {uc.financial_year.year}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                        UPLOADED
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(uc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recently uploaded UCs found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
