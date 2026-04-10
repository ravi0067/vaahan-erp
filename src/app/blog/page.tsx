import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import BlogListContent from "./BlogListContent";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "VaahanERP Blog — Dealership Tips & ERP Insights",
  description: "Vehicle dealership management tips, ERP insights, sales automation, and industry news in Hinglish. VaahanERP ke saath apna showroom badao.",
};

export default function BlogPage() {
  return <Suspense fallback={<BlogSkeleton />}><BlogListContent /></Suspense>;
}

function BlogSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
