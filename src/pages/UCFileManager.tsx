
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
import { FileText, Search, Download, Trash2, Calendar } from "lucide-react";

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

  const deleteUCEntry = async (ucId: string) => {
    try {
      // First, delete the actual UC file if it exists
      const ucEntry = ucEntries.find(entry => entry.id === ucId);
      if (ucEntry?.uc_file_path) {
        const { error: storageError } = await supabase.storage
          .from('uc_files')
          .remove([ucEntry.uc_file_path]);
        
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
        }
      }

      // Then delete the database entry
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

      // Refresh the list
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

  useEffect(() => {
    fetchUploadedUCEntries();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = ucEntries.filter((entry: any) =>
        entry.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('uc_files')
        .download(filePath);

      if (error) {
        throw error;
      }

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
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
        description: "Failed to download UC file",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    let badgeColor = "neutral"; // Default color
    switch (status) {
      case "pending":
        badgeColor = "yellow";
        break;
      case "approved":
        badgeColor = "green";
        break;
      case "rejected":
        badgeColor = "red";
        break;
      default:
        badgeColor = "neutral";
        break;
    }

    return (
      <Badge variant="secondary" className={`bg-${badgeColor}-500 text-white`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Sidebar />
        <SidebarInset>
          <div className="flex-1 ml-64 p-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">UC File Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Search by title, PI, agency, scheme, or year..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="h-5 w-5 text-gray-500" />
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
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center">
                              Loading UC entries...
                            </TableCell>
                          </TableRow>
                        ) : filteredEntries.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center">
                              No UC files found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredEntries.map((entry: any) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium">{entry.project_code}</TableCell>
                              <TableCell>{entry.principal_investigator?.name}</TableCell>
                              <TableCell>{entry.funding_agency?.name}</TableCell>
                              <TableCell>{entry.scheme?.name}</TableCell>
                              <TableCell className="text-center">{entry.financial_year?.year}</TableCell>
                              <TableCell>{getStatusBadge(entry.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => downloadFile(entry.uc_file_path, entry.uc_file_name)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-red-500">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete the UC file from our servers.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteUCEntry(entry.id)}>Delete</AlertDialogAction>
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
