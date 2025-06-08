import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Users, Search, ArrowLeft } from "lucide-react";
import { usePrincipalInvestigators } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Investigators = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedPI, setSelectedPI] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { pis, loading, refetch } = usePrincipalInvestigators();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [filteredPIs, setFilteredPIs] = useState(pis);

  useEffect(() => {
    setFilteredPIs(
      pis.filter((pi) =>
        pi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pi.email && pi.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (pi.department && pi.department.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  }, [searchQuery, pis]);

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('principal_investigators')
        .insert({ name, email, department });

      if (error) {
        console.error("Error creating PI:", error);
        toast({
          title: "Error",
          description: "Failed to create principal investigator",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Principal investigator created successfully",
      });
      setIsFormOpen(false);
      setName("");
      setEmail("");
      setDepartment("");
      refetch();
    } catch (error) {
      console.error("Error creating PI:", error);
      toast({
        title: "Error",
        description: "Failed to create principal investigator",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (pi: any) => {
    setSelectedPI(pi);
    setName(pi.name);
    setEmail(pi.email || "");
    setDepartment(pi.department || "");
    setIsEditFormOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedPI) return;

    try {
      const { error } = await supabase
        .from('principal_investigators')
        .update({ name, email, department })
        .eq('id', selectedPI.id);

      if (error) {
        console.error("Error updating PI:", error);
        toast({
          title: "Error",
          description: "Failed to update principal investigator",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Principal investigator updated successfully",
      });
      setIsEditFormOpen(false);
      setSelectedPI(null);
      setName("");
      setEmail("");
      setDepartment("");
      refetch();
    } catch (error) {
      console.error("Error updating PI:", error);
      toast({
        title: "Error",
        description: "Failed to update principal investigator",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('principal_investigators')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting PI:", error);
        toast({
          title: "Error",
          description: "Failed to delete principal investigator",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Principal investigator deleted successfully",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting PI:", error);
      toast({
        title: "Error",
        description: "Failed to delete principal investigator",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen">
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
            <h1 className="text-3xl font-bold text-gray-900">Principal Investigators</h1>
            <p className="text-gray-600">Manage principal investigators and their details</p>
          </div>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          Add New PI
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-600" />
            Search Principal Investigators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* PI Table */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Principal Investigators ({filteredPIs.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPIs.map((pi) => (
                  <TableRow key={pi.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{pi.name}</TableCell>
                    <TableCell>{pi.email || "-"}</TableCell>
                    <TableCell>{pi.department || "-"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(pi)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(pi.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create PI Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Principal Investigator</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={handleCreate}>
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit PI Dialog */}
      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Principal Investigator</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={handleUpdate}>
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Investigators;
