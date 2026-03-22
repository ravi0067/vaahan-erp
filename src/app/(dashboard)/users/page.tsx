"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";
import { AddUserDialog } from "./components/AddUserDialog";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

const mockUsers: User[] = [
  { id: "1", name: "Ravi Kumar", email: "ravi@vaahan.com", role: "Owner", active: true },
  { id: "2", name: "Amit Singh", email: "amit@vaahan.com", role: "Manager", active: true },
  { id: "3", name: "Priya Sharma", email: "priya@vaahan.com", role: "Sales Exec", active: true },
  { id: "4", name: "Neha Gupta", email: "neha@vaahan.com", role: "Accountant", active: true },
  { id: "5", name: "Sunil Yadav", email: "sunil@vaahan.com", role: "Mechanic", active: false },
  { id: "6", name: "Deepak Tiwari", email: "deepak@vaahan.com", role: "Viewer", active: true },
];

const roles = ["Owner", "Manager", "Sales Exec", "Accountant", "Mechanic", "Viewer"];
const modules = ["Dashboard", "Leads", "Stock", "Bookings", "Sales", "Service", "CashFlow", "Expenses", "Reports", "Settings"];
const permissions = ["View", "Edit", "Delete", "Export"];

const roleColor = (r: string) => {
  const c: Record<string, string> = {
    Owner: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    Manager: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    "Sales Exec": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    Accountant: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    Mechanic: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    Viewer: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };
  return c[r] || "";
};

// Default permission matrix
const defaultPerms: Record<string, Record<string, boolean[]>> = {};
roles.forEach((role) => {
  defaultPerms[role] = {};
  modules.forEach((mod) => {
    if (role === "Owner") defaultPerms[role][mod] = [true, true, true, true];
    else if (role === "Manager") defaultPerms[role][mod] = [true, true, false, true];
    else if (role === "Sales Exec") defaultPerms[role][mod] = ["Dashboard", "Leads", "Bookings", "Sales"].includes(mod) ? [true, true, false, false] : [true, false, false, false];
    else if (role === "Accountant") defaultPerms[role][mod] = ["Dashboard", "CashFlow", "Expenses", "Reports"].includes(mod) ? [true, true, false, true] : [true, false, false, false];
    else if (role === "Mechanic") defaultPerms[role][mod] = mod === "Service" ? [true, true, false, false] : [mod === "Dashboard", false, false, false];
    else defaultPerms[role][mod] = [true, false, false, false];
  });
});

export default function UsersPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<User | null>(null);
  const [perms, setPerms] = React.useState(defaultPerms);

  const togglePerm = (role: string, mod: string, permIdx: number) => {
    setPerms((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      next[role][mod][permIdx] = !next[role][mod][permIdx];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Users & Roles</h1>
          <p className="text-muted-foreground text-sm">Manage team access and permissions</p>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-end">
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
                  {mockUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Badge className={roleColor(u.role)}>{u.role}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={u.active ? "default" : "secondary"}>
                          {u.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditUser(u); setDialogOpen(true); }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
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
            <Button>Save Permissions</Button>
          </div>
        </TabsContent>
      </Tabs>

      <AddUserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editUser} />
    </div>
  );
}
