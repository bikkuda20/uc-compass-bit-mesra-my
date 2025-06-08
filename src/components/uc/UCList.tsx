
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Edit, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface UCListProps {
  onEdit: (uc: any) => void;
  onNew: () => void;
}

const UCList = ({ onEdit, onNew }: UCListProps) => {
  const [ucs, setUcs] = useState<any[]>([]);
  const [filteredUcs, setFilteredUcs] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    fundingAgency: "",
    financialYear: "",
    status: "",
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockUCs = [
      {
        id: 1,
        fundingAgency: "DST",
        financialYear: "2024-2025",
        piName: "Dr. Rajesh Kumar",
        projectCode: "DST/2024/001",
        status: "Pending",
        dateReceived: "2024-03-15",
        dateGiven: "",
        ucFile: "uc_rajesh_dst_2024.pdf",
        sanctionLetter: "sanction_rajesh_dst_2024.pdf",
        createdAt: "2024-03-10",
      },
      {
        id: 2,
        fundingAgency: "DRDO",
        financialYear: "2024-2025",
        piName: "Dr. Priya Sharma",
        projectCode: "DRDO/2024/002",
        status: "Submitted",
        dateReceived: "2024-02-20",
        dateGiven: "2024-03-01",
        ucFile: "uc_priya_drdo_2024.pdf",
        sanctionLetter: "sanction_priya_drdo_2024.pdf",
        createdAt: "2024-02-15",
      },
      {
        id: 3,
        fundingAgency: "ISRO",
        financialYear: "2023-2024",
        piName: "Dr. Amit Singh",
        projectCode: "ISRO/2023/003",
        status: "Verified",
        dateReceived: "2024-01-10",
        dateGiven: "2024-01-25",
        ucFile: "uc_amit_isro_2023.pdf",
        sanctionLetter: "sanction_amit_isro_2023.pdf",
        createdAt: "2024-01-05",
      },
    ];
    setUcs(mockUCs);
    setFilteredUcs(mockUCs);
  }, []);

  useEffect(() => {
    let filtered = ucs;

    if (filters.search) {
      filtered = filtered.filter(
        (uc) =>
          uc.piName.toLowerCase().includes(filters.search.toLowerCase()) ||
          uc.projectCode.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.fundingAgency) {
      filtered = filtered.filter((uc) => uc.fundingAgency === filters.fundingAgency);
    }

    if (filters.financialYear) {
      filtered = filtered.filter((uc) => uc.financialYear === filters.financialYear);
    }

    if (filters.status) {
      filtered = filtered.filter((uc) => uc.status === filters.status);
    }

    setFilteredUcs(filtered);
  }, [filters, ucs]);

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

  const fundingAgencies = ["DST", "DRDO", "ISRO", "UGC", "AICTE"];
  const financialYears = ["2024-2025", "2023-2024", "2022-2023"];
  const statuses = ["Pending", "Submitted", "Verified"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">UC Tracker</h2>
        <Button onClick={onNew} className="bg-blue-600 hover:bg-blue-700">
          Add New UC
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <SelectItem value="">All Agencies</SelectItem>
                {fundingAgencies.map((agency) => (
                  <SelectItem key={agency} value={agency}>
                    {agency}
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
                <SelectItem value="">All Years</SelectItem>
                {financialYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                {statuses.map((status) => (
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
                <TableHead>Status</TableHead>
                <TableHead>Date Received</TableHead>
                <TableHead>Date Given</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUcs.map((uc) => (
                <TableRow key={uc.id}>
                  <TableCell className="font-medium">{uc.fundingAgency}</TableCell>
                  <TableCell>{uc.financialYear}</TableCell>
                  <TableCell>{uc.piName}</TableCell>
                  <TableCell>{uc.projectCode}</TableCell>
                  <TableCell>{getStatusBadge(uc.status)}</TableCell>
                  <TableCell>{uc.dateReceived || "-"}</TableCell>
                  <TableCell>{uc.dateGiven || "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(uc)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => console.log("Download UC:", uc.ucFile)}
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

      {filteredUcs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-500">No UCs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default UCList;
