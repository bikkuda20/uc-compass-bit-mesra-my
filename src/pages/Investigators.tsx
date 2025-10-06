import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Users, Search, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";

const Investigators = () => {
  const [pis, setPis] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedPI, setSelectedPI] = useState<any>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchPIs = async () => {
    const { data, error } = await supabase
      .from('principal_investigators')
      .select('id, name, email, department, contact_number')
      .order('name');

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch investigators",
        variant: "destructive",
      });
    } else {
      setPis(data || []);
    }
  };

  const handleCreate = async () => {
    const { error } = await supabase.from('principal_investigators').insert({
      name,
      email,
      department,
      contact_number: contactNumber
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create investigator",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Investigator created" });
      setIsFormOpen(false);
      clearForm();
      fetchPIs();
    }
  };

  const handleEdit = (pi: any) => {
    setSelectedPI(pi);
    setName(pi.name);
    setEmail(pi.email || "");
    setDepartment(pi.department || "");
    setContactNumber(pi.contact_number || "");
    setIsEditFormOpen(true);
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from('principal_investigators')
      .update({
        name,
        email,
        department,
        contact_number: contactNumber
      })
      .eq('id', selectedPI.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update investigator",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Investigator updated" });
      setIsEditFormOpen(false);
      clearForm();
      fetchPIs();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('principal_investigators')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete investigator",
        variant: "destructive",
      });
    } else {
      toast({ title: "Deleted", description: "Investigator deleted" });
      fetchPIs();
    }
  };

  const clearForm = () => {
    setName("");
    setEmail("");
    setDepartment("");
    setContactNumber("");
    setSelectedPI(null);
  };

  useEffect(() => {
    fetchPIs();
  }, []);

  const filteredPIs = pis.filter((pi) =>
    pi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pi.email && pi.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (pi.department && pi.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (pi.contact_number && pi.contact_number.includes(searchQuery))
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 to-purple-100">
        <Sidebar />
        <SidebarInset>
          <div className="flex-1 ml-64 p-6 space-y-6">

            <div className="flex items-center justify-between mb-8">
              <Button variant="outline" onClick={() => navigate('/')} className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Principal Investigators</h1>
                <p className="text-gray-600">Manage investigators and their details</p>
              </div>
              <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                Add New PI
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2 text-blue-600" />
                  Search Investigators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Input
                    placeholder="Search by name, email, department or contact..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Investigators ({filteredPIs.length})
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
                        <TableHead>Contact Number</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPIs.map((pi) => (
                        <TableRow key={pi.id}>
                          <TableCell>{pi.name}</TableCell>
                          <TableCell>{pi.email || "-"}</TableCell>
                          <TableCell>{pi.department || "-"}</TableCell>
                          <TableCell>{pi.contact_number || "-"}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(pi)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(pi.id)}>
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

            {/* Add Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Investigator</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />

                  <Label>Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />

                  <Label>Department</Label>
                  <Input value={department} onChange={(e) => setDepartment(e.target.value)} />

                  <Label>Contact Number</Label>
                  <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleCreate}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Investigator</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />

                  <Label>Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} />

                  <Label>Department</Label>
                  <Input value={department} onChange={(e) => setDepartment(e.target.value)} />

                  <Label>Contact Number</Label>
                  <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleUpdate}>Update</Button>
                </div>
              </DialogContent>
            </Dialog>

          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Investigators;
