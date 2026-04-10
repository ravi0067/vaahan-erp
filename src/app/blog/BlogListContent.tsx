"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Tag, Clock, Eye, Star } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  featured: boolean;
  category: string;
  tags: string;
  views: number;
  publishedAt: string;
  createdAt: string;
  author: { name: string };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function readTime(content?: string) {
  return `${Math.max(3, Math.ceil((content?.length || 500) / 1000))} min read`;
}

export default function BlogListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", "9");

    fetch(`/api/blog?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setPosts(d.posts || []);
        setCategories(d.categories || []);
        setTotal(d.total || 0);
        setPages(d.pages || 1);
      })
      .finally(() => setLoading(false));
  }, [category, search, page]);

  const featuredPosts = posts.filter((p) => p.featured).slice(0, 3);
  const regularPosts = posts.filter((p) => !p.featured || featuredPosts.length === 0 ? true : !p.featured);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">VaahanERP Blog</h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">Dealership management tips, ERP insights, aur vehicle industry ki latest news</p>
      </div>

      {featuredPosts.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
            <h2 className="font-semibold text-gray-700">Featured Posts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <FeaturedCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && router.push(`/blog?search=${encodeURIComponent(search)}`)}
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/blog" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!category ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            All
          </Link>
          {categories.map((cat) => (
            <Link key={cat} href={`/blog?category=${encodeURIComponent(cat || "")}`} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${category === cat ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl mb-2">Koi post nahi mili</p>
          <p className="text-sm">Alag category ya search try karo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {[...Array(pages)].map((_, i) => (
            <Link key={i} href={`/blog?page=${i + 1}${category ? `&category=${encodeURIComponent(category)}` : ""}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block rounded-xl overflow-hidden border hover:shadow-lg transition-shadow bg-white">
      {post.coverImage ? (
        <img src={post.coverImage} alt={post.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-44 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          <span className="text-white text-4xl font-bold opacity-30">{post.title.charAt(0)}</span>
        </div>
      )}
      <div className="p-4">
        {post.category && <span className="text-xs bg-orange-100 text-orange-600 font-medium px-2 py-0.5 rounded-full">{post.category}</span>}
        <h3 className="font-bold text-gray-900 mt-2 mb-1 line-clamp-2 group-hover:text-orange-500 transition-colors">{post.title}</h3>
        <p className="text-xs text-gray-500">{formatDate(post.publishedAt || post.createdAt)}</p>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block rounded-xl border hover:shadow-lg transition-all bg-white overflow-hidden">
      {post.coverImage ? (
        <img src={post.coverImage} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-6xl font-bold text-gray-300">{post.title.charAt(0)}</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {post.category && <span className="text-xs bg-orange-100 text-orange-600 font-medium px-2 py-0.5 rounded-full">{post.category}</span>}
          {post.featured && <span className="text-xs bg-yellow-100 text-yellow-600 font-medium px-2 py-0.5 rounded-full">⭐ Featured</span>}
        </div>
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors leading-snug">{post.title}</h3>
        {post.excerpt && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.excerpt}</p>}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime()}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views}</span>
          </div>
          <span>{formatDate(post.publishedAt || post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
