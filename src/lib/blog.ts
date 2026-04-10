/**
 * Blog utilities — Prisma-based (used by sitemap, etc.)
 */

import { prisma } from "@/lib/prisma";

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  keywords: string[];
  readingTime: string;
  content?: string;
}

function toMeta(post: {
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  publishedAt?: Date | null;
  createdAt: Date;
  category?: string | null;
  tags?: string | null;
  authorId?: string | null;
}): BlogPostMeta {
  const wordCount = post.content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  const readingTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
  const keywords = post.tags
    ? post.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return {
    slug: post.slug,
    title: post.title,
    description: post.excerpt || post.content.replace(/<[^>]+>/g, "").slice(0, 160),
    date: (post.publishedAt || post.createdAt).toISOString(),
    author: post.authorId || "VaahanERP Team",
    category: post.category || "General",
    keywords,
    readingTime,
  };
}

export async function getAllPosts(): Promise<BlogPostMeta[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        content: true,
        publishedAt: true,
        createdAt: true,
        category: true,
        tags: true,
        authorId: true,
      },
    });
    return posts.map(toMeta);
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPostMeta | null> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug, published: true },
    });
    if (!post) return null;
    return { ...toMeta(post), content: post.content };
  } catch {
    return null;
  }
}
