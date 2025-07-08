
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, FileText, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useUCEntries, useFinancialYears } from "@/hooks/useSupabaseData";
import { UCCard } from "@/components/uc/UCCard";
import UCEditForm from "@/components/uc/UCEditForm"; // Fix: Use default import
import { PreviewModal } from "@/components/uc/PreviewModal";
import { useFileOperations } from "@/hooks/useFileOperations";
import { useToast } from "@/hooks/use-toast";

const UCFileManager = () => {
  const navigate = useNavigate();
  const { years } = useFinancialYears();
  const { ucs, loading, refetch, deleteUCEntry } = useUCEntries();
  const { downloadFile, previewFile } = useFileOperations();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [editingUC, setEditingUC] = useState<any>(null);
  const [previewModal, setPreviewModal] = useState<{filePath: string, fileName: string} | null>(null); // Fix: Rename variable

  // Filter UCs based on financial year and project code search
  const filteredUCs = ucs.filter(uc => {
    const matchesYear = selectedYear === 'all' || uc.financial_year?.id === selectedYear;
    const matchesSearch = !searchTerm || 
      uc.project_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uc.project_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uc.principal_investigator?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesYear && matchesSearch;
  });

  const handlePreview = (filePath: string, fileName: string) => {
    setPreviewModal({ filePath, fileName }); // Fix: Use correct variable name
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      await downloadFile(filePath, fileName);
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (uc: any) => {
    setEditingUC(uc);
  };

  const handlePrint = (filePath: string) => {
    console.log('Print functionality not implemented yet for:', filePath);
    toast({
      title: "Print",
      description: "Print functionality will be implemented soon.",
    });
  };

  const handleDelete = async (ucId: string) => {
    const success = await deleteUCEntry(ucId);
    if (success) {
      toast({
        title: "Success",
        description: "UC entry deleted successfully",
      });
    }
  };

  const handleEditComplete = () => {
    setEditingUC(null);
    refetch();
  };

  if (editingUC) {
    return (
      <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen">
        <UCEditForm
          ucId={editingUC.id} // Fix: Pass ucId instead of uc object
          onComplete={handleEditComplete}
          onCancel={() => setEditingUC(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold text-slate-800">UC File Manager</h2>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Financial Year
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="All Financial Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Financial Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Search by Project Code or Title
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by project code, title, or PI name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FileText className="w-4 h-4" />
          <span>
            Showing {filteredUCs.length} of {ucs.length} UC entries
            {selectedYear && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                {years.find(y => y.id === selectedYear)?.year}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* UC Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredUCs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No UC entries found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedYear 
                ? "No UC entries match your current filters. Try adjusting your search criteria."
                : "Start by uploading your first UC entry."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUCs.map((uc) => (
            <UCCard
              key={uc.id}
              entry={uc}
              onPreview={handlePreview}
              onDownload={handleDownload}
              onEdit={handleEdit}
              onPrint={handlePrint}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewModal && (
        <PreviewModal
          isOpen={true} // Fix: Add required isOpen prop
          filePath={previewModal.filePath} // Fix: Use correct prop name
          fileName={previewModal.fileName} // Fix: Use correct prop name
          onClose={() => setPreviewModal(null)} // Fix: Use correct variable name
        />
      )}
    </div>
  );
};

export default UCFileManager;
