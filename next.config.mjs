/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: ESLint errors won't fail the build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: TypeScript errors won't fail the build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
