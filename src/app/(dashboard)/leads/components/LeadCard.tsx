"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, ArrowRight } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
export type DealHealth = "Hot" | "Warm" | "Cold";
export type LeadStatus = "New" | "Contacted" | "Interested" | "Test Ride" | "Negotiation" | "Lost";

export interface Lead {
  id: string;
  name: string;
  mobile: string;
  model: string;
  status: LeadStatus;
  dealHealth: DealHealth;
  followUpDate: string;
  assignedTo: string;
  source: string;
}

// ── Health config ──────────────────────────────────────────────────────────
const healthConfig: Record<DealHealth, { emoji: string; color: string }> = {
  Hot: { emoji: "🔥", color: "bg-red-100 text-red-700 border-red-300" },
  Warm: { emoji: "☀️", color: "bg-amber-100 text-amber-700 border-amber-300" },
  Cold: { emoji: "❄️", color: "bg-blue-100 text-blue-700 border-blue-300" },
};

const statusColor: Record<LeadStatus, string> = {
  New: "bg-green-100 text-green-700",
  Contacted: "bg-blue-100 text-blue-700",
  Interested: "bg-purple-100 text-purple-700",
  "Test Ride": "bg-orange-100 text-orange-700",
  Negotiation: "bg-amber-100 text-amber-700",
  Lost: "bg-gray-100 text-gray-700",
};

interface LeadCardProps {
  lead: Lead;
  onConvert?: (lead: Lead) => void;
}

export function LeadCard({ lead, onConvert }: LeadCardProps) {
  const health = healthConfig[lead.dealHealth];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold">{lead.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" /> {lead.mobile}
            </div>
          </div>
          <Badge variant="outline" className={health.color}>
            {health.emoji} {lead.dealHealth}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Model</span>
            <span className="font-medium">{lead.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="outline" className={statusColor[lead.status]}>{lead.status}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Follow-up</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {lead.followUpDate}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Assigned</span>
            <span>{lead.assignedTo}</span>
          </div>
        </div>

        {lead.dealHealth === "Hot" && onConvert && (
          <Button
            size="sm"
            className="w-full mt-3"
            onClick={() => onConvert(lead)}
          >
            Convert to Booking <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
