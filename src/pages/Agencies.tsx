
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Building, Search, ArrowLeft, Plus } from "lucide-react";
import { useFundingAgencies, useSchemes } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Agencies = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const { agencies, loading, refetch } = useFundingAgencies();
  const { schemes, loading: schemesLoading } = useSchemes(selectedAgency || undefined);
  const [filteredAgencies, setFilteredAgencies] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let filtered = agencies;
    if (searchQuery) {
      filtered = filtered.filter((agency) =>
        agency.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredAgencies(filtered);
  }, [searchQuery, agencies]);

  const handleCreate = async (name: string) => {
    try {
      const { error } = await supabase
        .from('funding_agencies')
        .insert([{ name }]);

      if (error) {
        console.error("Error creating agency:", error);
        toast({
          title: "Error",
          description: "Failed to create agency",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Agency created successfully",
      });
      setIsFormOpen(false);
      refetch();
    } catch (error) {
      console.error("Error creating agency:", error);
      toast({
        title: "Error",
        description: "Failed to create agency",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (agency: any) => {
    setEditingAgency(agency);
    setIsEditFormOpen(true);
  };

  const handleUpdate = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('funding_agencies')
        .update({ name })
        .eq('id', id);

      if (error) {
        console.error("Error updating agency:", error);
        toast({
          title: "Error",
          description: "Failed to update agency",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Agency updated successfully",
      });
      setIsEditFormOpen(false);
      setEditingAgency(null);
      refetch();
    } catch (error) {
      console.error("Error updating agency:", error);
      toast({
        title: "Error",
        description: "Failed to update agency",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('funding_agencies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting agency:", error);
        toast({
          title: "Error",
          description: "Failed to delete agency",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Agency deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting agency:", error);
      toast({
        title: "Error",
        description: "Failed to delete agency",
        variant: "destructive",
      });
    }
  };

  const handleShowSchemes = (agencyId: string) => {
    setSelectedAgency(selectedAgency === agencyId ? null : agencyId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading agencies...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-green-50 to-teal-100 min-h-screen">
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
            <h1 className="text-3xl font-bold text-gray-900">Funding Agencies</h1>
            <p className="text-gray-600">Manage funding agencies and their schemes</p>
          </div>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-green-600 hover:bg-green-700">
          Add New Agency
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-600" />
            Search Agencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by agency name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Agencies Table */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2 text-green-600" />
            Funding Agencies ({filteredAgencies.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Schemes</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgencies.length > 0 ? (
                filteredAgencies.map((agency) => (
                  <>
                    <TableRow key={agency.id}>
                      <TableCell className="font-medium">{agency.name}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowSchemes(agency.id)}
                        >
                          {selectedAgency === agency.id ? 'Hide Schemes' : 'Show Schemes'}
                        </Button>
                      </TableCell>
                      <TableCell>{new Date(agency.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(agency)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(agency.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {selectedAgency === agency.id && (
                      <TableRow>
                        <TableCell colSpan={4} className="bg-gray-50">
                          <div className="p-4">
                            <h4 className="font-semibold mb-2">Schemes for {agency.name}:</h4>
                            {schemesLoading ? (
                              <p className="text-gray-500">Loading schemes...</p>
                            ) : schemes.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {schemes.map((scheme) => (
                                  <Badge key={scheme.id} variant="secondary" className="bg-blue-100 text-blue-800">
                                    {scheme.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500">No schemes found for this agency.</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No funding agencies found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Agency Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <div></div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Funding Agency</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                defaultValue=""
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // @ts-ignore
                    handleCreate(e.target.value);
                  }
                }}
              />
            </div>
          </div>
          <Button onClick={() => {
            // @ts-ignore
            handleCreate(document.getElementById("name").value);
          }}>Create Agency</Button>
        </DialogContent>
      </Dialog>

      {/* Edit Agency Dialog */}
      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogTrigger asChild>
          <div></div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Funding Agency</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                defaultValue={editingAgency?.name}
                className="col-span-3"
                onChange={(e) => setEditingAgency({ ...editingAgency, name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // @ts-ignore
                    handleUpdate(editingAgency.id, e.target.value);
                  }
                }}
              />
            </div>
          </div>
          <Button onClick={() => {
            // @ts-ignore
            handleUpdate(editingAgency.id, document.getElementById("name").value);
          }}>Update Agency</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Agencies;
