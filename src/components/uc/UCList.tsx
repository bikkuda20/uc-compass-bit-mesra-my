import { useState } from "react";
import { useUCEntries } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Edit, Eye, Trash2, FileText, Building, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UCProgressTracker from "./UCProgressTracker";
import UCDetailsModal from "./UCDetailsModal";

interface UCListProps {
  onEditUC?: (ucId: string) => void;
  onCreateUC?: () => void;
}

const UCList = ({ onEditUC, onCreateUC }: UCListProps) => {
  const { ucs, loading, refetch, deleteUCEntry } = useUCEntries();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUC, setSelectedUC] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  const filteredUCs = ucs.filter(uc => {
    const matchesSearch = 
      uc.project_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uc.principal_investigator?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uc.funding_agency?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uc.uc_entry_no?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || uc.current_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleEdit = (ucId: string) => {
    if (onEditUC) {
      onEditUC(ucId);
    }
  };

  const handleViewDetails = (uc: any) => {
    setSelectedUC(uc);
    setDetailsModalOpen(true);
  };

  const handleDelete = async (ucId: string, ucEntryNo: string) => {
    if (window.confirm(`Are you sure you want to delete UC entry ${ucEntryNo}?`)) {
      const success = await deleteUCEntry(ucId);
      if (success) {
        toast({
          title: "Success",
          description: "UC entry deleted successfully",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading UC entries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800">UC Progress Tracker</h1>
        <div className="flex space-x-2">
          {onCreateUC && (
            <Button onClick={onCreateUC} className="bg-blue-600 hover:bg-blue-700">
              Create New UC Tracker
            </Button>
          )}
          <Button onClick={refetch} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by project code, PI name, agency, or UC entry number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="Received from PI">Received from PI</SelectItem>
            <SelectItem value="Verified by Related Person">Verified</SelectItem>
            <SelectItem value="Checked by AR Finance">AR Finance</SelectItem>
            <SelectItem value="Sent to Deputy Comptroller">Deputy Comptroller</SelectItem>
            <SelectItem value="Sent to Registrar Office">To Registrar</SelectItem>
            <SelectItem value="Returned from Registrar Office">From Registrar</SelectItem>
            <SelectItem value="Handed Over to PI">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* UC Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUCs.map((uc) => (
          <Card key={uc.id} className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    {uc.uc_entry_no || 'No Entry Number'}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center space-x-1">
                      <Building className="w-4 h-4" />
                      <span>{uc.funding_agency?.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{uc.financial_year?.year}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {uc.current_status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">PI:</span>
                  </div>
                  <div className="ml-5">{uc.principal_investigator?.name}</div>
                </div>
                <div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">Project:</span>
                  </div>
                  <div className="ml-5">{uc.project_code}</div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="pt-4 border-t">
                <UCProgressTracker 
                  uc={uc} 
                  variant="horizontal" 
                  showLabels={true}
                  size="sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetails(uc)}
                  className="flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>Details</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(uc.id)}
                  className="flex items-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(uc.id, uc.uc_entry_no || uc.project_code)}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUCs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No UC entries found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria."
              : "No UC entries have been created yet."
            }
          </p>
        </div>
      )}

      {/* Details Modal */}
      <UCDetailsModal
        uc={selectedUC}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
      />
    </div>
  );
};

export default UCList;
