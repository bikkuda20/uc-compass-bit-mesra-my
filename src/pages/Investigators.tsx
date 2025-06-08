
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Loader2, Users } from "lucide-react";
import { usePrincipalInvestigators } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Investigators = () => {
  const { pis, loading, refetch } = usePrincipalInvestigators();
  const [newPI, setNewPI] = useState({ name: "", email: "", department: "", project_code: "" });
  const [editingPI, setEditingPI] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!newPI.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('principal_investigators')
        .insert([{
          name: newPI.name.trim(),
          email: newPI.email.trim() || null,
          department: newPI.department.trim() || null,
          project_code: newPI.project_code.trim() || null,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Principal Investigator added successfully",
      });
      
      setNewPI({ name: "", email: "", department: "", project_code: "" });
      refetch();
    } catch (error) {
      console.error('Error adding PI:', error);
      toast({
        title: "Error",
        description: "Failed to add Principal Investigator",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = async () => {
    if (!editingPI?.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    setIsEditing(true);
    try {
      const { error } = await supabase
        .from('principal_investigators')
        .update({
          name: editingPI.name.trim(),
          email: editingPI.email?.trim() || null,
          department: editingPI.department?.trim() || null,
          project_code: editingPI.project_code?.trim() || null,
        })
        .eq('id', editingPI.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Principal Investigator updated successfully",
      });
      
      setEditDialogOpen(false);
      setEditingPI(null);
      refetch();
    } catch (error) {
      console.error('Error updating PI:', error);
      toast({
        title: "Error",
        description: "Failed to update Principal Investigator",
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
        .from('principal_investigators')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Principal Investigator deleted successfully",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting PI:', error);
      toast({
        title: "Error",
        description: "Failed to delete Principal Investigator",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-50 via-white to-blue-50">
          <AppSidebar />
          <main className="flex-1">
            <div className="p-6">
              <SidebarTrigger className="mb-4" />
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                  <span className="ml-2 text-purple-600 font-medium">Loading Principal Investigators...</span>
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6 space-y-6">
            <SidebarTrigger className="mb-4" />
            
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center">
                <Users className="w-8 h-8 mr-3" />
                <div>
                  <h2 className="text-3xl font-bold">Principal Investigators</h2>
                  <p className="text-purple-100 mt-1">Manage research investigators and their details</p>
                </div>
              </div>
            </div>

            {/* Add New PI Form */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Principal Investigator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Input
                    placeholder="Name *"
                    value={newPI.name}
                    onChange={(e) => setNewPI({ ...newPI, name: e.target.value })}
                    className="border-green-300 focus:border-green-500"
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newPI.email}
                    onChange={(e) => setNewPI({ ...newPI, email: e.target.value })}
                    className="border-green-300 focus:border-green-500"
                  />
                  <Input
                    placeholder="Department"
                    value={newPI.department}
                    onChange={(e) => setNewPI({ ...newPI, department: e.target.value })}
                    className="border-green-300 focus:border-green-500"
                  />
                  <Input
                    placeholder="Project Code"
                    value={newPI.project_code}
                    onChange={(e) => setNewPI({ ...newPI, project_code: e.target.value })}
                    className="border-green-300 focus:border-green-500"
                  />
                  <Button onClick={handleAdd} disabled={isAdding} className="bg-green-600 hover:bg-green-700">
                    {isAdding ? "Adding..." : "Add PI"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PIs Table */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <TableHead className="font-semibold text-slate-700">Name</TableHead>
                      <TableHead className="font-semibold text-slate-700">Email</TableHead>
                      <TableHead className="font-semibold text-slate-700">Department</TableHead>
                      <TableHead className="font-semibold text-slate-700">Project Code</TableHead>
                      <TableHead className="font-semibold text-slate-700">Created</TableHead>
                      <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pis.map((pi) => (
                      <TableRow key={pi.id} className="hover:bg-purple-50/50 transition-colors">
                        <TableCell className="font-medium">{pi.name}</TableCell>
                        <TableCell>{pi.email || "-"}</TableCell>
                        <TableCell>{pi.department || "-"}</TableCell>
                        <TableCell>{pi.project_code || "-"}</TableCell>
                        <TableCell>{new Date(pi.created_at || '').toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                                  onClick={() => setEditingPI({ ...pi })}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Principal Investigator</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Input
                                    placeholder="Name *"
                                    value={editingPI?.name || ""}
                                    onChange={(e) => setEditingPI({ ...editingPI, name: e.target.value })}
                                  />
                                  <Input
                                    placeholder="Email"
                                    type="email"
                                    value={editingPI?.email || ""}
                                    onChange={(e) => setEditingPI({ ...editingPI, email: e.target.value })}
                                  />
                                  <Input
                                    placeholder="Department"
                                    value={editingPI?.department || ""}
                                    onChange={(e) => setEditingPI({ ...editingPI, department: e.target.value })}
                                  />
                                  <Input
                                    placeholder="Project Code"
                                    value={editingPI?.project_code || ""}
                                    onChange={(e) => setEditingPI({ ...editingPI, project_code: e.target.value })}
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
                              onClick={() => handleDelete(pi.id)}
                              disabled={isDeleting === pi.id}
                            >
                              {isDeleting === pi.id ? (
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

            {pis.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No Principal Investigators found.</p>
                <p className="text-slate-400 text-sm">Add your first investigator using the form above.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Investigators;
