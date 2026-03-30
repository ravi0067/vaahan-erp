"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Eye, EyeOff, Building2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");

  const [formData, setFormData] = useState({
    clientName: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    firmName: "",
    gstNumber: "",
    address: "",
    showroomType: "BIKE",
    brandName: "",
    brandType: "BIKE",
    locationName: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccess(true);
      setSuccessEmail(data.ownerEmail);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="w-full max-w-md space-y-4">
          <Card className="border-green-200">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-700">🎉 Registration Successful!</h2>
              <p className="text-muted-foreground">
                Your dealership has been registered successfully.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-1">
                <p className="text-sm"><strong>Login Email:</strong> {successEmail}</p>
                <p className="text-sm"><strong>Password:</strong> (the one you just set)</p>
              </div>
              <p className="text-sm text-muted-foreground">
                You can now login and start managing your dealership.
              </p>
              <Link href="/login">
                <Button className="w-full mt-2" size="lg">
                  🚀 Go to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-lg space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <Card>
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto mb-2">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                <Building2 className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Register Your Dealership</CardTitle>
            <CardDescription>
              Create your VaahanERP account — Free to start, upgrade anytime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="clientName">Dealership Name *</Label>
                    <Input
                      id="clientName"
                      placeholder="e.g., Shri Bajrang Motors"
                      value={formData.clientName}
                      onChange={(e) => updateField("clientName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ownerName">Owner Name *</Label>
                    <Input
                      id="ownerName"
                      placeholder="Full name"
                      value={formData.ownerName}
                      onChange={(e) => updateField("ownerName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+91-9876543210"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
              </div>

              {/* Business Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Business Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="firmName">Firm / Company Name</Label>
                    <Input
                      id="firmName"
                      placeholder="Legal business name"
                      value={formData.firmName}
                      onChange={(e) => updateField("firmName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input
                      id="gstNumber"
                      placeholder="e.g., 09ABCDE1234F1Z5"
                      value={formData.gstNumber}
                      onChange={(e) => updateField("gstNumber", e.target.value.toUpperCase())}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Complete address with pincode"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              {/* Showroom & Brand */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Showroom Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Showroom Type</Label>
                    <Select
                      value={formData.showroomType}
                      onValueChange={(v) => {
                        updateField("showroomType", v);
                        updateField("brandType", v);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BIKE">🏍️ Two Wheeler</SelectItem>
                        <SelectItem value="CAR">🚗 Four Wheeler</SelectItem>
                        <SelectItem value="EV">⚡ Electric Vehicle</SelectItem>
                        <SelectItem value="MULTI">🔄 Multi-Vehicle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="brandName">Brand Name</Label>
                    <Input
                      id="brandName"
                      placeholder="e.g., Honda, Hero, Maruti"
                      value={formData.brandName}
                      onChange={(e) => updateField("brandName", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="locationName">Showroom Location Name</Label>
                  <Input
                    id="locationName"
                    placeholder="e.g., Main Showroom, Chinhat Branch"
                    value={formData.locationName}
                    onChange={(e) => updateField("locationName", e.target.value)}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating your account..." : "🚀 Register My Dealership"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Login here
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By registering, you agree to our Terms of Service. Powered by Ravi Accounting Services.
        </p>
      </div>
    </div>
  );
}
