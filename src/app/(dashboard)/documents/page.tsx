"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileText, Upload, Download, Eye, Trash2, Search,
  Plus, Filter, CheckCircle, Clock, AlertTriangle,
  User, X, Edit
} from "lucide-react";
import { toast } from "sonner";

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

interface DocFile {
  id: string;
  type: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: "VERIFIED" | "PENDING" | "REJECTED";
  notes: string;
}

interface CustomerDoc {
  id: string;
  customerName: string;
  customerMobile: string;
  vehicleModel: string;
  bookingId: string;
  documents: DocFile[];
}

const mockCustomerDocs: CustomerDoc[] = [
  {
    id: "1", customerName: "Rahul Kumar", customerMobile: "9876543210",
    vehicleModel: "KTM Duke 200", bookingId: "BK-001",
    documents: [
      { id: "d1", type: "AADHAR", fileName: "rahul_aadhar.pdf", fileSize: "1.2 MB", uploadedAt: "2026-03-20", status: "VERIFIED", notes: "" },
      { id: "d2", type: "PAN", fileName: "rahul_pan.jpg", fileSize: "450 KB", uploadedAt: "2026-03-20", status: "VERIFIED", notes: "" },
      { id: "d3", type: "INSURANCE", fileName: "insurance_policy.pdf", fileSize: "2.1 MB", uploadedAt: "2026-03-21", status: "VERIFIED", notes: "" },
      { id: "d4", type: "RC", fileName: "", fileSize: "", uploadedAt: "", status: "PENDING", notes: "RTO se aana baaki hai" },
    ]
  },
  {
    id: "2", customerName: "Priya Sharma", customerMobile: "9876543211",
    vehicleModel: "Triumph Speed 400", bookingId: "BK-002",
    documents: [
      { id: "d5", type: "AADHAR", fileName: "priya_aadhar.pdf", fileSize: "980 KB", uploadedAt: "2026-03-19", status: "VERIFIED", notes: "" },
      { id: "d6", type: "DL", fileName: "priya_dl.jpg", fileSize: "320 KB", uploadedAt: "2026-03-19", status: "REJECTED", notes: "Blurry image, reupload needed" },
      { id: "d7", type: "FORM_20", fileName: "form20_priya.pdf", fileSize: "1.5 MB", uploadedAt: "2026-03-22", status: "PENDING", notes: "Verification pending" },
    ]
  },
  {
    id: "3", customerName: "Amit Verma", customerMobile: "9876543212",
    vehicleModel: "KTM RC 390", bookingId: "BK-003",
    documents: [
      { id: "d8", type: "AADHAR", fileName: "amit_aadhar.pdf", fileSize: "1.1 MB", uploadedAt: "2026-03-18", status: "VERIFIED", notes: "" },
      { id: "d9", type: "PAN", fileName: "amit_pan.pdf", fileSize: "550 KB", uploadedAt: "2026-03-18", status: "VERIFIED", notes: "" },
      { id: "d10", type: "RC", fileName: "rc_amit.pdf", fileSize: "2.8 MB", uploadedAt: "2026-03-23", status: "VERIFIED", notes: "RTO approved ✅" },
      { id: "d11", type: "INSURANCE", fileName: "insurance_amit.pdf", fileSize: "1.9 MB", uploadedAt: "2026-03-17", status: "VERIFIED", notes: "" },
      { id: "d12", type: "INVOICE", fileName: "invoice_amit.pdf", fileSize: "780 KB", uploadedAt: "2026-03-17", status: "VERIFIED", notes: "" },
    ]
  },
];

