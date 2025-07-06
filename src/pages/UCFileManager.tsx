import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, RefreshCw, Sparkles, Grid, List } from "lucide-react";
import { SearchBar } from "@/components/uc/SearchBar";
import { UCCard } from "@/components/uc/UCCard";
import { useFileOperations } from "@/hooks/useFileOperations";

const UCFileManager = () => {
  const [ucEntries, setUcEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <Sidebar />
        <SidebarInset>
          <div className="flex-1 ml-64 p-6 relative z-10">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden mb-6">
              <CardHeader className="bg-gradient-to-r from-slate-700 via-blue-700 to-indigo-700 text-white relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-700/95 via-blue-700/95 to-indigo-700/95 backdrop-blur-sm"></div>
                <CardTitle className="text-3xl font-bold flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <FileText className="h-8 w-8 text-white drop-shadow-lg" />
                      <Sparkles className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
                    </div>
                    <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent drop-shadow-lg">
                      UC File Manager
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 bg-white/20 rounded-lg p-1">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-8 w-8 p-0"
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-8 w-8 p-0"
                      >
                        <List className="h-4 w-4" />
                      </Button>
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
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            <div className="space-y-6">
              <SearchBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                  <span className="font-medium">Showing</span>{" "}
                  <span className="font-bold text-blue-600">{filteredEntries.length}</span>{" "}
                  of{" "}
                  <span className="font-bold text-indigo-600">{ucEntries.length}</span>{" "}
                  UC files
                </div>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center h-64 bg-white/80 backdrop-blur-sm rounded-2xl">
                  <div className="text-center">
                    <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <span className="text-lg font-semibold text-gray-700">Loading UC files...</span>
                  </div>
                </div>
              ) : filteredEntries.length === 0 ? (
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-lg rounded-2xl">
                  <CardContent className="text-center py-16">
                    <FileText className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                    <p className="text-xl font-bold text-gray-500 mb-2">
                      {searchTerm ? 'No UC files match your search.' : 'No UC files found.'}
                    </p>
                    <p className="text-gray-400 text-sm">Upload some UC files to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredEntries.map((entry: any) => (
                    <UCCard
                      key={entry.id}
                      entry={entry}
                      onPreview={previewFile}
                      onDownload={downloadFile}
                      onEdit={editUCEntry}
                      onPrint={printFile}
                      onDelete={deleteUCEntry}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UCFileManager;
