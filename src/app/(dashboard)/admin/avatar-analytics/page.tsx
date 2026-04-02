"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, Eye, MessageSquare, TrendingUp, Clock, Globe, BarChart3, Loader2, Monitor
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalVisitors: number; todayVisitors: number; weekVisitors: number;
    totalSessions: number; todaySessions: number; returningVisitors: number; returningRate: number;
  };
  recentSessions: Array<{
    id: string; visitor: string; phone?: string; visitCount: number;
    language: string; startedAt: string; messageCount: number;
  }>;
  topQueries: Array<{ query: string; count: number }>;
  languages: Array<{ language: string; count: number }>;
}

export default function AvatarAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vaani-avatar/analytics")
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  const o = data?.overview;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Monitor className="h-6 w-6 text-purple-600" /> Vaani Avatar Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Showroom TV interactions ka data</p>
        </div>
        <a href="/vaani-avatar" target="_blank" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
          🖥️ Open Avatar
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Visitors", value: o?.totalVisitors || 0, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Eye, label: "Aaj ke Visitors", value: o?.todayVisitors || 0, color: "text-green-600", bg: "bg-green-50" },
          { icon: MessageSquare, label: "Total Sessions", value: o?.totalSessions || 0, color: "text-purple-600", bg: "bg-purple-50" },
          { icon: TrendingUp, label: "Returning Rate", value: `${o?.returningRate || 0}%`, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Queries */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" /> Top Customer Queries
            </h3>
            {data?.topQueries?.length ? (
              <div className="space-y-2">
                {data.topQueries.map((q, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <span className="text-sm">{i + 1}. {q.query}</span>
                    <Badge variant="secondary">{q.count}x</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Abhi koi query nahi aayi</p>
            )}
          </CardContent>
        </Card>

        {/* Language Distribution */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" /> Language Distribution
            </h3>
            {data?.languages?.length ? (
              <div className="space-y-2">
                {data.languages.map((l, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <span className="text-sm capitalize">{l.language}</span>
                    <Badge variant="outline">{l.count} sessions</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Data aana shuru hoga soon</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" /> Recent Conversations
          </h3>
          {data?.recentSessions?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-2">Visitor</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-center p-2">Visits</th>
                    <th className="text-center p-2">Messages</th>
                    <th className="text-center p-2">Language</th>
                    <th className="text-right p-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentSessions.map(s => (
                    <tr key={s.id} className="border-b hover:bg-muted/30">
                      <td className="p-2 font-medium">{s.visitor}</td>
                      <td className="p-2 text-muted-foreground">{s.phone || "—"}</td>
                      <td className="p-2 text-center">
                        <Badge variant={s.visitCount > 1 ? "default" : "secondary"}>{s.visitCount}</Badge>
                      </td>
                      <td className="p-2 text-center">{s.messageCount}</td>
                      <td className="p-2 text-center capitalize">{s.language}</td>
                      <td className="p-2 text-right text-muted-foreground">
                        {new Date(s.startedAt).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Jab customers Avatar se baat karenge, data yahaan dikhega</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
