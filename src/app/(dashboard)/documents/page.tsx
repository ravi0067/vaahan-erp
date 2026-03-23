"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileText, Upload, Download, Eye, Edit, Trash2, Search,
  Plus, Filter, RefreshCw, CheckCircle, Clock, AlertTriangle,
  User, Car, Shield, FileCheck, Image, File, X
} from "lucide-react";
import { toast } from "sonner";

// Document types for dealership
const documentTypes = [
  { value: "AADHAR", label: "Aadhar Card", icon: "🪪" },
  { value: "PAN", label: "PAN Card", icon: "💳" },
  { value: "DL", label: "Driving License", icon: "🚗" },
  { value: "RC", label: "RC (Registration Certificate)", icon: "📋" },
  { value: "INSURANCE", label: "Insurance Policy", icon: "🛡️" },
  { value: "FORM_20", label: "Form 20 (Sale Letter)", icon: "📄" },
  { value: "FORM_21", label: "Form 21 (Delivery Note)", icon: "📄" },
  { value: "FORM_22", label: "Form 22 (Road Worthiness)", icon: "📄" },
  { value: "INVOICE", label: "Tax Invoice", icon: "🧾" },
  { value: "FINANCE_DOCS", label: "Finance Documents", icon: "🏦" },
  { value: "NOC", label: "NOC (No Objection Certificate)", icon: "📝" },
  { value: "POLLUTION", label: "Pollution Certificate", icon: "🌿" },
  { value: "PHOTO", label: "Customer Photo", icon: "📸" },
  { value: "SIGNATURE", label: "Signature", icon: "✍️" },
  { value: "OTHER", label: "Other Document", icon: "📁" },
];

interface CustomerDoc {
  id: string;
  customerName: string;
  customerMobile: string;
  vehicleModel: string;
  bookingId: string;
  documents: DocFile[];
}

interface DocFile {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  status: "VERIFIED" | "PENDING" | "REJECTED";
  notes: string;
}

// Mock data
const mockCustomerDocs: CustomerDoc[] = [
  {
    id: "1", customerName: "Rahul Kumar", customerMobile: "9876543210",
    vehicleModel: "KTM Duke 200", bookingId: "BK-001",
    documents: [
      { id: "d1", type: "AADHAR", fileName: "rahul_aadhar.pdf", fileUrl: "#", uploadedAt: "2026-03-20", status: "VERIFIED", notes: "" },
      { id: "d2", type: "PAN", fileName: "rahul_pan.jpg", fileUrl: "#", uploadedAt: "2026-03-20", status: "VERIFIED", notes: "" },
      { id: "d3", type: "INSURANCE", fileName: "insurance_policy.pdf", fileUrl: "#", uploadedAt: "2026-03-21", status: "VERIFIED", notes: "" },
      { id: "d4", type: "RC", fileName: "", fileUrl: "", uploadedAt: "", status: "PENDING", notes: "RTO se aana baaki hai" },
    ]
  },
  {
    id: "2", customerName: "Priya Sharma", customerMobile: "9876543211",
    vehicleModel: "Triumph Speed 400", bookingId: "BK-002",
    documents: [
      { id: "d5", type: "AADHAR", fileName: "priya_aadhar.pdf", fileUrl: "#", uploadedAt: "2026-03-19", status: "VERIFIED", notes: "" },
      { id: "d6", type: "DL", fileName: "priya_dl.jpg", fileUrl: "#", uploadedAt: "2026-03-19", status: "REJECTED", notes: "Blurry image, reupload needed" },
      { id: "d7", type: "FORM_20", fileName: "form20_priya.pdf", fileUrl: "#", uploadedAt: "2026-03-22", status: "PENDING", notes: "Verification pending" },
    ]
  },
  {
    id: "3", customerName: "Amit Verma", customerMobile: "9876543212",
    vehicleModel: "KTM RC 390", bookingId: "BK-003",
    documents: [
      { id: "d8", type: "AADHAR", fileName: "amit_aadhar.pdf", fileUrl: "#", uploadedAt: "2026-03-18", status: "VERIFIED", notes: "" },
      { id: "d9", type: "PAN", fileName: "amit_pan.pdf", fileUrl: "#", uploadedAt: "2026-03-18", status: "VERIFIED", notes: "" },
      { id: "d10", type: "RC", fileName: "rc_amit.pdf", fileUrl: "#", uploadedAt: "2026-03-23", status: "VERIFIED", notes: "RTO approved ✅" },
      { id: "d11", type: "INSURANCE", fileName: "insurance_amit.pdf", fileUrl: "#", uploadedAt: "2026-03-17", status: "VERIFIED", notes: "" },
      { id: "d12", type: "INVOICE", fileName: "invoice_amit.pdf", fileUrl: "#", uploadedAt: "2026-03-17", status: "VERIFIED", notes: "" },
    ]
  },
];

