import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Filter, Loader2, Plus, ArrowLeft, Eye, FileText, Trash2, Sparkles, Stars } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUCEntries, useFundingAgencies, useFinancialYears } from "@/hooks/useSupabaseData";
import { useNavigate } from "react-router-dom";
import UCForm from "./UCForm";
import UCProgressTracker from "./UCProgressTracker";
import UCDetailsModal from "./UCDetailsModal";

const UCList = () => {
  const { ucs, loading: ucsLoading, refetch, deleteUCEntry } = useUCEntries();
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
          uc.project_code.toLowerCase().includes(filters.search.toLowerCase()) ||
          (uc.uc_entry_no && uc.uc_entry_no.toLowerCase().includes(filters.search.toLowerCase()))
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

  const handleDeleteUc = async (ucId: string) => {
    const success = await deleteUCEntry(ucId);
    if (success) {
      // Entry will be automatically removed from the list by the refetch in deleteUCEntry
    }
  };

  if (ucsLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 animate-pulse"></div>
        <div className="text-center relative z-10">
          <div className="relative mb-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Loading UC trackers...
          </span>
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
    <div className="p-6 space-y-8 bg-gradient-to-br from-blue-50 via-purple-50 via-pink-50 to-amber-50 min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/15 to-amber-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-emerald-400/15 to-teal-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 hover:text-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-xl rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FileText className="w-10 h-10 text-blue-600 drop-shadow-lg" />
              <Stars className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
              UC Tracker
            </h2>
          </div>
        </div>
        <Button 
          onClick={handleAddNew} 
          className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl text-white font-bold px-8 py-3"
        >
          <Plus className="w-5 h-5 mr-2" />
          <Sparkles className="w-4 h-4 mr-2" />
          Create UC Tracker
        </Button>
      </div>

      {/* Enhanced Info Card */}
      <Card className="shadow-xl border-0 bg-gradient-to-r from-blue-50/90 to-purple-50/90 backdrop-blur-sm border-blue-200/50 rounded-2xl transform hover:scale-[1.02] transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 text-blue-700">
            <div className="relative">
              <FileText className="w-6 h-6" />
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-lg opacity-20 animate-pulse"></div>
            </div>
            <p className="text-sm font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              UC Tracker shows only UCs received from PIs for workflow tracking. Uploaded UCs are managed separately in UC Files.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Filters */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
          <CardTitle className="flex items-center text-xl font-bold">
            <Filter className="w-6 h-6 mr-3" />
            <Sparkles className="w-5 h-5 mr-2" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 bg-gradient-to-br from-white/95 to-blue-50/30">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="relative transform hover:scale-105 transition-transform duration-200">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
              <Input
                placeholder="Search by PI Name, Project Code, or UC Entry No"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 border-2 border-blue-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-white/80"
              />
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200">
              <Select
                value={filters.fundingAgency}
                onValueChange={(value) => setFilters({ ...filters, fundingAgency: value })}
              >
                <SelectTrigger className="border-2 border-blue-200 focus:border-purple-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-white/80">
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
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200">
              <Select
                value={filters.financialYear}
                onValueChange={(value) => setFilters({ ...filters, financialYear: value })}
              >
                <SelectTrigger className="border-2 border-blue-200 focus:border-purple-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-white/80">
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
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200">
              <Select
                value={filters.projectType}
                onValueChange={(value) => setFilters({ ...filters, projectType: value })}
              >
                <SelectTrigger className="border-2 border-blue-200 focus:border-purple-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-white/80">
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
            </div>
            <div className="transform hover:scale-105 transition-transform duration-200">
              <Select
                value={filters.currentStatus}
                onValueChange={(value) => setFilters({ ...filters, currentStatus: value })}
              >
                <SelectTrigger className="border-2 border-blue-200 focus:border-purple-500 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 bg-white/80">
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
          </div>
        </CardContent>
      </Card>

      {/* Enhanced UC Table */}
      <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300">
                  <TableHead className="font-bold text-white shadow-lg">UC Entry No</TableHead>
                  <TableHead className="font-bold text-white shadow-lg">Funding Agency</TableHead>
                  <TableHead className="font-bold text-white shadow-lg">Financial Year</TableHead>
                  <TableHead className="font-bold text-white shadow-lg">PI Name</TableHead>
                  <TableHead className="font-bold text-white shadow-lg">Project Code</TableHead>
                  <TableHead className="font-bold text-white shadow-lg">Project Type</TableHead>
                  <TableHead className="font-bold text-white shadow-lg">Progress</TableHead>
                  <TableHead className="font-bold text-white shadow-lg">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUcs.map((uc, index) => (
                  <TableRow 
                    key={uc.id} 
                    className={`hover:bg-gradient-to-r hover:from-blue-50/80 hover:via-purple-50/50 hover:to-pink-50/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${
                      index % 2 === 0 ? 'bg-white/70' : 'bg-gradient-to-r from-blue-50/30 to-purple-50/20'
                    }`}
                  >
                    <TableCell className="font-medium break-words max-w-24">
                      <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 text-blue-700 font-bold">
                        {uc.uc_entry_no || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium break-words max-w-32">{uc.funding_agency.name}</TableCell>
                    <TableCell className="break-words">
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200/50 text-orange-700 font-medium text-center">
                        {uc.financial_year.year}
                      </div>
                    </TableCell>
                    <TableCell className="break-words max-w-32">{uc.principal_investigator.name}</TableCell>
                    <TableCell className="break-words max-w-24 font-mono text-sm">
                      <div className="px-2 py-1 rounded-md bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/50 font-bold">
                        {uc.project_code}
                      </div>
                    </TableCell>
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
                          className="hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUc(uc)}
                          className="hover:bg-green-100 hover:text-green-700 transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-red-100 hover:text-red-700 transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete UC Entry</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this UC entry for "{uc.project_code}"? 
                                This action cannot be undone and will permanently remove the entry from the system.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteUc(uc.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl">
          <CardContent className="text-center py-16">
            <div className="relative">
              <FileText className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <Sparkles className="w-6 h-6 text-yellow-400 absolute top-0 right-1/2 transform translate-x-8 animate-pulse" />
            </div>
            <p className="text-xl font-bold text-gray-500 mb-2">No UC trackers found.</p>
            <p className="text-gray-400 text-sm">Create a new UC tracker to start tracking UCs received from PIs.</p>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mt-4 opacity-50"></div>
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
