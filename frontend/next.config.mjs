/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Proxy all /api/v1/* requests to the FastAPI backend.
  // This avoids CORS entirely: the browser only talks to localhost:3066 (same origin).
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8066"
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ]
  },
}

export default nextConfig
