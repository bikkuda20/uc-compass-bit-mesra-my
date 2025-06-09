
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { FileText, Search, Download, Trash2, Eye, Edit, Printer, RefreshCw } from "lucide-react";

const UCFileManager = () => {
  const [ucEntries, setUcEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const getCleanFilePath = (filePath: string) => {
    // Remove bucket prefix if it exists
    if (filePath.startsWith('uc-files/')) {
      return filePath.replace('uc-files/', '');
    }
    return filePath;
  };

  const checkFileExists = async (filePath: string) => {
    try {
      console.log('Checking file existence for path:', filePath);
      
      const cleanPath = getCleanFilePath(filePath);
      console.log('Clean path:', cleanPath);
      
      // Try to get the file metadata to check if it exists
      const { data, error } = await supabase.storage
        .from('uc-files')
        .list('', {
          search: cleanPath
        });
      
      console.log('File existence check result:', { data, error, cleanPath });
      
      if (error) {
        console.error('Storage error during file check:', error);
        return false;
      }
      
      // Check if the file exists in the list
      const fileExists = data && data.some(file => file.name === cleanPath);
      console.log('File exists:', fileExists);
      
      return fileExists;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      console.log('Downloading file:', filePath);
      
      const cleanPath = getCleanFilePath(filePath);
      console.log('Clean download path:', cleanPath);
      
      const fileExists = await checkFileExists(filePath);
      if (!fileExists) {
        toast({
          title: "File Not Found",
          description: "The requested file does not exist in storage",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.storage
        .from('uc-files')
        .download(cleanPath);

      if (error) {
        console.error('Download error:', error);
        throw error;
      }

      // Create download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'uc-file.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error: any) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: `Unable to download file: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const previewFile = async (filePath: string) => {
    try {
      console.log('Previewing file:', filePath);
      
      const cleanPath = getCleanFilePath(filePath);
      console.log('Clean preview path:', cleanPath);
      
      const fileExists = await checkFileExists(filePath);
      if (!fileExists) {
        toast({
          title: "File Not Found",
          description: "The requested file does not exist in storage",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.storage
        .from('uc-files')
        .createSignedUrl(cleanPath, 300); // 5 minutes

      if (error) {
        console.error('Preview error:', error);
        throw error;
      }

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
        toast({
          title: "Success",
          description: "File opened for preview",
        });
      } else {
        throw new Error('No signed URL returned');
      }
    } catch (error: any) {
      console.error('Preview failed:', error);
      toast({
        title: "Preview Failed",
        description: `Unable to preview file: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const printFile = async (filePath: string) => {
    try {
      console.log('Printing file:', filePath);
      
      const cleanPath = getCleanFilePath(filePath);
      
      const fileExists = await checkFileExists(filePath);
      if (!fileExists) {
        toast({
          title: "File Not Found",
          description: "The requested file does not exist in storage",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.storage
        .from('uc-files')
        .createSignedUrl(cleanPath, 300);

      if (error) {
        console.error('Print error:', error);
        throw error;
      }

      if (data?.signedUrl) {
        const printWindow = window.open(data.signedUrl, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
        
        toast({
          title: "Success",
          description: "File sent to printer",
        });
      } else {
        throw new Error('No signed URL returned');
      }
    } catch (error: any) {
      console.error('Print failed:', error);
      toast({
        title: "Print Failed",
        description: `Unable to print file: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const deleteUCEntry = async (ucId: string) => {
    try {
      console.log('Deleting UC entry:', ucId);
      
      const ucEntry = ucEntries.find(entry => entry.id === ucId);
      
      // Try to delete the file from storage if it exists
      if (ucEntry?.uc_file_path) {
        const cleanPath = getCleanFilePath(ucEntry.uc_file_path);
        const fileExists = await checkFileExists(ucEntry.uc_file_path);
        
        if (fileExists) {
          const { error: storageError } = await supabase.storage
            .from('uc-files')
            .remove([cleanPath]);
          
          if (storageError) {
            console.error('Storage deletion error:', storageError);
          } else {
            console.log('File deleted from storage successfully');
          }
        }
      }

      // Delete the database entry
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

      // Refresh the list
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

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      verified: "bg-blue-100 text-blue-800",
      default: "bg-gray-100 text-gray-800"
    };

    const colorClass = statusColors[status?.toLowerCase()] || statusColors.default;

    return (
      <Badge variant="secondary" className={colorClass}>
        {status?.toUpperCase() || 'PENDING'}
      </Badge>
    );
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

  // Load data on component mount
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
                  {/* Search Bar */}
                  <div className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Search by project code, PI name, agency, scheme, or year..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  
                  {/* Results Summary */}
                  <div className="text-sm text-gray-600">
                    Showing {filteredEntries.length} of {ucEntries.length} UC files
                  </div>
                  
                  {/* Table */}
                  <div className="overflow-x-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project Code</TableHead>
                          <TableHead>Principal Investigator</TableHead>
                          <TableHead>Funding Agency</TableHead>
                          <TableHead>Scheme</TableHead>
                          <TableHead>Financial Year</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Upload Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              <div className="flex items-center justify-center">
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                Loading UC files...
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredEntries.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              {searchTerm ? 'No UC files match your search.' : 'No UC files found.'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredEntries.map((entry: any) => (
                            <TableRow key={entry.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{entry.project_code}</TableCell>
                              <TableCell>{entry.principal_investigator?.name || 'N/A'}</TableCell>
                              <TableCell>{entry.funding_agency?.name || 'N/A'}</TableCell>
                              <TableCell>{entry.scheme?.name || entry.scheme_name || 'N/A'}</TableCell>
                              <TableCell className="text-center">{entry.financial_year?.year || 'N/A'}</TableCell>
                              <TableCell>{getStatusBadge(entry.status)}</TableCell>
                              <TableCell>
                                {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => previewFile(entry.uc_file_path)}
                                    disabled={!entry.uc_file_path}
                                    title="Preview File"
                                    className="hover:bg-blue-100"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => downloadFile(entry.uc_file_path, entry.uc_file_name)}
                                    disabled={!entry.uc_file_path}
                                    title="Download File"
                                    className="hover:bg-green-100"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editUCEntry(entry.id)}
                                    title="Edit Entry"
                                    className="hover:bg-orange-100"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => printFile(entry.uc_file_path)}
                                    disabled={!entry.uc_file_path}
                                    title="Print File"
                                    className="hover:bg-purple-100"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-500 hover:text-red-700 hover:bg-red-100" 
                                        title="Delete Entry"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete UC File</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete the UC file for project "{entry.project_code}"? 
                                          This action cannot be undone and will permanently remove the file from storage.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => deleteUCEntry(entry.id)}
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
                          ))
                        )}
                      </TableBody>
                    </Table>
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
