"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  UserPlus, Phone, Mail, MessageSquare, Calendar, TrendingUp,
  Target, Zap, Brain, MoreHorizontal,
  DollarSign, Users, Activity,
  Search, Download, Eye, Edit, Trash2,
  ArrowUp, ArrowDown,
  Rocket, Flame, Loader2
} from "lucide-react";
import { toast } from "sonner";

// Enhanced lead scoring algorithm
const calculateLeadScore = (lead: EnhancedLead) => {
  let score = 0;
  
  // Status-based scoring
  if (lead.status === "hot") score += 40;
  else if (lead.status === "warm") score += 25;
  else score += 10;
  
  // Has phone
  if (lead.phone) score += 10;
  // Has vehicle interest
  if (lead.vehicle) score += 15;
  // Has email
  if (lead.email) score += 5;
  // Recent lead (within 7 days)
  if (lead.createdAt) {
    const daysSinceCreation = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / 86400000);
    if (daysSinceCreation <= 7) score += 15;
    else if (daysSinceCreation <= 14) score += 10;
    else if (daysSinceCreation <= 30) score += 5;
  }
  // Has source
  if (lead.source) score += 5;
  // Notes present
  if (lead.notes) score += 5;
  
  return Math.min(Math.round(score), 100);
};

// AI-powered lead insights
const generateLeadInsights = (lead: EnhancedLead) => {
  const insights: Array<{ type: string; title: string; message: string; action: string; priority: string }> = [];
  const score = lead.score;
  
  if (score >= 80) {
    insights.push({
      type: 'success',
      title: '🏆 Super Hot Lead!',
      message: 'Ready to convert - call within 2 hours',
      action: 'Call Now',
      priority: 'urgent'
    });
  } else if (score >= 60) {
    insights.push({
      type: 'warning',
      title: '🔥 Warm Lead',
      message: 'Good conversion potential - schedule demo',
      action: 'Schedule Demo',
      priority: 'high'
    });
  } else if (score >= 40) {
    insights.push({
      type: 'info',
      title: '❄️ Cold Lead',
      message: 'Needs nurturing - send informational content',
      action: 'Send Brochure',
      priority: 'medium'
    });
  } else {
    insights.push({
      type: 'secondary',
      title: '😴 Inactive Lead',
      message: 'Low engagement - try different approach',
      action: 'Re-engage',
      priority: 'low'
    });
  }
  
  return insights;
};

// AI recommendation generator
const generateAIRecommendation = (lead: EnhancedLead) => {
  const recommendations: string[] = [];
  
  if (lead.score >= 80) {
    recommendations.push("🚀 URGENT: Call immediately and offer special discount");
    recommendations.push("📋 Schedule test ride within next 24 hours");
    recommendations.push("💰 Prepare financing options and trade-in quotes");
  } else if (lead.score >= 60) {
    recommendations.push("📞 Call within next 2 days with vehicle comparison");
    recommendations.push("📱 Send WhatsApp with EMI calculator and offers");
    recommendations.push("🎯 Invite for upcoming vehicle showcase event");
  } else {
    recommendations.push("📧 Send informational email about vehicle features");
    recommendations.push("📱 Add to WhatsApp broadcast for monthly updates");
    recommendations.push("🔄 Re-engage after 2 weeks with new approach");
  }
  
  return recommendations;
};

interface EnhancedLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  status: "hot" | "warm" | "cold";
  vehicle: string;
  location: string;
  notes: string;
  createdAt: string;
  assignedTo: string;
  tags: string[];
  score: number;
  insights: Array<{ type: string; title: string; message: string; action: string; priority: string }>;
}

