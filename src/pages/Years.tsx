import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Calendar, Search, ArrowLeft } from "lucide-react";
import { useFinancialYears } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";

const Years = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { years, loading, refetch } = useFinancialYears();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newYear, setNewYear] = useState({
    year: "",
    is_active: false,
  });

  const [editYear, setEditYear] = useState({
    id: "",
    year: "",
    is_active: false,
  });

  const handleInputChange = (e: any) => {
    setNewYear({ ...newYear, [e.target.name]: e.target.value });
  };

  const handleEditInputChange = (e: any) => {
    setEditYear({ ...editYear, [e.target.name]: e.target.value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewYear({ ...newYear, is_active: checked });
  };

  const handleEditSwitchChange = (checked: boolean) => {
    setEditYear({ ...editYear, is_active: checked });
  };

  const createYear = async () => {
    try {
      const { data, error } = await supabase
        .from('financial_years')
        .insert([newYear]);

      if (error) {
        console.error("Error creating year:", error);
        toast({
          title: "Error",
          description: "Failed to create financial year",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Financial year created successfully",
      });
      refetch();
      setIsFormOpen(false);
      setNewYear({ year: "", is_active: false });
    } catch (error) {
      console.error("Error creating year:", error);
      toast({
        title: "Error",
        description: "Failed to create financial year",
        variant: "destructive",
      });
    }
  };

  const updateYear = async () => {
    if (!editYear.id) {
      console.error("No year selected to update.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('financial_years')
        .update({ year: editYear.year, is_active: editYear.is_active })
        .eq('id', editYear.id);

      if (error) {
        console.error("Error updating year:", error);
        toast({
          title: "Error",
          description: "Failed to update financial year",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Financial year updated successfully",
      });
      refetch();
      setIsEditFormOpen(false);
      setEditYear({ id: "", year: "", is_active: false });
    } catch (error) {
      console.error("Error updating year:", error);
      toast({
        title: "Error",
        description: "Failed to update financial year",
        variant: "destructive",
      });
    }
  };

  const deleteYear = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('financial_years')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting year:", error);
        toast({
          title: "Error",
          description: "Failed to delete financial year",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Financial year deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting year:", error);
      toast({
        title: "Error",
        description: "Failed to delete financial year",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (year: any) => {
    setSelectedYear(year);
    setEditYear({
      id: year.id,
      year: year.year,
      is_active: year.is_active,
    });
    setIsEditFormOpen(true);
  };

  const filteredYears = years.filter((year) =>
    year.year.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-yellow-50 to-orange-100">
        <Sidebar />
        <SidebarInset>
          <div className="flex-1 ml-64 p-6 space-y-6">
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
                  <h1 className="text-3xl font-bold text-gray-900">Financial Years</h1>
                  <p className="text-gray-600">Manage financial years and their status</p>
                </div>
              </div>
              <Button onClick={() => setIsFormOpen(true)} className="bg-yellow-600 hover:bg-yellow-700">
                Add Financial Year
              </Button>
            </div>

            {/* Search Bar */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2 text-blue-600" />
                  Search Financial Years
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by year..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Years Table */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-yellow-600" />
                  Financial Years ({years.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredYears.map((year) => (
                      <TableRow key={year.id}>
                        <TableCell className="font-medium">{year.year}</TableCell>
                        <TableCell>
                          <Badge variant={year.is_active ? "outline" : "secondary"}>
                            {year.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(year)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteYear(year.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Add New Year Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <div></div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Financial Year</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="year" className="text-right">
                      Year
                    </Label>
                    <Input
                      type="text"
                      id="year"
                      name="year"
                      value={newYear.year}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="is_active" className="text-right">
                      Active
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Switch
                        id="is_active"
                        checked={newYear.is_active}
                        onCheckedChange={handleSwitchChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" onClick={createYear} className="ml-2">
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Year Dialog */}
            <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
              <DialogTrigger asChild>
                <div></div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Financial Year</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="year" className="text-right">
                      Year
                    </Label>
                    <Input
                      type="text"
                      id="year"
                      name="year"
                      value={editYear.year}
                      onChange={handleEditInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="is_active" className="text-right">
                      Active
                    </Label>
                    <div className="col-span-3 flex items-center">
                      <Switch
                        id="is_active"
                        checked={editYear.is_active}
                        onCheckedChange={handleEditSwitchChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="secondary" onClick={() => setIsEditFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" onClick={updateYear} className="ml-2">
                    Update
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Years;
