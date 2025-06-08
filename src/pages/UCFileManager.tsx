import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Eye, Printer, FileText, ArrowLeft, Edit2, Save, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUCEntries } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UCFileManager = () => {
  const { ucs, loading, refetch } = useUCEntries();
  const [filteredUcs, setFilteredUcs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let filtered = ucs;

    if (searchQuery) {
      filtered = filtered.filter((uc) =>
        uc.project_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uc.principal_investigator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        uc.funding_agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (uc.scheme?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUcs(filtered);
  }, [searchQuery, ucs]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Pending: { variant: "secondary" as const, className: "bg-orange-100 text-orange-800" },
      Submitted: { variant: "secondary" as const, className: "bg-blue-100 text-blue-800" },
      Verified: { variant: "secondary" as const, className: "bg-green-100 text-green-800" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const handleEdit = (uc: any) => {
    setEditingId(uc.id);
    setEditData({
      project_code: uc.project_code,
      status: uc.status,
      scheme_name: uc.scheme?.name || '',
    });
  };

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('uc_entries')
        .update({
          project_code: editData.project_code,
          status: editData.status,
          scheme_name: editData.scheme_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "UC entry updated successfully",
      });

      setEditingId(null);
      refetch();
    } catch (error) {
      console.error('Error updating UC entry:', error);
      toast({
        title: "Error",
        description: "Failed to update UC entry",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handlePreview = async (uc: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('uc-files')
        .createSignedUrl(uc.uc_file_path, 3600);

      if (error) {
        console.error('Error creating signed URL:', error);
        toast({
          title: "Error",
          description: "Failed to preview file",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(uc);
      setPreviewUrl(data.signedUrl);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to preview file",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (uc: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('uc-files')
        .download(uc.uc_file_path);

      if (error) {
        console.error('Error downloading file:', error);
        toast({
          title: "Error",
          description: "Failed to download file",
          variant: "destructive",
        });
        return;
      }

      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = uc.uc_file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "File downloaded successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (previewUrl) {
      const printWindow = window.open(previewUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading UC files...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50 to-pink-100 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">UC File Manager</h1>
            <p className="text-gray-600">Manage and view all uploaded UC files</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-600" />
            Search UC Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by project code, PI name, funding agency, or scheme..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* UC Files Table */}
        <Card className="shadow-lg border-0 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              UC Files ({filteredUcs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PI Name</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Scheme</TableHead>
                    <TableHead>Project Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUcs.length > 0 ? (
                    filteredUcs.map((uc) => (
                      <TableRow key={uc.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{uc.principal_investigator.name}</TableCell>
                        <TableCell>{uc.funding_agency.name}</TableCell>
                        <TableCell>
                          {editingId === uc.id ? (
                            <Input
                              value={editData.scheme_name}
                              onChange={(e) => setEditData({...editData, scheme_name: e.target.value})}
                              className="w-full"
                            />
                          ) : (
                            uc.scheme?.name || uc.scheme_name || 'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === uc.id ? (
                            <Input
                              value={editData.project_code}
                              onChange={(e) => setEditData({...editData, project_code: e.target.value})}
                              className="w-full"
                            />
                          ) : (
                            uc.project_code
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === uc.id ? (
                            <Select
                              value={editData.status}
                              onValueChange={(value) => setEditData({...editData, status: value})}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Submitted">Submitted</SelectItem>
                                <SelectItem value="Verified">Verified</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            getStatusBadge(uc.status)
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {editingId === uc.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSave(uc.id)}
                                  className="flex items-center"
                                >
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancel}
                                  className="flex items-center"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(uc)}
                                  className="flex items-center"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePreview(uc)}
                                  className="flex items-center"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownload(uc)}
                                  className="flex items-center"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedFile(uc);
                                    handlePreview(uc).then(() => handlePrint());
                                  }}
                                  className="flex items-center"
                                >
                                  <Printer className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">No UC files found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* File Preview */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="w-5 h-5 mr-2 text-purple-600" />
                File Preview
              </div>
              {selectedFile && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrint}
                  className="flex items-center"
                >
                  <Printer className="w-3 h-3 mr-1" />
                  Print
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFile && previewUrl ? (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900">{selectedFile.project_code}</h4>
                  <p className="text-sm text-gray-600">{selectedFile.uc_file_name}</p>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    src={previewUrl}
                    className="w-full h-96"
                    title="UC File Preview"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Eye className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Select a file to preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UCFileManager;
