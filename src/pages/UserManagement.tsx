
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Users, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Sidebar";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    role: "user",
    is_active: true,
    password: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users...');
      
      // First, let's check if we can connect to Supabase
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count(*)', { count: 'exact', head: true });
      
      console.log('Connection test:', { testData, testError });
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Users query result:', { data, error });

      if (error) {
        console.error('Error fetching users:', error);
        
        // If it's an RLS policy issue, show a more helpful message
        if (error.code === 'PGRST116' || error.message.includes('policy')) {
          toast({
            title: "Access Restricted",
            description: "You don't have permission to view users. Admin access required.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to fetch users: ${error.message}`,
            variant: "destructive",
          });
        }
        return;
      }

      setUsers(data || []);
      toast({
        title: "Success",
        description: `Loaded ${data?.length || 0} users`,
      });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: `Failed to fetch users: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update({
            email: formData.email,
            full_name: formData.full_name,
            role: formData.role,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingUser.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        // Create new user - first create auth user, then profile
        if (!formData.password) {
          throw new Error("Password is required for new users");
        }

        console.log('Creating new user with email:', formData.email);

        // Create auth user using regular signUp
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              role: formData.role,
            }
          }
        });

        if (authError) {
          console.error('Auth creation error:', authError);
          throw authError;
        }

        if (!authData.user) {
          throw new Error("Failed to create user");
        }

        console.log('Auth user created:', authData.user.id);

        // Create profile in public.users table using the auth user's ID
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            email: formData.email,
            full_name: formData.full_name,
            role: formData.role,
            is_active: formData.is_active,
          }]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }

        console.log('Profile created successfully');

        toast({
          title: "Success",
          description: "User created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({
        email: "",
        full_name: "",
        role: "user",
        is_active: true,
        password: "",
      });
      
      // Refresh the users list
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name || "",
      role: user.role,
      is_active: user.is_active,
      password: "", // Don't populate password for editing
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      // Refresh the users list
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'destructive'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-green-50">
          <Sidebar />
          <SidebarInset>
            <div className="flex-1 ml-64">
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading users...</span>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Sidebar />
        <SidebarInset>
          <div className="flex-1 ml-64">
            <div className="p-6 space-y-6">
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
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600">Manage system users and their permissions</p>
                  </div>
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Add User</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        />
                      </div>
                      {!editingUser && (
                        <div>
                          <Label htmlFor="password">Password *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                            placeholder="Enter password for new user"
                          />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="role">Role *</Label>
                        <Select 
                          value={formData.role} 
                          onValueChange={(value) => setFormData({...formData, role: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="is_active">Status</Label>
                        <Select 
                          value={formData.is_active.toString()} 
                          onValueChange={(value) => setFormData({...formData, is_active: value === 'true'})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingUser ? 'Update' : 'Create'} User
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    System Users ({users.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.length > 0 ? (
                          users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-gray-50">
                              <TableCell className="font-medium">{user.email}</TableCell>
                              <TableCell>{user.full_name || 'N/A'}</TableCell>
                              <TableCell>{getRoleBadge(user.role)}</TableCell>
                              <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(user)}
                                    className="flex items-center"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(user.id)}
                                    className="flex items-center text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                              <p className="text-gray-500">No users found</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UserManagement;
