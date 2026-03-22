"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBookingWizardStore, type DocumentData } from "@/store/booking-wizard-store";
import { Upload, FileCheck, FileX, FileText } from "lucide-react";

// ── Document config ────────────────────────────────────────────────────────
type DocKey = keyof DocumentData;

const docConfig: { key: DocKey; label: string; required: boolean }[] = [
  { key: "aadhar", label: "Aadhar Card", required: true },
  { key: "pan", label: "PAN Card", required: true },
  { key: "form20", label: "Form 20", required: true },
  { key: "form21", label: "Form 21", required: true },
  { key: "form22", label: "Form 22", required: true },
  { key: "invoice", label: "Invoice", required: false },
  { key: "insurance", label: "Insurance", required: false },
];

export function Step5Documents() {
  const { documents, setDocuments, nextStep } = useBookingWizardStore();
  // Local state for file names (since File objects can't be shown in UI easily)
  const [fileNames, setFileNames] = React.useState<Record<string, string>>({});

  const handleFileChange = (key: DocKey, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setDocuments({ [key]: file });
    setFileNames((prev) => ({ ...prev, [key]: file.name }));
  };

  const uploadedCount = docConfig.filter((d) => documents[d.key] !== null).length;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(uploadedCount / docConfig.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium">
              {uploadedCount}/{docConfig.length} uploaded
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Document Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {docConfig.map((doc) => {
          const isUploaded = documents[doc.key] !== null;
          const fileName = fileNames[doc.key];

          return (
            <Card
              key={doc.key}
              className={isUploaded ? "border-green-200" : "border-dashed"}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isUploaded ? (
                      <FileCheck className="h-5 w-5 text-green-600" />
                    ) : (
                      <FileX className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{doc.label}</p>
                      {doc.required && (
                        <span className="text-xs text-red-500">Required</span>
                      )}
                    </div>
                  </div>
                  {isUploaded && (
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      ✓ Done
                    </Badge>
                  )}
                </div>

                {fileName && (
                  <p className="text-xs text-muted-foreground mb-2 truncate">
                    📎 {fileName}
                  </p>
                )}

                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(doc.key, e.target.files)}
                  />
                  <div className="flex items-center justify-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
                    <Upload className="h-4 w-4" />
                    {isUploaded ? "Replace File" : "Upload File"}
                  </div>
                </label>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Document Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {docConfig.map((doc) => (
              <div key={doc.key} className="flex items-center justify-between py-1">
                <span className="text-sm">
                  {documents[doc.key] ? "✅" : "⬜"} {doc.label}
                  {doc.required && <span className="text-red-500 ml-1">*</span>}
                </span>
                <Badge variant={documents[doc.key] ? "default" : "outline"} className="text-xs">
                  {documents[doc.key] ? "Uploaded" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={nextStep} className="w-full sm:w-auto">
        Continue to Review →
      </Button>
    </div>
  );
}
