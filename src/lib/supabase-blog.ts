/**
 * Blog data access via Supabase REST API (not Prisma).
 * Works on production even when DATABASE_URL is misconfigured.
 */

const getSupabase = () => ({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
});

function headers(extra?: Record<string, string>) {
  const { key } = getSupabase();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
    ...extra,
  };
}

async function sbFetch(path: string, opts: RequestInit = {}) {
  const { url } = getSupabase();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...opts,
    headers: { ...headers(), ...(opts.headers as any) },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase error ${res.status}: ${text}`);
  }
  return res;
}

export interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  published: boolean;
  featured: boolean;
  category: string | null;
  tags: string | null;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string | null;
  metaTitle: string | null;
  metaDesc: string | null;
}

export async function getBlogPosts(opts: {
  category?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  page?: number;
}): Promise<{ posts: BlogPostRow[]; total: number; categories: string[] }> {
  const { category, search, featured, limit = 10, page = 1 } = opts;
  const offset = (page - 1) * limit;
  const rangeEnd = offset + limit - 1;

  let query = `BlogPost?published=eq.true&order=publishedAt.desc`;
  if (category) query += `&category=eq.${encodeURIComponent(category)}`;
  if (featured === true) query += `&featured=eq.true`;
  if (search) {
    const s = encodeURIComponent(`*${search}*`);
    query += `&or=(title.ilike.${s},excerpt.ilike.${s},tags.ilike.${s})`;
  }

  const [listRes, catRes] = await Promise.all([
    sbFetch(`${query}&select=id,title,slug,excerpt,coverImage,featured,category,tags,views,publishedAt,createdAt`, {
      headers: {
        "Range-Unit": "items",
        Range: `${offset}-${rangeEnd}`,
        Prefer: "count=exact",
      },
    }),
    sbFetch(`BlogPost?published=eq.true&select=category&category=not.is.null`),
  ]);

  const posts: BlogPostRow[] = await listRes.json();
  const contentRange = listRes.headers.get("content-range") || "";
  const total = parseInt(contentRange.split("/")[1] || "0") || posts.length;

  const allCats: { category: string }[] = await catRes.json();
  const categories = [...new Set(allCats.map((c) => c.category).filter(Boolean))];

  return { posts, total, categories };
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostRow | null> {
  const res = await sbFetch(
    `BlogPost?slug=eq.${encodeURIComponent(slug)}&published=eq.true&select=*&limit=1`
  );
  const rows: BlogPostRow[] = await res.json();
  return rows[0] || null;
}

export async function incrementViews(id: string): Promise<void> {
  try {
    // Fetch current views
    const res = await sbFetch(`BlogPost?id=eq.${id}&select=views&limit=1`);
    const rows: { views: number }[] = await res.json();
    if (!rows[0]) return;
    const newViews = (rows[0].views || 0) + 1;
    await sbFetch(`BlogPost?id=eq.${id}`, {
      method: "PATCH",
      body: JSON.stringify({ views: newViews, updatedAt: new Date().toISOString() }),
    });
  } catch {
    // non-critical — ignore
  }
}

export async function getRelatedPosts(
  id: string,
  category: string | null
): Promise<Partial<BlogPostRow>[]> {
  let query = `BlogPost?published=eq.true&id=neq.${id}&order=publishedAt.desc&limit=3`;
  if (category) query += `&or=(category.eq.${encodeURIComponent(category)},featured.eq.true)`;
  else query += `&featured=eq.true`;
  const res = await sbFetch(`${query}&select=title,slug,coverImage,category,publishedAt,excerpt`);
  return res.json();
}

export async function upsertBlogPost(post: Partial<BlogPostRow> & { slug: string }): Promise<BlogPostRow> {
  const res = await sbFetch(`BlogPost?slug=eq.${encodeURIComponent(post.slug)}`, {
    method: "PATCH",
    body: JSON.stringify({ ...post, updatedAt: new Date().toISOString() }),
  });
  const rows: BlogPostRow[] = await res.json();
  if (rows.length) return rows[0];
  // create
  const createRes = await sbFetch(`BlogPost`, {
    method: "POST",
    body: JSON.stringify({ ...post, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
  });
  const created: BlogPostRow[] = await createRes.json();
  return created[0];
}
