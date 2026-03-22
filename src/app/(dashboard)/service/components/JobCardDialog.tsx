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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

export interface PartLine {
  name: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface JobCard {
  id: string;
  jobNo: string;
  vehicleReg: string;
  customerName: string;
  customerMobile: string;
  complaints: string;
  diagnosis: string;
  parts: PartLine[];
  labourCharge: number;
  status: string;
  mechanic: string;
  totalBilled: number;
  received: number;
  pending: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobCard | null;
}

const emptyPart: PartLine = { name: "", qty: 1, rate: 0, amount: 0 };

const mechanics = ["Amit", "Raju", "Sunil", "Deepak"];

export function JobCardDialog({ open, onOpenChange, job }: Props) {
  const [vehicleReg, setVehicleReg] = React.useState("");
  const [customerName, setCustomerName] = React.useState("");
  const [customerMobile, setCustomerMobile] = React.useState("");
  const [complaints, setComplaints] = React.useState("");
  const [diagnosis, setDiagnosis] = React.useState("");
  const [parts, setParts] = React.useState<PartLine[]>([{ ...emptyPart }]);
  const [labourCharge, setLabourCharge] = React.useState(0);
  const [status, setStatus] = React.useState("Open");
  const [mechanic, setMechanic] = React.useState("");

  React.useEffect(() => {
    if (job) {
      setVehicleReg(job.vehicleReg);
      setCustomerName(job.customerName);
      setCustomerMobile(job.customerMobile);
      setComplaints(job.complaints);
      setDiagnosis(job.diagnosis);
      setParts(job.parts.length ? job.parts : [{ ...emptyPart }]);
      setLabourCharge(job.labourCharge);
      setStatus(job.status);
      setMechanic(job.mechanic);
    } else {
      setVehicleReg(""); setCustomerName(""); setCustomerMobile("");
      setComplaints(""); setDiagnosis(""); setParts([{ ...emptyPart }]);
      setLabourCharge(0); setStatus("Open"); setMechanic("");
    }
  }, [job, open]);

  const updatePart = (idx: number, field: keyof PartLine, value: string | number) => {
    setParts((prev) => {
      const next = [...prev];
      const p = { ...next[idx], [field]: value };
      if (field === "qty" || field === "rate") p.amount = p.qty * p.rate;
      next[idx] = p;
      return next;
    });
  };

  const addPart = () => setParts((prev) => [...prev, { ...emptyPart }]);
  const removePart = (idx: number) => setParts((prev) => prev.filter((_, i) => i !== idx));

  const partsTotal = parts.reduce((s, p) => s + p.amount, 0);
  const totalBilled = partsTotal + labourCharge;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? `Edit Job Card — ${job.jobNo}` : "New Job Card"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Vehicle Reg No</Label>
              <Input value={vehicleReg} onChange={(e) => setVehicleReg(e.target.value)} placeholder="UP32-XX-0000" />
            </div>
            <div className="grid gap-2">
              <Label>Customer Name</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Customer Mobile</Label>
              <Input value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Complaints</Label>
            <Textarea value={complaints} onChange={(e) => setComplaints(e.target.value)} rows={2} placeholder="Customer complaints..." />
          </div>
          <div className="grid gap-2">
            <Label>Diagnosis</Label>
            <Textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2} placeholder="Mechanic diagnosis..." />
          </div>

          {/* Parts */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Parts Used</Label>
              <Button variant="outline" size="sm" onClick={addPart}><Plus className="h-3 w-3 mr-1" /> Add Part</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Name</TableHead>
                  <TableHead className="w-20">Qty</TableHead>
                  <TableHead className="w-24">Rate (₹)</TableHead>
                  <TableHead className="w-24">Amount</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell><Input value={p.name} onChange={(e) => updatePart(i, "name", e.target.value)} placeholder="Part name" /></TableCell>
                    <TableCell><Input type="number" value={p.qty} onChange={(e) => updatePart(i, "qty", parseInt(e.target.value) || 0)} min={1} /></TableCell>
                    <TableCell><Input type="number" value={p.rate} onChange={(e) => updatePart(i, "rate", parseFloat(e.target.value) || 0)} /></TableCell>
                    <TableCell className="font-medium">{fmt(p.amount)}</TableCell>
                    <TableCell>
                      {parts.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removePart(i)}>
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="text-right text-sm text-muted-foreground">Parts Total: <span className="font-semibold text-foreground">{fmt(partsTotal)}</span></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Labour Charge (₹)</Label>
              <Input type="number" value={labourCharge} onChange={(e) => setLabourCharge(parseFloat(e.target.value) || 0)} />
            </div>
            <div className="grid gap-2">
              <Label>Assign Mechanic</Label>
              <Select value={mechanic} onValueChange={setMechanic}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {mechanics.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-right">
            <p className="text-lg font-bold">Total Billed: {fmt(totalBilled)}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onOpenChange(false)}>{job ? "Update" : "Create"} Job Card</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
