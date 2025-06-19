import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, RefreshCw, Sparkles } from "lucide-react";
import { SearchBar } from "@/components/uc/SearchBar";
import { UCTable } from "@/components/uc/UCTable";
import { useFileOperations } from "@/hooks/useFileOperations";

const UCFileManager = () => {
  const [ucEntries, setUcEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { downloadFile, previewFile, printFile } = useFileOperations();

  const fetchUploadedUCEntries = async () => {
    try {
      setLoading(true);
      console.log('Fetching UC entries...');
      
      const { data, error } = await supabase
        .from('uc_entries')
        .select(`
          *,
          funding_agency:funding_agencies(id, name),
          financial_year:financial_years(id, year),
          principal_investigator:principal_investigators(id, name, email, department),
          scheme:schemes(id, name, description)
        `)
        .is('uc_received_date', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Fetched UC entries:', data);
      setUcEntries(data || []);
      setFilteredEntries(data || []);
      
      toast({
        title: "Success",
        description: `Loaded ${data?.length || 0} UC files`,
      });
    } catch (error: any) {
      console.error('Error fetching UC entries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch UC files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUCEntry = async (ucId: string) => {
    try {
      console.log('Deleting UC entry:', ucId);
      
      const ucEntry = ucEntries.find(entry => entry.id === ucId);
      
      if (ucEntry?.uc_file_path) {
        const cleanPath = ucEntry.uc_file_path.startsWith('uc-files/') 
          ? ucEntry.uc_file_path.replace('uc-files/', '') 
          : ucEntry.uc_file_path;
        
        const { error: storageError } = await supabase.storage
          .from('uc-files')
          .remove([cleanPath]);
        
        if (storageError) {
          console.error('Storage deletion error:', storageError);
        } else {
          console.log('File deleted from storage successfully');
        }
      }

      const { error } = await supabase
        .from('uc_entries')
        .delete()
        .eq('id', ucId);

      if (error) {
        console.error('Database deletion error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "UC file deleted successfully",
      });

      fetchUploadedUCEntries();
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: `Unable to delete UC file: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const editUCEntry = (ucId: string) => {
    navigate(`/uc-upload?edit=${ucId}`);
  };

  // Filter entries based on search term
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = ucEntries.filter((entry: any) =>
        entry.project_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.principal_investigator?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.funding_agency?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.scheme?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.financial_year?.year?.toString().includes(searchTerm) ||
        entry.uc_entry_no?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEntries(filtered);
    } else {
      setFilteredEntries(ucEntries);
    }
  }, [searchTerm, ucEntries]);

  useEffect(() => {
    fetchUploadedUCEntries();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-purple-50 via-pink-50 to-amber-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-amber-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
        
        <Sidebar />
        <SidebarInset>
          <div className="flex-1 ml-64 p-8 relative z-10">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-sm"></div>
                <CardTitle className="text-3xl font-bold flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <FileText className="h-8 w-8 text-white drop-shadow-lg" />
                      <Sparkles className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent drop-shadow-lg">
                      UC File Manager
                    </span>
                  </div>
                  <Button 
                    onClick={fetchUploadedUCEntries}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/50 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 bg-gradient-to-br from-white/95 to-blue-50/50">
                <div className="space-y-6">
                  <div className="transform hover:scale-[1.02] transition-transform duration-300">
                    <SearchBar 
                      searchTerm={searchTerm}
                      onSearchChange={setSearchTerm}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 bg-gradient-to-r from-blue-100/50 to-purple-100/50 px-4 py-2 rounded-full border border-blue-200/50 shadow-sm">
                      <span className="font-medium">Showing</span>{" "}
                      <span className="font-bold text-blue-600">{filteredEntries.length}</span>{" "}
                      of{" "}
                      <span className="font-bold text-purple-600">{ucEntries.length}</span>{" "}
                      UC files
                    </div>
                    
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse delay-200"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-amber-500 rounded-full animate-pulse delay-400"></div>
                    </div>
                  </div>
                  
                  <div className="transform hover:scale-[1.01] transition-transform duration-300">
                    <UCTable
                      entries={filteredEntries}
                      loading={loading}
                      searchTerm={searchTerm}
                      onPreview={previewFile}
                      onDownload={downloadFile}
                      onEdit={editUCEntry}
                      onPrint={printFile}
                      onDelete={deleteUCEntry}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UCFileManager;
