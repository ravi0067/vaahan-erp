import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BlogNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Nahi Mili</h2>
      <p className="text-gray-500 mb-6">Ye blog post exist nahi karti ya delete ho gayi hai.</p>
      <Link href="/blog" className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-full hover:bg-orange-600 transition-colors font-medium text-sm">
        <ArrowLeft className="w-4 h-4" /> Blog Par Wapas Jao
      </Link>
    </div>
  );
}
