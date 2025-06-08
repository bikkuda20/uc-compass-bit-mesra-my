
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2, Building } from "lucide-react";
import { useFundingAgencies } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Agencies = () => {
  const { agencies, loading, refetch } = useFundingAgencies();
  const [newAgencyName, setNewAgencyName] = useState("");
  const [editingAgency, setEditingAgency] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!newAgencyName.trim()) {
      toast({
        title: "Validation Error",
        description: "Agency name is required",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('funding_agencies')
        .insert([{ name: newAgencyName.trim() }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Funding Agency added successfully",
      });
      
      setNewAgencyName("");
      refetch();
    } catch (error) {
      console.error('Error adding agency:', error);
      toast({
        title: "Error",
        description: "Failed to add Funding Agency",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = async () => {
    if (!editingAgency?.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Agency name is required",
        variant: "destructive",
      });
      return;
    }

    setIsEditing(true);
    try {
      const { error } = await supabase
        .from('funding_agencies')
        .update({ name: editingAgency.name.trim() })
        .eq('id', editingAgency.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Funding Agency updated successfully",
      });
      
      setEditDialogOpen(false);
      setEditingAgency(null);
      refetch();
    } catch (error) {
      console.error('Error updating agency:', error);
      toast({
        title: "Error",
        description: "Failed to update Funding Agency",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase
        .from('funding_agencies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Funding Agency deleted successfully",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting agency:', error);
      toast({
        title: "Error",
        description: "Failed to delete Funding Agency",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-green-50">
          <AppSidebar />
          <main className="flex-1">
            <div className="p-6">
              <SidebarTrigger className="mb-4" />
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  <span className="ml-2 text-blue-600 font-medium">Loading Funding Agencies...</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-green-50">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6 space-y-6">
            <SidebarTrigger className="mb-4" />
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center">
                <Building className="w-8 h-8 mr-3" />
                <div>
                  <h2 className="text-3xl font-bold">Funding Agencies</h2>
                  <p className="text-blue-100 mt-1">Manage funding organizations and agencies</p>
                </div>
              </div>
            </div>

            {/* Add New Agency Form */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Funding Agency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Agency Name *"
                    value={newAgencyName}
                    onChange={(e) => setNewAgencyName(e.target.value)}
                    className="flex-1 border-green-300 focus:border-green-500"
                  />
                  <Button onClick={handleAdd} disabled={isAdding} className="bg-green-600 hover:bg-green-700">
                    {isAdding ? "Adding..." : "Add Agency"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Agencies Table */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <TableHead className="font-semibold text-slate-700">Agency Name</TableHead>
                      <TableHead className="font-semibold text-slate-700">Created</TableHead>
                      <TableHead className="font-semibold text-slate-700">Updated</TableHead>
                      <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agencies.map((agency) => (
                      <TableRow key={agency.id} className="hover:bg-blue-50/50 transition-colors">
                        <TableCell className="font-medium">{agency.name}</TableCell>
                        <TableCell>{new Date(agency.created_at || '').toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(agency.updated_at || '').toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                                  onClick={() => setEditingAgency({ ...agency })}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Funding Agency</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Input
                                    placeholder="Agency Name *"
                                    value={editingAgency?.name || ""}
                                    onChange={(e) => setEditingAgency({ ...editingAgency, name: e.target.value })}
                                  />
                                  <div className="flex gap-2">
                                    <Button onClick={handleEdit} disabled={isEditing} className="flex-1">
                                      {isEditing ? "Updating..." : "Update"}
                                    </Button>
                                    <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="flex-1">
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(agency.id)}
                              disabled={isDeleting === agency.id}
                            >
                              {isDeleting === agency.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {agencies.length === 0 && (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No Funding Agencies found.</p>
                <p className="text-slate-400 text-sm">Add your first agency using the form above.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Agencies;
