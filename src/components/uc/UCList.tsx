
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Filter, Loader2, Plus, ArrowLeft, Eye, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUCEntries, useFundingAgencies, useFinancialYears } from "@/hooks/useSupabaseData";
import { useNavigate } from "react-router-dom";
import UCForm from "./UCForm";
import UCProgressTracker from "./UCProgressTracker";
import UCDetailsModal from "./UCDetailsModal";

const UCList = () => {
  const { ucs, loading: ucsLoading, refetch } = useUCEntries();
  const { agencies } = useFundingAgencies();
  const { years } = useFinancialYears();
  const navigate = useNavigate();
  
  const [filteredUcs, setFilteredUcs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUc, setEditingUc] = useState<any>(null);
  const [selectedUc, setSelectedUc] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    fundingAgency: "all",
    financialYear: "all",
    currentStatus: "all",
    projectType: "all",
  });

  useEffect(() => {
    let filtered = ucs;

    if (filters.search) {
      filtered = filtered.filter(
        (uc) =>
          uc.principal_investigator.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          uc.project_code.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.fundingAgency && filters.fundingAgency !== "all") {
      filtered = filtered.filter((uc) => uc.funding_agency.name === filters.fundingAgency);
    }

    if (filters.financialYear && filters.financialYear !== "all") {
      filtered = filtered.filter((uc) => uc.financial_year.year === filters.financialYear);
    }

    if (filters.currentStatus && filters.currentStatus !== "all") {
      filtered = filtered.filter((uc) => uc.current_status === filters.currentStatus);
    }

    if (filters.projectType && filters.projectType !== "all") {
      filtered = filtered.filter((uc) => uc.project_type === filters.projectType);
    }

    setFilteredUcs(filtered);
  }, [filters, ucs]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Not Started": { variant: "secondary" as const, className: "bg-gray-100 text-gray-800" },
      "Received from PI": { variant: "secondary" as const, className: "bg-blue-100 text-blue-800" },
      "Verified by Related Person": { variant: "secondary" as const, className: "bg-indigo-100 text-indigo-800" },
      "Checked by AR Finance": { variant: "secondary" as const, className: "bg-purple-100 text-purple-800" },
      "Sent to Deputy Comptroller": { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
      "Sent to Registrar Office": { variant: "secondary" as const, className: "bg-orange-100 text-orange-800" },
      "Returned from Registrar Office": { variant: "secondary" as const, className: "bg-cyan-100 text-cyan-800" },
      "Handed Over to PI": { variant: "secondary" as const, className: "bg-green-100 text-green-800" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["Not Started"];
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const currentStatuses = [
    "Not Started",
    "Received from PI", 
    "Verified by Related Person",
    "Checked by AR Finance",
    "Sent to Deputy Comptroller",
    "Sent to Registrar Office",
    "Returned from Registrar Office",
    "Handed Over to PI"
  ];
  const projectTypes = ["Project", "Workshop", "Seminar", "Symposium", "Conference"];

  const handleFormComplete = () => {
    setShowForm(false);
    setEditingUc(null);
    refetch();
  };

  const handleEditUc = (uc: any) => {
    setEditingUc(uc);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingUc(null);
    setShowForm(true);
  };

  const handleViewDetails = (uc: any) => {
    setSelectedUc(uc);
    setShowDetailsModal(true);
  };

  if (ucsLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <span className="text-blue-700 font-medium">Loading UC entries...</span>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <UCForm
        uc={editingUc}
        onComplete={handleFormComplete}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              UC Tracker
            </h2>
          </div>
        </div>
        <Button 
          onClick={handleAddNew} 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create UC Tracker
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by PI Name or Project Code"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Select
              value={filters.fundingAgency}
              onValueChange={(value) => setFilters({ ...filters, fundingAgency: value })}
            >
              <SelectTrigger className="border-blue-200 focus:border-blue-500">
                <SelectValue placeholder="Funding Agency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agencies</SelectItem>
                {agencies.map((agency) => (
                  <SelectItem key={agency.id} value={agency.name}>
                    {agency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.financialYear}
              onValueChange={(value) => setFilters({ ...filters, financialYear: value })}
            >
              <SelectTrigger className="border-blue-200 focus:border-blue-500">
                <SelectValue placeholder="Financial Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year.id} value={year.year}>
                    {year.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.projectType}
              onValueChange={(value) => setFilters({ ...filters, projectType: value })}
            >
              <SelectTrigger className="border-blue-200 focus:border-blue-500">
                <SelectValue placeholder="Project Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {projectTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.currentStatus}
              onValueChange={(value) => setFilters({ ...filters, currentStatus: value })}
            >
              <SelectTrigger className="border-blue-200 focus:border-blue-500">
                <SelectValue placeholder="Current Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {currentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* UC Table */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                  <TableHead className="font-semibold text-slate-700">Funding Agency</TableHead>
                  <TableHead className="font-semibold text-slate-700">Financial Year</TableHead>
                  <TableHead className="font-semibold text-slate-700">PI Name</TableHead>
                  <TableHead className="font-semibold text-slate-700">Project Code</TableHead>
                  <TableHead className="font-semibold text-slate-700">Project Type</TableHead>
                  <TableHead className="font-semibold text-slate-700">Progress</TableHead>
                  <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUcs.map((uc) => (
                  <TableRow key={uc.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    <TableCell className="font-medium break-words max-w-32">{uc.funding_agency.name}</TableCell>
                    <TableCell className="break-words">{uc.financial_year.year}</TableCell>
                    <TableCell className="break-words max-w-32">{uc.principal_investigator.name}</TableCell>
                    <TableCell className="break-words max-w-24 font-mono text-sm">{uc.project_code}</TableCell>
                    <TableCell className="break-words">{uc.project_type}</TableCell>
                    <TableCell className="min-w-80">
                      <div className="space-y-2">
                        <UCProgressTracker 
                          uc={uc} 
                          variant="horizontal" 
                          showLabels={false}
                          size="sm"
                        />
                        <div className="text-xs text-center">
                          {getStatusBadge(uc.current_status)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(uc)}
                          className="hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUc(uc)}
                          className="hover:bg-green-100 hover:text-green-700 transition-colors duration-200"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredUcs.length === 0 && !ucsLoading && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No UCs found matching your criteria.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or create a new UC tracker.</p>
          </CardContent>
        </Card>
      )}

      <UCDetailsModal 
        uc={selectedUc}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
};

export default UCList;
