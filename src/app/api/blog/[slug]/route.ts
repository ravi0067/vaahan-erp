import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug, published: true },
      include: { author: { select: { name: true } } },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    const related = await prisma.blogPost.findMany({
      where: {
        published: true,
        id: { not: post.id },
        OR: [
          { category: post.category || undefined },
          { featured: true },
        ],
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
      select: { title: true, slug: true, coverImage: true, category: true, publishedAt: true, excerpt: true },
    });

    return NextResponse.json({ post, related });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}
