'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Key, Github, Cloud, Shield, Zap, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function AIBotConfig() {
  const [config, setConfig] = useState({
    claudeApiKey: '',
    openaiApiKey: '',
    geminiApiKey: '',
    githubToken: '',
    githubRepo: 'ravi0067/vaahan-erp',
    vercelToken: '',
    whatsappApiKey: '',
    whatsappPhoneId: '',
    aiModel: 'claude-sonnet-4',
    autoFixErrors: true,
    autoDeployEnabled: true,
    voiceCommandEnabled: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save to localStorage for now (production: use encrypted DB)
    localStorage.setItem('vaahan_ai_config', JSON.stringify(config));
    setSaved(true);
    toast.success('AI Bot configuration saved!');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">🤖 AI Bot Configuration</h2>
        <p className="text-muted-foreground">Configure AI capabilities, API keys, and integrations</p>
      </div>

      {/* AI Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> AI Model Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>AI Model</Label>
            <Select value={config.aiModel} onValueChange={(v) => setConfig(p => ({...p, aiModel: v}))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-sonnet-4">Claude Sonnet 4 (Recommended - Fast & Smart)</SelectItem>
                <SelectItem value="claude-opus-4">Claude Opus 4 (Most Powerful - Higher Cost)</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini (Budget Friendly)</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro (Google)</SelectItem>
                <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash (Google - Fast & Efficient)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Claude API Key</Label>
            <Input type="password" placeholder="sk-ant-..." value={config.claudeApiKey} onChange={(e) => setConfig(p => ({...p, claudeApiKey: e.target.value}))} />
            <p className="text-xs text-muted-foreground mt-1">Get from console.anthropic.com</p>
          </div>
          <div>
            <Label>OpenAI API Key (Optional)</Label>
            <Input type="password" placeholder="sk-..." value={config.openaiApiKey} onChange={(e) => setConfig(p => ({...p, openaiApiKey: e.target.value}))} />
          </div>
          <div>
            <Label>Google Gemini API Key (Optional)</Label>
            <Input type="password" placeholder="AIza..." value={config.geminiApiKey} onChange={(e) => setConfig(p => ({...p, geminiApiKey: e.target.value}))} />
            <p className="text-xs text-muted-foreground mt-1">Get from aistudio.google.dev</p>
          </div>
        </CardContent>
      </Card>

      {/* GitHub Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Github className="h-5 w-5" /> GitHub Integration (Super Admin Only)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">⚠️ Super Admin Only: Bot can fix bugs, add features, and auto-deploy code</p>
          </div>
          <div>
            <Label>GitHub Personal Access Token</Label>
            <Input type="password" placeholder="ghp_..." value={config.githubToken} onChange={(e) => setConfig(p => ({...p, githubToken: e.target.value}))} />
          </div>
          <div>
            <Label>Repository</Label>
            <Input placeholder="username/repo" value={config.githubRepo} onChange={(e) => setConfig(p => ({...p, githubRepo: e.target.value}))} />
          </div>
          <div>
            <Label>Vercel Deploy Token</Label>
            <Input type="password" placeholder="vcp_..." value={config.vercelToken} onChange={(e) => setConfig(p => ({...p, vercelToken: e.target.value}))} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={config.autoFixErrors} onChange={(e) => setConfig(p => ({...p, autoFixErrors: e.target.checked}))} className="w-4 h-4" />
              <span className="text-sm">Auto-fix errors</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={config.autoDeployEnabled} onChange={(e) => setConfig(p => ({...p, autoDeployEnabled: e.target.checked}))} className="w-4 h-4" />
              <span className="text-sm">Auto-deploy after fix</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> WhatsApp Business Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">📱 Connect WhatsApp to enable: Client owner chat, voice commands, daily reports, payment alerts, lead follow-ups</p>
          </div>
          <div>
            <Label>WhatsApp Business API Key</Label>
            <Input type="password" placeholder="Meta Business API Key" value={config.whatsappApiKey} onChange={(e) => setConfig(p => ({...p, whatsappApiKey: e.target.value}))} />
            <p className="text-xs text-muted-foreground mt-1">Get from business.facebook.com → WhatsApp → API Setup</p>
          </div>
          <div>
            <Label>WhatsApp Phone Number ID</Label>
            <Input placeholder="Phone Number ID from Meta" value={config.whatsappPhoneId} onChange={(e) => setConfig(p => ({...p, whatsappPhoneId: e.target.value}))} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={config.voiceCommandEnabled} onChange={(e) => setConfig(p => ({...p, voiceCommandEnabled: e.target.checked}))} className="w-4 h-4" />
            <span className="text-sm">Enable voice command support</span>
          </label>
        </CardContent>
      </Card>

      {/* Bot Capabilities Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Bot Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Fix Bugs & Errors', icon: '🔧', status: config.githubToken ? 'active' : 'needs-key' },
              { label: 'Add New Features', icon: '✨', status: config.githubToken ? 'active' : 'needs-key' },
              { label: 'Auto-Deploy to Vercel', icon: '🚀', status: config.vercelToken ? 'active' : 'needs-key' },
              { label: 'WhatsApp Chat', icon: '💬', status: config.whatsappApiKey ? 'active' : 'needs-key' },
              { label: 'Voice Commands', icon: '🎙️', status: config.voiceCommandEnabled ? 'active' : 'disabled' },
              { label: 'Daily Business Reports', icon: '📊', status: 'active' },
              { label: 'Lead Follow-up Alerts', icon: '📞', status: 'active' },
              { label: 'Payment Reminders', icon: '💰', status: 'active' },
              { label: 'Customer Communication', icon: '📱', status: config.whatsappApiKey ? 'active' : 'needs-key' },
              { label: 'Error Monitoring', icon: '🛡️', status: config.githubToken ? 'active' : 'needs-key' },
            ].map((cap, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg border">
                <span className="text-sm">{cap.icon} {cap.label}</span>
                <Badge variant={cap.status === 'active' ? 'default' : 'secondary'} className={cap.status === 'active' ? 'bg-green-600' : ''}>
                  {cap.status === 'active' ? '✅ Active' : '🔑 Needs Key'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700" size="lg">
        {saved ? <><Check className="h-4 w-4 mr-2" /> Saved!</> : '💾 Save AI Bot Configuration'}
      </Button>
    </div>
  );
}