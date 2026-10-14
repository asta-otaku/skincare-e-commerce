/** @type {import('next').NextConfig} */

function supabaseHostname() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!url) return null
    return new URL(url).hostname
  } catch {
    return null
  }
}

const supabaseHost = supabaseHostname()

const nextConfig = {
  images: {
    // Skip Vercel Image Optimization (Hobby quota). Serves originals via next/image.
    unoptimized: true,
    qualities: [75, 100],
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
}

export default nextConfig
