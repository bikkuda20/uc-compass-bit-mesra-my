
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";
import { useFinancialYears } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Years = () => {
  const { years, loading, refetch } = useFinancialYears();
  const [newYear, setNewYear] = useState("");
  const [isAdding, setIsAdding] = useState(false);
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
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1">
            <div className="p-6">
              <SidebarTrigger className="mb-4" />
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2">Loading Financial Years...</span>
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
              <h2 className="text-2xl font-bold text-slate-800">Financial Years</h2>
            </div>

            {/* Add New Year Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Financial Year
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Financial Year (e.g., 2024-2025) *"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAdd} disabled={isAdding} className="bg-blue-600 hover:bg-blue-700">
                    {isAdding ? "Adding..." : "Add Year"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Years Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Financial Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {years.map((year) => (
                      <TableRow key={year.id}>
                        <TableCell className="font-medium">{year.year}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={year.is_active ? "default" : "secondary"}
                            className={year.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {year.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(year.created_at || '').toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleActiveStatus(year.id, year.is_active)}
                          >
                            {year.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {years.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500">No Financial Years found.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Years;
