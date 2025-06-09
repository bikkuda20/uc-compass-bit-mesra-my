
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, RefreshCw } from "lucide-react";
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
        entry.financial_year?.year?.toString().includes(searchTerm)
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Sidebar />
        <SidebarInset>
          <div className="flex-1 ml-64 p-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 mr-2 text-blue-600" />
                    UC File Manager
                  </div>
                  <Button 
                    onClick={fetchUploadedUCEntries}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <SearchBar 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                  
                  <div className="text-sm text-gray-600">
                    Showing {filteredEntries.length} of {ucEntries.length} UC files
                  </div>
                  
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
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UCFileManager;
