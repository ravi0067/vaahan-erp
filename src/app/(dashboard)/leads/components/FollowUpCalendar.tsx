"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Calendar view imports
import type { Lead, DealHealth } from "./LeadCard";

const healthColor: Record<DealHealth, string> = {
  Hot: "bg-red-500",
  Warm: "bg-orange-400",
  Cold: "bg-blue-400",
};

const healthBorder: Record<DealHealth, string> = {
  Hot: "border-red-300 bg-red-50 dark:bg-red-950",
  Warm: "border-orange-300 bg-orange-50 dark:bg-orange-950",
  Cold: "border-blue-300 bg-blue-50 dark:bg-blue-950",
};

interface FollowUpCalendarProps {
  leads: Lead[];
  onConvert: (lead: Lead) => void;
}

export function FollowUpCalendar({ leads, onConvert }: FollowUpCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  // Get unique follow-up dates
  const followUpDates = React.useMemo(() => {
    const map = new Map<string, Lead[]>();
    leads.forEach((lead) => {
      if (!lead.followUpDate) return;
      const existing = map.get(lead.followUpDate) || [];
      existing.push(lead);
      map.set(lead.followUpDate, existing);
    });
    return map;
  }, [leads]);

  // Generate calendar days for current view (next 14 days)
  const days = React.useMemo(() => {
    const result: { date: string; label: string; dayName: string }[] = [];
    const today = new Date();
    for (let i = -3; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      result.push({
        date: dateStr,
        label: d.getDate().toString(),
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      });
    }
    return result;
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const selectedLeads = selectedDate ? (followUpDates.get(selectedDate) || []) : [];

  return (
    <div className="space-y-4">
      {/* Date strip */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((day) => {
              const dayLeads = followUpDates.get(day.date) || [];
              const isToday = day.date === today;
              const isSelected = day.date === selectedDate;
              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDate(day.date === selectedDate ? null : day.date)}
                  className={`flex flex-col items-center min-w-[52px] px-2 py-2 rounded-lg text-xs transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isToday
                      ? "bg-primary/10 border border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="font-medium">{day.dayName}</span>
                  <span className="text-lg font-bold">{day.label}</span>
                  {dayLeads.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {dayLeads.slice(0, 3).map((l, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${healthColor[l.dealHealth]}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Hot
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-400" /> Warm
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" /> Cold
        </span>
      </div>

      {/* Selected date leads */}
      {selectedDate && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm">
            Follow-ups for {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            <Badge variant="secondary" className="ml-2">{selectedLeads.length}</Badge>
          </h3>
          {selectedLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No follow-ups scheduled for this date.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {selectedLeads.map((lead) => (
                <Card key={lead.id} className={`border ${healthBorder[lead.dealHealth]}`}>
                  <CardContent className="p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{lead.name}</p>
                      <span className={`w-2 h-2 rounded-full ${healthColor[lead.dealHealth]}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">{lead.model}</p>
                    <p className="text-xs text-muted-foreground">{lead.mobile}</p>
                    <div className="flex items-center justify-between pt-1">
                      <Badge variant="outline" className="text-xs">{lead.status}</Badge>
                      {lead.dealHealth === "Hot" && (
                        <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => onConvert(lead)}>
                          Convert
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Click on a date above to see follow-ups scheduled for that day
        </p>
      )}
    </div>
  );
}
