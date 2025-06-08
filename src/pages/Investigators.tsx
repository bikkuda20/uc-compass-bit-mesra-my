
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { usePrincipalInvestigators } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Investigators = () => {
  const { pis, loading, refetch } = usePrincipalInvestigators();
  const [newPI, setNewPI] = useState({ name: "", email: "", department: "" });
  const [isAdding, setIsAdding] = useState(false);
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
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Principal Investigator added successfully",
      });
      
      setNewPI({ name: "", email: "", department: "" });
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

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1">
            <div className="p-6">
              <SidebarTrigger className="mb-4" />
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading Principal Investigators...</span>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6 space-y-6">
            <SidebarTrigger className="mb-4" />
            
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Principal Investigators</h2>
            </div>

            {/* Add New PI Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Principal Investigator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Name *"
                    value={newPI.name}
                    onChange={(e) => setNewPI({ ...newPI, name: e.target.value })}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newPI.email}
                    onChange={(e) => setNewPI({ ...newPI, email: e.target.value })}
                  />
                  <Input
                    placeholder="Department"
                    value={newPI.department}
                    onChange={(e) => setNewPI({ ...newPI, department: e.target.value })}
                  />
                  <Button onClick={handleAdd} disabled={isAdding} className="bg-blue-600 hover:bg-blue-700">
                    {isAdding ? "Adding..." : "Add PI"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PIs Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pis.map((pi) => (
                      <TableRow key={pi.id}>
                        <TableCell className="font-medium">{pi.name}</TableCell>
                        <TableCell>{pi.email || "-"}</TableCell>
                        <TableCell>{pi.department || "-"}</TableCell>
                        <TableCell>{new Date(pi.created_at || '').toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {pis.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500">No Principal Investigators found.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Investigators;
