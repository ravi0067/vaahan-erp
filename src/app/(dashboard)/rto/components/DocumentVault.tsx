"use client";

import * as React from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Sparkles, ImageIcon } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingNo: string;
}

interface DocCard {
  type: string;
  uploaded: boolean;
  uploadDate?: string;
}

const documentTypes: DocCard[] = [
  { type: "Aadhaar Card", uploaded: true, uploadDate: "2025-01-10" },
  { type: "PAN Card", uploaded: true, uploadDate: "2025-01-10" },
  { type: "Address Proof", uploaded: false },
  { type: "Passport Photo", uploaded: true, uploadDate: "2025-01-12" },
  { type: "Insurance Copy", uploaded: true, uploadDate: "2025-01-15" },
  { type: "Form 20", uploaded: false },
  { type: "Form 21", uploaded: false },
  { type: "Invoice Copy", uploaded: true, uploadDate: "2025-01-10" },
  { type: "Delivery Note", uploaded: false },
  { type: "Road Tax Receipt", uploaded: false },
];

export function DocumentVault({ open, onOpenChange, bookingNo }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Document Vault — {bookingNo}</DialogTitle>
            <Button variant="outline" size="sm" className="gap-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Magic Fill (OCR)
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-4">
          {documentTypes.map((doc) => (
            <Card key={doc.type} className="relative">
              <CardContent className="p-3 flex flex-col items-center gap-2">
                <div className="w-full aspect-[4/3] bg-muted rounded flex items-center justify-center">
                  {doc.uploaded ? (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <FileText className="h-8 w-8 text-muted-foreground/40" />
                  )}
                </div>
                <p className="text-xs font-medium text-center leading-tight">{doc.type}</p>
                {doc.uploaded ? (
                  <Badge variant="secondary" className="text-[10px]">{doc.uploadDate}</Badge>
                ) : (
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1 w-full">
                    <Upload className="h-3 w-3" /> Upload
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
