import { NextRequest, NextResponse } from "next/server";
import { getBlogPosts } from "@/lib/supabase-blog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category  = searchParams.get("category")  || undefined;
    const search    = searchParams.get("search")    || undefined;
    const featured  = searchParams.get("featured") === "true" ? true : undefined;
    const limit     = parseInt(searchParams.get("limit") || "10");
    const page      = parseInt(searchParams.get("page")  || "1");

    const { posts, total, categories } = await getBlogPosts({
      category, search, featured, limit, page,
    });

    return NextResponse.json({
      posts,
      total,
      pages: Math.ceil(total / limit),
      page,
      categories,
    });
  } catch (error: any) {
    console.error("Blog API error:", error?.message);
    return NextResponse.json({ error: "Failed to fetch posts", detail: error?.message }, { status: 500 });
  }
}
