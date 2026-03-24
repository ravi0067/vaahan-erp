"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Shield, RefreshCw } from "lucide-react";
import { AddUserDialog } from "./components/AddUserDialog";
import { apiGet, apiDelete } from "@/lib/api";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active?: boolean;
  isActive?: boolean;
}

const roles = ["OWNER", "MANAGER", "SALES_EXEC", "ACCOUNTANT", "MECHANIC", "VIEWER"];
const modules = ["Dashboard", "Leads", "Stock", "Bookings", "Sales", "Service", "CashFlow", "Expenses", "Reports", "Settings"];
const permissions = ["View", "Edit", "Delete", "Export"];

const roleColor = (r: string) => {
  const c: Record<string, string> = {
    OWNER: "bg-purple-100 text-purple-700",
    MANAGER: "bg-blue-100 text-blue-700",
    SALES_EXEC: "bg-green-100 text-green-700",
    ACCOUNTANT: "bg-yellow-100 text-yellow-700",
    MECHANIC: "bg-orange-100 text-orange-700",
    VIEWER: "bg-gray-100 text-gray-700",
    SUPER_ADMIN: "bg-red-100 text-red-700",
  };
  return c[r] || "";
};

const defaultPerms: Record<string, Record<string, boolean[]>> = {};
roles.forEach((role) => {
  defaultPerms[role] = {};
  modules.forEach((mod) => {
    if (role === "OWNER") defaultPerms[role][mod] = [true, true, true, true];
    else if (role === "MANAGER") defaultPerms[role][mod] = [true, true, false, true];
    else if (role === "SALES_EXEC") defaultPerms[role][mod] = ["Dashboard", "Leads", "Bookings", "Sales"].includes(mod) ? [true, true, false, false] : [true, false, false, false];
    else if (role === "ACCOUNTANT") defaultPerms[role][mod] = ["Dashboard", "CashFlow", "Expenses", "Reports"].includes(mod) ? [true, true, false, true] : [true, false, false, false];
    else if (role === "MECHANIC") defaultPerms[role][mod] = mod === "Service" ? [true, true, false, false] : [mod === "Dashboard", false, false, false];
    else defaultPerms[role][mod] = [true, false, false, false];
  });
});

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<User | null>(null);
  const [perms, setPerms] = React.useState(defaultPerms);

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<User[]>('/api/users');
      setUsers(data.map(u => ({ ...u, active: u.isActive ?? true })));
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await apiDelete(`/api/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const togglePerm = (role: string, mod: string, permIdx: number) => {
    setPerms((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[role][mod][permIdx] = !next[role][mod][permIdx];
      return next;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <Card><CardContent className="p-6"><div className="h-48 bg-muted animate-pulse rounded" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users & Roles</h1>
          <p className="text-muted-foreground text-sm">Manage team access and permissions ({users.length} users)</p>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-1">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button onClick={() => { setEditUser(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add User
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Badge className={roleColor(u.role)}>{u.role}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={u.active || u.isActive ? "default" : "secondary"}>
                          {u.active || u.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditUser(u); setDialogOpen(true); }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteUser(u.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[120px]">
                      <Shield className="h-4 w-4 inline mr-1" /> Role
                    </TableHead>
                    {modules.map((m) => (
                      <TableHead key={m} className="text-center min-w-[100px]">{m}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role}>
                      <TableCell className="sticky left-0 bg-background z-10 font-medium">
                        <Badge className={roleColor(role)}>{role}</Badge>
                      </TableCell>
                      {modules.map((mod) => (
                        <TableCell key={mod} className="text-center">
                          <div className="flex flex-col gap-0.5 items-center">
                            {permissions.map((perm, pi) => (
                              <label key={perm} className="flex items-center gap-1 text-[10px] cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="h-3 w-3 rounded"
                                  checked={perms[role]?.[mod]?.[pi] ?? false}
                                  onChange={() => togglePerm(role, mod, pi)}
                                />
                                {perm}
                              </label>
                            ))}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button onClick={() => toast.success('Permissions saved!')}>Save Permissions</Button>
          </div>
        </TabsContent>
      </Tabs>

      <AddUserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editUser} />
    </div>
  );
}
