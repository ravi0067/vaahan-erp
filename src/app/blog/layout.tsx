import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "VaahanERP Blog", template: "%s | VaahanERP Blog" },
  description: "Dealership management tips, ERP insights, vehicle industry news in Hinglish",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="VaahanERP" className="h-8 w-8" />
            <span className="font-bold text-xl text-gray-900">VaahanERP</span>
            <span className="text-sm text-gray-400 ml-1">Blog</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/blog" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Blog</Link>
            <Link href="/blog?category=Business+Tips" className="text-gray-600 hover:text-orange-500 transition-colors">Business Tips</Link>
            <Link href="/blog?category=Technology" className="text-gray-600 hover:text-orange-500 transition-colors">Technology</Link>
            <Link href="/blog?category=Sales" className="text-gray-600 hover:text-orange-500 transition-colors">Sales</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
            <Link href="/pricing" className="bg-orange-500 text-white text-sm px-4 py-2 rounded-full hover:bg-orange-600 transition-colors font-medium">
              Free Demo
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-3">VaahanERP</h3>
              <p className="text-sm">India ka #1 Vehicle Dealership Management Software. Leads se lekar delivery tak — sab kuch automate karo.</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Categories</h3>
              <ul className="space-y-2 text-sm">
                {["Business Tips","Technology","Sales","Service","Finance"].map(c => (
                  <li key={c}><Link href={`/blog?category=${encodeURIComponent(c)}`} className="hover:text-white transition-colors">{c}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-sm text-center">
            <p>© {new Date().getFullYear()} VaahanERP. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
