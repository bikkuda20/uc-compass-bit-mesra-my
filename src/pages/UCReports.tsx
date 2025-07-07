
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileBarChart, Download, RefreshCw, Calendar, Filter } from "lucide-react";
import { useFinancialYears, useFundingAgencies } from "@/hooks/useSupabaseData";
import UCProgressTracker from "@/components/uc/UCProgressTracker";

const UCReports = () => {
  const [ucEntries, setUcEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState<string>("");
  const [selectedFundingAgency, setSelectedFundingAgency] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const { toast } = useToast();
  const { years } = useFinancialYears();
  const { agencies } = useFundingAgencies();

  const fetchUCReports = async () => {
    try {
      setLoading(true);
      console.log('Fetching UC reports...');
      
      let query = supabase
        .from('uc_entries')
        .select(`
          *,
          funding_agency:funding_agencies(id, name),
          financial_year:financial_years(id, year),
          principal_investigator:principal_investigators(id, name, email, department),
          scheme:schemes(id, name, description)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (selectedFinancialYear) {
        query = query.eq('financial_year_id', selectedFinancialYear);
      }

      if (selectedFundingAgency) {
        query = query.eq('funding_agency_id', selectedFundingAgency);
      }

      if (dateRange.startDate) {
        query = query.gte('created_at', dateRange.startDate);
      }

      if (dateRange.endDate) {
        query = query.lte('created_at', dateRange.endDate + 'T23:59:59');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Fetched UC reports:', data);
      setUcEntries(data || []);
      
    } catch (error: any) {
      console.error('Error fetching UC reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch UC reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'UC Entry No',
      'Project Code',
      'Project Title',
      'PI Name',
      'Funding Agency',
      'Financial Year',
      'Status',
      'UC Received Date',
      'UC Verified Date',
      'UC Checked AR Finance Date',
      'UC Sent Deputy Comptroller Date',
      'UC Sent Registrar Date',
      'UC Returned Registrar Date',
      'UC Handed Over PI Date',
      'Current Status'
    ];

    const csvData = [
      headers.join(','),
      ...ucEntries.map((entry: any) => [
        entry.uc_entry_no || '',
        entry.project_code || '',
        entry.project_title || '',
        entry.principal_investigator?.name || '',
        entry.funding_agency?.name || '',
        entry.financial_year?.year || '',
        entry.status || '',
        entry.uc_received_date || '',
        entry.uc_verified_date || '',
        entry.uc_checked_ar_finance_date || '',
        entry.uc_sent_deputy_comptroller_date || '',
        entry.uc_sent_registrar_date || '',
        entry.uc_returned_registrar_date || '',
        entry.uc_handed_over_pi_date || '',
        entry.current_status || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uc-reports-${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Report exported successfully",
    });
  };

  const getStatusSummary = () => {
    const summary = {
      total: ucEntries.length,
      handedOver: ucEntries.filter((entry: any) => entry.uc_handed_over_pi_date).length,
      inProgress: ucEntries.filter((entry: any) => entry.uc_received_date && !entry.uc_handed_over_pi_date).length,
      notStarted: ucEntries.filter((entry: any) => !entry.uc_received_date).length
    };
    return summary;
  };

  useEffect(() => {
    fetchUCReports();
  }, [selectedFinancialYear, selectedFundingAgency, dateRange]);

  const statusSummary = getStatusSummary();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Sidebar />
        <SidebarInset>
          <div className="flex-1 ml-64 p-6">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden mb-6">
              <CardHeader className="bg-gradient-to-r from-slate-700 via-blue-700 to-indigo-700 text-white">
                <CardTitle className="text-3xl font-bold flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileBarChart className="h-8 w-8 text-white" />
                    <span>UC Tracker Reports</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button 
                      onClick={exportToCSV}
                      variant="outline"
                      size="sm"
                      disabled={loading || ucEntries.length === 0}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button 
                      onClick={fetchUCReports}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="space-y-6">
              {/* Filters */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>Report Filters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="financialYear">Financial Year</Label>
                      <Select 
                        value={selectedFinancialYear} 
                        onValueChange={setSelectedFinancialYear}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Years</SelectItem>
                          {years.map((year) => (
                            <SelectItem key={year.id} value={year.id}>
                              {year.year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fundingAgency">Funding Agency</Label>
                      <Select 
                        value={selectedFundingAgency} 
                        onValueChange={setSelectedFundingAgency}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Agencies" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Agencies</SelectItem>
                          {agencies.map((agency) => (
                            <SelectItem key={agency.id} value={agency.id}>
                              {agency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button 
                      onClick={() => {
                        setSelectedFinancialYear("");
                        setSelectedFundingAgency("");
                        setDateRange({ startDate: "", endDate: "" });
                      }}
                      variant="outline"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{statusSummary.total}</div>
                      <div className="text-sm opacity-90">Total UCs</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{statusSummary.handedOver}</div>
                      <div className="text-sm opacity-90">Handed Over to PI</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{statusSummary.inProgress}</div>
                      <div className="text-sm opacity-90">In Progress</div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{statusSummary.notStarted}</div>
                      <div className="text-sm opacity-90">Not Started</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reports Table */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle>UC Tracker Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <RefreshCw className="h-12 w-12 animate-spin text-blue-600" />
                    </div>
                  ) : ucEntries.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-xl font-bold text-gray-500">No UC entries found</p>
                      <p className="text-gray-400">Try adjusting your filters</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>UC Entry No</TableHead>
                            <TableHead>Project Code</TableHead>
                            <TableHead>Project Title</TableHead>
                            <TableHead>PI Name</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Handed Over Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ucEntries.map((entry: any) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium">
                                {entry.uc_entry_no || 'N/A'}
                              </TableCell>
                              <TableCell>{entry.project_code}</TableCell>
                              <TableCell className="max-w-xs truncate">
                                {entry.project_title || 'N/A'}
                              </TableCell>
                              <TableCell>{entry.principal_investigator?.name}</TableCell>
                              <TableCell>
                                <UCProgressTracker 
                                  uc={entry} 
                                  variant="horizontal" 
                                  showLabels={false}
                                  size="sm"
                                />
                              </TableCell>
                              <TableCell>
                                {entry.uc_handed_over_pi_date ? 
                                  new Date(entry.uc_handed_over_pi_date).toLocaleDateString() : 
                                  'Not Handed Over'
                                }
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  entry.uc_handed_over_pi_date 
                                    ? 'bg-green-100 text-green-800' 
                                    : entry.uc_received_date
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {entry.current_status || 'Not Started'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UCReports;
