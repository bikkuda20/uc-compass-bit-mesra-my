
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2, Calendar } from "lucide-react";
import { useFinancialYears } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Years = () => {
  const { years, loading, refetch } = useFinancialYears();
  const [newYear, setNewYear] = useState("");
  const [editingYear, setEditingYear] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAdd = async () => {
    if (!newYear.trim()) {
      toast({
        title: "Validation Error",
        description: "Financial year is required",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('financial_years')
        .insert([{ year: newYear.trim(), is_active: false }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Financial Year added successfully",
      });
      
      setNewYear("");
      refetch();
    } catch (error) {
      console.error('Error adding financial year:', error);
      toast({
        title: "Error",
        description: "Failed to add Financial Year",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = async () => {
    if (!editingYear?.year?.trim()) {
      toast({
        title: "Validation Error",
        description: "Financial year is required",
        variant: "destructive",
      });
      return;
    }

    setIsEditing(true);
    try {
      const { error } = await supabase
        .from('financial_years')
        .update({ 
          year: editingYear.year.trim(),
          is_active: editingYear.is_active 
        })
        .eq('id', editingYear.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Financial Year updated successfully",
      });
      
      setEditDialogOpen(false);
      setEditingYear(null);
      refetch();
    } catch (error) {
      console.error('Error updating financial year:', error);
      toast({
        title: "Error",
        description: "Failed to update Financial Year",
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
        .from('financial_years')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Financial Year deleted successfully",
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting financial year:', error);
      toast({
        title: "Error",
        description: "Failed to delete Financial Year",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleActiveStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('financial_years')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Financial Year ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      
      refetch();
    } catch (error) {
      console.error('Error updating financial year:', error);
      toast({
        title: "Error",
        description: "Failed to update Financial Year",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <AppSidebar />
          <main className="flex-1">
            <div className="p-6">
              <SidebarTrigger className="mb-4" />
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                  <span className="ml-2 text-indigo-600 font-medium">Loading Financial Years...</span>
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6 space-y-6">
            <SidebarTrigger className="mb-4" />
            
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 mr-3" />
                <div>
                  <h2 className="text-3xl font-bold">Financial Years</h2>
                  <p className="text-indigo-100 mt-1">Manage academic and financial year periods</p>
                </div>
              </div>
            </div>

            {/* Add New Year Form */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-700">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Financial Year
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Financial Year (e.g., 2024-2025) *"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="flex-1 border-purple-300 focus:border-purple-500"
                  />
                  <Button onClick={handleAdd} disabled={isAdding} className="bg-purple-600 hover:bg-purple-700">
                    {isAdding ? "Adding..." : "Add Year"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Years Table */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <TableHead className="font-semibold text-slate-700">Financial Year</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700">Created</TableHead>
                      <TableHead className="font-semibold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {years.map((year) => (
                      <TableRow key={year.id} className="hover:bg-indigo-50/50 transition-colors">
                        <TableCell className="font-medium">{year.year}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={year.is_active ? "default" : "secondary"}
                            className={year.is_active ? "bg-green-100 text-green-800 border-green-300" : "bg-gray-100 text-gray-800 border-gray-300"}
                          >
                            {year.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(year.created_at || '').toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-300 text-blue-600 hover:bg-blue-50"
                                  onClick={() => setEditingYear({ ...year })}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Financial Year</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Input
                                    placeholder="Financial Year *"
                                    value={editingYear?.year || ""}
                                    onChange={(e) => setEditingYear({ ...editingYear, year: e.target.value })}
                                  />
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="active"
                                      checked={editingYear?.is_active || false}
                                      onChange={(e) => setEditingYear({ ...editingYear, is_active: e.target.checked })}
                                      className="rounded"
                                    />
                                    <label htmlFor="active" className="text-sm font-medium">
                                      Active Year
                                    </label>
                                  </div>
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
                              className={year.is_active ? "border-orange-300 text-orange-600 hover:bg-orange-50" : "border-green-300 text-green-600 hover:bg-green-50"}
                              onClick={() => toggleActiveStatus(year.id, year.is_active)}
                            >
                              {year.is_active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(year.id)}
                              disabled={isDeleting === year.id}
                            >
                              {isDeleting === year.id ? (
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

            {years.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No Financial Years found.</p>
                <p className="text-slate-400 text-sm">Add your first financial year using the form above.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Years;