export default function DocumentsPage() {
  const [customerDocs, setCustomerDocs] = useState<CustomerDoc[]>(mockCustomerDocs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Upload dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadCustomerId, setUploadCustomerId] = useState("");
  const [uploadDocType, setUploadDocType] = useState("OTHER");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState("");
  const [editDoc, setEditDoc] = useState<DocFile | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState<string>("");

  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<DocFile | null>(null);
  const [viewCustomer, setViewCustomer] = useState<CustomerDoc | null>(null);

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

  const getDocIcon = (type: string) => documentTypes.find(d => d.value === type)?.icon || "📁";
  const getDocLabel = (type: string) => documentTypes.find(d => d.value === type)?.label || type;

  // ─── UPLOAD ───
  const openUploadDialog = (customerId: string, docType: string) => {
    setUploadCustomerId(customerId);
    setUploadDocType(docType);
    setUploadFile(null);
    setUploadNotes("");
    setUploadDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size 10MB se zyada nahi hona chahiye!");
        return;
      }
      setUploadFile(file);
      toast.success(`📎 File selected: ${file.name}`);
    }
  };

  const handleUploadSubmit = () => {
    if (!uploadFile) {
      toast.error("Pehle file select karein!");
      return;
    }

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const newDoc: DocFile = {
        id: `d_${Date.now()}`,
        type: uploadDocType,
        fileName: uploadFile.name,
        fileSize: uploadFile.size > 1024 * 1024
          ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(uploadFile.size / 1024).toFixed(0)} KB`,
        uploadedAt: new Date().toISOString().split('T')[0],
        status: "PENDING",
        notes: uploadNotes || "Newly uploaded — verification pending"
      };

      setCustomerDocs(prev => prev.map(c => {
        if (c.id === uploadCustomerId) {
          // Check if replacing existing doc of same type
          const existingIdx = c.documents.findIndex(d => d.type === uploadDocType);
          if (existingIdx >= 0) {
            const updatedDocs = [...c.documents];
            updatedDocs[existingIdx] = newDoc;
            return { ...c, documents: updatedDocs };
          } else {
            return { ...c, documents: [...c.documents, newDoc] };
          }
        }
        return c;
      }));

      setIsUploading(false);
      setUploadDialogOpen(false);
      setUploadFile(null);
      toast.success(`✅ ${getDocLabel(uploadDocType)} uploaded successfully!`);
    }, 1500);
  };

  // ─── EDIT ───
  const openEditDialog = (customerId: string, doc: DocFile) => {
    setEditCustomerId(customerId);
    setEditDoc(doc);
    setEditNotes(doc.notes);
    setEditStatus(doc.status);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editDoc) return;
    setCustomerDocs(prev => prev.map(c => {
      if (c.id === editCustomerId) {
        return {
          ...c,
          documents: c.documents.map(d =>
            d.id === editDoc.id
              ? { ...d, notes: editNotes, status: editStatus as DocFile["status"] }
              : d
          )
        };
      }
      return c;
    }));
    setEditDialogOpen(false);
    toast.success("✅ Document updated!");
  };

  // ─── VIEW ───
  const openViewDialog = (customer: CustomerDoc, doc: DocFile) => {
    setViewCustomer(customer);
    setViewDoc(doc);
    setViewDialogOpen(true);
  };

  // ─── VERIFY / REJECT / DELETE ───
  const handleVerify = (customerId: string, docId: string) => {
    setCustomerDocs(prev => prev.map(c => {
      if (c.id === customerId) {
        return { ...c, documents: c.documents.map(d => d.id === docId ? { ...d, status: "VERIFIED" as const, notes: d.notes || "Verified ✅" } : d) };
      }
      return c;
    }));
    toast.success("✅ Document verified!");
  };

  const handleReject = (customerId: string, docId: string) => {
    setCustomerDocs(prev => prev.map(c => {
      if (c.id === customerId) {
        return { ...c, documents: c.documents.map(d => d.id === docId ? { ...d, status: "REJECTED" as const, notes: "Rejected — please reupload a clear copy" } : d) };
      }
      return c;
    }));
    toast.error("❌ Document rejected — customer ko reupload karna hoga");
  };

  const handleDelete = (customerId: string, docId: string) => {
    if (!confirm("Kya aap sure hain? Document permanently delete ho jayega.")) return;
    setCustomerDocs(prev => prev.map(c => {
      if (c.id === customerId) {
        return { ...c, documents: c.documents.filter(d => d.id !== docId) };
      }
      return c;
    }));
    toast.success("🗑️ Document deleted");
  };

  const handleSendToCustomer = (customer: CustomerDoc) => {
    toast.success(`📱 Documents link sent to ${customer.customerName} on WhatsApp!`);
  };

  const handleDownload = (doc: DocFile) => {
    toast.success(`📥 Downloading ${doc.fileName}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">📄 Document Management</h1>
          <p className="text-muted-foreground text-sm">Customer-wise documents — upload, verify, edit, reupload, share</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center"><User className="h-5 w-5 text-blue-600" /></div>
          <div><p className="text-sm text-muted-foreground">Customers</p><p className="text-xl font-bold">{totalCustomers}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-600" /></div>
          <div><p className="text-sm text-muted-foreground">Verified</p><p className="text-xl font-bold text-green-600">{verifiedDocs}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center"><Clock className="h-5 w-5 text-yellow-600" /></div>
          <div><p className="text-sm text-muted-foreground">Pending</p><p className="text-xl font-bold text-yellow-600">{pendingDocs}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
          <div><p className="text-sm text-muted-foreground">Rejected</p><p className="text-xl font-bold text-red-600">{rejectedDocs}</p></div>
        </CardContent></Card>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
                    📱 WhatsApp
                  </Button>
                  <Button size="sm" onClick={() => openUploadDialog(customer.id, "OTHER")}>
                    <Upload className="h-3 w-3 mr-1" /> Upload New
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          <span className="mr-2">{getDocIcon(doc.type)}</span>
                          {getDocLabel(doc.type)}
                        </TableCell>
                        <TableCell>
                          {doc.fileName ? (
                            <span className="text-sm text-blue-600 hover:underline cursor-pointer" onClick={() => openViewDialog(customer, doc)}>
                              {doc.fileName}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Not uploaded yet</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{doc.fileSize || "—"}</TableCell>
                        <TableCell className="text-sm">{doc.uploadedAt || "—"}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">{doc.notes || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 flex-wrap">
                            {/* View */}
                            {doc.fileName && (
                              <Button size="sm" variant="ghost" title="View" onClick={() => openViewDialog(customer, doc)}>
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                            {/* Download */}
                            {doc.fileName && (
                              <Button size="sm" variant="ghost" title="Download" onClick={() => handleDownload(doc)}>
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                            {/* Edit */}
                            <Button size="sm" variant="ghost" title="Edit Notes/Status" onClick={() => openEditDialog(customer.id, doc)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            {/* Upload / Reupload */}
                            <Button size="sm" variant="ghost" title={doc.fileName ? "Reupload" : "Upload"} onClick={() => openUploadDialog(customer.id, doc.type)}>
                              <Upload className="h-3 w-3" />
                            </Button>
                            {/* Verify (only for pending) */}
                            {doc.status === "PENDING" && doc.fileName && (
                              <Button size="sm" variant="ghost" className="text-green-600" title="Verify" onClick={() => handleVerify(customer.id, doc.id)}>
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                            {/* Reject (only for pending) */}
                            {doc.status === "PENDING" && doc.fileName && (
                              <Button size="sm" variant="ghost" className="text-red-600" title="Reject" onClick={() => handleReject(customer.id, doc.id)}>
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                            {/* Delete */}
                            <Button size="sm" variant="ghost" className="text-red-500" title="Delete" onClick={() => handleDelete(customer.id, doc.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Add missing documents */}
                    <TableRow>
                      <TableCell colSpan={7}>
                        <div className="flex flex-wrap gap-2 py-2">
                          {documentTypes
                            .filter(dt => !customer.documents.some(d => d.type === dt.value))
                            .slice(0, 5)
                            .map(dt => (
                              <Button key={dt.value} size="sm" variant="outline" className="text-xs" onClick={() => openUploadDialog(customer.id, dt.value)}>
                                <Plus className="h-3 w-3 mr-1" /> {dt.icon} {dt.label}
                              </Button>
                            ))
                          }
                          {documentTypes.filter(dt => !customer.documents.some(d => d.type === dt.value)).length > 5 && (
                            <span className="text-xs text-muted-foreground self-center">
                              +{documentTypes.filter(dt => !customer.documents.some(d => d.type === dt.value)).length - 5} more types available
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
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

      {/* ═══ UPLOAD DIALOG ═══ */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>📤 {uploadFile ? "Ready to Upload" : "Upload Document"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Document Type</Label>
              <Select value={uploadDocType} onValueChange={setUploadDocType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {documentTypes.map(dt => (
                    <SelectItem key={dt.value} value={dt.value}>{dt.icon} {dt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Select File</Label>
              <div
                className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  uploadFile ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-primary/50"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-10 w-10 mx-auto text-green-500" />
                    <p className="text-sm font-medium text-green-700">{uploadFile.name}</p>
                    <p className="text-xs text-green-600">
                      {uploadFile.size > 1024 * 1024
                        ? `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`
                        : `${(uploadFile.size / 1024).toFixed(0)} KB`
                      }
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <X className="h-3 w-3 mr-1" /> Change File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">Click to select file</p>
                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG — Max 10MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                className="mt-1"
                placeholder="e.g., RTO approved copy, updated version, clear scan..."
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUploadDialogOpen(false); setUploadFile(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUploadSubmit} disabled={!uploadFile || isUploading}>
              {isUploading ? (
                <>⏳ Uploading...</>
              ) : (
                <>📤 Upload Document</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ EDIT DIALOG ═══ */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>✏️ Edit Document</DialogTitle>
          </DialogHeader>
          {editDoc && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm font-medium">{getDocIcon(editDoc.type)} {getDocLabel(editDoc.type)}</p>
                {editDoc.fileName && <p className="text-xs text-muted-foreground mt-1">File: {editDoc.fileName}</p>}
                {editDoc.uploadedAt && <p className="text-xs text-muted-foreground">Uploaded: {editDoc.uploadedAt}</p>}
              </div>

              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VERIFIED">✅ Verified</SelectItem>
                    <SelectItem value="PENDING">⏳ Pending</SelectItem>
                    <SelectItem value="REJECTED">❌ Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  className="mt-1"
                  placeholder="Add notes about this document..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openUploadDialog(editCustomerId, editDoc.type)}>
                  <Upload className="h-3 w-3 mr-1" /> Reupload File
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>💾 Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ VIEW DIALOG ═══ */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>👁️ Document Preview</DialogTitle>
          </DialogHeader>
          {viewDoc && viewCustomer && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{getDocIcon(viewDoc.type)} {getDocLabel(viewDoc.type)}</span>
                  {getStatusBadge(viewDoc.status)}
                </div>
                <div className="text-sm text-muted-foreground">Customer: {viewCustomer.customerName}</div>
                <div className="text-sm text-muted-foreground">Vehicle: {viewCustomer.vehicleModel}</div>
                <div className="text-sm text-muted-foreground">File: {viewDoc.fileName} ({viewDoc.fileSize})</div>
                <div className="text-sm text-muted-foreground">Uploaded: {viewDoc.uploadedAt}</div>
                {viewDoc.notes && <div className="text-sm">Notes: {viewDoc.notes}</div>}
              </div>

              {/* Preview area */}
              <div className="border rounded-lg p-8 text-center bg-muted/30">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">{viewDoc.fileName}</p>
                <p className="text-xs text-muted-foreground mt-1">Preview available after Supabase Storage setup</p>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleDownload(viewDoc)}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => { setViewDialogOpen(false); openUploadDialog(viewCustomer.id, viewDoc.type); }}>
                  <Upload className="h-4 w-4 mr-2" /> Reupload
                </Button>
                <Button variant="outline" onClick={() => { setViewDialogOpen(false); openEditDialog(viewCustomer.id, viewDoc); }}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}