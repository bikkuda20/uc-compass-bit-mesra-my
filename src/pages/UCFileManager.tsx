
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
import { FileText, Search, Download, Trash2, Eye, Edit, Printer } from "lucide-react";

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
      const { data, error } = await supabase
        .from('uc_entries')
        .select(`
          *,
          funding_agency:funding_agencies(id, name),
          financial_year:financial_years(id, year),
          principal_investigator:principal_investigators(id, name, email, department),
          scheme:schemes(id, name, description)
        `)
        .is('uc_received_date', null) // Only show uploaded UCs (not received from PI)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUcEntries(data || []);
      setFilteredEntries(data || []);
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

  const checkFileExists = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('uc_files')
        .list('', {
          search: filePath
        });
      
      return !error && data && data.length > 0;
    } catch (error) {
      return false;
    }
  };

  const deleteUCEntry = async (ucId: string) => {
    try {
      const ucEntry = ucEntries.find(entry => entry.id === ucId);
      
      // Try to delete the file from storage if it exists
      if (ucEntry?.uc_file_path) {
        const fileExists = await checkFileExists(ucEntry.uc_file_path);
        if (fileExists) {
          const { error: storageError } = await supabase.storage
            .from('uc_files')
            .remove([ucEntry.uc_file_path]);
          
          if (storageError) {
            console.error('Error deleting file from storage:', storageError);
          }
        }
      }

      // Delete the database entry
      const { error } = await supabase
        .from('uc_entries')
        .delete()
        .eq('id', ucId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "UC file deleted successfully",
      });

      fetchUploadedUCEntries();
    } catch (error: any) {
      console.error('Error deleting UC entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete UC file",
        variant: "destructive",
      });
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      // Check if file exists first
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
        .from('uc_files')
        .download(filePath);

      if (error) {
        throw error;
      }

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "UC file downloaded successfully",
      });
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download UC file. File may not exist.",
        variant: "destructive",
      });
    }
  };

  const previewFile = async (filePath: string) => {
    try {
      // Check if file exists first
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
        .from('uc_files')
        .createSignedUrl(filePath, 60);

      if (error) {
        throw error;
      }

      window.open(data.signedUrl, '_blank');
    } catch (error: any) {
      console.error('Error previewing file:', error);
      toast({
        title: "Error",
        description: "Failed to preview UC file. File may not exist.",
        variant: "destructive",
      });
    }
  };

  const printFile = async (filePath: string) => {
    try {
      // Check if file exists first
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
        .from('uc_files')
        .createSignedUrl(filePath, 60);

      if (error) {
        throw error;
      }

      const printWindow = window.open(data.signedUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } catch (error: any) {
      console.error('Error printing file:', error);
      toast({
        title: "Error",
        description: "Failed to print UC file. File may not exist.",
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
      default: "bg-gray-100 text-gray-800"
    };

    const colorClass = statusColors[status?.toLowerCase()] || statusColors.default;

    return (
      <Badge variant="secondary" className={colorClass}>
        {status?.toUpperCase() || 'PENDING'}
      </Badge>
    );
  };

  useEffect(() => {
    fetchUploadedUCEntries();
  }, []);

  useEffect(() => {
    if (searchTerm) {
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Sidebar />
        <SidebarInset>
          <div className="flex-1 ml-64 p-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-blue-600" />
                  UC File Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Search by project code, PI, agency, scheme, or year..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  
                  <div className="overflow-x-auto">
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
                              Loading UC entries...
                            </TableCell>
                          </TableRow>
                        ) : filteredEntries.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              No UC files found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredEntries.map((entry: any) => (
                            <TableRow key={entry.id}>
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
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => downloadFile(entry.uc_file_path, entry.uc_file_name)}
                                    disabled={!entry.uc_file_path}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editUCEntry(entry.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => printFile(entry.uc_file_path)}
                                    disabled={!entry.uc_file_path}
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the UC file 
                                          "{entry.project_code}" and remove it from our servers.
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
