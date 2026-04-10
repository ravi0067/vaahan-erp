"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Save, Eye, Image as ImageIcon, Tags, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const BlogEditor = dynamic(() => import("@/components/blog/BlogEditor"), { ssr: false });

const CATEGORIES = ["Business Tips","Technology","Sales","Service","Finance","Industry News"];

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiKeyword, setAiKeyword] = useState("");
  const [aiLang, setAiLang] = useState("hinglish");
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [form, setForm] = useState({
    title: "", content: "", excerpt: "", coverImage: "",
    published: false, featured: false,
    metaTitle: "", metaDesc: "", category: "", tags: "",
  });

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const generateWithAI = async () => {
    if (!aiKeyword) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/blog-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: aiKeyword, language: aiLang }),
      });
      if (!res.ok) { const e = await res.json(); alert("AI Error: " + e.error); return; }
      const data = await res.json();
      setForm((f) => ({
        ...f,
        title: data.title || f.title,
        content: data.content || f.content,
        excerpt: data.excerpt || f.excerpt,
        metaTitle: data.metaTitle || f.metaTitle,
        metaDesc: data.metaDesc || f.metaDesc,
        category: data.category || f.category,
        tags: data.tags || f.tags,
      }));
      setShowAiPanel(false);
    } catch (e) {
      alert("AI generation failed. Check OpenAI API key in settings.");
    } finally {
      setAiLoading(false);
    }
  };

  const save = async (publish = false) => {
    if (!form.title.trim() || !form.content.trim()) {
      alert("Title aur content required hain");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, published: publish }),
      });
      if (!res.ok) { const e = await res.json(); alert(e.error); return; }
      router.push("/admin/blog");
    } catch (e) {
      alert("Save karne mein error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog"><button className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4" /></button></Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">New Blog Post</h1>
            <p className="text-xs text-gray-500">Draft save karein ya seedha publish karein</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowAiPanel(!showAiPanel)}>
            <Sparkles className="w-4 h-4 text-purple-500" /> AI Generate
          </Button>
          <Button variant="outline" size="sm" onClick={() => save(false)} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" /> Save Draft
          </Button>
          <Button size="sm" onClick={() => save(true)} disabled={saving} className="gap-2 bg-orange-500 hover:bg-orange-600">
            <Eye className="w-4 h-4" /> {saving ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      {showAiPanel && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h3 className="font-semibold text-purple-900">AI Blog Generator</h3>
          </div>
          <p className="text-xs text-purple-600 mb-3">Topic/keyword enter karo, AI poora blog post likh dega</p>
          <div className="flex gap-3 flex-col md:flex-row">
            <input value={aiKeyword} onChange={(e) => setAiKeyword(e.target.value)}
              placeholder="e.g. Bike dealership mein leads kaise manage karein"
              className="flex-1 px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
            />
            <select value={aiLang} onChange={(e) => setAiLang(e.target.value)}
              className="px-3 py-2 border border-purple-200 rounded-lg text-sm focus:outline-none bg-white">
              <option value="hinglish">Hinglish</option>
              <option value="english">English</option>
            </select>
            <Button onClick={generateWithAI} disabled={aiLoading || !aiKeyword} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shrink-0">
              {aiLoading ? "Generating..." : "Generate"}
            </Button>
          </div>
          {aiLoading && (
            <p className="text-xs text-purple-500 mt-2 animate-pulse">AI likh raha hai... thoda wait karo ☕</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input value={form.title} onChange={(e) => update("title", e.target.value)}
              placeholder="Blog post ka title..."
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 font-medium text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)}
              placeholder="2-3 line ka summary (listing mein dikhega)..."
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
            <BlogEditor value={form.content} onChange={(v) => update("content", v)} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">Post Settings</h3>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select value={form.category} onChange={(e) => update("category", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tags (comma separated)</label>
              <input value={form.tags} onChange={(e) => update("tags", e.target.value)}
                placeholder="ERP, dealership, vehicles..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cover Image URL</label>
              <input value={form.coverImage} onChange={(e) => update("coverImage", e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              {form.coverImage && <img src={form.coverImage} alt="preview" className="mt-2 rounded-lg w-full h-32 object-cover" onError={(e) => (e.target as HTMLImageElement).style.display = "none"} />}
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
              <div>
                <p className="text-xs font-medium text-gray-700">Featured Post</p>
                <p className="text-xs text-gray-400">Homepage par highlight</p>
              </div>
              <button onClick={() => update("featured", !form.featured)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.featured ? "bg-orange-500" : "bg-gray-200"}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.featured ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><Search className="w-4 h-4" />SEO Settings</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Meta Title</label>
              <input value={form.metaTitle} onChange={(e) => update("metaTitle", e.target.value)}
                placeholder="60 characters max"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <p className="text-xs text-gray-400 mt-1">{form.metaTitle.length}/60</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Meta Description</label>
              <textarea value={form.metaDesc} onChange={(e) => update("metaDesc", e.target.value)}
                placeholder="155 characters max"
                rows={2}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{form.metaDesc.length}/155</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
