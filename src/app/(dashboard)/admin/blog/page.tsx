"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, StarOff, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // ✅ FIXED FETCH
  const fetchPosts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filter !== "all") params.set("status", filter);

      const res = await fetch(`/api/admin/blog?${params}`);
      const json = await res.json();

      // 🔥 MAIN FIX
      setPosts(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [search, filter]);

  // ✅ SAFE FILTER
  const filteredPosts = (Array.isArray(posts) ? posts : []).filter((p) =>
    p?.title?.toLowerCase().includes(search.toLowerCase())
  );

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
    total: filteredPosts.length,
    published: filteredPosts.filter((p) => p.published).length,
    draft: filteredPosts.filter((p) => !p.published).length,
    featured: filteredPosts.filter((p) => p.featured).length,
    views: filteredPosts.reduce((s, p) => s + (p.views || 0), 0),
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Blog Management</h1>
        <Link href="/admin/blog/new">
          <Button className="bg-orange-500">
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </Link>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search post..."
          className="border px-3 py-2 rounded"
        />

        {["all", "published", "draft"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded ${
              filter === f ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredPosts.length === 0 ? (
        <p>No posts found</p>
      ) : (
        filteredPosts.map((post) => (
          <div key={post.id} className="border p-4 mb-2 flex justify-between">

            <div>
              <h3>{post.title}</h3>
              <p>{post.author?.name}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => togglePublish(post)}>
                {post.published ? "Unpublish" : "Publish"}
              </button>

              <button onClick={() => toggleFeatured(post)}>
                {post.featured ? "Unfeature" : "Feature"}
              </button>

              <Link href={`/admin/blog/${post.id}/edit`}>
                <button>Edit</button>
              </Link>

              <button onClick={() => deletePost(post.id)}>Delete</button>
            </div>

          </div>
        ))
      )}
    </div>
  );
}
