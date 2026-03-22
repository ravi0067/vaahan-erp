"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const models = [
  "Honda Activa 6G",
  "Honda SP 125",
  "Honda Shine",
  "Honda Unicorn",
  "Honda CB350",
  "Honda Dio",
];

const sources = [
  "Walk-in",
  "Phone Call",
  "Website",
  "WhatsApp",
  "Referral",
  "Social Media",
  "OLX/Classified",
];

export interface LeadFormData {
  name: string;
  mobile: string;
  email: string;
  interestedModel: string;
  location: string;
  source: string;
  notes: string;
}

interface AddLeadDialogProps {
  onAdd: (lead: LeadFormData) => void;
}

export function AddLeadDialog({ onAdd }: AddLeadDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<LeadFormData>({
    name: "",
    mobile: "",
    email: "",
    interestedModel: "",
    location: "",
    source: "",
    notes: "",
  });

  const handleSubmit = () => {
    if (!form.name || !form.mobile) return;
    onAdd(form);
    setForm({ name: "", mobile: "", email: "", interestedModel: "", location: "", source: "", notes: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Mobile *</Label>
              <Input
                placeholder="10-digit mobile"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Interested Model</Label>
              <Select
                value={form.interestedModel}
                onValueChange={(v) => setForm({ ...form, interestedModel: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Source</Label>
              <Select
                value={form.source}
                onValueChange={(v) => setForm({ ...form, source: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lead source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Location</Label>
            <Input
              placeholder="City / Area"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Any additional notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.name || !form.mobile}>
            Add Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
