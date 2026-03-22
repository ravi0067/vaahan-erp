"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useBookingWizardStore, type CustomerData } from "@/store/booking-wizard-store";
import { Search, UserPlus, Phone } from "lucide-react";

// Mock existing customers
const mockCustomers: CustomerData[] = [
  { id: "C001", name: "Raj Kumar", mobile: "9876543210", email: "raj@email.com", address: "Lucknow", aadharNo: "1234-5678-9012", panNo: "ABCDE1234F" },
  { id: "C002", name: "Priya Singh", mobile: "9988776655", email: "priya@email.com", address: "Kanpur", aadharNo: "9876-5432-1098", panNo: "FGHIJ5678K" },
  { id: "C003", name: "Suresh Yadav", mobile: "8877665544", email: "suresh@email.com", address: "Varanasi", aadharNo: "5678-1234-9090", panNo: "KLMNO9012P" },
];

export function Step1Customer() {
  const { customer, setCustomer, nextStep } = useBookingWizardStore();
  const [searchMobile, setSearchMobile] = React.useState("");
  const [found, setFound] = React.useState<CustomerData | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mode, setMode] = React.useState<"search" | "new">("search");
  const [form, setForm] = React.useState<CustomerData>(customer.name ? customer : {
    name: "", mobile: "", email: "", address: "", aadharNo: "", panNo: "",
  });

  const handleSearch = () => {
    const match = mockCustomers.find((c) => c.mobile === searchMobile);
    if (match) {
      setFound(match);
      setForm(match);
    } else {
      setFound(null);
      setMode("new");
      setForm((prev) => ({ ...prev, mobile: searchMobile }));
    }
  };

  const handleContinue = () => {
    setCustomer(form);
    nextStep();
  };

  const isValid = form.name && form.mobile && form.aadharNo;

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> Find Existing Customer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter mobile number..."
                value={searchMobile}
                onChange={(e) => setSearchMobile(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {found && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-800">{found.name}</p>
                  <p className="text-sm text-green-600">{found.mobile} • {found.address}</p>
                </div>
                <Badge className="bg-green-600">Found</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-sm text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>

      {/* New Customer Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" /> {found ? "Customer Details" : "Create New Customer"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Full Name *</Label>
              <Input
                placeholder="Enter full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Mobile Number *</Label>
              <Input
                placeholder="10-digit mobile"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
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
            <div className="grid gap-2">
              <Label>Address</Label>
              <Input
                placeholder="Full address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Aadhar Number *</Label>
              <Input
                placeholder="XXXX-XXXX-XXXX"
                value={form.aadharNo}
                onChange={(e) => setForm({ ...form, aadharNo: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>PAN Number</Label>
              <Input
                placeholder="ABCDE1234F"
                value={form.panNo}
                onChange={(e) => setForm({ ...form, panNo: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={handleContinue} disabled={!isValid} className="mt-6 w-full sm:w-auto">
            {found ? "Select & Continue" : "Create & Continue"} →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
