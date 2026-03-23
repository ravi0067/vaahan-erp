"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  UserPlus, Phone, Mail, MessageSquare, Calendar, TrendingUp,
  Target, Zap, Brain, MoreHorizontal, Star, Clock, AlertCircle,
  DollarSign, Users, Activity, PieChart, BarChart3, LineChart,
  Filter, Search, Download, Share, Eye, Edit, Trash2, Plus,
  CheckCircle, XCircle, ArrowUp, ArrowDown, ArrowRight,
  Smartphone, Globe, MapPin, Heart, ThumbsUp, Send, Bot,
  Lightbulb, Rocket, Trophy, Flame
} from "lucide-react";
import { toast } from "sonner";

// Enhanced lead scoring algorithm
const calculateLeadScore = (lead: any) => {
  let score = 0;
  
  // Demographics (20 points)
  if (lead.age >= 25 && lead.age <= 45) score += 10;
  if (lead.income >= 500000) score += 10;
  
  // Engagement (30 points)
  score += Math.min(lead.touchpoints * 2, 15);
  if (lead.responseTime <= 2) score += 10;
  if (lead.lastContact <= 3) score += 5;
  
  // Intent (25 points)
  if (lead.budgetConfirmed) score += 10;
  if (lead.timeframe <= 30) score += 10;
  if (lead.testRideBooked) score += 5;
  
  // Behavioral (25 points)
  if (lead.websiteVisits >= 3) score += 5;
  if (lead.brochureDownloaded) score += 5;
  if (lead.compareVehicles) score += 5;
  if (lead.financingInquiry) score += 5;
  if (lead.referralSource === 'Friend') score += 5;
  
  return Math.min(Math.round(score), 100);
};

// AI-powered lead insights
const generateLeadInsights = (lead: any) => {
  const insights = [];
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
  
  // Behavioral insights
  if (lead.budgetMismatch) {
    insights.push({
      type: 'warning',
      title: '💰 Budget Concern',
      message: 'Budget might be lower than vehicle price',
      action: 'Show EMI Options',
      priority: 'medium'
    });
  }
  
  if (lead.competitorMention) {
    insights.push({
      type: 'info',
      title: '⚔️ Competition Alert',
      message: `Also considering ${lead.competitorMention}`,
      action: 'Send Comparison',
      priority: 'high'
    });
  }
  
  if (lead.lastContact > 7) {
    insights.push({
      type: 'warning',
      title: '🚨 Follow-up Overdue',
      message: `No contact since ${lead.lastContact} days`,
      action: 'Follow Up Now',
      priority: 'urgent'
    });
  }
  
  return insights;
};

