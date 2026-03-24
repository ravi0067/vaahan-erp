"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, ChevronDown, ChevronRight, Download, Send, RefreshCw } from "lucide-react";
import { SendAlertDialog } from "@/components/alerts/SendAlertDialog";
import { Button } from "@/components/ui/button";
import { CustomerDetail, type Customer } from "./components/CustomerDetail";
import { exportToCSV } from "@/lib/export-csv";
import { apiGet } from "@/lib/api";
import { toast } from "sonner";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [alertCustomer, setAlertCustomer] = React.useState<Customer | null>(null);

  const fetchCustomers = React.useCallback(async () => {
    setLoading(true);
    try {
      const raw = await apiGet<any[]>('/api/customers');
      const data = Array.isArray(raw) ? raw : [];
      // Map API data to Customer format
      const mapped: Customer[] = data.map((c: any) => {
        const totalPaid = c.bookings?.reduce((sum: number, b: any) => sum + (b.paidAmount || 0), 0) || 0;
        const totalAmount = c.bookings?.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0) || 0;
        return {
          id: c.id,
          name: c.name,
          mobile: c.mobile,
          email: c.email || '',
          address: c.address || '',
          totalBookings: c.bookings?.length || 0,
          totalPaid,
          pending: Math.max(0, totalAmount - totalPaid),
          bookings: c.bookings?.map((b: any) => ({
            bookingNo: b.bookingNumber,
            vehicle: 'Vehicle',
            date: new Date(b.createdAt || Date.now()).toLocaleDateString('en-IN'),
            amount: b.totalAmount || 0,
            status: b.status || 'DRAFT',
          })) || [],
          payments: [],
        };
      });
      setCustomers(mapped);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.mobile.includes(q);
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <Card><CardContent className="p-6"><div className="h-64 bg-muted animate-pulse rounded" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Customer Ledger</h1>
          <p className="text-muted-foreground text-sm">{customers.length} customers with booking & payment history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCustomers} className="gap-1">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(filtered.map(c => ({ name: c.name, mobile: c.mobile, email: c.email, totalBookings: c.totalBookings, totalPaid: c.totalPaid, pending: c.pending })) as unknown as Record<string, unknown>[], "customer-ledger", [
              { key: "name", label: "Name" },
              { key: "mobile", label: "Mobile" },
              { key: "email", label: "Email" },
              { key: "totalBookings", label: "Total Bookings" },
              { key: "totalPaid", label: "Total Paid" },
              { key: "pending", label: "Pending" },
            ])}
          >
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or mobile..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="text-center">Bookings</TableHead>
                <TableHead className="text-right">Total Paid</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <React.Fragment key={c.id}>
                  <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                    <TableCell>
                      {expandedId === c.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.mobile}</TableCell>
                    <TableCell className="hidden md:table-cell">{c.email || '—'}</TableCell>
                    <TableCell className="text-center">{c.totalBookings}</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">{fmt(c.totalPaid)}</TableCell>
                    <TableCell className="text-right">
                      {c.pending > 0 ? (
                        <span className="text-red-600 font-medium">{fmt(c.pending)}</span>
                      ) : (
                        <span className="text-green-600">Clear ✓</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-blue-600"
                        onClick={(e) => { e.stopPropagation(); setAlertCustomer(c); }}
                        title="Send Alert"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedId === c.id && (
                    <TableRow>
                      <TableCell colSpan={8} className="p-0 bg-muted/30">
                        <CustomerDetail customer={c} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No customers found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {alertCustomer && (
        <SendAlertDialog
          open={!!alertCustomer}
          onClose={() => setAlertCustomer(null)}
          recipient={{
            name: alertCustomer.name,
            mobile: alertCustomer.mobile,
            email: alertCustomer.email,
          }}
          context={{
            bookingId: alertCustomer.bookings[0]?.bookingNo || '',
            vehicle: alertCustomer.bookings[0]?.vehicle || '',
            amount: alertCustomer.totalPaid + alertCustomer.pending,
            remaining: alertCustomer.pending,
          }}
        />
      )}
    </div>
  );
}
