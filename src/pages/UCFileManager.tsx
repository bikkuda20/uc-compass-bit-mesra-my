import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAllUCEntries, useFinancialYears } from "@/hooks/useSupabaseData";
import { UCCard } from "@/components/uc/UCCard";
import UCEditForm from "@/components/uc/UCEditForm";
import { PreviewModal } from "@/components/uc/PreviewModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";

const UCFileManager = () => {
  const navigate = useNavigate();
  const { years } = useFinancialYears();
  const { ucs, loading, refetch, deleteUCEntry } = useAllUCEntries();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [editingUC, setEditingUC] = useState<any>(null);
  const [previewModal, setPreviewModal] =
    useState<{ filePath: string; fileName: string } | null>(null);

  /* ===========================
     🔍 FILTER LOGIC (FINAL)
     =========================== */
  const filteredUCs = ucs.filter((uc) => {
    const matchesYear =
      selectedYear === 'all' || uc.financial_year?.id === selectedYear;

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      !search ||
      uc.project_code?.toLowerCase().includes(search) ||
      uc.project_title?.toLowerCase().includes(search) ||
      uc.principal_investigator?.name?.toLowerCase().includes(search) ||
      uc.funding_agency?.name?.toLowerCase().includes(search) ||
      uc.project_type?.name?.toLowerCase().includes(search); // ✅ PROJECT TYPE ENABLED

    return matchesYear && matchesSearch;
  });

  /* ===========================
     📄 FILE HANDLERS
     =========================== */
  const handlePreview = (filePath: string, fileName: string) => {
    setPreviewModal({ filePath, fileName });
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('uc-files')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: "Success", description: "File downloaded successfully" });
    } catch {
      toast({
        title: "Download Failed",
        description: "Failed to download the file.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('uc-files')
        .download(filePath);

      const url = URL.createObjectURL(data);
      const win = window.open(url, '_blank');
      win?.print();
      URL.revokeObjectURL(url);
    } catch {
      toast({
        title: "Print Failed",
        description: "Unable to print file.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (ucId: string) => {
    setEditingUC({ id: ucId });
  };

  const handleDelete = async (ucId: string) => {
    const success = await deleteUCEntry(ucId);
    if (success) {
      toast({ title: "Deleted", description: "UC entry deleted" });
      refetch();
    }
  };

  const handleEditComplete = () => {
    setEditingUC(null);
    refetch();
  };

  /* ===========================
     ✏️ EDIT MODE
     =========================== */
  if (editingUC) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-purple-100">
          <Sidebar />
          <SidebarInset>
            <div className="ml-64 p-6">
              <UCEditForm
                ucId={editingUC.id}
                onComplete={handleEditComplete}
                onCancel={() => setEditingUC(null)}
              />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  /* ===========================
     📁 MAIN VIEW
     =========================== */
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-purple-100">
        <Sidebar />
        <SidebarInset>
          <div className="ml-64 p-6 space-y-6">

            {/* HEADER */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => navigate('/')}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h2 className="text-2xl font-bold">UC File Manager</h2>
              </div>

              <div className="px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-800 text-sm font-semibold">
                Total UCs: {filteredUCs.length}
              </div>
            </div>

            {/* FILTERS */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" /> Filters
                </CardTitle>
              </CardHeader>

              <CardContent className="grid md:grid-cols-2 gap-4">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Financial Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {years.map((y) => (
                      <SelectItem key={y.id} value={y.id}>
                        {y.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by code, title, PI, funding agency, project type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* UC CARDS */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* PREVIEW MODAL */}
            {previewModal && (
              <PreviewModal
                isOpen
                filePath={previewModal.filePath}
                fileName={previewModal.fileName}
                onClose={() => setPreviewModal(null)}
              />
            )}

          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UCFileManager;