// Mock enhanced lead data
const mockLeads = [
  {
    id: "1",
    name: "Rahul Kumar",
    phone: "+91-9876543210",
    email: "rahul@email.com",
    source: "Website",
    status: "hot",
    interestedVehicle: "KTM Duke 390",
    budget: 350000,
    age: 28,
    income: 800000,
    location: "Gomti Nagar, Lucknow",
    touchpoints: 8,
    responseTime: 1, // hours
    lastContact: 1, // days ago
    budgetConfirmed: true,
    timeframe: 15, // days
    testRideBooked: true,
    websiteVisits: 5,
    brochureDownloaded: true,
    compareVehicles: true,
    financingInquiry: true,
    referralSource: "Google Ads",
    competitorMention: "Yamaha R15",
    budgetMismatch: false,
    notes: "Very interested, comparing with Yamaha R15. Budget confirmed. Test ride scheduled for tomorrow.",
    createdAt: "2026-03-22",
    nextFollowUp: "2026-03-24",
    assignedTo: "Priya Sharma",
    tags: ["Hot Lead", "Test Ride", "Budget Confirmed"],
    socialMedia: {
      facebook: "rahul.kumar.12345",
      instagram: "@rahul_bikes",
      linkedin: null
    },
    preferences: {
      communication: "WhatsApp",
      callTime: "Evening",
      language: "Hindi"
    }
  },
  {
    id: "2", 
    name: "Priya Singh",
    phone: "+91-9876543211",
    email: "priya@email.com",
    source: "Referral",
    status: "warm",
    interestedVehicle: "Triumph Scrambler 400X",
    budget: 280000,
    age: 32,
    income: 1200000,
    location: "Hazratganj, Lucknow",
    touchpoints: 4,
    responseTime: 3,
    lastContact: 5,
    budgetConfirmed: false,
    timeframe: 45,
    testRideBooked: false,
    websiteVisits: 2,
    brochureDownloaded: true,
    compareVehicles: false,
    financingInquiry: false,
    referralSource: "Friend",
    competitorMention: null,
    budgetMismatch: true,
    notes: "Interested but budget seems tight. Suggested EMI options. Needs to discuss with husband.",
    createdAt: "2026-03-20",
    nextFollowUp: "2026-03-25",
    assignedTo: "Amit Verma",
    tags: ["Budget Concern", "Family Decision"],
    socialMedia: {
      facebook: "priya.singh.789",
      instagram: "@priya_adventure",
      linkedin: "priya-singh-marketing"
    },
    preferences: {
      communication: "Phone Call",
      callTime: "Morning",
      language: "English"
    }
  },
  {
    id: "3",
    name: "Arjun Patel",
    phone: "+91-9876543212", 
    email: "arjun@email.com",
    source: "Walk-in",
    status: "cold",
    interestedVehicle: "KTM RC 200",
    budget: 200000,
    age: 22,
    income: 300000,
    location: "Alambagh, Lucknow",
    touchpoints: 2,
    responseTime: 8,
    lastContact: 12,
    budgetConfirmed: false,
    timeframe: 90,
    testRideBooked: false,
    websiteVisits: 1,
    brochureDownloaded: false,
    compareVehicles: true,
    financingInquiry: true,
    referralSource: "Walk-in",
    competitorMention: "Honda CBR150R",
    budgetMismatch: true,
    notes: "Student, first bike purchase. Needs financing. Not responding to calls.",
    createdAt: "2026-03-15",
    nextFollowUp: "2026-03-26",
    assignedTo: "Rohit Singh",
    tags: ["Student", "First Bike", "Financing Needed"],
    socialMedia: {
      facebook: null,
      instagram: "@arjun_rides",
      linkedin: null
    },
    preferences: {
      communication: "WhatsApp",
      callTime: "Anytime",
      language: "Hindi"
    }
  }
];

// Assign dynamic scores
mockLeads.forEach(lead => {
  lead.score = calculateLeadScore(lead);
  lead.insights = generateLeadInsights(lead);
});

