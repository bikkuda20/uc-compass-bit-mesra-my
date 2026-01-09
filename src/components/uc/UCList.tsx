import { useState } from "react";
import { useUCEntries } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Edit,
  Eye,
  Trash2,
  FileText,
  Building,
  Calendar,
  User,
  Layers,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UCProgressTracker from "./UCProgressTracker";
import UCDetailsModal from "./UCDetailsModal";

interface UCListProps {
  onEditTracker?: (ucId: string) => void;
  onCreateUC?: () => void;
}

const UCList = ({ onEditTracker, onCreateUC }: UCListProps) => {
  const { ucs, loading, refetch, deleteUCEntry } = useUCEntries();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUC, setSelectedUC] = useState<any>(null);
  const { toast } = useToast();

  const filteredUCs = ucs.filter((uc) => {
    const matchesSearch =
      uc.project_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uc.project_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uc.project_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uc.principal_investigator?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      uc.funding_agency?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      uc.uc_entry_no?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || uc.current_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (ucId: string, label: string) => {
    if (window.confirm(`Delete UC entry ${label}?`)) {
      const success = await deleteUCEntry(ucId);
      if (success) {
        toast({
          title: "Deleted",
          description: "UC entry deleted successfully",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Loading UC entries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">
          UC Progress Tracker
        </h1>

        <div className="flex gap-2">
          {onCreateUC && (
            <Button onClick={onCreateUC}>Create New UC</Button>
          )}
          <Button variant="outline" onClick={refetch}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search by title, type, code, PI, agency, UC no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Received from PI">Received</SelectItem>
            <SelectItem value="Verified by Related Person">Verified</SelectItem>
            <SelectItem value="Checked by AR Finance">AR Finance</SelectItem>
            <SelectItem value="Sent to Deputy Comptroller">Deputy</SelectItem>
            <SelectItem value="Sent to Registrar Office">Registrar</SelectItem>
            <SelectItem value="Handed Over to PI">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* UC Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUCs.map((uc) => (
          <Card key={uc.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-blue-700">
                    {uc.uc_entry_no || "No Entry Number"}
                  </CardTitle>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      {uc.funding_agency?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {uc.financial_year?.year}
                    </span>
                  </div>
                </div>

                <Badge>{uc.current_status}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Project Title */}
              {uc.project_title && (
                <div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs font-medium">
                    <FileText className="w-4 h-4" />
                    Project Title
                  </div>
                  <div className="ml-5 text-sm font-semibold text-slate-800 line-clamp-2">
                    {uc.project_title}
                  </div>
                </div>
              )}

              {/* Project Type */}
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span className="text-xs text-gray-500 font-medium">
                  Project Type
                </span>
                <Badge
                  variant="secondary"
                  className="bg-teal-100 text-teal-800 font-semibold"
                >
                  {uc.project_type || "N/A"}
                </Badge>
              </div>

              {/* PI & Project Code */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-gray-500" />
                  {uc.principal_investigator?.name}
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <FileText className="w-4 h-4 text-gray-500" />
                  {uc.project_code}
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="bg-gray-50 p-3 rounded-lg overflow-x-auto">
                <UCProgressTracker
                  uc={uc}
                  variant="horizontal"
                  size="sm"
                  showLabels
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedUC(uc)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditTracker?.(uc.id)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600"
                  onClick={() =>
                    handleDelete(
                      uc.id,
                      uc.uc_entry_no || uc.project_code
                    )
                  }
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <UCDetailsModal
        uc={selectedUC}
        isOpen={!!selectedUC}
        onClose={() => setSelectedUC(null)}
      />
    </div>
  );
};

export default UCList;
