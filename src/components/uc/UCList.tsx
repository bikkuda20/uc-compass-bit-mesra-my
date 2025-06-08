
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Edit, Filter, Loader2, Plus, ArrowLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUCEntries, useFundingAgencies, useFinancialYears } from "@/hooks/useSupabaseData";
import { useNavigate } from "react-router-dom";
import UCForm from "./UCForm";

const UCList = () => {
  const { ucs, loading: ucsLoading, refetch } = useUCEntries();
  const { agencies } = useFundingAgencies();
  const { years } = useFinancialYears();
  const navigate = useNavigate();
  
  const [filteredUcs, setFilteredUcs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUc, setEditingUc] = useState<any>(null);
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

  if (ucsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading UC entries...</span>
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold text-slate-800">UC Tracker</h2>
        </div>
        <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New UC Tracker
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by PI Name or Project Code"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.fundingAgency}
              onValueChange={(value) => setFilters({ ...filters, fundingAgency: value })}
            >
              <SelectTrigger>
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
              <SelectTrigger>
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
              <SelectTrigger>
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
              <SelectTrigger>
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
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Funding Agency</TableHead>
                <TableHead>Financial Year</TableHead>
                <TableHead>PI Name</TableHead>
                <TableHead>Project Code</TableHead>
                <TableHead>Project Type</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>UC Received</TableHead>
                <TableHead>UC Verified</TableHead>
                <TableHead>AR Finance Check</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUcs.map((uc) => (
                <TableRow key={uc.id}>
                  <TableCell className="font-medium">{uc.funding_agency.name}</TableCell>
                  <TableCell>{uc.financial_year.year}</TableCell>
                  <TableCell>{uc.principal_investigator.name}</TableCell>
                  <TableCell>{uc.project_code}</TableCell>
                  <TableCell>{uc.project_type}</TableCell>
                  <TableCell>{getStatusBadge(uc.current_status)}</TableCell>
                  <TableCell>{uc.uc_received_date || "-"}</TableCell>
                  <TableCell>{uc.uc_verified_date || "-"}</TableCell>
                  <TableCell>{uc.uc_checked_ar_finance_date || "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUc(uc)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => console.log("Download UC:", uc.uc_file_name)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredUcs.length === 0 && !ucsLoading && (
        <div className="text-center py-8">
          <p className="text-slate-500">No UCs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default UCList;
