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
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Megaphone, Target, TrendingUp, Users, Mail, MessageSquare,
  Phone, Calendar, BarChart3, PieChart, LineChart, Zap,
  Globe, Share2, Heart, ThumbsUp, Eye, Click, Send,
  Star, Award, Trophy, Crown, Rocket, Flame, Sparkles,
  Bot, Brain, Lightbulb, Magic, Wand2, Settings,
  Plus, Play, Pause, Stop, Edit, Trash2, Copy,
  Download, Upload, RefreshCw, CheckCircle, AlertTriangle,
  Clock, DollarSign, Percent, Hash, Tag, Map, Filter
} from "lucide-react";
import { toast } from "sonner";

// Marketing campaign templates
const campaignTemplates = [
  {
    id: "festival_diwali",
    name: "🪔 Diwali Dhamaka Campaign",
    description: "Complete festival marketing campaign with multi-channel approach",
    category: "Festival",
    channels: ["WhatsApp", "Email", "SMS", "Social Media", "Google Ads"],
    audience: "All Customers + Hot Leads",
    budget: 25000,
    duration: 15,
    expectedROI: "8-12x",
    content: {
      subject: "🪔 Diwali Dhamaka! Up to ₹25,000 OFF + Free Gold Coin",
      whatsappMsg: "Namaskar! 🙏 Diwali special offer - KTM Duke 390 pe ₹15,000 OFF + FREE gold coin! Limited time. Book now: [LINK]",
      emailHtml: `<h2>🪔 Happy Diwali! Special Bike Offers Just for You</h2><p>Get up to ₹25,000 OFF on premium bikes + FREE gold coin worth ₹5,000!</p>`,
      smsText: "Diwali Offer! KTM bikes pe ₹15K OFF + Free gold coin. Book today - [SHOWROOM]",
      socialPost: "This Diwali, ride home your dream bike! 🏍️✨ Up to ₹25K OFF + FREE gold coin. Limited period offer! #DiwaliOffer #KTM"
    },
    targeting: {
      age: "25-45",
      income: "5L+",
      location: "Lucknow",
      interests: ["Bikes", "Adventure", "Premium vehicles"]
    },
    schedule: {
      startDate: "2026-10-15",
      endDate: "2026-10-30",
      timeSlots: ["10:00 AM", "6:00 PM", "8:00 PM"]
    }
  },
  {
    id: "service_reminder",
    name: "🔧 Smart Service Reminder Campaign", 
    description: "AI-powered service reminder system with predictive maintenance",
    category: "Retention",
    channels: ["WhatsApp", "Phone Call", "Email"],
    audience: "Existing Customers",
    budget: 5000,
    duration: 30,
    expectedROI: "15-20x",
    content: {
      subject: "🔧 Time for Your Bike's Health Check-up!",
      whatsappMsg: "Namaste {customer_name}! Aapki {vehicle_model} ki service due hai. Book karne ke liye reply karein. 25% OFF limited time!",
      emailHtml: `<h2>Service Reminder for {vehicle_model}</h2><p>Your bike needs attention! Book now and get 25% OFF on service charges.</p>`,
      phoneScript: "Hello {customer_name}, this is [NAME] from [SHOWROOM]. Your {vehicle_model} service is due. Shall I schedule an appointment?"
    },
    targeting: {
      criteria: "Service due in 7 days",
      lastService: "6 months ago",
      mileage: "5000+ km"
    }
  },
  {
    id: "referral_program",
    name: "👥 Mega Referral Rewards Program",
    description: "Viral referral system with cash rewards and social sharing",
    category: "Growth",
    channels: ["WhatsApp", "Social Media", "Email"],
    audience: "Happy Customers", 
    budget: 50000,
    duration: 60,
    expectedROI: "20-30x",
    content: {
      subject: "💰 Earn ₹5,000 for Each Friend Who Buys!",
      whatsappMsg: "Aapke dost bike lena chaahte hain? Refer karke ₹5,000 cash reward paayein! Share karne ke liye link: [REFERRAL_LINK]",
      emailHtml: `<h2>💰 Refer & Earn Big!</h2><p>Get ₹5,000 cash reward for every successful referral + your friend gets ₹3,000 discount!</p>`,
      socialPost: "Know someone who needs a bike? Refer them and earn ₹5K cash! 💰 Win-win for everyone! 🏍️✨"
    },
    rewards: {
      referrer: "₹5,000 cash",
      referee: "₹3,000 discount",
      bonus: "₹10,000 for 5 referrals"
    }
  },
  {
    id: "abandoned_lead",
    name: "🎯 Win-Back Abandoned Leads",
    description: "Re-engage cold leads with personalized offers and incentives", 
    category: "Re-engagement",
    channels: ["WhatsApp", "Email", "Phone Call"],
    audience: "Cold Leads (No contact 30+ days)",
    budget: 15000,
    duration: 21,
    expectedROI: "5-8x",
    content: {
      subject: "🎁 Special Comeback Offer Just for You!",
      whatsappMsg: "Hi {customer_name}! Aapki dream bike {vehicle_model} ka special price sirf aapke liye - ₹10,000 extra discount! Limited time.",
      emailHtml: `<h2>We Miss You! Special Comeback Offer</h2><p>Your dream {vehicle_model} is waiting with an exclusive ₹10,000 discount!</p>`,
      phoneScript: "Hello, this is from [SHOWROOM]. You inquired about {vehicle_model}. We have a special offer for you - shall I share details?"
    },
    incentives: {
      discount: "₹10,000 extra",
      freebie: "Free accessories worth ₹5,000",
      financing: "0% interest for 6 months"
    }
  }
];