export default function AdvancedCRMPage() {
  const [leads, setLeads] = useState(mockLeads);
  const [filteredLeads, setFilteredLeads] = useState(mockLeads);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState([0, 100]);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("table"); // table, cards, pipeline

  // Filter and sort leads
  useEffect(() => {
    let filtered = leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lead.phone.includes(searchQuery) ||
                           lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           lead.interestedVehicle.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesScore = lead.score >= scoreFilter[0] && lead.score <= scoreFilter[1];
      const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
      
      return matchesSearch && matchesStatus && matchesScore && matchesSource;
    });

    // Sort leads
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === "score" || sortBy === "budget" || sortBy === "touchpoints") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }
      
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredLeads(filtered);
  }, [leads, searchQuery, statusFilter, scoreFilter, sourceFilter, sortBy, sortOrder]);

  // Stats
  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.status === "hot").length;
  const warmLeads = leads.filter(l => l.status === "warm").length;
  const coldLeads = leads.filter(l => l.status === "cold").length;
  const avgScore = Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length);
  const conversionRate = Math.round((hotLeads / totalLeads) * 100);
  const totalBudget = leads.reduce((sum, l) => sum + l.budget, 0);

  const getScoreBadge = (score) => {
    if (score >= 80) return <Badge className="bg-red-100 text-red-700"><Flame className="h-3 w-3 mr-1" />HOT {score}</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-700"><Zap className="h-3 w-3 mr-1" />WARM {score}</Badge>;
    if (score >= 40) return <Badge className="bg-blue-100 text-blue-700"><Activity className="h-3 w-3 mr-1" />COLD {score}</Badge>;
    return <Badge className="bg-gray-100 text-gray-700">INACTIVE {score}</Badge>;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "hot": return "text-red-600 bg-red-50";
      case "warm": return "text-yellow-600 bg-yellow-50";
      case "cold": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const handleAction = (leadId, action) => {
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

  const generateAIRecommendation = (lead) => {
    const recommendations = [];
    
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
    
    if (lead.competitorMention) {
      recommendations.push(`⚔️ Send comparison sheet vs ${lead.competitorMention}`);
    }
    
    if (lead.budgetMismatch) {
      recommendations.push("💳 Share EMI options and down payment schemes");
    }
    
    return recommendations;
  };

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
              <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pipeline</p>
                <p className="text-2xl font-bold text-indigo-600">₹{(totalBudget/100000).toFixed(1)}L</p>
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
                <SelectItem value="budget">💰 Budget</SelectItem>
                <SelectItem value="lastContact">📞 Last Contact</SelectItem>
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
          <Button 
            variant={viewMode === "pipeline" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("pipeline")}
          >
            Pipeline View
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

      {/* Enhanced Lead Table */}
      {viewMode === "table" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead Details</TableHead>
                  <TableHead>Score & Status</TableHead>
                  <TableHead>Vehicle Interest</TableHead>
                  <TableHead>Budget & Timeline</TableHead>
                  <TableHead>AI Insights</TableHead>
                  <TableHead>Last Contact</TableHead>
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
                        <div className="text-sm text-muted-foreground">📍 {lead.location}</div>
                        <div className="flex gap-1 mt-1">
                          {lead.tags.slice(0, 2).map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        {getScoreBadge(lead.score)}
                        <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(lead.status)}`}>
                          {lead.status.toUpperCase()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {lead.touchpoints} touchpoints
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{lead.interestedVehicle}</div>
                        <div className="text-xs text-muted-foreground">via {lead.source}</div>
                        {lead.competitorMention && (
                          <div className="text-xs text-orange-600">vs {lead.competitorMention}</div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">₹{(lead.budget/100000).toFixed(1)}L</div>
                        <div className="text-xs text-muted-foreground">
                          {lead.budgetConfirmed ? "✅ Confirmed" : "❓ Unconfirmed"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {lead.timeframe} days timeline
                        </div>
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
                      <div className="space-y-1">
                        <div className="text-sm">{lead.lastContact} days ago</div>
                        <div className="text-xs text-muted-foreground">by {lead.assignedTo}</div>
                        <div className="text-xs text-muted-foreground">
                          Next: {lead.nextFollowUp}
                        </div>
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
                  <div className="text-sm text-muted-foreground">{selectedLead.interestedVehicle}</div>
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
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">📞 Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <div>Phone: {selectedLead.phone}</div>
                      <div>Email: {selectedLead.email}</div>
                      <div>Location: {selectedLead.location}</div>
                      <div>Preferred Communication: {selectedLead.preferences.communication}</div>
                      <div>Best Call Time: {selectedLead.preferences.callTime}</div>
                      <div>Language: {selectedLead.preferences.language}</div>
                    </div>
                    
                    <h3 className="font-semibold">💰 Financial Details</h3>
                    <div className="space-y-2 text-sm">
                      <div>Budget: ₹{(selectedLead.budget/100000).toFixed(1)}L</div>
                      <div>Income: ₹{(selectedLead.income/100000).toFixed(1)}L/year</div>
                      <div>Budget Status: {selectedLead.budgetConfirmed ? "✅ Confirmed" : "❓ Unconfirmed"}</div>
                      <div>Financing Interest: {selectedLead.financingInquiry ? "Yes" : "No"}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">🎯 Engagement Metrics</h3>
                    <div className="space-y-2 text-sm">
                      <div>Total Touchpoints: {selectedLead.touchpoints}</div>
                      <div>Website Visits: {selectedLead.websiteVisits}</div>
                      <div>Response Time: {selectedLead.responseTime} hours</div>
                      <div>Last Contact: {selectedLead.lastContact} days ago</div>
                      <div>Next Follow-up: {selectedLead.nextFollowUp}</div>
                    </div>
                    
                    <h3 className="font-semibold">🔍 Behavioral Data</h3>
                    <div className="space-y-2 text-sm">
                      <div>Brochure Downloaded: {selectedLead.brochureDownloaded ? "✅" : "❌"}</div>
                      <div>Test Ride Booked: {selectedLead.testRideBooked ? "✅" : "❌"}</div>
                      <div>Vehicle Comparison: {selectedLead.compareVehicles ? "✅" : "❌"}</div>
                      <div>Competitor Interest: {selectedLead.competitorMention || "None"}</div>
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