export default function DocumentsPage() {
  const [customerDocs, setCustomerDocs] = useState<CustomerDoc[]>(mockCustomerDocs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDoc | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{ customerId: string; docType: string } | null>(null);
  const [editDoc, setEditDoc] = useState<{ customerId: string; doc: DocFile } | null>(null);

  // Filter customers
  const filteredDocs = customerDocs.filter(c => {
    const matchesSearch = c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customerMobile.includes(searchQuery) ||
      c.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.bookingId.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === "ALL") return matchesSearch;
    if (filterStatus === "PENDING") return matchesSearch && c.documents.some(d => d.status === "PENDING");
    if (filterStatus === "REJECTED") return matchesSearch && c.documents.some(d => d.status === "REJECTED");
    if (filterStatus === "COMPLETE") return matchesSearch && c.documents.every(d => d.status === "VERIFIED");
    return matchesSearch;
  });

  // Stats
  const totalCustomers = customerDocs.length;
  const pendingDocs = customerDocs.reduce((sum, c) => sum + c.documents.filter(d => d.status === "PENDING").length, 0);
  const rejectedDocs = customerDocs.reduce((sum, c) => sum + c.documents.filter(d => d.status === "REJECTED").length, 0);
  const verifiedDocs = customerDocs.reduce((sum, c) => sum + c.documents.filter(d => d.status === "VERIFIED").length, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED": return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
      case "PENDING": return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "REJECTED": return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getDocIcon = (type: string) => {
    const docType = documentTypes.find(d => d.value === type);
    return docType?.icon || "📁";
  };

  const getDocLabel = (type: string) => {
    const docType = documentTypes.find(d => d.value === type);
    return docType?.label || type;
  };

  const handleUpload = (customerId: string, docType: string) => {
    setUploadTarget({ customerId, docType });
    setUploadDialogOpen(true);
  };

  const handleUploadSubmit = () => {
    if (!uploadTarget) return;
    
    // Simulate upload
    setCustomerDocs(prev => prev.map(c => {
      if (c.id === uploadTarget.customerId) {
        const existingDocIndex = c.documents.findIndex(d => d.type === uploadTarget.docType);
        const newDoc: DocFile = {
          id: `d_${Date.now()}`,
          type: uploadTarget.docType,
          fileName: `${uploadTarget.docType.toLowerCase()}_uploaded.pdf`,
          fileUrl: "#",
          uploadedAt: new Date().toISOString().split('T')[0],
          status: "PENDING",
          notes: "Newly uploaded — verification pending"
        };

        if (existingDocIndex >= 0) {
          const updatedDocs = [...c.documents];
          updatedDocs[existingDocIndex] = newDoc;
          return { ...c, documents: updatedDocs };
        } else {
          return { ...c, documents: [...c.documents, newDoc] };
        }
      }
      return c;
    }));

    toast.success("Document uploaded successfully!");
    setUploadDialogOpen(false);
    setUploadTarget(null);
  };

  const handleVerify = (customerId: string, docId: string) => {
    setCustomerDocs(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          documents: c.documents.map(d => d.id === docId ? { ...d, status: "VERIFIED" as const } : d)
        };
      }
      return c;
    }));
    toast.success("Document verified ✅");
  };

  const handleReject = (customerId: string, docId: string) => {
    setCustomerDocs(prev => prev.map(c => {
      if (c.id === customerId) {
        return {
          ...c,
          documents: c.documents.map(d => d.id === docId ? { ...d, status: "REJECTED" as const, notes: "Rejected — please reupload" } : d)
        };
      }
      return c;
    }));
    toast.error("Document rejected — customer ko reupload karna hoga");
  };

  const handleDelete = (customerId: string, docId: string) => {
    setCustomerDocs(prev => prev.map(c => {
      if (c.id === customerId) {
        return { ...c, documents: c.documents.filter(d => d.id !== docId) };
      }
      return c;
    }));
    toast.success("Document deleted");
  };

  const handleSendToCustomer = (customer: CustomerDoc) => {
    toast.success(`📱 Documents link sent to ${customer.customerName} on WhatsApp!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">📄 Document Management</h1>
          <p className="text-muted-foreground text-sm">Customer-wise documents — upload, verify, edit, share</p>
        </div>
        <Button onClick={() => toast.info("Select a customer to upload documents")}>
          <Upload className="h-4 w-4 mr-2" /> Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center"><User className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-sm text-muted-foreground">Customers</p><p className="text-xl font-bold">{totalCustomers}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-sm text-muted-foreground">Verified</p><p className="text-xl font-bold text-green-600">{verifiedDocs}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center"><Clock className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="text-sm text-muted-foreground">Pending</p><p className="text-xl font-bold text-yellow-600">{pendingDocs}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
            <div><p className="text-sm text-muted-foreground">Rejected</p><p className="text-xl font-bold text-red-600">{rejectedDocs}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, mobile, vehicle, booking ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Customers</SelectItem>
            <SelectItem value="PENDING">Has Pending Docs</SelectItem>
            <SelectItem value="REJECTED">Has Rejected Docs</SelectItem>
            <SelectItem value="COMPLETE">All Verified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Document Cards */}
      <div className="space-y-4">
        {filteredDocs.map((customer) => (
          <Card key={customer.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{customer.customerName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      📱 {customer.customerMobile} • 🏍️ {customer.vehicleModel} • 📋 {customer.bookingId}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleSendToCustomer(customer)}>
                    📱 Send to WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleUpload(customer.id, "OTHER")}>
                    <Upload className="h-3 w-3 mr-1" /> Upload
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <span className="mr-2">{getDocIcon(doc.type)}</span>
                        {getDocLabel(doc.type)}
                      </TableCell>
                      <TableCell>
                        {doc.fileName ? (
                          <span className="text-sm text-blue-600 hover:underline cursor-pointer">{doc.fileName}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Not uploaded</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{doc.uploadedAt || "—"}</TableCell>
                      <TableCell>{getStatusBadge(doc.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{doc.notes || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {doc.fileName && (
                            <>
                              <Button size="sm" variant="ghost" title="View"><Eye className="h-3 w-3" /></Button>
                              <Button size="sm" variant="ghost" title="Download"><Download className="h-3 w-3" /></Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" title="Upload/Reupload" onClick={() => handleUpload(customer.id, doc.type)}>
                            <Upload className="h-3 w-3" />
                          </Button>
                          {doc.status === "PENDING" && (
                            <>
                              <Button size="sm" variant="ghost" className="text-green-600" title="Verify" onClick={() => handleVerify(customer.id, doc.id)}>
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600" title="Reject" onClick={() => handleReject(customer.id, doc.id)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" className="text-red-500" title="Delete" onClick={() => handleDelete(customer.id, doc.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Add missing documents button */}
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="flex flex-wrap gap-2 py-2">
                        {documentTypes
                          .filter(dt => !customer.documents.some(d => d.type === dt.value))
                          .slice(0, 5)
                          .map(dt => (
                            <Button key={dt.value} size="sm" variant="outline" className="text-xs" onClick={() => handleUpload(customer.id, dt.value)}>
                              <Plus className="h-3 w-3 mr-1" /> {dt.icon} {dt.label}
                            </Button>
                          ))
                        }
                        {documentTypes.filter(dt => !customer.documents.some(d => d.type === dt.value)).length > 5 && (
                          <Button size="sm" variant="ghost" className="text-xs text-muted-foreground">
                            +{documentTypes.filter(dt => !customer.documents.some(d => d.type === dt.value)).length - 5} more
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

        {filteredDocs.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Documents Found</h3>
              <p className="text-muted-foreground">Search ya filter change karo</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>📤 Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Document Type</Label>
              <Select value={uploadTarget?.docType || "OTHER"} onValueChange={(v) => setUploadTarget(prev => prev ? {...prev, docType: v} : null)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {documentTypes.map(dt => (
                    <SelectItem key={dt.value} value={dt.value}>{dt.icon} {dt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Select File</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to upload or drag & drop</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Input placeholder="e.g., RTO approved copy, updated version" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUploadSubmit}>📤 Upload Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}