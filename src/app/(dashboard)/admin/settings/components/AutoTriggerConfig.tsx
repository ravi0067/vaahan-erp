"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useSettingsStore, type AutoTriggerRule } from "@/store/settings-store";
import { Save, Bell } from "lucide-react";

export function AutoTriggerConfig() {
  const { autoTriggers, setAutoTriggers } = useSettingsStore();
  const [rules, setRules] = React.useState<AutoTriggerRule[]>(autoTriggers);
  const [saved, setSaved] = React.useState(false);

  const toggleChannel = (idx: number, channel: "whatsapp" | "email" | "sms") => {
    const updated = [...rules];
    updated[idx] = { ...updated[idx], [channel]: !updated[idx][channel] };
    setRules(updated);
    setSaved(false);
  };

  const handleSave = () => {
    setAutoTriggers(rules);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Auto-Trigger Rules
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure which notifications are sent automatically when events occur
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Event</TableHead>
                <TableHead className="text-center w-[100px]">WhatsApp</TableHead>
                <TableHead className="text-center w-[100px]">Email</TableHead>
                <TableHead className="text-center w-[100px]">SMS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule, idx) => (
                <TableRow key={rule.event}>
                  <TableCell className="font-medium">{rule.event}</TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => toggleChannel(idx, "whatsapp")}
                      className={`w-8 h-8 rounded-lg transition-colors ${
                        rule.whatsapp
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      {rule.whatsapp ? "✅" : "❌"}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => toggleChannel(idx, "email")}
                      className={`w-8 h-8 rounded-lg transition-colors ${
                        rule.email
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      {rule.email ? "✅" : "❌"}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => toggleChannel(idx, "sms")}
                      className={`w-8 h-8 rounded-lg transition-colors ${
                        rule.sms
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      {rule.sms ? "✅" : "❌"}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            {saved ? "Saved ✅" : "Save Configuration"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