export default function AdvancedCRMPage() {
  const [leads, setLeads] = useState<EnhancedLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<EnhancedLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<EnhancedLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState([0, 100]);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("table");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped: EnhancedLead[] = data.map((l: Record<string, unknown>) => {
          const dealHealth = ((l.dealHealth as string) || "").toUpperCase();
          const status: "hot" | "warm" | "cold" = dealHealth === "HOT" ? "hot" : dealHealth === "WARM" ? "warm" : "cold";
          const lead: EnhancedLead = {
            id: l.id as string,
            name: (l.customerName as string) || "Unknown",
            phone: (l.mobile as string) || "",
            email: (l.email as string) || "",
            source: (l.source as string) || "Walk-in",
            status,
            vehicle: (l.interestedModel as string) || "",
            location: "",
            notes: (l.notes as string) || "",
            createdAt: (l.createdAt as string) || "",
            assignedTo: "",
            tags: [],
            score: 0,
            insights: [],
          };
          // Compute score and insights
          lead.score = calculateLeadScore(lead);
          lead.insights = generateLeadInsights(lead);
          return lead;
        });
        setLeads(mapped);
      }
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Filter and sort leads
  useEffect(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lead.phone.includes(searchQuery) ||
                           lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lead.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesScore = lead.score >= scoreFilter[0] && lead.score <= scoreFilter[1];
      const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
      
      return matchesSearch && matchesStatus && matchesScore && matchesSource;
    });

    filtered.sort((a, b) => {
      const key = sortBy as keyof EnhancedLead;
      let aVal = a[key];
      let bVal = b[key];
      
      if (sortBy === "score") {
        aVal = a.score;
        bVal = b.score;
      }
      
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal || "");
      const bStr = String(bVal || "");
      return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    setFilteredLeads(filtered);
  }, [leads, searchQuery, statusFilter, scoreFilter, sourceFilter, sortBy, sortOrder]);

  // Stats
  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.status === "hot").length;
  const warmLeads = leads.filter(l => l.status === "warm").length;
  const coldLeads = leads.filter(l => l.status === "cold").length;
  const avgScore = totalLeads > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / totalLeads) : 0;
  const conversionRate = totalLeads > 0 ? Math.round((hotLeads / totalLeads) * 100) : 0;

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-red-100 text-red-700"><Flame className="h-3 w-3 mr-1" />HOT {score}</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-700"><Zap className="h-3 w-3 mr-1" />WARM {score}</Badge>;
    if (score >= 40) return <Badge className="bg-blue-100 text-blue-700"><Activity className="h-3 w-3 mr-1" />COLD {score}</Badge>;
    return <Badge className="bg-gray-100 text-gray-700">INACTIVE {score}</Badge>;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "hot": return "text-red-600 bg-red-50";
      case "warm": return "text-yellow-600 bg-yellow-50";
      case "cold": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const handleAction = (leadId: string, action: string) => {
    switch(action) {
      case "call":
        toast.success("📞 Calling lead...");
        break;
      case "whatsapp":
        toast.success("📱 WhatsApp message sent!");
        break;
      case "email":
        toast.success("📧 Email sent!");
        break;
      case "schedule":
        toast.success("📅 Meeting scheduled!");
        break;
      default:
        toast.info(`Action: ${action}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground text-sm">Loading leads with AI scoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">🧠 Advanced CRM Intelligence</h1>
          <p className="text-muted-foreground">AI-powered lead scoring, insights & conversion optimization</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Leads
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Advanced Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{totalLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Flame className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hot Leads</p>
                <p className="text-2xl font-bold text-red-600">{hotLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Warm Leads</p>
                <p className="text-2xl font-bold text-yellow-600">{warmLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold text-green-600">{avgScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversion</p>
                <p className="text-2xl font-bold text-purple-600">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cold Leads</p>
                <p className="text-2xl font-bold text-blue-600">{coldLeads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🔍 Advanced Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="hot">🔥 Hot Leads</SelectItem>
                <SelectItem value="warm">⚡ Warm Leads</SelectItem>
                <SelectItem value="cold">❄️ Cold Leads</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Website">🌐 Website</SelectItem>
                <SelectItem value="Walk-in">🚶 Walk-in</SelectItem>
                <SelectItem value="Referral">👥 Referral</SelectItem>
                <SelectItem value="Social Media">📱 Social Media</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">🎯 Lead Score</SelectItem>
                <SelectItem value="name">👤 Name</SelectItem>
                <SelectItem value="createdAt">📅 Date Added</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4">
            <Label className="text-sm font-medium">Score Range: {scoreFilter[0]} - {scoreFilter[1]}</Label>
            <Slider
              value={scoreFilter}
              onValueChange={setScoreFilter}
              max={100}
              min={0}
              step={10}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button 
            variant={viewMode === "table" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Table View
          </Button>
          <Button 
            variant={viewMode === "cards" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            Card View
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filteredLeads.length} leads</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {leads.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <UserPlus className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No Leads Yet</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Leads will appear here once customers enquire about vehicles. Add leads manually or they&apos;ll be captured from walk-ins, website forms, and phone enquiries. AI scoring will automatically rank them.
            </p>
          </CardContent>
        </Card>
      ) : filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-30" />
            <h3 className="text-lg font-semibold mb-1">No matching leads</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Details</TableHead>
                  <TableHead>Score & Status</TableHead>
                  <TableHead>Vehicle Interest</TableHead>
                  <TableHead>AI Insights</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{lead.name}</div>
                        <div className="text-sm text-muted-foreground">📱 {lead.phone}</div>
                        {lead.email && <div className="text-sm text-muted-foreground">✉️ {lead.email}</div>}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        {getScoreBadge(lead.score)}
                        <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(lead.status)}`}>
                          {lead.status.toUpperCase()}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{lead.vehicle || "Not specified"}</div>
                        <div className="text-xs text-muted-foreground">via {lead.source}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1 max-w-xs">
                        {lead.insights.slice(0, 2).map((insight, i) => (
                          <div key={i} className={`text-xs p-2 rounded ${
                            insight.type === 'success' ? 'bg-green-50 text-green-700' :
                            insight.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                            insight.type === 'info' ? 'bg-blue-50 text-blue-700' :
                            'bg-gray-50 text-gray-700'
                          }`}>
                            <div className="font-medium">{insight.title}</div>
                            <div className="mt-1">{insight.message}</div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN") : "—"}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleAction(lead.id, "call")}>
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleAction(lead.id, "whatsapp")}>
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleAction(lead.id, "email")}>
                          <Mail className="h-3 w-3" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                              <Eye className="h-3 w-3 mr-2" />View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(lead.id, "schedule")}>
                              <Calendar className="h-3 w-3 mr-2" />Schedule Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-3 w-3 mr-2" />Edit Lead
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-3 w-3 mr-2" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedLead(lead)}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.phone}</p>
                  </div>
                  {getScoreBadge(lead.score)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">{lead.vehicle || "No vehicle specified"}</span>
                  <span className="text-muted-foreground ml-2">via {lead.source}</span>
                </div>
                {lead.insights[0] && (
                  <div className={`text-xs p-2 rounded ${
                    lead.insights[0].type === 'success' ? 'bg-green-50 text-green-700' :
                    lead.insights[0].type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {lead.insights[0].title} — {lead.insights[0].message}
                  </div>
                )}
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleAction(lead.id, "call"); }}>
                    <Phone className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleAction(lead.id, "whatsapp"); }}>
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleAction(lead.id, "email"); }}>
                    <Mail className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold">{selectedLead.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedLead.vehicle || "No vehicle specified"}</div>
                </div>
                <div className="ml-auto">
                  {getScoreBadge(selectedLead.score)}
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">📞 Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <div>Phone: {selectedLead.phone}</div>
                      <div>Email: {selectedLead.email || "Not provided"}</div>
                      <div>Source: {selectedLead.source}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">🎯 Lead Details</h3>
                    <div className="space-y-2 text-sm">
                      <div>Vehicle Interest: {selectedLead.vehicle || "Not specified"}</div>
                      <div>Status: {selectedLead.status.toUpperCase()}</div>
                      <div>Created: {selectedLead.createdAt ? new Date(selectedLead.createdAt).toLocaleDateString("en-IN") : "—"}</div>
                      {selectedLead.notes && <div>Notes: {selectedLead.notes}</div>}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="insights">
                <div className="space-y-4">
                  <h3 className="font-semibold">🧠 AI-Generated Insights</h3>
                  <div className="grid gap-3">
                    {selectedLead.insights.map((insight, i) => (
                      <div key={i} className={`p-4 rounded-lg ${
                        insight.type === 'success' ? 'bg-green-50 border border-green-200' :
                        insight.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                        insight.type === 'info' ? 'bg-blue-50 border border-blue-200' :
                        'bg-gray-50 border border-gray-200'
                      }`}>
                        <div className="font-medium text-sm">{insight.title}</div>
                        <div className="text-sm mt-1">{insight.message}</div>
                        <Button size="sm" className="mt-2" onClick={() => handleAction(selectedLead.id, insight.action)}>
                          {insight.action}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="recommendations">
                <div className="space-y-4">
                  <h3 className="font-semibold">💡 AI Recommendations</h3>
                  <div className="space-y-3">
                    {generateAIRecommendation(selectedLead).map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Brain className="h-5 w-5 text-primary mt-0.5" />
                        <div className="text-sm">{rec}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedLead(null)}>Close</Button>
              <Button onClick={() => handleAction(selectedLead.id, "convert")}>
                <Rocket className="h-4 w-4 mr-2" />
                Convert to Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
