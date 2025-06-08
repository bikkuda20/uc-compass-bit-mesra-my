
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2 } from "lucide-react";
import { useFundingAgencies } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Agencies = () => {
  const { agencies, loading, refetch } = useFundingAgencies();
  const [newAgencyName, setNewAgencyName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
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
                <span className="ml-2">Loading Funding Agencies...</span>
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
              <h2 className="text-2xl font-bold text-slate-800">Funding Agencies</h2>
            </div>

            {/* Add New Agency Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Funding Agency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Agency Name *"
                    value={newAgencyName}
                    onChange={(e) => setNewAgencyName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAdd} disabled={isAdding} className="bg-blue-600 hover:bg-blue-700">
                    {isAdding ? "Adding..." : "Add Agency"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Agencies Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agency Name</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agencies.map((agency) => (
                      <TableRow key={agency.id}>
                        <TableCell className="font-medium">{agency.name}</TableCell>
                        <TableCell>{new Date(agency.created_at || '').toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(agency.updated_at || '').toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {agencies.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500">No Funding Agencies found.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Agencies;