// Marketing analytics data
const marketingStats = {
  totalCampaigns: 12,
  activeCampaigns: 3,
  totalReach: 45250,
  totalClicks: 3420,
  totalConversions: 89,
  totalRevenue: 2340000,
  avgCTR: 7.6,
  avgConversionRate: 2.6,
  avgROI: 850,
  topChannel: "WhatsApp",
  bestCampaign: "Diwali Dhamaka",
  monthlyBudget: 75000,
  budgetSpent: 45300
};

// Social media automation
const socialMediaPlatforms = [
  {
    platform: "Facebook",
    icon: "📘",
    followers: 2450,
    engagement: 8.2,
    posts: 24,
    reach: 12500,
    color: "bg-blue-100 text-blue-700"
  },
  {
    platform: "Instagram", 
    icon: "📷",
    followers: 1890,
    engagement: 12.5,
    posts: 18,
    reach: 8900,
    color: "bg-pink-100 text-pink-700"
  },
  {
    platform: "YouTube",
    icon: "📺",
    followers: 560,
    engagement: 15.3,
    posts: 6,
    reach: 4200,
    color: "bg-red-100 text-red-700"
  },
  {
    platform: "LinkedIn",
    icon: "💼",
    followers: 890,
    engagement: 6.8,
    posts: 12,
    reach: 3400,
    color: "bg-blue-100 text-blue-800"
  }
];

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState(campaignTemplates);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [newCampaignDialog, setNewCampaignDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [aiRecommendations, setAiRecommendations] = useState([]);

  // Generate AI marketing recommendations
  useEffect(() => {
    const recommendations = [
      {
        type: "urgent",
        title: "🚨 High-Value Lead Alert",
        message: "3 leads with ₹5L+ budget haven't been contacted in 5 days. Launch targeted campaign?",
        action: "Launch Campaign",
        impact: "Potential ₹15L revenue recovery"
      },
      {
        type: "opportunity",
        title: "🎯 Perfect Timing for Festival Campaign",
        message: "Dussehra approaching. Historical data shows 40% higher conversion during festivals.",
        action: "Create Festival Campaign",
        impact: "Expected 8-12x ROI"
      },
      {
        type: "insight",
        title: "📊 WhatsApp Outperforming Email",
        message: "WhatsApp campaigns have 85% open rate vs 22% email. Shift budget allocation?",
        action: "Optimize Budget",
        impact: "25-30% improvement in reach"
      },
      {
        type: "automation",
        title: "🤖 Auto-Service Reminders Ready",
        message: "47 customers due for service in next 14 days. Auto-launch reminder campaign?",
        action: "Enable Auto-Campaign",
        impact: "₹2.3L potential service revenue"
      }
    ];
    setAiRecommendations(recommendations);
  }, []);

  const launchCampaign = (campaignId) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, status: 'active', launchedAt: new Date().toISOString() }
        : c
    ));
    toast.success("🚀 Campaign launched successfully!");
  };

  const pauseCampaign = (campaignId) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, status: 'paused' }
        : c
    ));
    toast.info("⏸️ Campaign paused");
  };

  const stopCampaign = (campaignId) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, status: 'stopped' }
        : c
    ));
    toast.success("🛑 Campaign stopped");
  };

  const duplicateCampaign = (campaignId) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    const newCampaign = {
      ...campaign,
      id: `${campaign.id}_copy_${Date.now()}`,
      name: `${campaign.name} (Copy)`,
      status: 'draft'
    };
    setCampaigns(prev => [...prev, newCampaign]);
    toast.success("📋 Campaign duplicated");
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "active": return <Badge className="bg-green-100 text-green-700"><Play className="h-3 w-3 mr-1" />Active</Badge>;
      case "paused": return <Badge className="bg-yellow-100 text-yellow-700"><Pause className="h-3 w-3 mr-1" />Paused</Badge>;
      case "stopped": return <Badge className="bg-red-100 text-red-700"><Stop className="h-3 w-3 mr-1" />Stopped</Badge>;
      case "draft": return <Badge className="bg-gray-100 text-gray-700"><Edit className="h-3 w-3 mr-1" />Draft</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getROIColor = (roi: string) => {
    const roiNum = parseFloat(roi.replace(/[^\d.-]/g, ''));
    if (roiNum >= 10) return "text-green-600";
    if (roiNum >= 5) return "text-yellow-600"; 
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">🚀 Marketing Automation Hub</h1>
          <p className="text-muted-foreground">AI-powered campaigns, social media automation & customer engagement</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          <Button onClick={() => setNewCampaignDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* AI Recommendations Bar */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg text-purple-800">🤖 AI Marketing Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {aiRecommendations.map((rec, i) => (
              <Card key={i} className={`${
                rec.type === 'urgent' ? 'border-red-200 bg-red-50' :
                rec.type === 'opportunity' ? 'border-green-200 bg-green-50' :
                rec.type === 'insight' ? 'border-blue-200 bg-blue-50' :
                'border-purple-200 bg-purple-50'
              }`}>
                <CardContent className="p-4">
                  <div className={`text-sm font-medium mb-2 ${
                    rec.type === 'urgent' ? 'text-red-700' :
                    rec.type === 'opportunity' ? 'text-green-700' :
                    rec.type === 'insight' ? 'text-blue-700' :
                    'text-purple-700'
                  }`}>
                    {rec.title}
                  </div>
                  <div className="text-xs text-gray-600 mb-3">{rec.message}</div>
                  <div className="text-xs text-gray-500 mb-2">Impact: {rec.impact}</div>
                  <Button size="sm" className="w-full text-xs">
                    {rec.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Marketing Dashboard Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Megaphone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold text-blue-600">{marketingStats.activeCampaigns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reach</p>
                <p className="text-2xl font-bold text-green-600">{(marketingStats.totalReach/1000).toFixed(1)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Click className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold text-yellow-600">{marketingStats.avgCTR}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversions</p>
                <p className="text-2xl font-bold text-purple-600">{marketingStats.totalConversions}</p>
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
                <p className="text-sm text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold text-indigo-600">₹{(marketingStats.totalRevenue/100000).toFixed(1)}L</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg ROI</p>
                <p className="text-2xl font-bold text-red-600">{marketingStats.avgROI}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Marketing Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="campaigns">📊 Campaigns</TabsTrigger>
          <TabsTrigger value="automation">🤖 Automation</TabsTrigger>
          <TabsTrigger value="social">📱 Social Media</TabsTrigger>
          <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
          <TabsTrigger value="templates">📝 Templates</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Marketing Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Details</TableHead>
                    <TableHead>Channels & Audience</TableHead>
                    <TableHead>Budget & Duration</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground">{campaign.description}</div>
                          <Badge variant="outline" className="text-xs">{campaign.category}</Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {campaign.channels.slice(0, 2).join(", ")}
                            {campaign.channels.length > 2 && ` +${campaign.channels.length - 2}`}
                          </div>
                          <div className="text-xs text-muted-foreground">{campaign.audience}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">₹{(campaign.budget/1000).toFixed(0)}K</div>
                          <div className="text-xs text-muted-foreground">{campaign.duration} days</div>
                          <div className="text-xs text-green-600">ROI: {campaign.expectedROI}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">Reach: 12.5K</div>
                          <div className="text-sm">Clicks: 890</div>
                          <div className="text-sm">Conv: 23</div>
                          <Progress value={65} className="h-1" />
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(campaign.status || 'draft')}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {!campaign.status || campaign.status === 'draft' ? (
                            <Button size="sm" onClick={() => launchCampaign(campaign.id)}>
                              <Play className="h-3 w-3 mr-1" />Launch
                            </Button>
                          ) : campaign.status === 'active' ? (
                            <Button size="sm" variant="outline" onClick={() => pauseCampaign(campaign.id)}>
                              <Pause className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => launchCampaign(campaign.id)}>
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => setSelectedCampaign(campaign)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => duplicateCampaign(campaign.id)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📱 Social Media Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {socialMediaPlatforms.map((platform, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${platform.color}`}>
                          <span className="text-lg">{platform.icon}</span>
                        </div>
                        <div>
                          <div className="font-medium">{platform.platform}</div>
                          <div className="text-sm text-muted-foreground">{platform.followers} followers</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{platform.engagement}% engagement</div>
                        <div className="text-xs text-muted-foreground">{platform.posts} posts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🤖 Auto-Post Scheduler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Post Content</Label>
                    <Textarea placeholder="🏍️ New KTM bikes arrived! Book your test ride today..." className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Platforms</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platforms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Platforms</SelectItem>
                          <SelectItem value="facebook">Facebook Only</SelectItem>
                          <SelectItem value="instagram">Instagram Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Schedule</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Post timing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="now">Post Now</SelectItem>
                          <SelectItem value="optimal">Optimal Time</SelectItem>
                          <SelectItem value="custom">Custom Schedule</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Schedule Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>📊 Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Budget</span>
                    <span className="font-medium">₹{(marketingStats.monthlyBudget/1000).toFixed(0)}K</span>
                  </div>
                  <Progress value={(marketingStats.budgetSpent/marketingStats.monthlyBudget)*100} />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Spent: ₹{(marketingStats.budgetSpent/1000).toFixed(0)}K</span>
                    <span>Remaining: ₹{((marketingStats.monthlyBudget-marketingStats.budgetSpent)/1000).toFixed(0)}K</span>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Best Performing Channel</span>
                    <Badge className="bg-green-100 text-green-700">{marketingStats.topChannel}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Top Campaign</span>
                    <span className="text-sm font-medium">{marketingStats.bestCampaign}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Conversion Rate</span>
                    <span className="text-sm font-medium text-green-600">{marketingStats.avgConversionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎯 Channel Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { channel: "WhatsApp", performance: 85, color: "bg-green-500" },
                    { channel: "Email", performance: 65, color: "bg-blue-500" },
                    { channel: "SMS", performance: 45, color: "bg-yellow-500" },
                    { channel: "Social Media", performance: 35, color: "bg-purple-500" },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.channel}</span>
                        <span className="font-medium">{item.performance}%</span>
                      </div>
                      <Progress value={item.performance} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {campaignTemplates.slice(0, 3).map((template, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="outline">{template.category}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <div className="space-y-2 text-sm">
                      <div>🎯 Audience: {template.audience}</div>
                      <div>💰 Budget: ₹{(template.budget/1000).toFixed(0)}K</div>
                      <div>📅 Duration: {template.duration} days</div>
                      <div className={`font-medium ${getROIColor(template.expectedROI)}`}>
                        📈 Expected ROI: {template.expectedROI}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap mt-2">
                      {template.channels.slice(0, 3).map((channel, j) => (
                        <Badge key={j} variant="secondary" className="text-xs">{channel}</Badge>
                      ))}
                    </div>
                    <Button className="w-full mt-4" onClick={() => setSelectedCampaign(template)}>
                      <Rocket className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Megaphone className="h-6 w-6 text-primary" />
                {selectedCampaign.name}
                {getStatusBadge(selectedCampaign.status || 'template')}
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="targeting">Targeting</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">📊 Campaign Details</h3>
                    <div className="space-y-2 text-sm">
                      <div>Category: {selectedCampaign.category}</div>
                      <div>Budget: ₹{(selectedCampaign.budget/1000).toFixed(0)}K</div>
                      <div>Duration: {selectedCampaign.duration} days</div>
                      <div>Expected ROI: {selectedCampaign.expectedROI}</div>
                      <div>Audience: {selectedCampaign.audience}</div>
                    </div>
                    
                    <h3 className="font-semibold">📱 Channels</h3>
                    <div className="flex gap-2 flex-wrap">
                      {selectedCampaign.channels.map((channel, i) => (
                        <Badge key={i} variant="outline">{channel}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">🎯 Expected Results</h3>
                    <div className="space-y-2 text-sm">
                      <div>Estimated Reach: 25,000+</div>
                      <div>Expected Clicks: 2,000+</div>
                      <div>Projected Conversions: 50-80</div>
                      <div>Revenue Potential: ₹15-25L</div>
                    </div>
                    
                    {selectedCampaign.schedule && (
                      <>
                        <h3 className="font-semibold">📅 Schedule</h3>
                        <div className="space-y-2 text-sm">
                          <div>Start: {selectedCampaign.schedule.startDate}</div>
                          <div>End: {selectedCampaign.schedule.endDate}</div>
                          <div>Time Slots: {selectedCampaign.schedule.timeSlots.join(", ")}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="content">
                <div className="space-y-4">
                  <h3 className="font-semibold">📝 Message Content</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>WhatsApp Message</Label>
                      <Textarea 
                        value={selectedCampaign.content.whatsappMsg} 
                        className="mt-1"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>Email Subject</Label>
                      <Input 
                        value={selectedCampaign.content.subject} 
                        readOnly
                      />
                    </div>
                    <div>
                      <Label>SMS Text</Label>
                      <Textarea 
                        value={selectedCampaign.content.smsText} 
                        className="mt-1"
                        readOnly
                      />
                    </div>
                    {selectedCampaign.content.socialPost && (
                      <div>
                        <Label>Social Media Post</Label>
                        <Textarea 
                          value={selectedCampaign.content.socialPost} 
                          className="mt-1"
                          readOnly
                        />
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedCampaign(null)}>Close</Button>
              <Button onClick={() => launchCampaign(selectedCampaign.id)}>
                <Rocket className="h-4 w-4 mr-2" />
                Launch Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}