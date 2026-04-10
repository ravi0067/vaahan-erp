import { NextRequest, NextResponse } from "next/server";
import { getBlogPostBySlug, incrementViews, getRelatedPosts } from "@/lib/supabase-blog";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await getBlogPostBySlug(params.slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // fire-and-forget — don't block response
    incrementViews(post.id);

    const related = await getRelatedPosts(post.id, post.category);

    return NextResponse.json({ post, related });
  } catch (error: any) {
    console.error("Blog slug API error:", error?.message);
    return NextResponse.json({ error: "Failed to fetch post", detail: error?.message }, { status: 500 });
  }
}
