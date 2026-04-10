import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Eye, Calendar, Tag } from "lucide-react";
import { getBlogPostBySlug, getRelatedPosts, incrementViews } from "@/lib/supabase-blog";

export const dynamic = "force-dynamic";

interface Props { params: { slug: string }; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const post = await getBlogPostBySlug(params.slug);
    if (!post) return { title: "Post Not Found" };
    return {
      title: post.metaTitle || post.title,
      description: post.metaDesc || post.excerpt || undefined,
      openGraph: {
        title: post.metaTitle || post.title,
        description: post.metaDesc || post.excerpt || undefined,
        images: post.coverImage ? [post.coverImage] : [],
        type: "article",
      },
    };
  } catch {
    return { title: "VaahanERP Blog" };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) notFound();

  // fire-and-forget
  incrementViews(post.id);

  const related = await getRelatedPosts(post.id, post.category);
  const plainText = post.content.replace(/<[^>]*>/g, "");
  const readTime = Math.max(3, Math.ceil(plainText.length / 1000));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Blog
      </Link>

      <article>
        <div className="mb-6">
          {post.category && (
            <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="inline-block text-sm bg-orange-100 text-orange-600 font-medium px-3 py-1 rounded-full mb-3 hover:bg-orange-200 transition-colors">
              {post.category}
            </Link>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 border-b">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{readTime} min read</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{post.views} views</span>
          </div>
        </div>

        {post.coverImage && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img src={post.coverImage} alt={post.title} className="w-full max-h-[460px] object-cover" />
          </div>
        )}

        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-orange-500 prose-strong:text-gray-900 prose-li:text-gray-700 prose-h2:mt-8 prose-h2:mb-4 prose-h3:mt-6 prose-h3:mb-3"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
            <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
            {post.tags.split(",").map((tag: string) => (
              <Link key={tag} href={`/blog?search=${encodeURIComponent(tag.trim())}`} className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-orange-100 hover:text-orange-600 transition-colors">
                {tag.trim()}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl text-white text-center">
          <h3 className="text-xl font-bold mb-2">Apni Dealership Automate Karo!</h3>
          <p className="text-orange-100 mb-4 text-sm">Leads, bookings, service, cashflow — sab ek jagah. VaahanERP try karo free mein.</p>
          <Link href="/pricing" className="inline-block bg-white text-orange-600 font-semibold px-6 py-2.5 rounded-full hover:bg-orange-50 transition-colors text-sm">
            Free Demo Book Karo →
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="group block rounded-xl border hover:shadow-md transition-all bg-white overflow-hidden">
                {r.coverImage ? (
                  <img src={r.coverImage} alt={r.title} className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-300">{r.title?.charAt(0)}</span>
                  </div>
                )}
                <div className="p-4">
                  {r.category && <span className="text-xs text-orange-500 font-medium">{r.category}</span>}
                  <h4 className="font-semibold text-gray-900 mt-1 line-clamp-2 text-sm group-hover:text-orange-500 transition-colors">{r.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
