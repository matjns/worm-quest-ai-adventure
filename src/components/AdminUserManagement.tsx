import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminControls, AdminUser } from "@/hooks/useAdminControls";
import { Users, Shield, Edit, Search, ShieldCheck, ShieldX, RefreshCw, Calendar, Mail } from "lucide-react";
import { toast } from "sonner";

export function AdminUserManagement() {
  const { users, fetchUsers, updateUserDisplayName, setUserRole, isAdmin } = useAdminControls();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    setIsRefreshing(false);
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setNewDisplayName(user.display_name || "");
  };

  const handleSaveDisplayName = async () => {
    if (!editingUser || !newDisplayName.trim()) return;
    
    setIsUpdating(true);
    const success = await updateUserDisplayName(editingUser.user_id, newDisplayName.trim());
    setIsUpdating(false);
    
    if (success) {
      setEditingUser(null);
    }
  };

  const handleToggleAdmin = async (user: AdminUser) => {
    const confirmed = window.confirm(
      user.is_admin 
        ? `Remove admin privileges from ${user.display_name || user.email}?`
        : `Grant admin privileges to ${user.display_name || user.email}?`
    );
    
    if (confirmed) {
      await setUserRole(user.user_id, 'admin', !user.is_admin);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage all registered users, modify display names, and assign roles
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-sm text-muted-foreground">Total Users</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{users.filter(u => u.is_admin).length}</div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">
              {users.filter(u => {
                if (!u.last_sign_in_at) return false;
                const lastSignIn = new Date(u.last_sign_in_at);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return lastSignIn > weekAgo;
              }).length}
            </div>
            <div className="text-sm text-muted-foreground">Active This Week</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or display name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users Table */}
        <ScrollArea className="h-[400px] border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.display_name || "No name"}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(user.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.last_sign_in_at)}
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">User</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Display Name</label>
                              <Input
                                value={newDisplayName}
                                onChange={(e) => setNewDisplayName(e.target.value)}
                                placeholder="Enter display name"
                              />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Email: {editingUser?.email}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={handleSaveDisplayName}
                              disabled={isUpdating}
                            >
                              {isUpdating ? "Saving..." : "Save Changes"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAdmin(user)}
                        title={user.is_admin ? "Remove admin" : "Make admin"}
                      >
                        {user.is_admin ? (
                          <ShieldX className="w-4 h-4 text-destructive" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-primary" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {searchQuery ? "No users match your search" : "No users found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
