"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, StarOff, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  category: string;
  views: number;
  publishedAt: string;
  createdAt: string;
  author: { name: string };
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filter !== "all") params.set("status", filter);
    const res = await fetch(`/api/admin/blog?${params}`);
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [search, filter]);

  const togglePublish = async (post: BlogPost) => {
    await fetch(`/api/admin/blog/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...post, published: !post.published }),
    });
    fetchPosts();
  };

  const toggleFeatured = async (post: BlogPost) => {
    await fetch(`/api/admin/blog/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...post, featured: !post.featured }),
    });
    fetchPosts();
  };

  const deletePost = async (id: string) => {
    if (!confirm("Ye post delete karein? Yeh undo nahi hoga.")) return;
    setDeleting(id);
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    fetchPosts();
    setDeleting(null);
  };

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.published).length,
    draft: posts.filter((p) => !p.published).length,
    featured: posts.filter((p) => p.featured).length,
    views: posts.reduce((s, p) => s + (p.views || 0), 0),
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Posts create, edit, publish aur manage karo</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/blog" target="_blank">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="w-4 h-4" /> Public Blog
            </Button>
          </Link>
          <Link href="/admin/blog/new">
            <Button className="gap-2 bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4" /> New Post
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total", value: stats.total, color: "text-gray-900" },
          { label: "Published", value: stats.published, color: "text-green-600" },
          { label: "Drafts", value: stats.draft, color: "text-yellow-600" },
          { label: "Featured", value: stats.featured, color: "text-orange-500" },
          { label: "Total Views", value: stats.views, color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Post search karein..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div className="flex gap-2">
            {["all","published","draft"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === f ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="divide-y">
            {[...Array(5)].map((_, i) => <div key={i} className="p-4 h-16 bg-gray-50 animate-pulse" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg mb-2">Koi post nahi mili</p>
            <Link href="/admin/blog/new"><Button variant="outline" size="sm" className="mt-2 gap-2"><Plus className="w-4 h-4" />Pehla Post Likhein</Button></Link>
          </div>
        ) : (
          <div className="divide-y">
            {posts.map((post) => (
              <div key={post.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">{post.title}</h3>
                    {post.featured && <Star className="w-3.5 h-3.5 text-orange-400 fill-orange-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${post.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                    {post.category && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.category}</span>}
                    <span>{post.views} views</span>
                    <span>{new Date(post.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {post.published && (
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-orange-500 transition-colors" title="View live">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </Link>
                  )}
                  <button onClick={() => toggleFeatured(post)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title={post.featured ? "Remove featured" : "Mark featured"}>
                    {post.featured ? <Star className="w-4 h-4 text-orange-400 fill-orange-400" /> : <StarOff className="w-4 h-4 text-gray-400" />}
                  </button>
                  <button onClick={() => togglePublish(post)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title={post.published ? "Unpublish" : "Publish"}>
                    {post.published ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </button>
                  <Link href={`/admin/blog/${post.id}/edit`}>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-500 transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </Link>
                  <button onClick={() => deletePost(post.id)} disabled={deleting === post.id}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
