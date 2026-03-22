"use client";

import * as React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export interface RTORecord {
  id: string;
  bookingNo: string;
  customer: string;
  vehicle: string;
  regNumber: string;
  status: "Applied" | "Pending" | "Approved";
  appliedDate: string;
  approvedDate: string;
  insuranceExpiry: string;
  notes: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: RTORecord;
}

export function RTODetailDialog({ open, onOpenChange, record }: Props) {
  const [form, setForm] = React.useState(record);

  React.useEffect(() => {
    setForm(record);
  }, [record]);

  const update = (field: keyof RTORecord, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>RTO Detail — {record.bookingNo}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Customer</Label>
            <Input value={form.customer} disabled />
          </div>
          <div className="grid gap-2">
            <Label>Vehicle</Label>
            <Input value={form.vehicle} disabled />
          </div>
          <div className="grid gap-2">
            <Label>Registration Number</Label>
            <Input value={form.regNumber} onChange={(e) => update("regNumber", e.target.value)} placeholder="e.g., UP32-AB-1234" />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => update("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Applied Date</Label>
              <Input type="date" value={form.appliedDate} onChange={(e) => update("appliedDate", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Approved Date</Label>
              <Input type="date" value={form.approvedDate} onChange={(e) => update("approvedDate", e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Insurance Expiry</Label>
            <Input type="date" value={form.insuranceExpiry} onChange={(e) => update("insuranceExpiry", e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Additional notes..." rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onOpenChange(false)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
